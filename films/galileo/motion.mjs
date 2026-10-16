import {ease,mix} from '../../engine/math.mjs';
export const pageState=t=>{const p=ease(t,4.7,6.9);return {p,edge:277*Math.cos(p*Math.PI),lift:160*Math.sin(p*Math.PI),visible:t>=4.7&&t<7.1}};
export function wristWorld(t){
 const rest=[1183,793],contact=s=>{const p=pageState(s);return[1025+p.edge-10,847-34-p.lift]};
 if(t<4.1)return rest;
 if(t<4.7){const k=ease(t,4.1,4.7),b=contact(4.7);return[mix(rest[0],b[0],k),mix(rest[1],b[1],k)]}
 if(t<=6)return contact(t);
 const a=contact(6),k=ease(t,6,7.7);return[mix(a[0],rest[0],k),mix(a[1],rest[1],k)];
}
