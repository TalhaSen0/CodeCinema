"""Official public demo audition only; not a pinned local V3 benchmark or final asset."""
from pathlib import Path
import json,subprocess,time,shutil,hashlib
from gradio_client import Client,handle_file
import soundfile as sf
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'films/galileo/assets/auditions/chatterbox-hosted';out.mkdir(parents=True,exist_ok=True)
client=Client('ResembleAI/Chatterbox-Multilingual-TTS',verbose=False,httpx_kwargs={'timeout':60})
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {narration} from './films/galileo/production.mjs';console.log(JSON.stringify(narration))"],cwd=ROOT))
manifest={'status':'audition-only','source':'https://huggingface.co/spaces/ResembleAI/Chatterbox-Multilingual-TTS','execution':'hosted official demo; not local GPU','modelVersion':'not verified; do not label V3','voice':'official demo Turkish reference default; separate reference rights not cleared for final','commercialReleaseApproved':False,'seed':9,'cues':[]}
clips=[];rate=None
for index in [1,4]:
    print(f'Requesting Turkish cue {index}',flush=True);started=time.perf_counter()
    # The demo's None fallback is a URL, but librosa expects a downloaded file.
    # Submit the provider's own default reference through Gradio file handling.
    job=client.submit(text_input=prod[index]['text'],language_id='tr',audio_prompt_path_input=handle_file('https://storage.googleapis.com/chatterbox-demo-samples/mtl_prompts/tr_m.flac'),exaggeration_input=.5,temperature_input=.8,seed_num_input=9,cfgw_input=.5,api_name='/generate_tts_audio')
    result=job.result(timeout=300)
    dest=out/f'voice-{index}.wav';shutil.copyfile(result,dest)
    samples,sr=sf.read(dest)
    if rate is not None and rate!=sr:raise RuntimeError('Sample-rate mismatch')
    if not np.isfinite(samples).all():raise RuntimeError('Invalid audio')
    rate=sr
    manifest['cues'].append({'index':index,'text':prod[index]['text'],'seconds':len(samples)/sr,'requestSeconds':time.perf_counter()-started,'peak':float(np.abs(samples).max()),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    if clips:clips.append(np.zeros((sr,)+samples.shape[1:]))
    clips.append(samples)
    print(f'Saved cue {index}: {len(samples)/sr:.2f}s',flush=True)
joined=np.concatenate(clips)
sf.write(out/'listening-reel.wav',joined,rate,subtype='PCM_16')
sf.write(out/'listening-reel-headroom.wav',joined*10**(-6/20),rate,subtype='PCM_16')
manifest['listeningCopy']={'file':'listening-reel-headroom.wav','gainDB':-6,'denoising':False,'timeStretch':False}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Audition saved. Not cleared for final use.',flush=True)
