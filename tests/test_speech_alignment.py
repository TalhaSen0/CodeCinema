"""Safety gates must preserve narration when alignment is suspect."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('alignment', ROOT/'tools/align-narration.py')
alignment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(alignment)


class AlignmentGateTests(unittest.TestCase):
    def setUp(self):
        self.result = {'segments': [{'words': [
            {'word': 'Bir ', 'start': .2, 'end': .4, 'probability': .8},
            {'word': 'örnek.', 'start': .4, 'end': 1., 'probability': .8}]}]}

    def test_valid_keeps_uncertainty_margin(self):
        interval, reasons = alignment.assess(self.result, 'Bir örnek.', 2.)
        self.assertEqual(interval, [.1, 1.1])
        self.assertEqual(reasons, [])

    def test_corrupt_alignment_preserves_whole_cue(self):
        for field, value in [('end', .4), ('probability', .01),
                             ('start', float('nan')), ('end', 3.), ('start', .1)]:
            with self.subTest(field=field, value=value):
                data = copy.deepcopy(self.result)
                data['segments'][0]['words'][1][field] = value
                interval, reasons = alignment.assess(data, 'Bir örnek.', 2.)
                self.assertEqual(interval, [0., 2.])
                self.assertTrue(reasons)

    def test_missing_text_preserves_whole_cue(self):
        interval, reasons = alignment.assess(self.result, 'Bir farklı örnek.', 2.)
        self.assertEqual(interval, [0., 2.])
        self.assertIn('missing-or-mismatched-script-words', reasons)

    def test_empty_preserves_whole_cue(self):
        self.assertEqual(alignment.assess({}, 'Bir örnek.', 2.)[0], [0., 2.])


if __name__ == '__main__':
    unittest.main()
