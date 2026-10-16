import {ctx,path,ellipse,line,grad,hatch,text,layer} from '../../engine/paint.mjs';
import {ik,smooth,ease,mix} from '../../engine/math.mjs';
import {characterPose} from './motion.mjs';
export function torso(){
 const p=path('M -93 -105 C -145 -101 -186 -52 -193 28 L -215 188 Q -121 242 55 211 L 131 171 L 86 -18 Q 75 -94 23 -105 Z',grad(-170,-80,100,210,[[0,'#473c35'],[.42,'#5a4838'],[1,'#1b1b1c']]),'#17191b',4);
 hatch(p,-230,-130,390,380,9,'#bd9d6327');
 path('M -83 -92 Q -50 -54 -15 -40 L 32 -95 L 11 -132 L -60 -133 Z','#ba9264');
 path('M -88 -100 L -16 -42 L -60 -10 L -110 -82 Z','#bba987','#30251b',3);
 path('M 28 -104 L -16 -42 L 18 -4 L 55 -78 Z','#d7c9a3','#30251b',3);
 for(let i=0;i<5;i++)ellipse(-14+i*3,4+i*35,4,4,'#8e7755','#171913');
 for(const d of ['M -152 -51 Q -143 44 -176 152','M -127 4 Q -110 90 -127 182','M 55 -27 Q 33 80 89 166','M -61 32 Q -42 122 -60 199'])path(d,null,'#100f104a',5);
 line([[-107,175],[-59,184],[-22,179]],'#b1935c66',2);
}
export function head(){
 path('M -86 -68 Q -122 -83 -116 -135 Q -131 -182 -99 -221 Q -81 -243 -48 -235 Q 14 -248 36 -206 Q 67 -195 58 -148 L 37 -93 Z','#afa48a','#30271e',3);
 const p=path('M -86 -173 Q -76 -226 -26 -222 Q 22 -226 36 -183 Q 32 -162 48 -138 L 38 -127 Q 48 -106 27 -99 Q 30 -76 -6 -63 Q -54 -62 -83 -100 Q -106 -129 -86 -173 Z',grad(-80,-210,45,-85,[[0,'#aa7953'],[.5,'#d4b383'],[.72,'#e2c797'],[1,'#906044']]),'#443022',3);
 hatch(p,-115,-245,180,190,8,'#70412824');
 path('M -91 -157 Q -118 -170 -107 -130 Q -103 -111 -86 -119','#b58a60','#59412c',2);
 path('M -101 -151 Q -94 -151 -95 -135',null,'#805a3d',2);
 path('M -84 -196 Q -55 -226 -10 -224 Q -36 -242 -63 -231 Q -84 -238 -101 -207 L -113 -160 L -86 -142 Z','#b8b097','#443a2b',2);
 for(let i=0;i<12;i++){const x=-108+i*5;path(`M ${x} ${-177-i*3} Q ${x-11} ${-194-i*1.6} ${x+19} ${-215-i*.5}`,null,i%2?'#ded2ae':'#746a55',1.6)}
 path('M -80 -116 Q -63 -121 -48 -106 Q -22 -98 -8 -115 Q 13 -123 36 -108 Q 39 -78 17 -57 Q 9 -24 -25 -7 Q -66 -22 -82 -58 Q -97 -91 -80 -116 Z',grad(-75,-100,20,-20,[[0,'#958d78'],[.55,'#d2c6a4'],[1,'#7a7460']]),'#493b2a',2);
 for(let i=0;i<24;i++){const x=-80+i*4.7;path(`M ${x} ${-106+Math.sin(i)*4} Q ${x+10} -63 ${-26+(x+26)*.62} ${-21-Math.abs(x+25)*.48}`,null,i%3?'#655d4a88':'#eee0b080',1.4)}
 path('M -38 -115 Q -20 -123 -8 -117 Q 6 -126 22 -113 L 29 -104 Q 7 -103 -8 -110 Q -23 -102 -38 -108 Z','#d9caab','#74624b',1);
 line([[-22,-100],[-6,-97],[10,-101]],'#5c3c2b',2);
 path('M -12 -178 Q 2 -165 -5 -145 L 18 -140 Q 23 -132 10 -128 L -7 -131',null,'#8d5d3c',2.5);
 path('M -58 -183 Q -42 -195 -26 -185',null,'#bdb092',7);
 path('M -7 -187 Q 9 -194 20 -184',null,'#d1c2a3',6);
 path('M -59 -173 Q -46 -181 -28 -174',null,'#503f2e',2.5);
 path('M -3 -175 Q 8 -181 20 -175',null,'#503f2e',2.5);
 ellipse(-37,-174,3.8,4.5,'#262923');ellipse(13,-175,3.2,4,'#262923');
 ellipse(-36,-175,1,1,'#e0d3ab');ellipse(14,-176,1,1,'#e0d3ab');
 for(let i=0;i<4;i++)path(`M ${-58+i*3} ${-201-i*5} Q -27 ${-208-i*4} 0 ${-202-i*3}`,null,'#805a3f99',1);
 path('M -65 -157 Q -52 -148 -38 -152 M -65 -150 Q -49 -144 -39 -148',null,'#986b4777',1.4);
}
let sprites;
export function getSprites(){if(!sprites)sprites={head:layer(()=>{ctx.translate(250,270);head()},500,380),torso:layer(()=>{ctx.translate(250,150);torso()},500,420)};return sprites}
export function hand(x,y,rot=0){ctx.save();ctx.translate(x,y);ctx.rotate(rot);path('M -19 -10 Q -21 -20 -10 -22 L 12 -19 Q 32 -15 34 -9 Q 33 -4 20 -7 L 9 -9 Q 39 0 34 7 Q 29 11 8 5 Q 30 14 22 19 L 1 12 Q -11 12 -19 4 Z',grad(-12,-20,20,16,[[0,'#e0b981'],[1,'#8d5b3e']]),'#66432c',1.8);path('M -12 -10 Q -2 -3 9 -3 M -10 -4 Q -3 4 6 5',null,'#9e7049',1);ctx.restore()}
function sleeve(a,e,b){
 const fill=grad(a[0],a[1],b[0],b[1],[[0,'#62503c'],[1,'#3a302a']]);
 const segment=(p,q,wa,wb)=>{const dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy),nx=-dy/d,ny=dx/d,ax=dx/d,ay=dy/d;path(`M ${p[0]+nx*wa} ${p[1]+ny*wa} Q ${(p[0]+q[0])/2+nx*wa} ${(p[1]+q[1])/2+ny*wa} ${q[0]+nx*wb} ${q[1]+ny*wb} Q ${q[0]+ax*wb} ${q[1]+ay*wb} ${q[0]-nx*wb} ${q[1]-ny*wb} L ${p[0]-nx*wa} ${p[1]-ny*wa} Q ${p[0]-ax*wa*.4} ${p[1]-ay*wa*.4} ${p[0]+nx*wa} ${p[1]+ny*wa} Z`,fill,'#25211e',2.4)};
 ellipse(a[0],a[1],33,34,fill,'#25211e',2.4);segment(a,e,32,27);ellipse(e[0],e[1],27,27,fill);segment(e,b,26,19);line([[e[0]-10,e[1]-10],[e[0]+9,e[1]+9]],'#99805a55',2);ellipse(b[0],b[1],22,14,'#c0ac85','#42372b',2);
}
export function rig(t,hybrid=false){
 const pose=characterPose(t),{lean,turn,left,right}=pose;
 ctx.save();ctx.translate(...pose.origin);ctx.rotate(lean);
 if(hybrid){const s=getSprites();ctx.drawImage(s.torso,-250,-150)}else torso();
 sleeve(left.shoulder,left.elbow,left.wrist);sleeve(right.shoulder,right.elbow,right.wrist);
 ctx.save();ctx.translate(0,-3);ctx.rotate(-.09+Math.sin(t*.55)*.025-turn*.035);
 if(hybrid){const s=getSprites();ctx.drawImage(s.head,-250,-270)}else head();
 // Closed eyelids use exactly the same head transform.
 if((t%5.3)<.12){line([[-59,-174],[-28,-174]],'#bba078',7);line([[-3,-175],[20,-175]],'#bba078',7)}
 ctx.restore();
 ctx.restore();
}
export function drawHands(t){const pose=characterPose(t),{left,right}=pose;ctx.save();ctx.translate(...pose.origin);ctx.rotate(pose.lean);hand(...left.wrist,left.rotation);hand(...right.wrist,right.rotation);
 // Hand and pen share the same wrist transform and calibrated grip angle.
 ctx.save();ctx.translate(...left.wrist);ctx.rotate(left.rotation);ctx.rotate(-.45);line([[3,8],[56,-115]],'#c5ad7e',2);path('M 56 -115 Q 46 -167 79 -202 Q 86 -157 56 -115 Z','#c9bd9c','#594e37',1.5);for(let i=0;i<12;i++)line([[56+i*1.8,-127-i*5],[65+i*1.8,-132-i*5]],'#8f8165',1);ctx.restore();ctx.restore();}
