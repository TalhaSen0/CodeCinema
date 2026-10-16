import {use,ctx,rect,line,grad,text,textBoxes,resetTextBoxes} from '../../engine/paint.mjs';
import {clamp,ease} from '../../engine/math.mjs';
import {roomBase,roomForeground} from './room.mjs';
import {pageSurface,leftSurface,pageView,pageStateAt,bookCamera} from './pages.mjs';
import {pageTexture,setPageDiagnostic} from './page-content.mjs';
import {makeTracks} from '../../engine/physics.mjs';
import {getSprites} from './character.mjs';
import {DURATION,CLIPS,narration,shots,events} from './production.mjs';
import {drawMesh,regularMesh,project} from '../../engine/warp.mjs';
const c=document.querySelector('canvas'),q=new URLSearchParams(location.search),scale=(window.FILM_SCALE||1)*Number(q.get('ss')||1);
c.width=1920*scale;c.height=1080*scale;use(c.getContext('2d',{alpha:false}));
const duration=window.COMPARE?10:DURATION;
function label(s,x,y,size=30,col='#dfc89f',align='left'){text(s,x,y,size,col,align)}
const worldLayer=document.createElement('canvas'),foregroundLayer=document.createElement('canvas');
for(const cv of [worldLayer,foregroundLayer]){cv.width=1920;cv.height=1080}
function cameraAffine(m){ctx.transform(m[0],m[3],m[1],m[4],m[2],m[5])}
let surfaceTrace=null,lastTime=0;
function drawSurface(t,view){
 const state=pageStateAt(t),underTime=state.under==='bernoulli'&&t<29?29:state.time,transform=ctx.getTransform();
 // Prefilter the same UV texture for the highly oblique, small book surface.
 // Separate axes avoid shimmering glyphs when a 1080px folio is only ~80px high.
 const edge=pageSurface.boundary({view}),extent=axis=>Math.max(...edge.map(p=>p[axis]))-Math.min(...edge.map(p=>p[axis])),level=(size,max)=>Math.min(max,2**Math.ceil(Math.log2(Math.max(64,size*1.5))));
 const tw=level(extent(0),1920),th=level(extent(1)+(state.curl?180:0),1080),texture=(id,time)=>pageTexture(id,time,tw,th);
 surfaceTrace={surfaceId:pageSurface.id,state,focus:view.focus,anchors:[[410/1920,355/1080],[1250/1920,775/1080],[0,0],[1,0],[1,1],[0,1]].map(([u,v])=>{const p=pageSurface.sample(u,v,{view});return{...p,x:transform.a*p.x+transform.c*p.y+transform.e,y:transform.b*p.x+transform.d*p.y+transform.f}}),drawOrder:['world','page-under',...(state.curl>0||state.front!==state.under?['page-front-back']:[]),'foreground']};
 const under=texture(state.under,underTime),flat={view,curl:0};
 if(view.focus<1&&t>=CLIPS.firstTurn[1]){const left={view,curl:0};drawMesh(ctx,leftSurface.mesh(left,24,8),pageTexture('back',0),{shade:false,clip:leftSurface.boundary(left)})}
 if(view.focus===1&&state.curl===0){ctx.drawImage(pageTexture(state.front,state.time),0,0);return}
 const boundary=pageSurface.boundary(flat);
 if(view.focus===1)ctx.drawImage(under,0,0);else drawMesh(ctx,pageSurface.mesh(flat,24,8),under,{shade:false,clip:boundary});
 if(state.front!==state.under||state.curl>0){const options={view,curl:state.curl};drawMesh(ctx,pageSurface.mesh(options,48,10),texture(state.front,state.time),{back:texture('back',0),shade:true,clip:state.curl===0?boundary:null})}
}
function screenLighting(focus){if(focus>=1)return;ctx.save();ctx.globalAlpha=1-focus;rect(0,0,1920,1080,grad(0,0,1000,0,[[0,'#08141be6'],[.52,'#09131b70'],[1,'transparent']]));ctx.restore()}
function titles(t,closing=false){if(window.COMPARE)return;ctx.save();ctx.globalAlpha=closing?ease(t,43.5,45):ease(t,.2,2)*(1-ease(t,8,10));
 label(closing?'CODECINEMA · BİLİMİN İZİNDE':'BİLİMİN İZİNDE / 01',154,270,21,'#bda274');line([[154,294],[390,294]],'#b79b64',1);
 label(closing?'Doğru soru,':'Galileo',148,393,83,'#e4d1ac');label(closing?'yeni bir yol açar.':'ve en hızlı yol',152,466,56,'#d4ba8b');
 label(closing?'1638 → 1697':'Mesafe ile zaman arasında bir hikâye',156,529,24,'#b5a183');if(!closing)label('Çalışma odası: temsili canlandırma',156,578,18,'#a99779');ctx.restore();}
