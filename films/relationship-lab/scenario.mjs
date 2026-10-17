import {ease,mix} from '../../engine/math.mjs';
import {solveArm} from '../../engine/rigging.mjs';
import {InextensibleSheet} from '../../engine/inextensible-sheet.mjs';
import {identity3,project,homography,multiply3} from '../../engine/warp.mjs';
import {transform2,resolveRelations,drawOrder,surfaceAnchor} from '../../engine/relationships.mjs';

export const DURATION=6;
export const variants=[
  {id:'courier',scale:1,angle:0,width:48,surfaceWidth:240,surfaceHeight:130,color:'#eab676'},
  {id:'mechanic',scale:.8,angle:-.12,width:72,surfaceWidth:300,surfaceHeight:100,color:'#9fc4da'},
  {id:'archivist',scale:1.15,angle:.10,width:36,surfaceWidth:180,surfaceHeight:180,color:'#c1b5e2'},
];
export const faults=['connection','contact','occlusion','shape','perspective','temporal'];
const pointMix=(a,b,k)=>a.map((v,i)=>mix(v,b[i],k));
export function handTarget(t) {
  const rest=[780,580],pick=[850,610],drop=[1000,610];
  if(t<1) return pointMix(rest,pick,ease(t,0,1));
  if(t<=4) {
    const k=ease(t,1,4);
    return [mix(pick[0],drop[0],k),610-120*Math.sin(Math.PI*k)**2];
  }
  return pointMix(drop,[900,570],ease(t,4,5));
}
export function scenario(t,variant=variants[0],fault=null) {
  const root=transform2({x:960*(1-variant.scale),y:570*(1-variant.scale),scaleX:variant.scale,angle:variant.angle});
  const k=ease(t,0,6);
  const camera=multiply3(homography([[50*k,30*k],[1920-110*k,80*k],[1920-20*k,1080-20*k],[10*k,1080-80*k]]),[1/1920,0,0,0,1/1080,0,0,0,1]);
  const hand=handTarget(t),arm=solveArm([740,360],hand,{upper:240,forearm:210,pole:1,minAngle:20,maxAngle:165});
  const holding=t>=1&&t<4,owner=holding?'hand':t<1?'pickup':'drop';
  const actualHand=hand.map((v,i)=>v+(fault==='connection'&&i===0?22:0));
  const nodes=[
    {id:'root',local:root},
    {id:'hand',parent:'root',local:transform2({x:actualHand[0],y:actualHand[1]})},
    {id:'pickup',parent:'root',local:transform2({x:850,y:610})},
    {id:'drop',parent:'root',local:transform2({x:1000,y:610})},
    {id:'prop',parent:owner,local:transform2({x:fault==='temporal'&&t>=4?40:0,y:28+(fault==='contact'?25:0)})},
  ];
  const relations=resolveRelations(nodes,t,camera),screen=p=>project(camera,...project(root,...p));
  const propWorld=relations.world('prop');
  const propCamera=fault==='perspective'?identity3():camera;
  const propMatrix=multiply3(propCamera,propWorld),propPoint=p=>project(propMatrix,...p);
  const half=variant.width/2*(fault==='shape'?4:1);
  const propLocal=[[-half,-28],[half,-28],[half,28],[-half,28]];
  const prop=propLocal.map(propPoint);
  const pole=[[916,400],[934,400],[934,700],[916,700]].map(screen);
  const order=drawOrder(['body','arm','prop','pole','hand'],[['body','arm'],['arm','prop'],['prop','hand'],...(fault==='occlusion'?[['pole','prop']]:[['prop','pole']])]);
  const sw=variant.surfaceWidth,sh=variant.surfaceHeight;
  const surfaceOrigin=1500;
  const surface=new InextensibleSheet({width:sw,height:sh,origin:[surfaceOrigin,650]});
  const surfaceOptions={curl:ease(t,1,5),stretch:fault==='shape'?1.5:1},mesh=surface.mesh(surfaceOptions,48,8);
  const surfacePoints=mesh.vertices.map(p=>[p.x,p.y]);
  const combined=multiply3(camera,root);
  const renderMesh={...mesh,vertices:mesh.vertices.map(p=>{const a=project(combined,p.x,p.y);return{...p,x:a[0],y:a[1]};})};
  const wristWorld=project(root,...arm.wrist),handWorld=relations.anchor('hand');
  const expectedGrip=project(root,...(holding?hand:t<1?[850,610]:[1000,610]));
  const referenceBottom=screen([holding?hand[0]:t<1?850:1000,(holding?hand[1]:610)+56]);
  const measured={
    strains:[{id:'flexible-material',value:surface.strain(surfaceOptions)}],
    connections:[{id:'wrist-hand',a:wristWorld,b:handWorld}],
    contacts:[{id:'owner-grip',a:relations.anchor('prop',[0,-28]),b:expectedGrip}],
    projections:[{id:'prop-camera',a:propPoint([0,28]),b:project(camera,...relations.anchor('prop',[0,28]))}],
    lengths:[
      {id:'upper-arm',a:arm.shoulder,b:arm.elbow,expected:240},
      {id:'forearm',a:arm.elbow,b:arm.wrist,expected:210},
      {id:'prop-width',a:propLocal[0],b:propLocal[1],expected:variant.width},
    ],
    bounds:[{id:'flexible',points:surfacePoints,box:[1150,250,1850,850]}],
    occlusion:[{id:'pole-prop',expected:'pole',actual:order.indexOf('pole')>order.indexOf('prop')?'pole':'prop'}],
  };
  return {t,variant,fault,owner,holding,order,measured,prop,pole,screen,arm,
    hand:screen(actualHand),body:[[650,350],[760,350],[800,650],[610,650]].map(screen),
    head:screen([690,275]),renderMesh,
    surfacePin:surfaceAnchor(surface,[.7,.5],surfaceOptions,combined),
    marker:propPoint([0,28]),referenceBottom,
    probe:screen([925,518]),
    temporal:{t,points:{hand:screen(actualHand),prop:propPoint([0,0]),surface:surfaceAnchor(surface,[.7,.5],surfaceOptions,combined)}},
  };
}
