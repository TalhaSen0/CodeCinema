"""Two licensed synthetic Turkish reference auditions via official Chatterbox demo.

No default demo speaker is used. Existing Galileo outputs remain untouched.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import time
import numpy as np
import soundfile as sf
from gradio_client import Client, handle_file

ROOT = Path(__file__).resolve().parents[1]
REF = ROOT / 'assets/voice-references/alania'
OUT = ROOT / 'films/galileo/assets/auditions/male-voices'


def main():
    references = json.loads((REF/'manifest.json').read_text(encoding='utf-8'))
    selected = json.loads((ROOT/'assets/selected-voice.json').read_text(encoding='utf-8'))
    lock = json.loads((ROOT/selected['voiceLock']).read_text(encoding='utf-8'))
    voices = [v for v in references['voices'] if v['voice_id'] == lock['voiceId']]
    if len(voices) != 1:
        raise ValueError('Selected narrator missing; no fallback allowed')
    settings = lock['generation']
    prod = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
        "import {narration} from './films/galileo/production.mjs';console.log(JSON.stringify(narration))"], cwd=ROOT))
    client = Client('ResembleAI/Chatterbox-Multilingual-TTS', verbose=False,
                    httpx_kwargs={'timeout': 60})
    for voice in voices:
        reference = ROOT / lock['reference']['path']
        if hashlib.sha256(reference.read_bytes()).hexdigest() != lock['reference']['sha256']:
            raise ValueError('Locked reference changed')
        out = OUT / voice['voice_id']; out.mkdir(parents=True, exist_ok=True)
        manifest = {'status': 'listening-candidate', 'model': 'Chatterbox Multilingual',
            'execution': 'official hosted demo; loaded weights version not verified',
            'modelLicense': 'MIT', 'referenceLicense': 'CC-BY-4.0',
            'reference': voice, 'attribution': references['attribution'],
            'referenceSource': references['source'], 'referenceRevision': references['revisionObserved'],
            'commercialLicenseBasis': 'Publisher explicitly permits commercial reuse of synthetic references with attribution.',
            'finalReleaseApproved': False, 'seed': 9, 'exaggeration': .5,
            'temperature': .8, 'cfg': .5, 'cues': []}
        if (out/'manifest.json').exists():
            previous = json.loads((out/'manifest.json').read_text(encoding='utf-8'))
            assert previous['reference']['sha256'] == voice['sha256']
            manifest = previous
        for index in [1, 4]:
            path = out/f'voice-{index}.wav'
            if path.exists():
                saved = next((c for c in manifest['cues'] if c['index'] == index), None)
                if not saved or saved['text'] != prod[index]['text'] or saved['sha256'] != hashlib.sha256(path.read_bytes()).hexdigest():
                    raise ValueError(f'Existing audition differs: {path}')
                continue
            print(f'Generating {voice["voice_id"]}, cue {index}', flush=True)
            started = time.perf_counter()
            job = client.submit(text_input=prod[index]['text'], language_id='tr',
                audio_prompt_path_input=handle_file(str(reference)), exaggeration_input=settings['exaggeration'],
                temperature_input=settings['temperature'], seed_num_input=settings['seed'],
                cfgw_input=settings['cfg'], api_name='/generate_tts_audio')
            result = job.result(timeout=300)
            shutil.copyfile(result, path)
            audio, sr = sf.read(path)
            assert sr == 24000 and audio.ndim == 1 and np.isfinite(audio).all()
            manifest['cues'].append({'index': index, 'text': prod[index]['text'],
                'seconds': len(audio)/sr, 'requestSeconds': time.perf_counter()-started,
                'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
            (out/'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
        clips = [sf.read(out/f'voice-{i}.wav')[0] for i in [1, 4]]
        reel = np.concatenate([clips[0], np.zeros(24000), clips[1]]) * 10**(-6/20)
        sf.write(out/'listening-reel.wav', reel, 24000, subtype='PCM_16')
        print(f'Saved {voice["voice_id"]}: {len(reel)/24000:.2f}s', flush=True)


if __name__ == '__main__':
    main()
