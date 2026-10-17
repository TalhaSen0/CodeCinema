"""Conservative audition-only polish. Does not confer reference voice rights."""
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'films/galileo/assets/auditions/chatterbox-hosted'
source = OUT / 'listening-reel-headroom.wav'
original, sr = sf.read(source)
# Fixed low noise floor, mild attenuation, smoothed spectral gains.
filters = 'afftdn=nr=4:nf=-50:tn=0:gs=6'
with tempfile.TemporaryDirectory() as tmp:
    intermediate = Path(tmp) / 'filtered.wav'
    subprocess.run([str(ROOT / '.tools/ffmpeg.exe'), '-v', 'error', '-y',
                    '-i', str(source), '-af', filters, '-c:a', 'pcm_f32le',
                    str(intermediate)], check=True)
    clean, clean_sr = sf.read(intermediate)
assert clean_sr == sr and clean.shape == original.shape
assert np.isfinite(clean).all()
# Match RMS for a fair audition instead of making the processed copy louder.
rms = lambda x: float(np.sqrt(np.mean(x*x)))
gain = rms(original) / max(rms(clean), 1e-12)
clean *= gain
assert np.max(np.abs(clean)) < 0.95
sf.write(OUT / 'listening-reel-polished.wav', clean, sr, subtype='PCM_16')
sf.write(OUT / 'comparison-original-then-polished.wav',
         np.concatenate([original, np.zeros(sr), clean]), sr, subtype='PCM_16')
report = {'source': source.name, 'filter': filters, 'rmsMatchGain': gain,
          'sampleRate': sr, 'duration': len(clean)/sr,
          'timeStretch': False, 'subjectiveQuality': 'awaiting listening comparison',
          'commercialReleaseApproved': False,
          'watermark': 'No targeted removal; survival after filtering not measured.',
          'files': []}
for name in [source.name, 'listening-reel-polished.wav', 'comparison-original-then-polished.wav']:
    path = OUT / name
    audio, rate = sf.read(path)
    assert rate == sr and np.isfinite(audio).all()
    report['files'].append({'file': name, 'seconds': len(audio)/rate,
        'peak': float(np.max(np.abs(audio))), 'rms': rms(audio),
        'fullScaleSamples': int(np.sum(np.abs(audio) >= 32767/32768)),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT / 'polish-review.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
