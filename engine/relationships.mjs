// Stateless local -> world -> screen evaluation. All matrices are row-major 3x3.
import {identity3, multiply3, inverse3, project} from './warp.mjs';

export function transform2({x=0,y=0,angle=0,scaleX=1,scaleY=scaleX}={}) {
  const c=Math.cos(angle),s=Math.sin(angle);
  return [c*scaleX,-s*scaleY,x,s*scaleX,c*scaleY,y,0,0,1];
}

export function resolveRelations(nodes,t,camera=identity3()) {
  const definitions=new Map(),world=new Map(),visiting=new Set();
  for(const node of nodes) {
    if(!node.id || definitions.has(node.id)) throw new Error('Duplicate or empty node ID');
    definitions.set(node.id,node);
  }
  function resolve(id) {
    if(world.has(id)) return world.get(id);
    if(visiting.has(id)) throw new Error(`Parent cycle at ${id}`);
    const node=definitions.get(id);
    if(!node) throw new Error(`Missing parent ${id}`);
    visiting.add(id);
    const parent=typeof node.parent==='function'?node.parent(t):node.parent;
    const local=typeof node.local==='function'?node.local(t):node.local??identity3();
    if(local.length!==9 || !local.every(Number.isFinite)) throw new Error(`Invalid transform ${id}`);
    const matrix=parent?multiply3(resolve(parent),local):local;
    if(!matrix.every(Number.isFinite)||!inverse3(matrix).every(Number.isFinite)) throw new Error(`Invalid composed transform ${id}`);
    world.set(id,matrix);visiting.delete(id);
    return matrix;
  }
  for(const id of definitions.keys()) resolve(id);
  if(camera.length!==9 || !camera.every(Number.isFinite)) throw new Error('Invalid camera');
  if(!inverse3(camera).every(Number.isFinite)) throw new Error('Invalid camera inverse');
  return {
    world:id=>resolve(id).slice(),
    screen:id=>multiply3(camera,resolve(id)),
    anchor(id,point=[0,0],space='world') {
      if(!['world','screen'].includes(space)) throw new Error('Unknown coordinate space');
      return project(space==='screen'?multiply3(camera,resolve(id)):resolve(id),...point);
    },
  };
}

// Convert a world pose into a new parent's local space at the ownership boundary.
export const reparentLocal=(worldPose,parentWorld)=>multiply3(inverse3(parentWorld),worldPose);

export function surfaceAnchor(surface,uv,options={},camera=identity3()) {
  if(uv.length!==2 || !uv.every(Number.isFinite)) throw new Error('Invalid surface UV');
  const p=surface.sample(...uv,options);
  if(![p.x,p.y].every(Number.isFinite)) throw new Error('Invalid surface anchor');
  return project(camera,p.x,p.y);
}

// Explicit painter constraints. Stable input order breaks ties; cycles fail closed.
export function drawOrder(ids,edges=[]) {
  if(new Set(ids).size!==ids.length) throw new Error('Duplicate drawing ID');
  const remaining=new Set(ids),out=[];
  for(const edge of edges) if(edge.length!==2 || edge.some(id=>!remaining.has(id))) throw new Error('Unknown occlusion node');
  while(remaining.size) {
    const next=ids.find(id=>remaining.has(id)&&!edges.some(([back,front])=>front===id&&remaining.has(back)));
    if(next===undefined) throw new Error('Occlusion cycle');
    remaining.delete(next);out.push(next);
  }
  return out;
}
