"""Extract the actually encoded MP4, not merely browser renders, for final visual QA."""
from pathlib import Path
from PIL import Image,ImageDraw
import subprocess,json,sys,math
ROOT=Path(__file__).resolve().parents[1];FF=str(ROOT/'.tools/ffmpeg.exe');out=ROOT/(sys.argv[2] if len(sys.argv)>2 else 'review/encoded');out.mkdir(parents=True,exist_ok=True)
video=ROOT/(sys.argv[1] if len(sys.argv)>1 else 'renders/galileo-final.mp4')
times=[0,2,4.7,5.5,6,7,10,11,12,13,14,16,18,19.5,21,24,25.5,27,29,31,34,35.5,36.3,37,39,41,42,43,44,46,47.96]
def extract(t,name):subprocess.run([FF,'-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(out/name)],check=True)
def sheet(items,output_name,cols=4):
    w=480;h=270;im=Image.new('RGB',(cols*w,math.ceil(len(items)/cols)*(h+24)),'#101a20');d=ImageDraw.Draw(im)
    for i,(t,name) in enumerate(items):
        frame=Image.open(out/name).convert('RGB');frame.thumbnail((w,h));x=i%cols*w;y=i//cols*(h+24);im.paste(frame,(x,y));d.text((x+12,y+h+4),f'{t:.3f}s',fill='#d8c092')
    im.save(out/output_name,quality=94)
items=[]
for i,t in enumerate(times):
    name=f'encoded-{i:02}.png';extract(t,name);items.append((t,name))
sheet(items,'contact-sheet.jpg')
for label,a,b in [('hand',3.7,7.3),('race',34,37),('portal',9.5,14.5),('turn',23.5,29.5),('return',40.5,44.5)]:
    strip=[]
    for i in range(round((b-a)*12)+1):
        t=a+i/12;name=f'{label}-{i:02}.jpg';extract(t,name);strip.append((t,name))
    for start in range(0,len(strip),16): sheet(strip[start:start+16],label+f'-strip-{start//16+1:02}.jpg')
# Close crops remain 1:1 image pixels for face and contact inspection.
Image.open(out/'encoded-03.png').crop((885,340,1240,830)).save(out/'face-hand-crop.png')
Image.open(out/'encoded-03.png').crop((900,620,1350,900)).save(out/'page-contact-crop.png')
(out/'manifest.json').write_text(json.dumps({'video':str(video),'frames':[{'t':t,'file':n} for t,n in items]},indent=2),encoding='utf-8')
print('Decoded video contact sheet and crops ready:',out)
