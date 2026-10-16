from pathlib import Path
import zipfile,hashlib
root=Path(__file__).resolve().parents[1];dest=root/'renders/codecinema-source.zip'
files=[]
for name in ['engine','films','tools','docs','production','briefs','tests','vendor/opus-js-animations']:
    for p in (root/name).rglob('*'):
        if p.is_file() and '.git' not in p.parts and '__pycache__' not in p.parts:files.append(p)
for name in ['AGENTS.md','README.md','package.json','package-lock.json','requirements.txt','.gitignore','assets/licenses.md','vendor/javascript-animation-skills/LICENSE','vendor/motion-skills/LICENSE','review/quality-report.md','review/verification.json','review/delivery-manifest.json','review/audio-timings.json','review/preview-smoke.json','review/audio-reuse-check.json','review/comparison/metrics.json']:
    p=root/name
    if p.exists():files.append(p)
for name in ['contact-sheet.jpg','face-hand-crop.png','hand-strip.jpg','race-strip.jpg','portal-strip.jpg','return-strip.jpg']:files.append(root/'review/encoded'/name)
with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in sorted(set(files)):z.write(p,Path('CodeCinema')/p.relative_to(root))
with zipfile.ZipFile(dest) as z:
    assert z.testzip() is None
    assert 'CodeCinema/AGENTS.md' in z.namelist()
    assert not any('node_modules' in n or 'assets/models' in n or '/.git/' in n for n in z.namelist())
sha=hashlib.sha256(dest.read_bytes()).hexdigest();dest.with_suffix('.sha256').write_text(sha+'  '+dest.name+'\n',encoding='ascii')
print('Source archive verified:',dest,'files',len(set(files)),'bytes',dest.stat().st_size)
