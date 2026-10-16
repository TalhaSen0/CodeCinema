from pathlib import Path
import subprocess
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];ff=str(root/'.tools/ffmpeg.exe');out=root/'review/revision';old=root/'renders/galileo-before-pages.mp4';new=root/'renders/galileo-final-v2.mp4'
font="C\\:/Windows/Fonts/georgia.ttf"
def branch(index,label):return f"[{index}:v]scale=960:540,pad=960:572:0:32:color=0x101a20,drawtext=fontfile='{font}':text='{label}':x=18:y=6:fontsize=18:fontcolor=0xd8c092[v{index}]"
subprocess.run([ff,'-v','error','-y','-i',str(old),'-i',str(new),'-filter_complex',branch(0,'ONCE')+';'+branch(1,'SONRA')+';[v0][v1]hstack=inputs=2[v]','-map','[v]','-map','1:a:0','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(root/'renders/galileo-before-after.mp4')],check=True)
sheet=Image.new('RGB',(1920,4*572),'#101a20');draw=ImageDraw.Draw(sheet)
for row,t in enumerate([2,12,26,43]):
    for col,video in enumerate([old,new]):
        path=out/f'compare-{row}-{col}.png';subprocess.run([ff,'-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(path)],check=True)
        im=Image.open(path).resize((960,540));sheet.paste(im,(col*960,row*572+32));draw.text((col*960+12,row*572+8),f'{"BEFORE" if col==0 else "AFTER"} {t:.3f}s',fill='#d8c092')
sheet.save(out/'before-after.jpg',quality=96)
print('Before/after encoded MP4 and reference sheet ready.')
