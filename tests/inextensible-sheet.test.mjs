import test from 'node:test';
import assert from 'node:assert/strict';
import {InextensibleSheet} from '../engine/inextensible-sheet.mjs';
import {inspectFrame} from '../engine/quality.mjs';

test('final sheet mirrors the initial pose horizontally and preserves the arch direction',()=>{
  for(const [width,height] of [[240,130],[300,100],[180,180],[60,400]]) {
    const sheet=new InextensibleSheet({width,height,origin:[1500,650]});
    for(let i=0;i<=64;i++)for(const v of [0,.5,1]) {
      const u=i/64,a=sheet.material(u,v,{curl:0}),b=sheet.material(u,v,{curl:1});
      assert.ok(Math.hypot(a.x+b.x,a.y-b.y,a.z-b.z)<1e-9);
      const start=sheet.sample(u,v,{curl:0}),end=sheet.sample(u,v,{curl:1});
      assert.ok(Math.abs(start.x+end.x-3000)<1e-9);
      assert.ok(Math.abs(start.y-end.y)<1e-9);
    }
    for(const curl of [0,1]) {
      const left=sheet.sample(0,.5,{curl}),middle=sheet.sample(.5,.5,{curl}),right=sheet.sample(1,.5,{curl});
      assert.ok(middle.y<(left.y+right.y)/2,'center must remain above the ends');
    }
    const zero=1-Math.atan(.25/1.1)/Math.PI;
    for(const u of [0,.5,1]) {
      const a=sheet.material(u,.5,{curl:zero-1e-7}),b=sheet.material(u,.5,{curl:zero+1e-7});
      assert.ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<.001);
      assert.ok(sheet.strain({curl:zero})<.001);
    }
  }
});

test('sheet material metric and projected segment lengths stay bounded throughout the turn',()=>{
  for(const [width,height] of [[240,130],[300,100],[180,180],[60,400]]) {
    const sheet=new InextensibleSheet({width,height});
    for(let frame=0;frame<=240;frame++) {
      const options={curl:frame/240};
      assert.ok(sheet.strain(options)<.001);
      for(let i=0;i<64;i++) {
        const a=sheet.sample(i/64,.5,options),b=sheet.sample((i+1)/64,.5,options);
        assert.ok(Math.hypot(b.x-a.x,b.y-a.y)<=width/64+1e-9,'projection must not lengthen a material segment');
      }
      const hinge=sheet.material(0,.5,options);
      assert.ok(Math.hypot(hinge.x,hinge.y-height/2,hinge.z)<1e-12);
    }
  }
});
test('strain detector catches subtle surface-only expansion even inside the old bounding box',()=>{
  const sheet=new InextensibleSheet({width:240,height:130});
  for(const curl of [.1,.3,.5,.7,.9]) {
    assert.deepEqual(inspectFrame({strains:[{id:'paper',value:sheet.strain({curl})}]}),[]);
    const defects=inspectFrame({strains:[{id:'paper',value:sheet.strain({curl,stretch:1.02})}]});
    assert.equal(defects[0]?.category,'shape');
  }
  assert.equal(inspectFrame({strains:[{id:'paper',value:NaN}]}).length,1);
});
