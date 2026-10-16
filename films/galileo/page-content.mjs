import {use,ctx,rect,path,line,ellipse,grad,glow,text,paper} from '../../engine/paint.mjs';
import {ease} from '../../engine/math.mjs';
import {makeTracks} from '../../engine/physics.mjs';
let parchment;const tracks=makeTracks(),colors=['#6b6b61','#9c5134','#2b6a66'],symbol=['I','II','III'];
const label=(...args)=>text(...args);
function heading(kicker,title,sub){label(kicker,147,183,20,'#8a5e38');line([[147,204],[350,204]],'#9a7448',1);label(title,145,277,54,'#403125');if(sub)label(sub,148,326,23,'#7e6141')}
function diagram(t,cycloid=false){
 if(!parchment)parchment=paper();
 ctx.drawImage(parchment,0,0);rect(0,0,1920,1080,glow(820,510,1100,'#fff0c325'));
 // Engraved ruled border; scientific folio, rather than a slide deck.
 ctx.strokeStyle='#785b3844';ctx.lineWidth=1;ctx.strokeRect(95,116,1730,838);ctx.strokeRect(102,123,1716,824);
 heading(cycloid?'ACTA ERUDITORUM · 1697':'İKİ YENİ BİLİM · 1638',cycloid?'Zamanın çizdiği eğri':'En kısa yol. En kısa süre?',cycloid?(t>=38?'Başta kazanılan hız, uzun yolu telafi eder.':'Bir çemberin üzerindeki nokta, sikloidi çizer.'):'Aynı başlangıç. Aynı varış. Farklı zamanlar.');
 const ox=410,oy=355,sx=140,sy=140;
 const map=p=>[ox+p[0]*sx,oy+p[1]*sy];
 // Equal pixel scales keep the circular arc circular and preserve the cycloid's geometry.
 ctx.save();ctx.setLineDash([4,9]);line([[ox,oy],[ox,oy+3*sy],[ox+6*sx,oy+3*sy]],'#94714666',1.5);ctx.restore();
 label('3 m',ox-28,oy+1.5*sy,20,'#8b704d','right');label('6 m',ox+3*sx,oy+3*sy+36,20,'#8b704d','center');
 const count=cycloid?3:2;
 for(let j=0;j<count;j++){
  const track=tracks.curves[j],draw=cycloid?ease(t,29+j*.18,31.8+j*.18):ease(t,14+j*.7,16+j*.7),pts=[];
  for(let i=0;i<=260*draw;i++)pts.push(map(track.point(i/260)));
  if(pts.length)line(pts,colors[j],j===2?5:3);
 }
 for(const [s,p] of [['A',[0,0]],['B',[6,3]]]){const [x,y]=map(p);ellipse(x,y,7,7,'#3b3328');label(s,s==='A'?x-30:x-10,s==='A'?y+16:y-24,31,'#413326')}
 const release=cycloid?34:17.5,elapsed=Math.max(0,(t-release)*.62);
 for(let j=0;j<count;j++){
  const track=tracks.curves[j];if(t<release)continue;const [x,y]=map(track.at(elapsed));
  // Tails are historical positions; no accumulated particle state and no rotation implying rolling.
  for(let k=9;k>0;k--){const [tx,ty]=map(track.at(Math.max(0,elapsed-k*.026)));ellipse(tx,ty,7,7,colors[j]+Math.round(35*(1-k/10)).toString(16).padStart(2,'0'))}
  ellipse(x+4,y+8,12,5,'#322b2133');ellipse(x,y,11,11,colors[j],'#ead5a0',2);ellipse(x-3,y-4,3,3,'#eee1b7');
 }
 // Legend and calculated times share the simulation's data, not authored fake numbers.
 for(let j=0;j<count;j++){const x=240+j*520;line([[x,915],[x+40,915]],colors[j],4);label(symbol[j]+'  '+tracks.curves[j].name,x+55,922,25,colors[j]);if(t>release+tracks.curves[j].duration/.62)label(tracks.curves[j].duration.toFixed(3)+' s',x+290,922,24,colors[j])}
 label('Durgun başlangıç · g = 9,81 m/s² · Sürtünmesiz kayma · Hareket 0,62×',960,961,19,'#7c6241','center');
 // An engraved chronometer supplies a visible time reference beside the trajectories.
 const clock=Math.min(elapsed,tracks.curves[0].duration),cx=1570,cy=560;
 ellipse(cx,cy,112,112,null,'#947245',2);ellipse(cx,cy,102,102,null,'#94724577',1);
 for(let i=0;i<40;i++){const a=i/40*Math.PI*2,r=i%5?96:90;line([[cx+Math.sin(a)*r,cy-Math.cos(a)*r],[cx+Math.sin(a)*102,cy-Math.cos(a)*102]],'#896941',i%5?1:2)}
 const angle=clock/2*Math.PI*2;line([[cx,cy],[cx+Math.sin(angle)*77,cy-Math.cos(angle)*77]],'#755237',3);ellipse(cx,cy,5,5,'#755237');
 label(clock.toFixed(2)+' s',cx,cy+158,32,'#6a5035','center');label('LE TEMPS',cx,cy-141,17,'#8b6a43','center');
 if(cycloid&&t<34){
  // Real rolling circle construction, inset. This circle is a construction tool, not the sliding mass.
  const th=tracks.theta*ease(t,29,33.3),a=tracks.a*44,cx=1100+a*th,cy=223-a;
  ctx.save();ctx.globalAlpha=.65;line([[1070,223],[1670,223]],'#8a704b',1);const trace=[];for(let i=0;i<=100;i++){const u=th*i/100;trace.push([1100+a*(u-Math.sin(u)),223-a*(1-Math.cos(u))])}line(trace,'#2b6a66',2);ellipse(cx,cy,a,a,null,'#987c4d',2);line([[cx,cy],[cx-a*Math.sin(th),cy+a*Math.cos(th)]],'#95653e',2);ellipse(cx-a*Math.sin(th),cy+a*Math.cos(th),5,5,'#2b6a66');ctx.restore();
 }
 if(!cycloid&&t>=20.4){
  // A written conclusion follows the race while the narration explains Galileo's arcs.
  // Reveal in page UV space; the finished note remains attached during the turn.
  ctx.save();ctx.beginPath();ctx.rect(1350,785,480*ease(t,20.4,22.5),92);ctx.clip();
  label('Dairesel yay:',1350,815,23,'#9c5134');
  label('daha uzun yol, daha kısa süre.',1350,849,23,'#9c5134');
  line([[1350,860],[1350+350*ease(t,21.5,22.7),860]],'#9c5134',1.5);ctx.restore();
 }
}

