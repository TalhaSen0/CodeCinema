import {rng} from './math.mjs';
export let ctx;
export const textBoxes=[];
export function resetTextBoxes(){textBoxes.length=0}
export function use(c){ctx=c;ctx.lineCap='round';ctx.lineJoin='round'}
export function path(d,fill,stroke='#221913',w=2){const p=new Path2D(d);if(fill){ctx.fillStyle=fill;ctx.fill(p)}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke(p)}return p}
export function ellipse(x,y,rx,ry,fill,stroke=null,w=2){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=w;ctx.stroke()}}
export function line(points,color='#7a5735',w=2){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke()}
export function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
export function grad(x,y,x2,y2,stops){const g=ctx.createLinearGradient(x,y,x2,y2);stops.forEach(([s,c])=>g.addColorStop(s,c));return g}
export function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');return g}
export function text(s,x,y,size=30,color='#dfc89f',align='left',font='Georgia'){ctx.font=`${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y);const m=ctx.measureText(s),tr=ctx.getTransform(),left=x-(align==='center'?m.width/2:align==='right'?m.width:0),top=y-m.actualBoundingBoxAscent,bottom=y+m.actualBoundingBoxDescent;const corners=[[left,top],[left+m.width,top],[left+m.width,bottom],[left,bottom]].map(([x,y])=>[tr.a*x+tr.c*y+tr.e,tr.b*x+tr.d*y+tr.f]);textBoxes.push({text:s,x0:Math.min(...corners.map(p=>p[0])),x1:Math.max(...corners.map(p=>p[0])),y0:Math.min(...corners.map(p=>p[1])),y1:Math.max(...corners.map(p=>p[1])),width:ctx.canvas.width,height:ctx.canvas.height})}
export function hatch(p,x,y,w,h,spacing=9,col='#e1bb7933'){ctx.save();ctx.clip(p);for(let i=-h;i<w;i+=spacing)line([[x+i,y+h],[x+i+h*.65,y]],col,1);ctx.restore()}
export function layer(draw,w=1920,h=1080){const old=ctx,c=document.createElement('canvas');c.width=w;c.height=h;use(c.getContext('2d'));draw();use(old);return c}
export function paper(w=1920,h=1080){return layer(()=>{rect(0,0,w,h,grad(0,0,w,h,[[0,'#e4c994'],[.5,'#d6b980'],[1,'#b58f58']]));const r=rng(27);for(let i=0;i<45000;i++){ctx.globalAlpha=r()*.12;rect(r()*w,r()*h,r()*2+1,r()*2+1,i%2?'#fff8da':'#48301e')}ctx.globalAlpha=1;for(let i=0;i<90;i++){const x=r()*w,y=r()*h;ellipse(x,y,3+r()*12,1+r()*5,'#6a41220a')}},w,h)}
