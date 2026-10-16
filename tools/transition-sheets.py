from pathlib import Path
from PIL import Image,ImageDraw
import json,sys,math
p=Path(sys.argv[1]);cols=4;w=480;h=270
for name in ['arm','entry','turn','exit']:
    items=json.loads((p/name/'manifest.json').read_text(encoding='utf-8'))
    for start in range(0,len(items),16):
        chunk=items[start:start+16];out=Image.new('RGB',(cols*w,math.ceil(len(chunk)/cols)*(h+26)),'#101a20');d=ImageDraw.Draw(out)
        for i,item in enumerate(chunk):
            im=Image.open(p/name/item['file']).convert('RGB');im.thumbnail((w,h));x=i%cols*w;y=i//cols*(h+26);out.paste(im,(x,y));d.text((x+10,y+h+4),f"{name} · {item['t']:.4f} s",fill='#d8c092')
        out.save(p/name/f'sheet-{start//16+1:02}.jpg',quality=94)
print('Paginated temporal sheets ready.')
