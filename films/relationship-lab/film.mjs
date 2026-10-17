import {scenario,variants,DURATION} from './scenario.mjs';
import {drawMesh} from '../../engine/warp.mjs';
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:false});
canvas.width=1920;canvas.height=1080;
const params=new URLSearchParams(location.search);
let variant=variants.find(v=>v.id===params.get('variant'))??variants[0],fault=params.get('fault'),last;
const texture=document.createElement('canvas');texture.width=480;texture.height=270;
const tc=texture.getContext('2d');tc.fillStyle='#e7d1a0';tc.fillRect(0,0,480,270);
for(let x=0;x<480;x+=40)for(let y=0;y<270;y+=40){tc.fillStyle=(x+y)%80===0?'#d9b879':'#f1d9a7';tc.fillRect(x,y,40,40)}
function polygon(points,color){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=color;ctx.fill()}
function dot(p,r,color){ctx.beginPath();ctx.arc(...p,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill()}
function seek(t) {
  last=scenario(Math.max(0,Math.min(DURATION,t)),variant,fault);const s=last;
  ctx.fillStyle='#10202b';ctx.fillRect(0,0,1920,1080);
  ctx.fillStyle='#dce5e9';ctx.font='36px sans-serif';ctx.fillText('İLİŞKİ LABORATUVARI · '+variant.id,110,100);
  ctx.font='24px sans-serif';ctx.fillText('Uzan → kavra → taşı → bırak | kamera ve bükülen yüzey',110,145);
  polygon([[600,666],[1100,666],[1100,700],[600,700]].map(s.screen),'#596b76');
  for(const id of s.order) {
    if(id==='body'){
      polygon(s.body,variant.color);
      polygon([[677,315],[703,315],[703,365],[677,365]].map(s.screen),variant.color);
      polygon(Array.from({length:48},(_,i)=>s.screen([690+55*Math.cos(i*Math.PI/24),275+55*Math.sin(i*Math.PI/24)])),variant.color);
    }
    if(id==='arm'){ctx.strokeStyle=variant.color;ctx.lineWidth=28*variant.scale;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...s.screen(s.arm.shoulder));ctx.lineTo(...s.screen(s.arm.elbow));ctx.lineTo(...s.screen(s.arm.wrist));ctx.stroke()}
    if(id==='prop')polygon(s.prop,'#ed493e');
    if(id==='pole')polygon(s.pole,'#36a879');
    if(id==='hand')dot(s.hand,12,'#f4cf9d');
  }
  drawMesh(ctx,s.renderMesh,texture,{back:texture});
  dot(s.surfacePin,6,'#44bbdd');
  // Marker is drawn through the prop's actual transform; QA predicts it independently.
  dot(s.marker,6,'#ff00ff');
  ctx.font='26px sans-serif';ctx.fillStyle='#dce5e9';ctx.fillText(`${s.t.toFixed(3)} s · sahip: ${s.owner} · ${fault??'temiz'}`,110,950);
  document.getElementById('time').textContent=s.t.toFixed(2);
  document.getElementById('scrub').value=s.t;
}
window.__film={ready:true,duration:DURATION,seek,
  configure(v,f=null){variant=variants.find(x=>x.id===v);if(!variant)throw new Error('Unknown variant');fault=f;},
  debug:()=>({t:last.t,measured:last.measured,referenceBottom:last.referenceBottom,probe:last.probe,temporal:last.temporal}),
};
// Playback schedules absolute seeks; the drawing function remains stateless.
let playing=false,startedAt=0,startedTime=0;
const play=document.getElementById('play');
function stop(){playing=false;play.textContent='Oynat';}
function tick(now){if(!playing)return;const t=startedTime+(now-startedAt)/1000;seek(t);if(t>=DURATION)stop();else requestAnimationFrame(tick);}
play.onclick=()=>{if(playing){stop();return;}startedTime=last.t>=DURATION?0:last.t;startedAt=performance.now();playing=true;play.textContent='Duraklat';requestAnimationFrame(tick);};
document.getElementById('restart').onclick=()=>{stop();seek(0);};
document.getElementById('scrub').oninput=e=>{stop();seek(+e.target.value);};
document.getElementById('variant').value=variant.id;
document.getElementById('fault').value=fault??'';
for(const id of ['variant','fault'])document.getElementById(id).onchange=()=>{
  stop();window.__film.configure(document.getElementById('variant').value,document.getElementById('fault').value||null);seek(last.t);
};
await document.fonts.ready;seek(0);
