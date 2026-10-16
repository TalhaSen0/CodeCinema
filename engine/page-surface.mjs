import {clamp,mix} from './math.mjs';
import {homography,project,multiply3,inverse3,regularMesh} from './warp.mjs';
export const FULL_PAGE=[1920,0,0,0,1080,0,0,0,1];
export function quadratic(a,c,b,t){return[(1-t)**2*a[0]+2*(1-t)*t*c[0]+t*t*b[0],(1-t)**2*a[1]+2*(1-t)*t*c[1]+t*t*b[1]]}
// Developable cylindrical curl: material distance is unchanged across the fold.
export function curlPoint(u,v,progress){const p=clamp(progress);if(p<=0)return{u,v,z:0,normal:1};if(p>=1)return{u:-u,v,z:0,normal:-1};
 const tilt=.12*Math.sin(Math.PI*p),cs=Math.cos(tilt),sn=Math.sin(tilt),aspect=1080/1920,q=.5+(u-.5)*cs+(v-.5)*aspect*sn,along=-(u-.5)*sn+(v-.5)*aspect*cs;
 const radius=.10*Math.sin(Math.PI*p),fold=1-p,s=Math.max(0,q-fold);if(s===0)return{u,v,z:0,normal:1};const angle=Math.min(Math.PI,s/radius),extra=Math.max(0,s-Math.PI*radius),x=fold+radius*Math.sin(angle)-extra;
 return{u:.5+(x-.5)*cs-along*sn,v:.5+((x-.5)*sn+along*cs)/aspect,z:radius*(1-Math.cos(angle)),normal:Math.cos(angle)}}
export class PageSurface {
 constructor({id,width=1920,height=1080,origin=[0,0],top,bottom,turned=null,lift=[-60,-780,-.2]}){this.turned=turned;this.id=id;this.width=width;this.height=height;this.origin=origin;this.top=top;this.bottom=bottom;this.lift=lift;this.corners=[top[0],top[2],bottom[2],bottom[0]].map(([x,y])=>[x+origin[0],y+origin[1]]);this.plane=homography(this.corners);this.inversePlane=inverse3(this.plane)}
 world(u,v,{flatten=0}={}){if(u<0&&this.turned){const a=quadratic(...this.turned.top,-u),b=quadratic(...this.turned.bottom,-u);return[this.origin[0]+mix(a[0],b[0],v),this.origin[1]+mix(a[1],b[1],v)]}const base=project(this.plane,u,v);if(u<0||u>1)return base;const top=quadratic(...this.top,u),bottom=quadratic(...this.bottom,u),pt=project(this.plane,u,0),pb=project(this.plane,u,1),w=1-clamp(flatten);return[base[0]+w*((1-v)*(top[0]+this.origin[0]-pt[0])+v*(bottom[0]+this.origin[0]-pb[0])),base[1]+w*((1-v)*(top[1]+this.origin[1]-pt[1])+v*(bottom[1]+this.origin[1]-pb[1]))]}
 view(focus=0,roomCamera=[1,0,0,0,1,0,0,0,1]){const p=clamp(focus),book=multiply3(roomCamera,this.plane),plane=book.map((v,i)=>mix(v,FULL_PAGE[i],p));return{focus:p,plane,camera:multiply3(plane,this.inversePlane),lift:this.lift.map((v,i)=>mix(v,[-480,-270,-.5][i],p))}}
 sample(u,v,{view=this.view(),curl=0}={}){const c=curlPoint(u,v,curl),world=this.world(c.u,c.v,{flatten:view.focus}),flat=view.focus===1?[c.u*this.width,c.v*this.height]:project(view.camera,...world),den=1+view.lift[2]*c.z;return{x:(flat[0]+view.lift[0]*c.z)/den,y:(flat[1]+view.lift[1]*c.z)/den,z:c.z,normal:c.normal}}
 mesh(options={},cols=32,rows=10){return regularMesh((u,v)=>this.sample(u,v,options),cols,rows)}
 boundary(options={},steps=32){const pts=[];for(let i=0;i<=steps;i++){const p=this.sample(i/steps,0,options);pts.push([p.x,p.y])}for(let i=1;i<=steps;i++){const p=this.sample(1,i/steps,options);pts.push([p.x,p.y])}for(let i=steps-1;i>=0;i--){const p=this.sample(i/steps,1,options);pts.push([p.x,p.y])}for(let i=steps-1;i>0;i--){const p=this.sample(0,i/steps,options);pts.push([p.x,p.y])}return pts}
}
