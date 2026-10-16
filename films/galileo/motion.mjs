import {ease,mix} from '../../engine/math.mjs';
import {pageSurface,CLIPS} from './pages.mjs';
import {solveArm} from '../../engine/rigging.mjs';
export const GRIP={approach:4.1,start:4.7,end:5.2,rest:6.8,uv:[.96,.60],finger:[25,0],rotation:Math.atan2(20,-15)};
export function contactAt(t){return pageSurface.sample(...GRIP.uv,{curl:ease(t,...CLIPS.firstTurn)})}
export function rightGoal(t){const rest=[1183,793],at=s=>{const p=contactAt(s);return[p.x+15,p.y-20]},weight=ease(t,GRIP.approach,GRIP.start)*(1-ease(t,GRIP.end,GRIP.rest));
 let point=rest;if(t>=GRIP.approach&&t<GRIP.start){const k=ease(t,GRIP.approach,GRIP.start),b=at(GRIP.start);point=[mix(rest[0],b[0],k),mix(rest[1],b[1],k)]}else if(t>=GRIP.start&&t<=GRIP.end)point=at(t);else if(t>GRIP.end){const a=at(GRIP.end),k=ease(t,GRIP.end,GRIP.rest);point=[mix(a[0],rest[0],k),mix(a[1],rest[1],k)]}
 return{point,weight,rotation:GRIP.rotation,gripping:t>=GRIP.start&&t<=GRIP.end};
}
export const wristWorld=t=>rightGoal(t).point;
export function characterPose(t){
 const breath=Math.sin(t*1.4)*2,lean=Math.sin(t*.5)*.016,origin=[1080,620+breath],turn=ease(t,4,5.7)*(1-ease(t,7,8.6)),goal=rightGoal(t);
 const toLocal=([x,y])=>{x-=origin[0];y-=origin[1];return[x*Math.cos(lean)+y*Math.sin(lean),-x*Math.sin(lean)+y*Math.cos(lean)]};
 const toWorld=([x,y])=>[origin[0]+x*Math.cos(lean)-y*Math.sin(lean),origin[1]+x*Math.sin(lean)+y*Math.cos(lean)];
 const left=solveArm([-124,-53],[mix(-118,-135,turn),mix(175,165,turn)],{pole:1}),right=solveArm([72+28*goal.weight,-30+30*goal.weight],toLocal(goal.point),{pole:-1});
 left.rotation=.7;right.rotation=goal.rotation-lean;
 const fingertip=toWorld([right.wrist[0]+25*Math.cos(right.rotation),right.wrist[1]+25*Math.sin(right.rotation)]);
 return{origin,lean,breath,turn,left,right,toWorld,fingertip,gripping:goal.gripping,contact:contactAt(t)};
}
