from pathlib import Path
import subprocess
import numpy as np
from PIL import Image,ImageDraw

root=Path(__file__).resolve().parents[1]
out=root/'review/relationships/comparison';out.mkdir(parents=True,exist_ok=True)
ff=root/'.tools/ffmpeg.exe'
for name in ['courier','mechanic','archivist']:
    raw=subprocess.check_output([str(ff),'-v','error','-i',str(out.parent/f'{name}.mp4'),'-vf',r'select=not(mod(n\,2)),crop=780:600:1100:350,scale=260:200','-vsync','0','-pix_fmt','rgb24','-f','rawvideo','-'])
    frames=np.frombuffer(raw,np.uint8).reshape(-1,200,260,3)
    sheet=Image.new('RGB',(2600,9*225),'#10202b');draw=ImageDraw.Draw(sheet)
    for i,frame in enumerate(frames):
        x=i%10*260;y=i//10*225;sheet.paste(Image.fromarray(frame),(x,y));draw.text((x+8,y+202),f'{name} {i/15:.3f}s',fill='white')
    sheet.save(out/f'{name}-dense.jpg',quality=94)
subprocess.run([str(ff),'-v','error','-y','-i',str(root/'review/relationships-before-stretch-fix/courier.mp4'),'-i',str(out.parent/'courier.mp4'),'-filter_complex','[0:v]crop=780:600:1100:350[a];[1:v]crop=780:600:1100:350[b];[a][b]hstack=inputs=2[v]','-map','[v]','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out/'before-after.mp4')],check=True)
