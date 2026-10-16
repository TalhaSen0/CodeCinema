"""Compare approved artwork sources, audio hashes and unaffected encoded reference regions."""
from pathlib import Path
import subprocess,re,hashlib,json
from PIL import Image,ImageChops,ImageStat,ImageDraw
root=Path(__file__).resolve().parents[1];out=root/'review/revision';out.mkdir(parents=True,exist_ok=True)
baseline='cc2b213';checks=[]
def original(path):return subprocess.check_output(['git','show',f'{baseline}:{path}'],cwd=root).decode('utf-8')
def function(source,name):
    a=re.search(r'(?:export )?function '+name+r'\(',source).start()
    b=re.search(r'\n(?:export )?function |\nlet sprites',source[a+1:])
    return source[a:a+1+b.start() if b else len(source)].strip()
for path,names in [('films/galileo/character.mjs',['head','torso','hand']),('films/galileo/room.mjs',['scenery'])]:
    old=original(path);new=(root/path).read_text(encoding='utf-8')
    for name in names:
        equal=function(old,name)==function(new,name);checks.append({'source':path,'function':name,'unchanged':equal});assert equal,(path,name)
for path in ['engine/paint.mjs','engine/physics.mjs']:
    equal=original(path).replace('\r\n','\n')==(root/path).read_text(encoding='utf-8');checks.append({'source':path,'unchanged':equal});assert equal,path
manifest=json.loads(original('review/delivery-manifest.json'))
for path,expected in manifest['inputs'].items():
    if path.endswith('.wav'):
        actual=hashlib.sha256((root/path).read_bytes()).hexdigest();checks.append({'audio':path,'unchanged':actual==expected});assert actual==expected,path
old=Image.open(root/'review/baseline/browser-2.png').convert('RGB');new=Image.open(out/'key-2.000.png').convert('RGB')
regions={'head':(965,385,1115,535),'bookcase':(1420,115,1840,755),'window':(140,110,435,620)}
comparison=Image.new('RGB',(960,2*294),'#101a20');d=ImageDraw.Draw(comparison)
for i,(im,label) in enumerate([(old,'BEFORE — 2.000s'),(new,'AFTER — 2.000s')]):
    im=im.resize((960,540));im.thumbnail((480,270));comparison.paste(im,(i*480,24));d.text((i*480+12,6),label,fill='#d8c092')
for name,box in regions.items():
    diff=ImageChops.difference(old.crop(box),new.crop(box));stat=ImageStat.Stat(diff);rmse=(sum(x*x for x in stat.rms)/3)**.5
    checks.append({'region':name,'rmse':rmse,'tolerance':5,'ok':rmse<5});assert rmse<5,(name,rmse)
comparison.crop((0,0,960,294)).save(out/'style-before-after.jpg',quality=96)
(out/'style-verification.json').write_text(json.dumps({'baseline':baseline,'checks':checks},indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2))
