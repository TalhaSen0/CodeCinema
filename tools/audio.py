"""Offline Piper narration and original procedural score; no cloud inference."""
from pathlib import Path
import json, subprocess, wave, sys, math
import numpy as np
import requests
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'films/galileo/assets'; OUT.mkdir(parents=True,exist_ok=True)
MODEL=ROOT/'assets/models/tr_TR-dfki-medium.onnx'; MODEL.parent.mkdir(parents=True,exist_ok=True)
BASE='https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/'
def download(name,dest):
    if dest.exists(): return
    print('Downloading',name,flush=True)
    with requests.get(BASE+name,stream=True,timeout=120) as r:
        r.raise_for_status()
        with dest.with_suffix(dest.suffix+'.part').open('wb') as f:
            for block in r.iter_content(1024*1024): f.write(block)
    dest.with_suffix(dest.suffix+'.part').replace(dest)
for name,dest in [(MODEL.name,MODEL),(MODEL.name+'.json',Path(str(MODEL)+'.json')),('MODEL_CARD',MODEL.parent/'MODEL_CARD')]:download(name,dest)
from piper import PiperVoice, SynthesisConfig
voice=PiperVoice.load(str(MODEL))
cached_path=ROOT/'review/audio-timings.json'
previous=json.loads(cached_path.read_text(encoding='utf-8')) if cached_path.exists() else {}
prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import * as p from './films/galileo/production.mjs'; console.log(JSON.stringify(p))"],cwd=ROOT))
(ROOT/'production/galileo.json').write_text(json.dumps(prod,ensure_ascii=False,indent=2),encoding='utf-8')
SR=48000; duration=prod['DURATION']; n=round(SR*duration)
speech=np.zeros(n,dtype=np.float64); timings=[]
FF=str(ROOT/'.tools/ffmpeg.exe')
for i,cue in enumerate(prod['narration']):
    target=OUT/f'voice-{i}.wav'
    cached_cues=previous.get('cues',[])
    reuse=target.exists() and i<len(cached_cues) and cached_cues[i]['text']==cue['text'] and '--regenerate' not in sys.argv
    if not reuse:
        with wave.open(str(target),'wb') as w:voice.synthesize_wav(cue['text'],w,SynthesisConfig(length_scale=1.03,noise_scale=.55,noise_w_scale=.65))
    with wave.open(str(target),'rb') as w: length=w.getnframes()/w.getframerate()
    available=cue['end']-cue['start']; speed=max(1,length/(available-.15))
    if speed>1.35: raise RuntimeError(f'Cue {i} needs excessive speed {speed:.2f}; revise its text or timing')
    data=subprocess.check_output([FF,'-v','error','-i',str(target),'-af',f'atempo={speed}', '-ar',str(SR),'-ac','1','-f','f32le','-'])
    samples=np.frombuffer(data,dtype=np.float32).astype(float)
    fade=min(200,len(samples)//4);samples[:fade]*=np.linspace(0,1,fade);samples[-fade:]*=np.linspace(1,0,fade)
    start=round(cue['start']*SR);speech[start:start+len(samples)]+=samples
    timings.append({**cue,'actualEnd':cue['start']+len(samples)/SR,'sourceSeconds':length,'speed':speed})
    print('Narration',i,'duration',round(len(samples)/SR,2),'speed',round(speed,2),flush=True)
# Original modal score: intimate plucked harmonics and a low bowed drone.
t=np.arange(n)/SR; score=np.zeros(n); right=np.zeros(n)
notes=[146.832,174.614,220,261.626,293.665,220,174.614,164.814]
for k,start in enumerate(np.arange(.25,duration-1,1.5)):
    f=notes[(k//4+k%3)%len(notes)];length=min(3,duration-start);nt=np.arange(round(length*SR))/SR
    env=(1-np.exp(-nt*35))*np.exp(-nt*1.7)*np.clip((length-nt)*4,0,1)
    sound=sum(np.sin(2*np.pi*f*h*nt)*a for h,a in [(1,1),(2,.28),(3,.13),(5,.035)])*env*.027
    index=round(start*SR);score[index:index+len(sound)]+=sound;right[index:index+len(sound)]+=sound*(.85+.15*math.sin(k))
drone=(np.sin(2*np.pi*73.416*t)+.24*np.sin(2*np.pi*110*t))*.008*(1+.15*np.sin(t*.7));score+=drone;right+=drone
rng=np.random.default_rng(1638)
# Low-amplitude room air, plus timed page friction and small release clicks.
air=rng.normal(0,.0009,n);score+=air;right+=air*.8
for event in prod['events']:
    start=event['t'];length=.8 if event['type']=='page' else .22;nt=np.arange(round(length*SR))/SR
    if event['type']=='page':
        noise=rng.normal(0,1,len(nt));noise=np.convolve(noise,np.ones(12)/12,mode='same');sound=noise*np.sin(np.pi*nt/length)**2*.027
    else:sound=np.sin(2*np.pi*(600 if event['type']=='release' else 293.665)*nt)*np.exp(-nt*24)*.035
    index=round(start*SR);score[index:index+len(sound)]+=sound;right[index:index+len(sound)]+=sound
# Duck the score around speech, with smooth attack and release.
duck=np.ones(n)
for cue in timings:
    a=max(0,round((cue['start']-.15)*SR));b=min(n,round((cue['actualEnd']+.25)*SR));duck[a:b]=.45
duck=np.convolve(np.pad(duck,(2400,2400),mode='edge'),np.ones(4801)/4801,mode='valid')
fade=np.minimum(np.clip(t/1.2,0,1),np.clip((duration-t)/1.8,0,1))
mix=np.stack([speech*.88+score*duck,speech*.88+right*duck],axis=1)*fade[:,None]
peak=float(np.max(np.abs(mix)));mix*=min(1,.89/max(peak,1e-9))
def wav(name,data):
    if data.ndim==1:data=data[:,None]
    with wave.open(str(OUT/name),'wb') as w:w.setnchannels(data.shape[1]);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())
wav('mix.wav',mix);wav('narration.wav',speech);wav('score.wav',np.stack([score,right],axis=1)*fade[:,None])
(ROOT/'review/audio-timings.json').write_text(json.dumps({'sampleRate':SR,'duration':duration,'peak':peak,'cues':timings,'events':prod['events'],'voice':'Piper tr_TR-dfki-medium; CC BY-NC-SA dataset; noncommercial delivery'},ensure_ascii=False,indent=2),encoding='utf-8')
print('48 second stereo mix written.',flush=True)
