"""Apply conservative polish and guarded cue alignment to male voice candidates."""
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly
import torch
import stable_whisper

ROOT = Path(__file__).resolve().parents[1]


def load_tool(name):
    spec = importlib.util.spec_from_file_location(name, ROOT/'tools'/f'{name}.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


def main():
    align = load_tool('align-narration'); env = load_tool('speech-envelope')
    checkpoint = ROOT/'assets/models/whisper/tiny.pt'
    assert hashlib.sha256(checkpoint.read_bytes()).hexdigest() == align.MODEL_SHA
    torch.set_num_threads(4)
    model = stable_whisper.load_model('tiny', device='cpu', download_root=str(checkpoint.parent))
    selected = json.loads((ROOT/'assets/selected-voice.json').read_text(encoding='utf-8'))
    lock = json.loads((ROOT/selected['voiceLock']).read_text(encoding='utf-8'))
    for voice_id in [lock['voiceId']]:
        out = ROOT/'films/galileo/assets/auditions/male-voices'/voice_id
        if not (out/'manifest.json').exists():
            print(f'No generated audition yet: {voice_id}', flush=True)
            continue
        manifest = json.loads((out/'manifest.json').read_text(encoding='utf-8'))
        clips = []
        for cue in manifest['cues']:
            if clips:
                clips.append(np.zeros(24000))
            clip, sr = sf.read(out/f'voice-{cue["index"]}.wav')
            assert sr == 24000
            clips.append(clip)
        if not clips:
            continue
        sf.write(out/'listening-reel.wav', np.concatenate(clips)*10**(-6/20), 24000, subtype='PCM_16')
        intervals, checks, offset = [], [], 0.
        for cue in manifest['cues']:
            path = out/f'voice-{cue["index"]}.wav'
            assert hashlib.sha256(path.read_bytes()).hexdigest() == cue['sha256']
            audio, sr = sf.read(path)
            assert sr == 24000 and audio.ndim == 1
            result = model.align(resample_poly(audio, 2, 3).astype(np.float32),
                                 cue['text'], language='tr', vad=False, verbose=None)
            data = result.to_dict() if result else {}
            (out/f'alignment-{cue["index"]}.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
            interval, reasons = align.assess(data, cue['text'], len(audio)/sr)
            intervals.append([offset+interval[0], offset+interval[1]])
            checks.append({'cue': cue['index'], 'interval': interval, 'reviewReasons': reasons,
                           'action': 'preserve-full-cue' if reasons else 'candidate-trim'})
            offset += len(audio)/sr + 1.
        source = out/'listening-reel.wav'; original, sr = sf.read(source)
        with tempfile.TemporaryDirectory() as tmp:
            intermediate = Path(tmp)/'polished.wav'
            subprocess.run([str(ROOT/'.tools/ffmpeg.exe'), '-v', 'error', '-y', '-i', str(source),
                '-af', 'afftdn=nr=4:nf=-50:tn=0:gs=6', '-c:a', 'pcm_f32le', str(intermediate)], check=True)
            polished, rate = sf.read(intermediate)
        assert rate == sr and polished.shape == original.shape
        rms = lambda x: float(np.sqrt(np.mean(x*x)))
        polished *= rms(original) / max(rms(polished), 1e-12)
        gain = env.envelope(len(polished), sr, intervals)
        final = polished*gain
        assert np.isfinite(final).all() and np.max(np.abs(final)) < .95
        sf.write(out/'listening-ready.wav', final, sr, subtype='PCM_16')
        decoded, _ = sf.read(out/'listening-ready.wav')
        assert np.all(decoded[gain == 0] == 0)
        report = {'voice': voice_id, 'duration': len(final)/sr, 'sampleRate': sr,
            'peak': float(np.abs(decoded).max()), 'filter': 'afftdn=nr=4:nf=-50:tn=0:gs=6',
            'paddingSeconds': .1, 'fadeSeconds': .01, 'alignmentUncertaintySeconds': .1,
            'timeStretch': False, 'pitchShift': False, 'humanListeningAccepted': False,
            'watermark': 'No targeted removal; postfilter detection not measured', 'cues': checks,
            'sha256': hashlib.sha256((out/'listening-ready.wav').read_bytes()).hexdigest()}
        (out/'review.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        (out/'ATTRIBUTION.txt').write_text(manifest['attribution']+'\n'+manifest['referenceSource']+
             '\nhttps://creativecommons.org/licenses/by/4.0/\nAI-generated narration with MIT-licensed Chatterbox.\n', encoding='utf-8')
        print(json.dumps(report, indent=2), flush=True)


if __name__ == '__main__':
    main()
