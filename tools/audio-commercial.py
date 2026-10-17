"""Pinned Turkish Freya candidate. Separate outputs; no Piper imports or cache reuse.

Run with .tools/freya-env/Scripts/python.exe after the documented isolated setup.
Only explicit model files are fetched, with a 2GB total budget. No full VoxCPM model.
"""
from pathlib import Path
import argparse, hashlib, json, subprocess, sys, time, wave

ROOT=Path(__file__).resolve().parents[1]
POLICY=json.loads((ROOT/'assets/commercial-voice-policy.json').read_text(encoding='utf-8'))

def sha(path):
    h=hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda:f.read(1024*1024),b''):h.update(block)
    return h.hexdigest()

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--film',default='galileo')
    parser.add_argument('--limit',type=int)
    parser.add_argument('--device',choices=['cuda','cpu'],default='cuda')
    parser.add_argument('--regenerate',action='store_true')
    args=parser.parse_args()
    if args.limit is not None and args.limit<1:raise ValueError('Limit must be positive')
    import re
    if not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}',args.film):raise ValueError('Invalid film ID')
    source=ROOT/'.tools/freya-source'
    revision=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
    if revision!=POLICY['code']['revision']:raise RuntimeError('Unreviewed Freya source revision')
    if subprocess.check_output(['git','-C',str(source),'status','--porcelain'],text=True).strip():raise RuntimeError('Freya source has local changes')
    out=ROOT/'films'/args.film/'assets/commercial-freya';out.mkdir(parents=True,exist_ok=True)
    prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',f"import * as p from './films/{args.film}/production.mjs'; console.log(JSON.stringify(p))"],cwd=ROOT))
    cues=prod['narration'][:args.limit]
    if not cues:raise ValueError('No narration cues selected')
    from huggingface_hub import HfApi,hf_hub_download
    api=HfApi();local={};download_total=0
    for kind in ['model','decoder']:
        spec=POLICY[kind];info=api.model_info(spec['repo'],revision=spec['revision'],files_metadata=True)
        entries={f.rfilename:f for f in info.siblings}
        for name in spec['files']:
            entry=entries[name]
            if entry.size is None:raise RuntimeError('Unknown download size')
            download_total+=entry.size
        if download_total>POLICY['maxModelDownloadBytes']:raise RuntimeError('Model download budget exceeded')
    # Dependencies and checkpoints are local; model execution never calls a speech API.
    for kind in ['model','decoder']:
        spec=POLICY[kind];local[kind]={}
        for name in spec['files']:
            file=Path(hf_hub_download(spec['repo'],name,revision=spec['revision'],cache_dir=str(ROOT/'assets/models/hf-commercial')))
            local[kind][name]=file
    import torch, numpy as np, soundfile as sf
    if args.device=='cuda' and not torch.cuda.is_available():raise RuntimeError('CUDA unavailable; choose --device cpu explicitly')
    sys.path.insert(0,str(source))
    from freyatts.model import FreyaDiT
    from freyatts.pipeline import FreyaTTS,normalize
    from voxcpm.modules.audiovae import AudioVAEV2,AudioVAEConfigV2
    from safetensors.torch import load_file
    cfg=json.loads(local['model']['config.json'].read_text(encoding='utf-8'))
    model=FreyaDiT(vocab=cfg['vocab'],d=cfg['d'],depth=cfg['depth'],heads=cfg['heads'],ff=cfg['ff'])
    model.load_state_dict(load_file(str(local['model']['model.safetensors'])),strict=True)
    model=model.to(args.device).eval()
    vae=AudioVAEV2(AudioVAEConfigV2())
    checkpoint=torch.load(local['decoder']['audiovae.pth'],map_location='cpu',weights_only=True)
    vae.load_state_dict(checkpoint.get('state_dict',checkpoint),strict=True)
    vae=vae.to(args.device).float().eval()
    for p in vae.parameters():p.requires_grad=False
    vocab=json.loads((source/'freyatts/char_vocab.json').read_text(encoding='utf-8'))
    tts=FreyaTTS(model,vae,vocab,device=args.device)
    # Upstream retries can change speaker seed. This adapter forbids those hidden retries.
    adapter_hash=sha(Path(__file__))
    manifest={'provider':POLICY['provider'],'policy':POLICY,'adapterSha256':adapter_hash,'downloadBytes':download_total,
              'device':args.device,'torch':torch.__version__,'cues':[],
              'files':{kind:{n:{'sha256':sha(p),'bytes':p.stat().st_size} for n,p in files.items()} for kind,files in local.items()},
              'status':'candidate-requires-listening-review','subjectiveAudioReviewed':False}
    previous_path=out/'manifest.json'
    previous=json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
    for i,cue in enumerate(cues):
        target=out/f'voice-{i}.wav';key=hashlib.sha256(json.dumps({'cue':cue,'policy':POLICY,'adapterSha256':adapter_hash,'torch':torch.__version__,'device':args.device},sort_keys=True,ensure_ascii=False).encode()).hexdigest()
        old=next((x for x in previous.get('cues',[]) if x.get('key')==key),None)
        started=time.perf_counter();reused=bool(old and target.exists() and old.get('sha256')==sha(target) and not args.regenerate)
        if not reused:
            chunks=tts._clauses(normalize(cue['text']))
            pieces=[]
            for chunk in chunks:
                with torch.no_grad():samples=tts._synth_one(chunk,steps=POLICY['steps'],seed=POLICY['seed'])
                if not np.isfinite(samples).all() or np.max(np.abs(samples))<.001:raise RuntimeError(f'Invalid/silent cue {i}')
                if pieces:pieces.append(np.zeros(5760,dtype=np.float32))
                pieces.append(samples)
            samples=np.concatenate(pieces)
            sf.write(target,samples,48000,subtype='PCM_16')
        samples,sr=sf.read(target);seconds=len(samples)/sr
        peak=float(np.max(np.abs(samples)));rms=float(np.sqrt(np.mean(samples*samples)))
        if not np.isfinite(samples).all() or peak>=.9999 or rms<.001:raise RuntimeError(f'Clipping or silence in cue {i}')
        row={**cue,'index':i,'key':key,'sha256':sha(target),'seconds':seconds,'peak':peak,'rms':rms,
             'fitsSlot':seconds<=cue['end']-cue['start']-.15,'requiredSpeed':max(1,seconds/(cue['end']-cue['start']-.15)),
             'generationSeconds':time.perf_counter()-started,'reused':reused}
        manifest['cues'].append(row)
        previous_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps(row,ensure_ascii=False),flush=True)
    reel=[]
    for row in manifest['cues']:
        samples,sr=sf.read(out/f"voice-{row['index']}.wav")
        if reel:reel.append(np.zeros(sr,dtype=np.float32))
        reel.append(samples)
    preview=out/'listening-reel.wav'
    sf.write(preview,np.concatenate(reel),48000,subtype='PCM_16')
    manifest['listeningReel']={'file':preview.name,'sha256':sha(preview),'gapSeconds':1,'timedToFilm':False}
    manifest['peakAllocatedVRAM']=torch.cuda.max_memory_allocated() if args.device=='cuda' else None
    manifest['allCuesGenerated']=len(cues)==len(prod['narration'])
    previous_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Candidate audio only. Existing Piper mix and MP4 unchanged.',flush=True)

if __name__=='__main__':main()
