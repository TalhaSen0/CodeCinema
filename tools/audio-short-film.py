"""Original score + optional selected narrator. Record quota failures explicitly."""
from pathlib import Path
import argparse,json,subprocess,hashlib,shutil
import numpy as np
import soundfile as sf
ROOT=Path(__file__).resolve().parents[1]
def write_audio(path, audio, sr):
    temporary=path.with_name(path.stem+'.new.wav')
    sf.write(temporary,audio,sr,subtype='PCM_16')
    temporary.replace(path)

def main():
    p=argparse.ArgumentParser();p.add_argument('--film',required=True);p.add_argument('--try-voice',action='store_true');args=p.parse_args()
    if not all(c in 'abcdefghijklmnopqrstuvwxyz0123456789-' for c in args.film):raise ValueError('Invalid film')
    prod=json.loads(subprocess.check_output(['node','--input-type=module','-e',f"import * as p from './films/{args.film}/production.mjs';console.log(JSON.stringify(p))"],cwd=ROOT))
    out=ROOT/'films'/args.film/'assets';out.mkdir(parents=True,exist_ok=True)
    sr=48000;n=round(prod['duration']*sr);t=np.arange(n)/sr;mix=np.zeros((n,2))
    # Original sparse glass / felt score, no outside recording or generative model.
    for when,freq,amp in [(0,146.83,.055),(4,220,.035),(8,293.66,.04),(12,196,.03),(16,220,.04),(20,293.66,.03),(24,146.83,.045),(28,220,.035)]:
        u=t-when;env=np.where(u>=0,np.minimum(np.maximum(u,0)/.08,1)*np.exp(-np.maximum(u,0)/3),0)
        note=amp*env*(np.sin(2*np.pi*freq*u)+.28*np.sin(2*np.pi*2*freq*u)+.13*np.sin(2*np.pi*3*freq*u))
        pan=.35+.3*(when%12)/12;mix[:,0]+=note*np.sqrt(1-pan);mix[:,1]+=note*np.sqrt(pan)
    for i,event in enumerate(prod['soundEvents']):
        at=round(event['time']*sr);count=min(int(.08*sr),n-at)
        if count<=0:continue
        u=np.arange(count)/sr;tick=.025*np.sin(2*np.pi*(1200 if i%2 else 900)*u)*np.exp(-u*110)*np.minimum(u/.002,1)
        mix[at:at+count,i%2]+=tick
    mix*=np.minimum(t/.3,1)[:,None]*np.clip((prod['duration']-t)/1.2,0,1)[:,None]
    mix *= 3
    music = mix.copy()
    write_audio(out/'music.wav',music,sr)
    selection=json.loads((ROOT/'assets/selected-voice.json').read_text());lock=json.loads((ROOT/selection['voiceLock']).read_text(encoding='utf-8'))
    reference=ROOT/lock['reference']['path'];assert hashlib.sha256(reference.read_bytes()).hexdigest()==lock['reference']['sha256']
    report={'film':args.film,'voiceId':lock['voiceId'],'duration':prod['duration'],'narrationStatus':'not-attempted','cues':[],'music':'original procedural score','fallbackVoice':None}
    complete=True;client=None
    for i,cue in enumerate(prod['narration']):
        path=out/f'narration-{i}.wav'
        if not path.exists() and args.try_voice:
            try:
                from gradio_client import Client,handle_file
                if client is None:client=Client('ResembleAI/Chatterbox-Multilingual-TTS',verbose=False,httpx_kwargs={'timeout':60})
                s=lock['generation'];print(f'Requesting selected narrator cue {i}',flush=True)
                result=client.submit(text_input=cue['text'],language_id='tr',audio_prompt_path_input=handle_file(str(reference)),exaggeration_input=s['exaggeration'],temperature_input=s['temperature'],seed_num_input=s['seed'],cfgw_input=s['cfg'],api_name='/generate_tts_audio').result(timeout=180)
                shutil.copyfile(result,path)
            except Exception as exc:
                report['narrationStatus']='service-unavailable';report['reason']=str(exc);complete=False;print(str(exc),flush=True);break
        if not path.exists():complete=False;continue
        audio,rate=sf.read(path);seconds=len(audio)/rate
        report['cues'].append({'index':i,'text':cue['text'],'seconds':seconds,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
        if seconds>cue['end']-cue['start']:complete=False;report['narrationStatus']='needs-slot-review'
    # Never put incomplete narration into a delivered soundtrack.
    if complete and len(report['cues'])==len(prod['narration']):
        from scipy.signal import resample_poly
        speech = np.zeros((n, 2))
        # Psychoacoustic cinematic audio ducking:
        # Pre-attack: 300ms cosine descent before speech
        # Hold: 700ms natural breathing window after speech
        # Release: 1400ms smooth organic S-curve swell
        # Min gain: 0.35 (~-9 dB attenuation of background music during dialogue)
        duck = np.ones(n)
        min_gain = 0.35
        attack = 0.30
        hold = 0.70
        release = 1.40
        for i, cue in enumerate(prod['narration']):
            audio, rate = sf.read(out/f'narration-{i}.wav')
            c_sec = len(audio) / rate
            t0 = max(0, cue['start'] - attack)
            t1 = cue['start']
            t2 = cue['start'] + c_sec
            t3 = min(prod['duration'], t2 + hold)
            t4 = min(prod['duration'], t3 + release)
            idx_att = (t >= t0) & (t < t1)
            if np.any(idx_att):
                u = (t[idx_att] - t0) / (t1 - t0)
                duck[idx_att] = np.minimum(duck[idx_att], min_gain + (1.0 - min_gain) * 0.5 * (1 + np.cos(np.pi * u)))
            idx_speech = (t >= t1) & (t < t3)
            if np.any(idx_speech):
                duck[idx_speech] = np.minimum(duck[idx_speech], min_gain)
            idx_rel = (t >= t3) & (t < t4)
            if np.any(idx_rel):
                u = (t[idx_rel] - t3) / (t4 - t3)
                duck[idx_rel] = np.minimum(duck[idx_rel], min_gain + (1.0 - min_gain) * 0.5 * (1 - np.cos(np.pi * u)))

            audio = resample_poly(audio, sr, rate) * .42
            at = round(cue['start'] * sr)
            speech[at:at+len(audio), :] += audio[:, None]

        mix = music * duck[:, None] + speech
        report['narrationStatus']='complete-needs-listening'
        report['ducking']={'minGain':min_gain,'attackSeconds':attack,'holdSeconds':hold,'releaseSeconds':release}
    else:
        mix = music.copy()
        report['delivery']='music-and-subtitles-preview; selected narration pending'
    assert np.isfinite(mix).all() and np.max(np.abs(mix))<1
    write_audio(out/'mix.wav',mix,sr)
    report['peak']=float(np.max(np.abs(mix)))
    (out/'audio-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2),flush=True)

if __name__=='__main__':main()
