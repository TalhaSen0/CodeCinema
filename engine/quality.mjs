// Measurement checks, never a claim of aesthetic approval. Missing evidence fails.
export const LIMITS=Object.freeze({connection:.01,contact:.5,perspective:3,shape:.001,seam:.5});
const distance=(a,b)=>a?.length===2&&b?.length===2&&[...a,...b].every(Number.isFinite)?Math.hypot(a[0]-b[0],a[1]-b[1]):Infinity;
export function inspectFrame({connections=[],contacts=[],projections=[],lengths=[],bounds=[],occlusion=[],strains=[]}) {
  const defects=[];
  const record=(category,id,value,limit)=>{if(!Number.isFinite(value)||value>limit) defects.push({category,id,value:Number.isFinite(value)?value:null,limit});};
  for(const {id,value} of strains)record('shape',id,value,.001);
  for(const [items,category,limit] of [[connections,'connection',LIMITS.connection],[contacts,'contact',LIMITS.contact],[projections,'perspective',LIMITS.perspective]]) {
    for(const {id,a,b} of items) record(category,id,distance(a,b),limit);
  }
  for(const {id,a,b,expected} of lengths) record('shape',id,expected>0?Math.abs(distance(a,b)/expected-1):Infinity,LIMITS.shape);
  for(const {id,points,box} of bounds) {
    let overflow=points?.length?0:Infinity;
    for(const p of points??[]) overflow=Math.max(overflow,...(p?.length===2&&p.every(Number.isFinite)?[box[0]-p[0],box[1]-p[1],p[0]-box[2],p[1]-box[3]]:[Infinity]));
    record('shape',id,overflow,0);
  }
  for(const {id,expected,actual} of occlusion) if(!expected||expected!==actual) defects.push({category:'occlusion',id,expected,actual});
  return defects;
}

export function inspectStep(a,b,{maxSpeed=1800,seam=false}={}) {
  const defects=[],dt=b.t-a.t;
  if(!Number.isFinite(dt)||!(dt>0)||!Number.isFinite(maxSpeed)||maxSpeed<0) return [{category:'temporal',id:'time-order-or-budget'}];
  for(const [id,p] of Object.entries(a.points)) {
    const delta=distance(p,b.points[id]),limit=seam?LIMITS.seam:maxSpeed*dt;
    if(delta>limit) defects.push({category:'temporal',id,delta:Number.isFinite(delta)?delta:null,limit});
  }
  if(Object.keys(b.points).some(id=>!(id in a.points))) defects.push({category:'temporal',id:'point-set'});
  return defects;
}

export function deliveryGate({defects=[],evidence={},visualReviewed=false,audioReviewed=false,audioRequired=true}) {
  const required=['geometry','raster','mutations','encoded','determinism','regression'];
  const missing=required.filter(key=>evidence[key]!==true);
  return {status:defects.length||missing.length?'blocked':!visualReviewed||(audioRequired&&!audioReviewed)?'review-required':'ready',missing,defects};
}
