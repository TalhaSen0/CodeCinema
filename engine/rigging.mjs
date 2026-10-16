import {clamp} from './math.mjs';
export function solveArm(shoulder,target,{upper=135,forearm=130,pole=1,minAngle=52,maxAngle=165}={}){
 const dx=target[0]-shoulder[0],dy=target[1]-shoulder[1],requestedDistance=Math.hypot(dx,dy),r=Math.PI/180;
 const minReach=Math.sqrt(upper*upper+forearm*forearm-2*upper*forearm*Math.cos(minAngle*r)),maxReach=Math.sqrt(upper*upper+forearm*forearm-2*upper*forearm*Math.cos(maxAngle*r));
 const d=clamp(requestedDistance,minReach,maxReach),dir=Math.atan2(dy,dx),wrist=[shoulder[0]+Math.cos(dir)*d,shoulder[1]+Math.sin(dir)*d],offset=Math.acos(clamp((upper*upper+d*d-forearm*forearm)/(2*upper*d),-1,1)),a=dir+pole*offset,elbow=[shoulder[0]+upper*Math.cos(a),shoulder[1]+upper*Math.sin(a)];
 return{shoulder,elbow,wrist,upper,forearm,pole,clamped:Math.abs(d-requestedDistance)>.001,interior:Math.acos(clamp((upper*upper+forearm*forearm-d*d)/(2*upper*forearm),-1,1))/r,upperAngle:a/r,forearmAngle:Math.atan2(wrist[1]-elbow[1],wrist[0]-elbow[0])};
}
