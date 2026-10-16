import {use,ctx,rect,path,line,ellipse,grad,glow,text,paper,textBoxes,resetTextBoxes} from '../../engine/paint.mjs';
import {clamp,mix,ease,smooth} from '../../engine/math.mjs';
import {makeTracks} from '../../engine/physics.mjs';
import {room} from './room.mjs';
import {getSprites} from './character.mjs';
import {DURATION,narration,shots,events} from './production.mjs';
import {warp} from '../../engine/warp.mjs';
const c=document.querySelector('canvas'),q=new URLSearchParams(location.search),scale=(window.FILM_SCALE||1)*Number(q.get('ss')||1);
c.width=1920*scale;c.height=1080*scale;use(c.getContext('2d',{alpha:false}));
const parchment=paper(),tracks=makeTracks(),duration=window.COMPARE?10:DURATION;
const colors=['#6b6b61','#9c5134','#2b6a66'];
const symbol=['I','II','III'];
function label(s,x,y,size=30,col='#dfc89f',align='left'){text(s,x,y,size,col,align)}
function heading(kicker,title,sub){label(kicker,147,183,20,'#8a5e38');line([[147,204],[350,204]],'#9a7448',1);label(title,145,277,54,'#403125');if(sub)label(sub,148,326,23,'#7e6141')}
function diagram(t,cycloid=false){
 ctx.drawImage(parchment,0,0);rect(0,0,1920,1080,glow(820,510,1100,'#fff0c325'));
 // Engraved ruled border; scientific folio, rather than a slide deck.
 ctx.strokeStyle='#785b3844';ctx.lineWidth=1;ctx.strokeRect(95,116,1730,838);ctx.strokeRect(102,123,1716,824);
 heading(cycloid?'ACTA ERUDITORUM · 1697':'İKİ YENİ BİLİM · 1638',cycloid?'Zamanın çizdiği eğri':'En kısa yol. En kısa süre?',cycloid?'Bir çemberin üzerindeki nokta, sikloidi çizer.':'Aynı başlangıç. Aynı varış. Farklı zamanlar.');
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
 if(cycloid&&t>38){ctx.save();ctx.globalAlpha=ease(t,38,39);rect(147,300,1000,40,'#d7ba83');label('Başta kazanılan hız, uzun yolu telafi eder.',148,326,23,'#7e6141');ctx.restore()}
}
function wide(t,closing=false){
 ctx.save();const z=closing?mix(1.12,1.04,ease(t,43,48)):1.02+t*.006;ctx.translate(960,530);ctx.scale(z,z);ctx.translate(-960,-530);room(closing?8+Math.max(0,t-44)*.4:t,window.COMPARE==='hybrid');ctx.restore();
 // Light falloff preserves candle highlights, with a cool outside world.
 rect(0,0,1920,1080,grad(0,0,1000,0,[[0,'#08141be6'],[.52,'#09131b70'],[1,'transparent']]));
 if(!window.COMPARE){ctx.save();ctx.globalAlpha=closing?ease(t,43.5,45):ease(t,.2,2)*(1-ease(t,8,10));
 label(closing?'CODECINEMA · BİLİMİN İZİNDE':'BİLİMİN İZİNDE / 01',154,270,21,'#bda274');line([[154,294],[390,294]],'#b79b64',1);
 label(closing?'Doğru soru,':'Galileo',148,393,83,'#e4d1ac');label(closing?'yeni bir yol açar.':'ve en hızlı yol',152,466,56,'#d4ba8b');
 label(closing?'1638 → 1697':'Mesafe ile zaman arasında bir hikâye',156,529,24,'#b5a183');if(!closing)label('Çalışma odası: temsili canlandırma',156,578,18,'#a99779');ctx.restore()}
}
const pageTexture=document.createElement('canvas');pageTexture.width=1920;pageTexture.height=1080;
function portal(t,reverse=false){
 const p=ease(t,reverse?41:10,reverse?44:14),k=reverse?1-p:p;
 wide(reverse?44:t,reverse);
 const camera=reverse?mix(1.12,1.04,ease(44,43,48)):1.02+t*.006;
 const page=[[1017,818],[1302,813],[1307,861],[1031,887]].map(([x,y])=>[960+(x-960)*camera,530+(y-530)*camera]);
 const full=[[0,0],[1920,0],[1920,1080],[0,1080]],quad=page.map((a,i)=>[mix(a[0],full[i][0],k),mix(a[1],full[i][1],k)]);
 const original=ctx;use(pageTexture.getContext('2d'));ctx.setTransform(1,0,0,1,0,0);diagram(reverse?40:14,reverse);use(original);warp(ctx,pageTexture,quad,7);
}
function pageTurn(t){
 diagram(t<26?23.9:29,false);
 const p=ease(t,24,28.5),edge=1920*(1-p);
 if(p>.02){ctx.save();ctx.beginPath();ctx.rect(edge,0,1920-edge,1080);ctx.clip();diagram(29,true);ctx.restore();
 path(`M ${edge} 0 Q ${edge-240*Math.sin(p*Math.PI)} 540 ${edge} 1080 L ${edge+130*Math.sin(p*Math.PI)} 1080 Q ${edge+70} 540 ${edge+130*Math.sin(p*Math.PI)} 0 Z`,grad(edge-120,0,edge+150,0,[[0,'#8b704e'],[.5,'#f0ddb0'],[1,'#c1a271']]),'#8f754d',1);
 }
 ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)**2;label('1696',960,463,142,'#43372a','center');label('JOHANN BERNOULLI',960,528,26,'#614b31','center');label('Bir soru, Avrupa’nın matematikçilerine ulaşır.',960,589,27,'#725638','center');ctx.restore();
}
function subtitles(t){const n=narration.find(n=>t>=n.start&&t<n.end);if(!n)return;const words=n.text.split(' '),lines=[];let s='';ctx.font='25px Georgia';for(const word of words){if(ctx.measureText(s+' '+word).width>1510){lines.push(s);s=word}else s+=(s?' ':'')+word}if(s)lines.push(s);const y=lines.length>1?1021:1040;lines.forEach((s,i)=>label(s,960,y+i*34,25,'#ecdfc2','center'))}
function seek(time){resetTextBoxes();const t=clamp(Number(time)||0,0,duration);ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,1920,1080);
 if(window.COMPARE||t<10)wide(t);else if(t<14)portal(t);else if(t<24)diagram(t);else if(t<29)pageTurn(t);else if(t<41)diagram(t,true);else if(t<44)portal(t,true);else wide(t,true);
 // Cinemascope composition with subtitles in the lower picture area.
 rect(0,0,1920,65,'#0c1419');rect(0,988,1920,92,'#0c1419');
 label('C O D E C I N E M A',153,42,17,'#967e59');label(window.COMPARE?'ÇALIŞMA ODASI · '+window.COMPARE.toUpperCase():'GALILEO / EN HIZLI YOL',1767,42,15,'#967e59','right');
 if(!window.COMPARE)subtitles(t);
 const range=document.getElementById('scrub');if(range)range.value=t;const counter=document.getElementById('time');if(counter)counter.textContent=t.toFixed(1)+' / '+duration;
}
await document.fonts.ready;
window.__film={duration,ready:true,seek,shots,events,textBoxes,tracks:tracks.curves.map(c=>({id:c.id,duration:c.duration})),sprites:()=>Object.fromEntries(Object.entries(getSprites()).map(([k,c])=>[k,c.toDataURL()]))};
seek(Number(q.get('t')||0));
if(q.has('capture'))document.body.classList.add('capture');
let playing=false,origin=0,at=0;const audio=new Audio('./assets/mix.wav');
const scrub=document.getElementById('scrub');if(scrub)scrub.oninput=()=>{at=+scrub.value;audio.currentTime=at;origin=performance.now()-at*1000;seek(at)};
const button=document.getElementById('play');if(button)button.onclick=async()=>{playing=!playing;button.textContent=playing?'Duraklat':'Oynat';if(playing){origin=performance.now()-at*1000;audio.currentTime=at;await audio.play().catch(()=>{})}else audio.pause()};
function tick(now){if(playing){at=Math.min(duration,(now-origin)/1000);seek(at);if(at===duration){playing=false;audio.pause()}}requestAnimationFrame(tick)}if(!q.has('capture'))requestAnimationFrame(tick);
