"""Local Turkish cue alignment experiment; uncertain cues remain fully audible.

Run with .tools/alignment-env/Scripts/python.exe tools/align-narration.py
Requires the explicitly downloaded, hash-verified Whisper tiny checkpoint.
Produces a separate audition, never replaces the human-approved recording.
"""
from pathlib import Path
import hashlib
import importlib.util
import json
import math
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
MODEL_SHA = '65147644a518d12f04e32d6f3b26facc3f8dd46e5390956a9424a650c0ce22b9'


def normalized(text):
    return ''.join(c for c in unicodedata.normalize('NFC', text) if c.isalnum())


def assess(result, text, duration):
    words = [w for s in result.get('segments', []) for w in s.get('words', [])]
    reasons = []
    if not words or normalized(''.join(w['word'] for w in words)) != normalized(text):
        reasons.append('missing-or-mismatched-script-words')
    previous = 0.
    for w in words:
        start, end = w['start'], w['end']
        if not all(math.isfinite(v) for v in [start, end]) or not 0 <= start < end <= duration:
            reasons.append('invalid-or-zero-word-duration')
        if start < previous - .001:
            reasons.append('nonmonotonic-words')
        previous = end
        probability = w.get('probability', 0)
        if not math.isfinite(probability) or probability < .15:
            reasons.append('low-token-probability')
    if reasons:
        return [0., duration], sorted(set(reasons))
    # Extra uncertainty margin for the small model, separate from the user's
    # 100ms breathing room. Preserve all pauses within a cue, not every word.
    return [max(0., words[0]['start']-.1), min(duration, words[-1]['end']+.1)], []


def main():
    import numpy as np
    import soundfile as sf
    import torch
    import stable_whisper
    from scipy.signal import resample_poly
    model_path = ROOT / 'assets/models/whisper/tiny.pt'
    if hashlib.sha256(model_path.read_bytes()).hexdigest() != MODEL_SHA:
        raise ValueError('Whisper tiny checkpoint SHA mismatch')
    torch.set_num_threads(4)
    model = stable_whisper.load_model('tiny', device='cpu', download_root=str(model_path.parent))
    out = ROOT / 'films/galileo/assets/auditions/chatterbox-hosted'
    manifest = json.loads((out/'manifest.json').read_text(encoding='utf-8'))
    intervals, reviews, offset = [], [], 0.
    for cue in manifest['cues']:
        path = out / f"voice-{cue['index']}.wav"
        audio, sr = sf.read(path)
        if sr != 24000 or audio.ndim != 1:
            raise ValueError('Audition expects mono 24kHz source')
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest != cue['sha256']:
            raise ValueError('Cue changed since generation')
        result = model.align(resample_poly(audio, 2, 3).astype(np.float32),
                             cue['text'], language='tr', vad=False, verbose=None)
        data = result.to_dict() if result else {}
        (out/f"alignment-tiny-{cue['index']}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        interval, reasons = assess(data, cue['text'], len(audio)/sr)
        intervals.append([offset+interval[0], offset+interval[1]])
        reviews.append({'cue': cue['index'], 'sourceSHA256': digest,
                        'action': 'preserve-full-cue' if reasons else 'candidate-boundary-trim',
                        'reviewReasons': reasons, 'localInterval': interval})
        offset += len(audio)/sr + 1.
    spec = {'speechIntervals': intervals, 'paddingSeconds': .1, 'fadeSeconds': .01,
            'alignmentUncertaintyMarginSeconds': .1, 'model': 'Whisper tiny',
            'modelSHA256': MODEL_SHA, 'runtime': 'stable-ts 2.19.1 / openai-whisper 20250625',
            'mode': 'candidate-only; supplied-text alignment is not independent ASR verification',
            'cues': reviews}
    (out/'speech-intervals-auto.json').write_text(json.dumps(spec, indent=2), encoding='utf-8')
    loader = importlib.util.spec_from_file_location('speech_envelope', ROOT/'tools/speech-envelope.py')
    module = importlib.util.module_from_spec(loader); loader.loader.exec_module(module)
    source, rate = sf.read(out/'listening-reel-polished.wav')
    gain = module.envelope(len(source), rate, intervals)
    sf.write(out/'listening-reel-auto-pauses.wav', source*gain, rate, subtype='PCM_16')
    decoded, _ = sf.read(out/'listening-reel-auto-pauses.wav')
    assert np.array_equal(decoded[gain == 1], source[gain == 1])
    assert np.all(decoded[gain == 0] == 0)
    report = {'duration': len(source)/rate, 'peak': float(np.abs(decoded).max()),
              'preservedSamples': int((gain == 1).sum()), 'silencedSamples': int((gain == 0).sum()),
              'commercialReleaseApproved': False, 'humanListeningAccepted': False,
              'cues': reviews}
    (out/'auto-pauses-review.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
