import test from 'node:test';import assert from 'node:assert/strict';
import {pendulum} from '../engine/pendulum.mjs';
test('Pendulum rod remains fixed and fourfold length doubles period',()=>{
 for(const length of [.4,1.6])for(let i=0;i<960;i++){
  const p=pendulum(i/30,{length});assert.ok(Math.abs(Math.hypot(p.x,p.y)-length)<1e-12);
 }
 assert.ok(Math.abs(pendulum(0,{length:1.6}).period/pendulum(0,{length:.4}).period-2)<1e-12);
});
test('Pendulum direct seeks and full periods have same pose',()=>{
 const a=pendulum(.9);pendulum(987);assert.deepEqual(pendulum(.9),a);
 const b=pendulum(.9+a.period);assert.ok(Math.abs(a.x-b.x)<1e-12);
});
