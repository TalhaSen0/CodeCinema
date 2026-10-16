// Downward y, metres, point mass released from rest. No rolling, drag or friction.
export function makeTracks(X=6,Y=3,g=9.81,N=12000){
 let lo=.001,hi=2*Math.PI-.001;
 for(let i=0;i<90;i++){const m=(lo+hi)/2;if((m-Math.sin(m))/(1-Math.cos(m))<X/Y)lo=m;else hi=m}
 const theta=(lo+hi)/2,a=Y/(1-Math.cos(theta));
 const R=(X*X+Y*Y)/(2*X),end=Math.acos(1-X/R);
 const curves=[{id:'line',name:'Düz yol',point:u=>[X*u,Y*u]},
 {id:'circle',name:'Dairesel yay',point:u=>[R*(1-Math.cos(end*u)),R*Math.sin(end*u)]},
 {id:'cycloid',name:'Sikloid',point:u=>[a*(theta*u-Math.sin(theta*u)),a*(1-Math.cos(theta*u))]}];
 for(const c of curves){c.samples=[{u:0,t:0,x:0,y:0}];let time=0,prev=c.point(0);
  // Quadratic parameter spacing resolves the integrable release singularity.
  for(let i=1;i<=N;i++){const u=(i/N)**2,p=c.point(u),ds=Math.hypot(p[0]-prev[0],p[1]-prev[1]);time+=ds/Math.sqrt(2*g*(p[1]+prev[1])/2);c.samples.push({u,t:time,x:p[0],y:p[1]});prev=p}
  c.duration=time;
  c.at=t=>{if(t<=0)return [0,0];if(t>=time)return c.point(1);let l=0,h=N;while(h-l>1){const m=(l+h)>>1;if(c.samples[m].t<t)l=m;else h=m}const s=c.samples[l],e=c.samples[h],k=(t-s.t)/(e.t-s.t);return [s.x+(e.x-s.x)*k,s.y+(e.y-s.y)*k]};
 }
 return {X,Y,g,theta,a,curves,analyticCycloid:theta*Math.sqrt(a/g),analyticLine:Math.sqrt(2*(X*X+Y*Y)/(g*Y))};
}
