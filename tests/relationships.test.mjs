import {test} from 'node:test';
import assert from 'node:assert/strict';
import {transform2,resolveRelations,reparentLocal,drawOrder} from '../engine/relationships.mjs';
import {identity3,multiply3} from '../engine/warp.mjs';
import {inspectFrame,inspectStep,deliveryGate} from '../engine/quality.mjs';
import {scenario,variants,faults} from '../films/relationship-lab/scenario.mjs';

test('nested anchors and ownership preserve an independently known world pose',()=>{
  const parent=transform2({x:100,y:50,angle:Math.PI/2,scaleX:2});
  const r=resolveRelations([{id:'p',local:parent},{id:'c',parent:'p',local:transform2({x:10,y:20})}],0);
  assert.ok(Math.hypot(r.anchor('c')[0]-60,r.anchor('c')[1]-70)<1e-9);
  const pose=transform2({x:43,y:72,angle:.4});
  const result=multiply3(parent,reparentLocal(pose,parent));
  result.forEach((v,i)=>assert.ok(Math.abs(v-pose[i])<1e-9));
});
test('invalid ownership and painter cycles fail closed',()=>{
  assert.throws(()=>resolveRelations([{id:'a',parent:'b'},{id:'b',parent:'a'}],0),/cycle/);
  assert.throws(()=>resolveRelations([{id:'a',parent:'missing'}],0),/Missing/);
  assert.throws(()=>resolveRelations([{id:'a'},{id:'a'}],0),/Duplicate/);
  assert.throws(()=>resolveRelations([{id:'a',local:Array(9).fill(0)}],0),/Singular/);
  assert.throws(()=>resolveRelations([{id:'a',local:transform2({scaleX:1e300})}],0),/Invalid/);
  assert.throws(()=>drawOrder(['a','b'],[['a','b'],['b','a']]),/cycle/);
  assert.throws(()=>drawOrder(['a'],[['a','missing']]),/Unknown/);
});
test('three clean scenarios remain valid at 120Hz and at ownership seams',()=>{
  for(const v of variants) {
    let previous;
    for(let i=0;i<=720;i++) {
      const s=scenario(i/120,v);
      assert.deepEqual(inspectFrame(s.measured),[],`${v.id} @ ${s.t}`);
      if(previous)assert.deepEqual(inspectStep(previous,s.temporal),[],`${v.id} step ${s.t}`);
      previous=s.temporal;
    }
    for(const t of [1,4])assert.deepEqual(inspectStep(scenario(t-.0001,v).temporal,scenario(t+.0001,v).temporal,{seam:true}),[]);
  }
});
test('all six injected fault families are caught in every variant',()=>{
  for(const v of variants)for(const fault of faults) {
    const defects=fault==='temporal'?inspectStep(scenario(4-.0001,v,fault).temporal,scenario(4+.0001,v,fault).temporal,{seam:true}):inspectFrame(scenario(2.5,v,fault).measured);
    assert.ok(defects.some(d=>d.category===fault),`${v.id}/${fault}`);
  }
});
test('unrelated seeks do not change serialized observations',()=>{
  for(const v of variants)for(const t of [0,1,2.5,4,6]) {
    const first=JSON.stringify(scenario(t,v).temporal);scenario(5.83,v);scenario(.137,v);
    assert.equal(JSON.stringify(scenario(t,v).temporal),first);
  }
});
test('missing measurements and missing delivery evidence cannot pass',()=>{
  assert.equal(inspectFrame({contacts:[{id:'missing',a:[0,0],b:null}]}).length,1);
  assert.equal(inspectStep({t:0,points:{a:[0,0]}},{t:Infinity,points:{a:[0,0]}}).length,1);
  assert.equal(deliveryGate({}).status,'blocked');
  const evidence=Object.fromEntries(['geometry','raster','mutations','encoded','determinism','regression'].map(x=>[x,true]));
  assert.equal(deliveryGate({evidence}).status,'review-required');
  assert.equal(deliveryGate({evidence,visualReviewed:true,audioRequired:false}).status,'ready');
});
test('threshold boundaries distinguish tolerated noise from real violations',()=>{
  for(const [key,limit] of [['connections',.01],['contacts',.5],['projections',3]]) {
    assert.deepEqual(inspectFrame({[key]:[{id:'edge',a:[0,0],b:[limit,0]}]}),[]);
    assert.equal(inspectFrame({[key]:[{id:'edge',a:[0,0],b:[limit+.0001,0]}]}).length,1);
  }
  assert.deepEqual(inspectStep({t:1,points:{a:[0,0]}},{t:1.0001,points:{a:[.5,0]}},{seam:true}),[]);
  assert.equal(inspectStep({t:1,points:{a:[0,0]}},{t:1.0001,points:{a:[.501,0]}},{seam:true}).length,1);
});