const textures=new Map();let diagnostic=null;
export function setPageDiagnostic(mode){diagnostic=mode;for(const entry of textures.values())entry.time=NaN}
export function renderPageContent(id,t){
 if(diagnostic){const colors={galileo:'#b53535',bernoulli:'#27944f',notes:'#6c4ab8',back:'#decba4'};rect(0,0,1920,1080,colors[id]);if(diagnostic==='anchors'&&id!=='back'){ellipse(410,355,40,40,'#ff00ff');ellipse(1250,775,40,40,'#00ffff')}return}
 if(!parchment)parchment=paper();
 if(id==='back'||id==='notes'){
  ctx.drawImage(parchment,0,0);
  if(id==='notes'){heading('GALILEO GALILEI · DE MOTU','İki Yeni Bilim','Hareket üzerine notlar');for(let i=0;i<19;i++){const y=390+i*24;line([[180,y],[860+(i%4)*170,y]],'#66583b55',2)}}
  return;
 }
 diagram(t,id==='bernoulli');
 if(id==='bernoulli'&&t<30.6){
  // Chapter title belongs to the new sheet's UV texture, never a screen overlay.
  ctx.save();ctx.globalAlpha=1-ease(t,29,30.6);text('1696',960,463,142,'#43372a','center');text('JOHANN BERNOULLI',960,528,26,'#614b31','center');text('Bir soru, Avrupa’nın matematikçilerine ulaşır.',960,589,27,'#725638','center');ctx.restore();
 }
}
export function pageTexture(id,t,width=1920,height=1080){
 if(width!==1920||height!==1080){
  const source=pageTexture(id,t),key=id+':'+width+'x'+height;let entry=textures.get(key);
  if(!entry){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;entry={canvas,time:NaN};textures.set(key,entry)}
  if(entry.time!==t){const c=entry.canvas.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.clearRect(0,0,width,height);c.drawImage(source,0,0,width,height);entry.time=t}return entry.canvas;
 }
 let entry=textures.get(id);if(!entry){const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;entry={canvas,time:NaN};textures.set(id,entry)}
 if(entry.time!==t){const original=ctx;use(entry.canvas.getContext('2d'));ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';renderPageContent(id,t);use(original);entry.time=t}
 return entry.canvas;
}
