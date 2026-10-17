import {clamp,ease,mix,rng} from '../../engine/math.mjs';
import {pendulum} from '../../engine/pendulum.mjs';
import {duration,narration} from './production.mjs';
const canvas=document.querySelector('#c'),ctx=canvas.getContext('2d');
const scale=(window.FILM_SCALE||1)*Number(new URL(location.href).searchParams.get('ss')||1);
canvas.width=1920*scale;canvas.height=1080*scale;
const gold='#e9bb72',cream='#f4e5c9',teal='#75b9b0';
const random=rng(81),dust=Array.from({length:65},()=>[random()*1920,random()*880,random()*2+1,random()*6]);
const textBoxes=[];
function line(points,color,width=2){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function circle(x,y,r,fill,stroke=null){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function text(s,x,y,size,color=cream,align='left',font='Georgia'){ctx.font=`${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);let m=ctx.measureText(s);textBoxes.push({text:s,x:x-(align==='center'?m.width/2:0),y:y-size,width:m.width,height:size});}
function bg(t){
 let g=ctx.createLinearGradient(0,0,1920,1080);g.addColorStop(0,'#173235');g.addColorStop(.6,'#0a1a1d');g.addColorStop(1,'#061013');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);
 // Architectural arches and moonlight, all fixed in the set.
 for(let x of [190,1510]){ctx.save();ctx.beginPath();ctx.moveTo(x,760);ctx.lineTo(x,280);ctx.bezierCurveTo(x,70,x+250,70,x+250,280);ctx.lineTo(x+250,760);ctx.closePath();ctx.fillStyle='#294548';ctx.fill();ctx.clip();
 let sky=ctx.createLinearGradient(0,100,0,760);sky.addColorStop(0,'#4d7375');sky.addColorStop(1,'#112c32');ctx.fillStyle=sky;ctx.fillRect(x,80,250,700);
 circle(x+175,220,52,'#d7d5b599');circle(x+195,208,48,'#4d7375');
 for(let i=0;i<9;i++){let bx=x+i*39;line([[bx,790],[bx-15,500-i%3*55]],'#10272c',8);line([[bx-6,630],[bx-45,560]],'#10272c',4)}
 line([[x+125,100],[x+125,760]],'#14282a',15);line([[x,410],[x+250,410]],'#14282a',12);ctx.restore();}
 ctx.fillStyle='#102326';ctx.fillRect(0,800,1920,280);
 for(let i=0;i<18;i++){let x=i*150-300;line([[960+(x-960)*.75,800],[x,1080]],'#34504b33',2)}
 for(let y of [830,890,980])line([[0,y],[1920,y]],'#5c766033');
 let light=ctx.createRadialGradient(920,430,40,920,430,900);light.addColorStop(0,'#b99e4120');light.addColorStop(1,'#00000000');ctx.fillStyle=light;ctx.fillRect(0,0,1920,1080);
 for(let [x,y,r,p] of dust){ctx.globalAlpha=.12+.1*Math.sin(t*.3+p);circle((x+t*3)%1920,y+Math.sin(t*.2+p)*15,r,'#e5d8aa')}ctx.globalAlpha=1;
 let vignette=ctx.createRadialGradient(960,500,400,960,500,1120);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#000b');ctx.fillStyle=vignette;ctx.fillRect(0,0,1920,1080);
}
function bob(x,y,r,color){
 ctx.save();ctx.shadowBlur=30;ctx.shadowColor='#0009';ctx.shadowOffsetY=12;
 let g=ctx.createRadialGradient(x-r*.4,y-r*.45,2,x,y,r);g.addColorStop(0,'#fff0c4');g.addColorStop(.22,color);g.addColorStop(.7,'#9e743b');g.addColorStop(1,'#32291d');circle(x,y,r,g);ctx.restore();
 ctx.beginPath();ctx.arc(x,y,r*.78,Math.PI*1.07,Math.PI*1.7);ctx.strokeStyle='#f7dda999';ctx.lineWidth=2;ctx.stroke();circle(x-r*.28,y-r*.38,r*.09,'#fff6dc99');
}
function instrument(t,x,pivot,length,px,alpha=1,color=gold){
 const state=pendulum(t,{length}),L=length*px,bx=x+state.x*px,by=pivot+state.y*px;
 ctx.save();ctx.globalAlpha*=alpha;
 line([[x-100,pivot-20],[x+100,pivot-20]],'#796b4b',14);line([[x-100,pivot-27],[x+100,pivot-27]],'#d1ae6a',3);
 ctx.beginPath();ctx.ellipse(x,827,42+length*15,8,0,0,Math.PI*2);ctx.fillStyle='#0006';ctx.fill();
 // Track uses a true circular arc; rod and bob share one endpoint.
 ctx.beginPath();ctx.arc(x,pivot,L,Math.PI/2-.2,Math.PI/2+.2);ctx.strokeStyle='#d8c99e33';ctx.lineWidth=2;ctx.stroke();
 line([[x,pivot],[bx,by]],'#0c191a',8);line([[x-1,pivot],[bx-1,by]],'#ddcca4',3);
 circle(x,pivot,12,'#a38351','#e3c48b');circle(x,pivot,4,'#1a2e2e');
 bob(bx,by,30,color);ctx.restore();return state;
}
function hero(t){
 ctx.save();const z=1+.025*ease(t,0,7);ctx.translate(650,470);ctx.scale(z,z);ctx.translate(-650,-470);
 instrument(t,635,160,1.6,365);ctx.restore();
 text('BİR KÜÇÜK FİZİK HİKÂYESİ',1030,290,20,gold,'left','Arial');
 text('Salıncağın',1024,391,78);text('Sırrı',1024,478,108);
 line([[1030,522],[1220,522]],gold,2);text('Aynı başlangıç.',1030,580,30,'#a8b8ae');text('Başka bir ritim.',1030,622,30,'#a8b8ae');
 text('01 / MERAK',120,104,18,'#9bad9f','left','Arial');
}
function duet(t){
 const local=t-8;instrument(local,620,220,.4,340,1,teal);instrument(local,1310,220,1.6,340);
 text('İki uzunluk. İki ritim.',960,110,52,cream,'center');
 text('KISA SARKAÇ',620,460,22,teal,'center','Arial');text('L',620,507,39,cream,'center');
 text('UZUN SARKAÇ',1310,850,22,gold,'center','Arial');text('4L',1310,898,39,cream,'center');
 const p=pendulum(0,{length:.4}).period;
 // Period markers appear after the comparison is established.
 ctx.save();ctx.globalAlpha=ease(t,15,17);
 const counted=Math.max(0,t-16);
 text('Tam salınım sayısı',190,650,22,'#a8b8ae');
 for(let k=0;k<8;k++){let x=210+k*47;circle(x,700,6,k<Math.floor(counted/p)?teal:'#2b4648');}
 text('T',620,710,32,teal);
 for(let k=0;k<4;k++){let x=210+k*94;circle(x,760,6,k<Math.floor(counted/(2*p))?gold:'#2b4648');}
 text('2T',620,770,32,gold);
 text('Küçük açı · sürtünmesiz model',190,839,19,'#8da39b','left','Arial');ctx.restore();
}
function ending(t){
 instrument(t-8,490,160,.4,340,1,teal);instrument(t-8,880,160,1.6,340);
 text('UZUNLUK ×4',1220,345,25,gold,'left','Arial');text('Zaman ×2',1216,424,64);
 line([[1220,470],[1660,470]],'#8f8c6433');text('T = 2π √(L / g)',1220,548,42,'#b8c7b7');
 text('Aynı yerçekimi, küçük salınımlar.',1220,601,22,'#a3b4a9');
 text('CODECINEMA',120,112,22,gold,'left','Arial');text('Dünyayı hareketle anla.',120,884,25,'#97aea6');
}
function draw(t){
 t=clamp(t,0,duration);ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;textBoxes.length=0;bg(t);
 const b=ease(t,7.3,8.3),c=ease(t,23.4,24.4);
 if(b<1){ctx.save();ctx.globalAlpha=1-b;hero(t);ctx.restore()}
 if(b>0&&c<1){ctx.save();ctx.globalAlpha=b*(1-c);duet(t);ctx.restore()}
 if(c>0){ctx.save();ctx.globalAlpha=c;ending(t);ctx.restore()}
 ctx.fillStyle='#061113e8';ctx.fillRect(0,962,1920,118);line([[100,962],[1820,962]],'#d4ad6633');
 const cue=narration.find(n=>t>=n.start&&t<n.end);if(cue)text(cue.text,960,1020,29,cream,'center');
 ctx.fillStyle=gold;ctx.fillRect(100,1054,1720*t/duration,2);
 const label=document.querySelector('#time');if(label)label.textContent=`${t.toFixed(1)} / ${duration}`;
}
window.__film={ready:true,duration,seek:draw,textBoxes};draw(0);
const play=document.querySelector('#play'),scrub=document.querySelector('#scrub');
if(play){const audio=new Audio('./assets/mix.wav');let playing=false,base=0,start=0;
 play.onclick=async()=>{playing=!playing;play.textContent=playing?'Duraklat':'Oynat';if(playing){base=+scrub.value;start=performance.now();audio.currentTime=base;await audio.play().catch(()=>{});requestAnimationFrame(tick)}else audio.pause()};
 function tick(now){if(!playing)return;const t=Math.min(duration,base+(now-start)/1000);scrub.value=t;draw(t);if(t>=duration){playing=false;audio.pause();play.textContent='Oynat'}else requestAnimationFrame(tick)}
 scrub.oninput=()=>{base=+scrub.value;start=performance.now();audio.currentTime=base;draw(base)};
}
