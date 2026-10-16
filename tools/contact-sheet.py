from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,sys,math
p=Path(sys.argv[1])
def sheet(items,name,cols=4,width=480):
    h=round(width*9/16);out=Image.new('RGB',(cols*width,math.ceil(len(items)/cols)*(h+27)), '#101a20');d=ImageDraw.Draw(out)
    for i,item in enumerate(items):
        im=Image.open(p/item['file']).convert('RGB');im.thumbnail((width,h));x=(i%cols)*width;y=(i//cols)*(h+27);out.paste(im,(x,y));d.text((x+12,y+h+5),f"{item['t']:.3f} s",fill='#d8c092')
    out.save(p/name,quality=94)
sheet(json.loads((p/'manifest.json').read_text()),'contact-sheet.jpg')
items=json.loads((p/'manifest.json').read_text())
for i in range(0,len(items),24):sheet(items[i:i+24],f'contact-page-{i//24+1}.jpg')
for name in ['hand-page','portal','race','return']:sheet(json.loads((p/(name+'.json')).read_text()),name+'-sheet.jpg',4)
print('Contact sheet and four temporal strips:',p)
