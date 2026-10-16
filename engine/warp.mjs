// Map one texture to a four-corner page using a subdivided bilinear mesh.
// Small cells keep the curved perspective change smooth without a WebGL dependency.
export function warp(ctx,img,corners,steps=12){
 const [a,b,c,d]=corners;
 ctx.save();ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.lineTo(...c);ctx.lineTo(...d);ctx.closePath();ctx.clip();
 const p=(u,v)=>[(1-v)*((1-u)*a[0]+u*b[0])+v*((1-u)*d[0]+u*c[0]),(1-v)*((1-u)*a[1]+u*b[1])+v*((1-u)*d[1]+u*c[1])];
 function tri(s,t){const [s0,s1,s2]=s,[t0,t1,t2]=t;
  const x1=s1[0]-s0[0],y1=s1[1]-s0[1],x2=s2[0]-s0[0],y2=s2[1]-s0[1],det=x1*y2-x2*y1;
  const A=((t1[0]-t0[0])*y2-(t2[0]-t0[0])*y1)/det,B=((t1[1]-t0[1])*y2-(t2[1]-t0[1])*y1)/det,C=(x1*(t2[0]-t0[0])-x2*(t1[0]-t0[0]))/det,D=(x1*(t2[1]-t0[1])-x2*(t1[1]-t0[1]))/det;
  const mx=(t0[0]+t1[0]+t2[0])/3,my=(t0[1]+t1[1]+t2[1])/3;
  const expanded=t.map(([x,y])=>{const len=Math.hypot(x-mx,y-my);return[x+(x-mx)*.8/len,y+(y-my)*.8/len]});
  ctx.save();ctx.beginPath();ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();ctx.transform(A,B,C,D,t0[0]-A*s0[0]-C*s0[1],t0[1]-B*s0[0]-D*s0[1]);ctx.drawImage(img,0,0);ctx.restore();
 }
 for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){const u=x/steps,v=y/steps,U=(x+1)/steps,V=(y+1)/steps;const src=[[u*img.width,v*img.height],[U*img.width,v*img.height],[U*img.width,V*img.height],[u*img.width,V*img.height]],dst=[p(u,v),p(U,v),p(U,V),p(u,V)];tri([src[0],src[1],src[2]],[dst[0],dst[1],dst[2]]);tri([src[0],src[2],src[3]],[dst[0],dst[2],dst[3]])}
 ctx.restore();
}
