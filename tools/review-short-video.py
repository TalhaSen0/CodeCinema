"""Decode a complete short film and make actual MP4 evidence."""
from pathlib import Path
import subprocess,json,sys,hashlib
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1];video=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
ff=str(root/'.tools/ffmpeg.exe');probe=str(root/'.tools/ffprobe.exe')
info=json.loads(subprocess.check_output([probe,'-v','error','-count_frames','-show_streams','-show_format','-of','json',str(video)]))
v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
duration=float(info['format']['duration']);assert v['r_frame_rate']=='30/1';assert int(v['nb_read_frames'])==round(duration*30)
subprocess.run([ff,'-v','error','-xerror','-i',str(video),'-f','null','NUL'],check=True)
def sheet(name,start,seconds,fps,cols):
 dest=out/name
 subprocess.run([ff,'-v','error','-y','-ss',str(start),'-i',str(video),'-t',str(seconds),'-vf',f'fps={fps},scale=480:270,tile={cols}x{int((seconds*fps+cols-1)//cols)}','-frames:v','1',str(dest)],check=True)
sheet('contact-sheet.jpg',0,duration,.5,4)
sheet('transition-1.jpg',7,2,12,4)
sheet('transition-2.jpg',23,2,12,4)
subprocess.run([ff,'-v','error','-y','-ss','17','-i',str(video),'-frames:v','1',str(out/'detail.png')],check=True)
report={'video':str(video),'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'duration':duration,'width':v['width'],'height':v['height'],'fps':v['r_frame_rate'],'decodedFrames':v['nb_read_frames'],'videoCodec':v['codec_name'],'audioCodec':a['codec_name'],'fullDecode':'passed','subjectiveAudio':'not listened by agent'}
(out/'verification.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report))
