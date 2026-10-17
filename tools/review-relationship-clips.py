"""Decode actual lab MP4s; keep dense strips and independently measured metadata."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]);results=[]
ff=str(root/'.tools/ffmpeg.exe');probe=str(root/'.tools/ffprobe.exe')
for movie in sorted(out.glob('*.mp4')):
    meta=json.loads(subprocess.check_output([probe,'-v','error','-count_frames','-select_streams','v:0','-show_streams','-of','json',str(movie)]))['streams'][0]
    subprocess.run([ff,'-v','error','-xerror','-i',str(movie),'-f','null','-'],check=True)
    data=subprocess.check_output([ff,'-v','error','-i',str(movie),'-vf','scale=192:108','-pix_fmt','gray','-f','rawvideo','-'])
    frames=np.frombuffer(data,np.uint8).reshape(-1,108,192)
    diffs=np.abs(np.diff(frames.astype(float),axis=0)).mean(axis=(1,2))
    ok=len(frames)==180 and meta['width']==1920 and meta['height']==1080 and meta['r_frame_rate']=='30/1' and abs(float(meta['duration'])-6)<.04 and float(diffs.max())<25 and bool(np.all(frames.std(axis=(1,2))>5))
    results.append({'file':movie.name,'frames':len(frames),'fps':meta['r_frame_rate'],'duration':meta['duration'],'width':meta['width'],'height':meta['height'],'maxFrameDifference':float(diffs.max()),'ok':ok})
    # Select exact even frames: 15 Hz, labels match original video timestamps.
    rgb=subprocess.check_output([ff,'-v','error','-i',str(movie),'-vf',r'select=not(mod(n\,2)),scale=480:270','-vsync','0','-pix_fmt','rgb24','-f','rawvideo','-'])
    images=np.frombuffer(rgb,np.uint8).reshape(-1,270,480,3)
    for start in range(0,len(images),16):
        sheet=Image.new('RGB',(1920,4*296),'#10202b');draw=ImageDraw.Draw(sheet)
        for j,frame in enumerate(images[start:start+16]):
            x=(j%4)*480;y=(j//4)*296;sheet.paste(Image.fromarray(frame),(x,y));draw.text((x+8,y+274),f'{movie.stem} {(start+j)/15:.3f}s',fill='white')
        sheet.save(out/f'{movie.stem}-encoded-strip-{start//16+1:02}.jpg',quality=92)
(out/'encoded.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
if not all(r['ok'] for r in results) or len(results)!=3:raise SystemExit(1)
