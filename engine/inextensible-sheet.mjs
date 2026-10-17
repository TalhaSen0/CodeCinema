import {clamp} from './math.mjs';
import {regularMesh} from './warp.mjs';

// A cylindrical sheet parameterized by material arc length, before projection.
// |dP/ds|=1, |dP/dy|=1, dP/ds dot dP/dy=0: bending cannot stretch it.
export class InextensibleSheet {
  constructor({width,height,origin=[0,0],viewAngle=Math.PI/9}) {
    if(!(width>0&&height>0))throw new Error('Invalid sheet dimensions');
    Object.assign(this,{width,height,origin,viewAngle});
  }
  material(u,v,{curl=0,stretch=1}={}) {
    // Reverse local rest curvature as the sheet turns, so the final pose is
    // a horizontal mirror (x -> -x, z unchanged), not an inverted arch.
    const p=clamp(curl),bow=.25*Math.cos(Math.PI*p)+1.1*Math.sin(Math.PI*p);
    const theta=Math.PI*p+bow,k=-2*bow/this.width,s=u*this.width;
    // Stable integral through zero curvature: no divide-by-zero or pose snap.
    const half=k*s/2,sinc=Math.abs(half)<1e-6?1-half*half/6:Math.sin(half)/half;
    return {x:stretch*s*Math.cos(theta+half)*sinc,
      y:v*this.height,z:s*Math.sin(theta+half)*sinc,
      normal:Math.cos(theta+k*s)};
  }
  sample(u,v,options={}) {
    const p=this.material(u,v,options),a=this.viewAngle;
    return {x:this.origin[0]+p.x,y:this.origin[1]+p.y*Math.cos(a)-p.z*Math.sin(a),
      z:p.y*Math.sin(a)+p.z*Math.cos(a),normal:p.normal};
  }
  mesh(options={},cols=48,rows=8){return regularMesh((u,v)=>this.sample(u,v,options),cols,rows);}
  strain(options={},steps=64) {
    let max=0;
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
    // Local metric in both axes AND diagonals catches stretch and shear.
    for(let i=0;i<steps;i++)for(const v of [0,.5,1-1/steps]) {
      const u=i/steps,a=this.material(u,v,options);
      for(const [du,dv] of [[1/steps,0],[0,1/steps],[1/steps,1/steps]]) {
        const actual=dist(a,this.material(u+du,v+dv,options));
        max=Math.max(max,Math.abs(actual/Math.hypot(du*this.width,dv*this.height)-1));
      }
    }
    return max;
  }
}
