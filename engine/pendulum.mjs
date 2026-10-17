// Analytic small-angle model; length is measured from pivot to bob centre.
export function pendulum(t,{length=1.6,amplitude=.2,gravity=9.81,phase=0}={}){
 if(!Number.isFinite(t)||length<=0||gravity<=0)throw new Error('Invalid pendulum parameters');
 const omega=Math.sqrt(gravity/length),angle=amplitude*Math.cos(omega*t+phase);
 return {angle,x:length*Math.sin(angle),y:length*Math.cos(angle),period:2*Math.PI/omega};
}