function wide(t,closing=false){
 const local=closing?8+Math.max(0,t-44)*.4:t,m=bookCamera(t,closing);
 ctx.save();cameraAffine(m);roomBase(local,window.COMPARE==='hybrid');drawSurface(t,pageSurface.view());roomForeground(local,window.COMPARE==='hybrid');ctx.restore();screenLighting(0);titles(t,closing);
}
function layerTexture(canvas,draw){const original=ctx;use(canvas.getContext('2d'));ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,1920,1080);draw();use(original);return canvas}
function worldMesh(matrix,offset=0){return regularMesh((u,v)=>{const [x,y]=project(matrix,1920*u,1080*v);return{x,y:y+offset}},24,14)}
function portal(t,reverse=false){
 const view=pageView(t),local=reverse?8+Math.max(0,t-44)*.4:t;
 rect(0,0,1920,1080,'#101e25');
 const bg=layerTexture(worldLayer,()=>roomBase(local,window.COMPARE==='hybrid'));
 drawMesh(ctx,worldMesh(view.camera),bg,{shade:false});
 drawSurface(t,view);
 const fg=layerTexture(foregroundLayer,()=>roomForeground(local,window.COMPARE==='hybrid'));
 // Elevated foreground props leave the reader's sightline as the camera tilts to the paper.
 const nearestY=Math.min(...[[0,0],[1920,0],[1920,1080],[0,1080]].map(p=>project(view.camera,...p)[1]));
 const elevation=view.focus**2*Math.max(0,1180-nearestY);
 drawMesh(ctx,worldMesh(view.camera,elevation),fg,{shade:false});
 screenLighting(view.focus);if(reverse)titles(t,true);
}
function diagram(t,cycloid=false){drawSurface(t,pageView(t))}
function pageTurn(t){drawSurface(t,pageView(t))}
function subtitles(t){const n=narration.find(n=>t>=n.start&&t<n.end);if(!n)return;const words=n.text.split(' '),lines=[];let s='';ctx.font='25px Georgia';for(const word of words){if(ctx.measureText(s+' '+word).width>1510){lines.push(s);s=word}else s+=(s?' ':'')+word}if(s)lines.push(s);const y=lines.length>1?1021:1040;lines.forEach((s,i)=>label(s,960,y+i*34,25,'#ecdfc2','center'))}
function seek(time){resetTextBoxes();const t=clamp(Number(time)||0,0,duration);lastTime=t;ctx.setTransform(scale,0,0,scale,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,1920,1080);
 if(window.COMPARE||t<CLIPS.entry[0])wide(t);else if(t<CLIPS.entry[1])portal(t);else if(t<CLIPS.chapterTurn[0])diagram(t);else if(t<29)pageTurn(t);else if(t<CLIPS.exit[0])diagram(t,true);else if(t<CLIPS.exit[1])portal(t,true);else wide(t,true);
 // Cinemascope composition with subtitles in the lower picture area.
 rect(0,0,1920,65,'#0c1419');rect(0,988,1920,92,'#0c1419');
 label('C O D E C I N E M A',153,42,17,'#967e59');label(window.COMPARE?'ÇALIŞMA ODASI · '+window.COMPARE.toUpperCase():'GALILEO / EN HIZLI YOL',1767,42,15,'#967e59','right');
 if(!window.COMPARE)subtitles(t);
 const range=document.getElementById('scrub');if(range)range.value=t;const counter=document.getElementById('time');if(counter)counter.textContent=t.toFixed(1)+' / '+duration;
}
await document.fonts.ready;
window.__film={duration,ready:true,seek,shots,events,textBoxes,debug:()=>({t:lastTime,surface:surfaceTrace}),setDiagnostic:setPageDiagnostic,tracks:makeTracks().curves.map(c=>({id:c.id,duration:c.duration})),sprites:()=>Object.fromEntries(Object.entries(getSprites()).map(([k,c])=>[k,c.toDataURL()]))};
seek(Number(q.get('t')||0));
if(q.has('capture'))document.body.classList.add('capture');
let playing=false,origin=0,at=0;const audio=new Audio('./assets/mix.wav');
const scrub=document.getElementById('scrub');if(scrub)scrub.oninput=()=>{at=+scrub.value;audio.currentTime=at;origin=performance.now()-at*1000;seek(at)};
const button=document.getElementById('play');if(button)button.onclick=async()=>{playing=!playing;button.textContent=playing?'Duraklat':'Oynat';if(playing){origin=performance.now()-at*1000;audio.currentTime=at;await audio.play().catch(()=>{})}else audio.pause()};
function tick(now){if(playing){at=Math.min(duration,(now-origin)/1000);seek(at);if(at===duration){playing=false;audio.pause()}}requestAnimationFrame(tick)}if(!q.has('capture'))requestAnimationFrame(tick);
