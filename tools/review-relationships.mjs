import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {run,env} from './common.mjs';
import {scenario,variants,faults} from '../films/relationship-lab/scenario.mjs';
import {inspectFrame,inspectStep,deliveryGate} from '../engine/quality.mjs';

const out='review/relationships';mkdirSync(out,{recursive:true});
const report={scope:'Synthetic corpus only; no claim of general defect recall',geometry:[],mutations:[],raster:[],seeks:[],errors:[],falsePositives:0,misses:0};
writeFileSync(`${out}/verification.json`,JSON.stringify({status:'running',startedAt:new Date().toISOString()}));
const regressionFiles=['renders/galileo-final-v2.mp4','films/galileo/assets/mix.wav','films/galileo/assets/narration.wav'];
const fileHash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const baseline=Object.fromEntries(regressionFiles.map(file=>[file,fileHash(file)]));
writeFileSync(`${out}/baseline.json`,JSON.stringify(baseline,null,2));
for(const variant of variants) {
  let previous;const defects=[];
  for(let i=0;i<=720;i++) {
    const s=scenario(i/120,variant);
    defects.push(...inspectFrame(s.measured).map(d=>({...d,t:s.t})));
    if(previous)defects.push(...inspectStep(previous,s.temporal).map(d=>({...d,t:s.t})));
    previous=s.temporal;
  }
  for(const t of [1,4])defects.push(...inspectStep(scenario(t-.0001,variant).temporal,scenario(t+.0001,variant).temporal,{seam:true}));
  report.geometry.push({variant:variant.id,samples:721,defects});report.falsePositives+=defects.length;
  for(const fault of faults) {
    const defects=fault==='temporal'?inspectStep(scenario(3.9999,variant,fault).temporal,scenario(4.0001,variant,fault).temporal,{seam:true}):inspectFrame(scenario(2.5,variant,fault).measured);
    const detected=defects.some(d=>d.category===fault);
    report.mutations.push({variant:variant.id,fault,detected,defects});if(!detected)report.misses++;
  }
}
const server=await serveDir(process.cwd()),browser=await chromium.launch();
try {
  const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(server.url('films/relationship-lab/index.html')+'?capture=1');
  await page.waitForFunction(()=>window.__film?.ready);
  for(const variant of variants) {
    for(const fault of [null,'contact','perspective','occlusion']) {
      const result=await page.evaluate(({id,fault})=>{
        __film.configure(id,fault);__film.seek(2.5);
        const {referenceBottom,probe}=__film.debug(),c=document.querySelector('canvas'),cx=c.getContext('2d');
        const data=cx.getImageData(0,0,c.width,c.height).data;let n=0,x=0,y=0;
        for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++) {
          const p=(j*c.width+i)*4;
          if(data[p]>240&&data[p+1]<15&&data[p+2]>240){n++;x+=i+.5;y+=j+.5}
        }
        const error=n?Math.hypot(x/n-referenceBottom[0],y/n-referenceBottom[1]):null;
        const pixel=[...cx.getImageData(Math.round(probe[0]),Math.round(probe[1]),1,1).data];
        return {markerFound:n>0,error,front:pixel[1]>pixel[0]*1.5?'pole':'other',pixel};
      },{id:variant.id,fault});
      const markerOK=result.markerFound&&result.error<=3,occlusionOK=result.front==='pole';
      const detected=fault==='occlusion'?!occlusionOK:fault?!markerOK:markerOK&&occlusionOK;
      report.raster.push({variant:variant.id,fault,...result,expectedOutcomeMet:detected});
      if(!detected){if(fault)report.misses++;else report.falsePositives++;}
      const png=await page.evaluate(()=>document.querySelector('canvas').toDataURL('image/png'));
      writeFileSync(`${out}/${variant.id}-${fault??'clean'}.png`,Buffer.from(png.split(',')[1],'base64'));
    }
    await page.evaluate(id=>__film.configure(id),variant.id);
    for(const t of [0,1,2.5,4,6]) {
      const capture=async time=>page.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL()},time);
      const a=await capture(t);await capture(5.73);const b=await capture(t);
      await page.reload();await page.waitForFunction(()=>window.__film?.ready);await page.evaluate(id=>__film.configure(id),variant.id);
      const c=await capture(t),hash=s=>createHash('sha256').update(s).digest('hex');
      report.seeks.push({variant:variant.id,t,repeated:hash(a)===hash(b),cold:hash(a)===hash(c)});
    }
    const dir=`${out}/${variant.id}`;mkdirSync(dir,{recursive:true});
    for(let i=0;i<180;i++) {
      const png=await page.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL('image/png')},i/30);
      writeFileSync(`${dir}/frame-${String(i).padStart(4,'0')}.png`,Buffer.from(png.split(',')[1],'base64'));
    }
    await run(env.FFMPEG,['-v','error','-y','-framerate','30','-i',`${dir}/frame-%04d.png`,'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',`${out}/${variant.id}.mp4`]);
  }
} finally {await browser.close();server.close();}
await run('python',['tools/review-relationship-clips.py',out]);
report.encoded=JSON.parse(readFileSync(`${out}/encoded.json`,'utf8'));
await run(process.execPath,['--test','tests/*.test.mjs']);
await run(process.execPath,['tools/verify.mjs','renders/galileo-final-v2.mp4',`${out}/galileo-verification.json`]);
await run(process.execPath,['tools/verify-surfaces.mjs',out]);
report.regression={unchanged:regressionFiles.every(file=>baseline[file]===fileHash(file)),
  technical:JSON.parse(readFileSync(`${out}/galileo-verification.json`,'utf8')).failures.length===0,
  surfaces:JSON.parse(readFileSync(`${out}/surface-verification.json`,'utf8')).failures.length===0};
const defects=[...report.geometry.flatMap(r=>r.defects),...(report.falsePositives||report.misses?[{category:'detector',falsePositives:report.falsePositives,misses:report.misses}]:[]),...report.errors.map(message=>({category:'browser',message}))];
report.gate=deliveryGate({defects,audioRequired:false,evidence:{geometry:report.geometry.every(r=>!r.defects.length),raster:report.raster.every(r=>r.expectedOutcomeMet),mutations:report.misses===0,encoded:report.encoded.every(r=>r.ok),determinism:report.seeks.every(r=>r.repeated&&r.cold),regression:Object.values(report.regression).every(Boolean)}});
writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({falsePositives:report.falsePositives,misses:report.misses,gate:report.gate,encoded:report.encoded},null,2));
if(report.gate.status==='blocked')process.exitCode=1;
