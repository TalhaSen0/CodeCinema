from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];out=root/'review/revision/clips';checks=[]
for name,start,duration in [('arm',3.7,3.6),('entry',9.5,5),('turn',23.5,6),('exit',40.5,4)]:
    video=out/(name+'.mp4')
    probe=json.loads(subprocess.check_output([str(root/'.tools/ffprobe.exe'),'-v','error','-count_frames','-show_streams','-of','json',str(video)]))['streams'][0]
    assert int(probe['nb_read_frames'])==round(duration*30)
    subprocess.run([str(root/'.tools/ffmpeg.exe'),'-v','error','-xerror','-i',str(video),'-f','null','-'],check=True)
    pixels=subprocess.check_output([str(root/'.tools/ffmpeg.exe'),'-v','error','-i',str(video),'-vf','scale=96:54,format=gray','-f','rawvideo','-'])
    frames=[pixels[i:i+5184] for i in range(0,len(pixels),5184)]
    differences=[sum(abs(a-b) for a,b in zip(frames[i-1],frames[i]))/5184 for i in range(1,len(frames))]
    assert max(differences)<25,(name,max(differences))
    checks.append({'clip':name,'frames':len(frames),'maxFrameDifference':max(differences),'completeDecode':True})
    samples=[i for i in range(0,len(frames),5)] # 6 decoded frames/second, including start and near end.
    for offset in range(0,len(samples),16):
        sheet=Image.new('RGB',(1920,4*294),'#101a20');draw=ImageDraw.Draw(sheet)
        for j,frame in enumerate(samples[offset:offset+16]):
            png=out/f'{name}-decoded-{frame:03}.png'
            subprocess.run([str(root/'.tools/ffmpeg.exe'),'-v','error','-y','-ss',str(frame/30),'-i',str(video),'-frames:v','1',str(png)],check=True)
            im=Image.open(png);im.thumbnail((480,270));x=j%4*480;y=j//4*294;sheet.paste(im,(x,y));draw.text((x+8,y+273),f'{name} {start+frame/30:.3f}s',fill='#d8c092')
        sheet.save(out/f'{name}-decoded-sheet-{offset//16+1:02}.jpg',quality=94)
(out/'verification.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(checks)
