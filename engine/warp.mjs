// Projective mapping and textured triangle drawing; no retained scene graph required.
export const identity3=()=>[1,0,0,0,1,0,0,0,1];
export function multiply3(a,b){return Array.from({length:9},(_,i)=>{const r=Math.floor(i/3),c=i%3;return a[r*3]*b[c]+a[r*3+1]*b[c+3]+a[r*3+2]*b[c+6]})}
export function inverse3(m){const [a,b,c,d,e,f,g,h,i]=m,co=[e*i-f*h,c*h-b*i,b*f-c*e,f*g-d*i,a*i-c*g,c*d-a*f,d*h-e*g,b*g-a*h,a*e-b*d],det=a*co[0]+b*co[3]+c*co[6];if(Math.abs(det)<1e-12)throw new Error('Singular page projection');return co.map(v=>v/det)}
export function project(m,u,v){const w=m[6]*u+m[7]*v+m[8];if(Math.abs(w)<1e-9)throw new Error('Page crosses projection plane');return[(m[0]*u+m[1]*v+m[2])/w,(m[3]*u+m[4]*v+m[5])/w]}
export function homography(corners){const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=corners,dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;let g=0,h=0;if(Math.abs(dx3)+Math.abs(dy3)>1e-10){const det=dx1*dy2-dx2*dy1;if(Math.abs(det)<1e-12)throw new Error('Degenerate page quadrilateral');g=(dx3*dy2-dx2*dy3)/det;h=(dx1*dy3-dx3*dy1)/det}return[x1-x0+g*x1,x3-x0+h*x3,x0,y1-y0+g*y1,y3-y0+h*y3,y0,g,h,1]}
export function regularMesh(sample,cols=24,rows=8){const vertices=[];for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++){const u=x/cols,v=y/rows;vertices.push({u,v,...sample(u,v)})}const triangles=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x,b=a+1,c=b+cols+1,d=a+cols+1;triangles.push([a,b,c],[a,c,d])}return{vertices,triangles}}
function texturedTriangle(ctx,img,verts,overlap){const s=verts.map(p=>[p.u*img.width,p.v*img.height]),t=verts.map(p=>[p.x,p.y]);const [s0,s1,s2]=s,[t0,t1,t2]=t;const x1=s1[0]-s0[0],y1=s1[1]-s0[1],x2=s2[0]-s0[0],y2=s2[1]-s0[1],det=x1*y2-x2*y1;
 const area=(t1[0]-t0[0])*(t2[1]-t0[1])-(t2[0]-t0[0])*(t1[1]-t0[1]);if(Math.abs(area)<.002)return;
 const A=((t1[0]-t0[0])*y2-(t2[0]-t0[0])*y1)/det,B=((t1[1]-t0[1])*y2-(t2[1]-t0[1])*y1)/det,C=(x1*(t2[0]-t0[0])-x2*(t1[0]-t0[0]))/det,D=(x1*(t2[1]-t0[1])-x2*(t1[1]-t0[1]))/det;
 const winding=Math.sign(area),expanded=t.map(([x,y],i)=>{const a=t[(i+2)%3],b=t[(i+1)%3],d1=Math.max(.001,Math.hypot(x-a[0],y-a[1])),d2=Math.max(.001,Math.hypot(b[0]-x,b[1]-y)),n1=[winding*(y-a[1])/d1,-winding*(x-a[0])/d1],n2=[winding*(b[1]-y)/d2,-winding*(b[0]-x)/d2],den=Math.max(.02,1+n1[0]*n2[0]+n1[1]*n2[1]);return[x+(n1[0]+n2[0])*overlap/den,y+(n1[1]+n2[1])*overlap/den]});
 ctx.save();ctx.beginPath();ctx.moveTo(...expanded[0]);ctx.lineTo(...expanded[1]);ctx.lineTo(...expanded[2]);ctx.closePath();ctx.clip();ctx.transform(A,B,C,D,t0[0]-A*s0[0]-C*s0[1],t0[1]-B*s0[0]-D*s0[1]);ctx.drawImage(img,0,0);ctx.restore();
}
export function drawMesh(ctx,mesh,front,{back=front,shade=true,clip=null,overlap=.65}={}){ctx.save();if(clip){ctx.beginPath();clip.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip()}
 const ordered=mesh.triangles.map(ids=>{const vs=ids.map(i=>mesh.vertices[i]);return{vs,depth:vs.reduce((s,p)=>s+(p.z||0),0)/3,normal:vs.reduce((s,p)=>s+(p.normal??1),0)/3}}).sort((a,b)=>a.depth-b.depth);
 for(const tri of ordered){const vs=tri.vs;if(vs.every(p=>p.x< -4)||vs.every(p=>p.x>1924)||vs.every(p=>p.y< -4)||vs.every(p=>p.y>1084))continue;texturedTriangle(ctx,tri.normal>=0?front:back,vs,overlap);if(shade&&Math.abs(tri.normal)<.97){ctx.save();ctx.beginPath();vs.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=`rgba(63,43,24,${.13*(1-Math.abs(tri.normal))})`;ctx.fill();ctx.restore()}}
 ctx.restore();
}
export function warp(ctx,img,corners,steps=12){const h=homography(corners),mesh=regularMesh((u,v)=>{const [x,y]=project(h,u,v);return{x,y}},steps,Math.max(2,Math.round(steps*.6)));drawMesh(ctx,mesh,img,{shade:false,clip:corners})}
