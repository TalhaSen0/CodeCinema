"""Bounded Turkish V3 audition; no reference voice, no modification of final audio."""
from pathlib import Path
import argparse, hashlib, json, os, random, subprocess, time
from concurrent.futures import ThreadPoolExecutor,as_completed

ROOT=Path(__file__).resolve().parents[1]
REVISION='5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18'
SOURCE='5de7a54aa4e5e2baadb0182dde554908b48b85c2'
FILES=['README.md','ve.pt','t3_mtl23ls_v3.safetensors','s3gen.pt','grapheme_mtl_merged_expanded_v1.json','conds.pt']
def sha(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def fetch_parts(url,temp,size,workers=32):
    """Bounded, resumable ranges; the caller verifies the complete LFS SHA256."""
    import requests
    part_size=1024*1024
    chunks=temp.parent/(temp.name+'.chunks-1m');chunks.mkdir(exist_ok=True)
    ranges=[(i,start,min(size-1,start+part_size-1)) for i,start in enumerate(range(0,size,part_size))]
    # Preserve previously downloaded contiguous bytes as complete chunks.
    if temp.exists():
        with temp.open('rb') as old:
            for i,start,end in ranges:
                if end>=temp.stat().st_size:break
                dest=chunks/str(i)
                if not dest.exists():old.seek(start);dest.write_bytes(old.read(end-start+1))
    def fetch(item):
        i,start,end=item;dest=chunks/str(i);expected=end-start+1
        if dest.exists() and dest.stat().st_size==expected:return expected
        for attempt in range(3):
            try:
                # Unique range URL prevents an intermediary serving a cached range.
                with requests.get(url+f'?download=true&range={start}-{end}',headers={'Range':f'bytes={start}-{end}'},stream=True,timeout=(30,30)) as r:
                    r.raise_for_status()
                    if r.status_code!=206 or r.headers.get('Content-Range')!=f'bytes {start}-{end}/{size}':raise RuntimeError('Wrong chunk range')
                    n=0
                    with dest.open('wb') as f:
                        for block in r.iter_content(65536):
                            n+=len(block)
                            if n>expected:raise RuntimeError('Oversized chunk')
                            f.write(block)
                    if n!=expected:raise RuntimeError('Incomplete chunk')
                    return n
            except requests.RequestException:
                if attempt==2:raise
    done=0
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for job in as_completed([pool.submit(fetch,r) for r in ranges]):
            done+=job.result()
            if done%(32*1048576)==0 or done==size:print(f'{temp.stem}: {done//1048576}/{size//1048576} MiB',flush=True)
    with temp.open('wb') as f:
        for i,_,_ in ranges:
            with (chunks/str(i)).open('rb') as chunk:
                for block in iter(lambda:chunk.read(1024*1024),b''):f.write(block)

def main():
    p=argparse.ArgumentParser();p.add_argument('--download-only',action='store_true');args=p.parse_args()
    from huggingface_hub import HfApi
    import requests
    info=HfApi().model_info('ResembleAI/chatterbox',revision=REVISION,files_metadata=True)
    sizes={f.rfilename:f.size for f in info.siblings}
    total=sum(sizes[n] for n in FILES)
    if total>3_300_000_000:raise RuntimeError('3.3 GB model budget exceeded')
    print(f'Pinned model files: {total} bytes',flush=True)
    folder=ROOT/'assets/models/chatterbox-v3'/REVISION;folder.mkdir(parents=True,exist_ok=True)
    entries={f.rfilename:f for f in info.siblings}
    for name in FILES:
        dest=folder/name
        expected=entries[name].lfs.sha256 if entries[name].lfs else None
        if dest.exists() and dest.stat().st_size==sizes[name] and (not expected or sha(dest)==expected):continue
        print(f'Downloading {name} ({sizes[name]} bytes)',flush=True)
        temp=dest.with_suffix(dest.suffix+'.part');received=temp.stat().st_size if temp.exists() else 0;reported=received
        if sizes[name]>32*1024*1024:
            fetch_parts(f'https://huggingface.co/ResembleAI/chatterbox/resolve/{REVISION}/{name}',temp,sizes[name])
            if sha(temp)!=expected:raise RuntimeError('Download integrity failed')
            temp.replace(dest)
            continue
        headers={'Range':f'bytes={received}-'} if received else {}
        with requests.get(f'https://huggingface.co/ResembleAI/chatterbox/resolve/{REVISION}/{name}',headers=headers,stream=True,timeout=60) as response:
            response.raise_for_status()
            if response.status_code==206:
                if not response.headers.get('Content-Range','').startswith(f'bytes {received}-'):raise RuntimeError('Wrong resume range')
            else:received=0
            with temp.open('ab' if received else 'wb') as f:
                for chunk in response.iter_content(1024*1024):
                    received+=len(chunk)
                    if received>sizes[name]:raise RuntimeError('Download exceeded declared size')
                    f.write(chunk)
                    if received-reported>=256*1024*1024:print(f'{name}: {received//(1024*1024)} MiB',flush=True);reported=received
        if received!=sizes[name] or (expected and sha(temp)!=expected):raise RuntimeError('Download integrity failed')
        temp.replace(dest)
    (ROOT/'.tools/chatterbox-local-path.txt').write_text(str(folder),encoding='utf-8')
    if args.download_only:return
    # No additional models may be fetched during inference.
    os.environ['HF_HUB_OFFLINE']='1'
    import numpy as np,torch,soundfile as sf
    from huggingface_hub import constants
    constants.HF_HUB_OFFLINE=True
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    source=ROOT/'.tools/chatterbox-source'
    if subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()!=SOURCE:raise RuntimeError('Source revision changed')
    torch.manual_seed(9);np.random.seed(9);random.seed(9)
    model=ChatterboxMultilingualTTS.from_local(folder,'cuda',t3_model='v3')
    prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {narration} from './films/galileo/production.mjs';console.log(JSON.stringify(narration))"],cwd=ROOT))
    out=ROOT/'films/galileo/assets/commercial-chatterbox';out.mkdir(parents=True,exist_ok=True)
    manifest={'provider':'chatterbox-multilingual-v3','modelRevision':REVISION,'codeRevision':SOURCE,'modelLicense':'MIT','language':'tr','seed':9,'voice':'bundled conds.pt; no user reference or Piper audio','status':'candidate-requires-listening','torch':torch.__version__,'runtimeNote':'Experimental Torch 2.9.1 runtime reused read-only; upstream pins 2.6.0. Not production-qualified.','files':{n:sha(folder/n) for n in FILES},'cues':[]}
    clips=[]
    for index in [1,4]:
        text=prod[index]['text'];torch.manual_seed(9);np.random.seed(9);random.seed(9)
        started=time.perf_counter()
        wav=model.generate(text,language_id='tr',exaggeration=.5,cfg_weight=.5).squeeze().numpy()
        if not np.isfinite(wav).all() or np.max(np.abs(wav))<.001:raise RuntimeError('Invalid/silent output')
        file=out/f'voice-{index}.wav';sf.write(file,wav,model.sr,subtype='PCM_16')
        row={'index':index,'text':text,'seconds':len(wav)/model.sr,'generationSeconds':time.perf_counter()-started,'peak':float(np.max(np.abs(wav))),'sha256':sha(file)}
        manifest['cues'].append(row);print(json.dumps(row,ensure_ascii=False),flush=True)
        if clips:clips.append(np.zeros(model.sr,dtype=np.float32))
        clips.append(wav)
    sf.write(out/'listening-reel.wav',np.concatenate(clips),model.sr,subtype='PCM_16')
    manifest['sampleRate']=model.sr;manifest['peakAllocatedVRAM']=torch.cuda.max_memory_allocated()
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__':main()
