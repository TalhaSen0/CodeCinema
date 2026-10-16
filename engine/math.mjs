export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
export const ease=(t,a,b)=>smooth((t-a)/(b-a));
export function rng(seed=1638){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function ik(shoulder,hand,l1,l2,bend=1){const dx=hand[0]-shoulder[0],dy=hand[1]-shoulder[1],d=Math.min(Math.hypot(dx,dy),l1+l2-.001);const a=Math.atan2(dy,dx)+bend*Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return [shoulder[0]+l1*Math.cos(a),shoulder[1]+l1*Math.sin(a)]}
