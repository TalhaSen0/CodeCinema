"""Apply supplied speech intervals without changing timing or the source file.

Intervals must be reviewed against the recording (or supplied by an aligner).
This is not a speech detector: text or volume alone cannot identify breaths.
"""
import argparse
import hashlib
import json
from pathlib import Path
import numpy as np
import soundfile as sf


def envelope(count, rate, intervals, padding=.1, fade=.01):
    if padding < 0 or fade <= 0:
        raise ValueError('Padding must be nonnegative and fade positive')
    t = np.arange(count) / rate
    gain = np.zeros(count)
    for start, end in intervals:
        if not 0 <= start < end <= count / rate:
            raise ValueError('Speech interval outside recording')
        # Full level throughout speech and padding; fades outside that region.
        left, right = start - padding, end + padding
        rise = np.clip((t - (left - fade)) / fade, 0, 1)
        fall = np.clip(((right + fade) - t) / fade, 0, 1)
        window = .5 - .5 * np.cos(np.pi * np.minimum(rise, fall))
        gain = np.maximum(gain, window)
    return gain


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('intervals', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    if args.source.resolve() == args.output.resolve():
        raise ValueError('Preserve original recording')
    spec = json.loads(args.intervals.read_text(encoding='utf-8'))
    x, rate = sf.read(args.source)
    if not np.isfinite(x).all():
        raise ValueError('Nonfinite source')
    gain = envelope(len(x), rate, spec['speechIntervals'],
                    spec.get('paddingSeconds', .1), spec.get('fadeSeconds', .01))
    y = x * (gain if x.ndim == 1 else gain[:, None])
    sf.write(args.output, y, rate, subtype='PCM_16')
    decoded, decoded_rate = sf.read(args.output)
    assert decoded_rate == rate and decoded.shape == x.shape
    assert np.all(decoded[gain == 0] == 0)
    # PCM16 inputs stay bit-identical; higher precision inputs may quantize.
    assert np.max(np.abs(decoded[gain == 1] - x[gain == 1]), initial=0) <= 1/32768
    report = {'source': str(args.source), 'intervalSpecification': spec,
              'duration': len(x)/rate, 'sampleRate': rate,
              'unchangedFullGainSamples': int(np.sum(gain == 1)),
              'zeroGainSamples': int(np.sum(gain == 0)),
              'peak': float(np.max(np.abs(decoded))),
              'sourceSHA256': hashlib.sha256(args.source.read_bytes()).hexdigest(),
              'outputSHA256': hashlib.sha256(args.output.read_bytes()).hexdigest(),
              'subjectiveResult': 'awaiting listening; boundaries are provisional',
              'commercialReleaseApproved': False}
    args.output.with_suffix('.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
