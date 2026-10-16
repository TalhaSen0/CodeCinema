import {chromium} from 'playwright';import {serveDir} from './upstream/lib.mjs';import {mkdirSync,writeFileSync} from 'node:fs';import {run} from './common.mjs';
const out=process.argv[2]||'review/revision',ranges=[['arm',3.7,7.3],['entry',9.5,14.5],['turn',23.5,29.5],['exit',40.5,44.5]];
mkdirSync(out,{recursive:true});const server=await serveDir(process.cwd()),browser=await chromium.launch(),errors=[];
try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(server.url('films/galileo/index.html')+'?capture=1');await page.waitForFunction(()=>window.__film?.ready);
 for(const [name,a,b]of ranges){const dir=out+'/'+name;mkdirSync(dir,{recursive:true});const manifest=[],times=new Set();for(let i=0;i<=Math.ceil((b-a)*12);i++)times.add(Math.min(b,a+i/12));for(const boundary of [4.7,5.2,6.9,10,14,24,28.5,29,41,44])if(boundary>a&&boundary<b)for(let k=-3;k<=3;k++)times.add(boundary+k/30);
  for(const [i,t]of [...times].sort((a,b)=>a-b).entries()){const result=await page.evaluate(t=>{__film.seek(t);return{image:document.querySelector('canvas').toDataURL('image/jpeg',.93),trace:__film.debug()}},t),file='frame-'+String(i).padStart(4,'0')+'.jpg';writeFileSync(dir+'/'+file,Buffer.from(result.image.split(',')[1],'base64'));manifest.push({t,file,trace:result.trace})}
  writeFileSync(dir+'/manifest.json',JSON.stringify(manifest));console.log(name+': '+manifest.length+' temporal frames saved.');
 }
 for(const t of [0,2,4.7,5,5.2,5.5,6,7,9.9666667,10,10.0333333,11,12,13,13.9666667,14,14.0333333,16,20.3,21.5,23,23.9666667,24,24.0333333,25,25.5,26,26.5,27,28.5,29,30.5,35.5,39,40.9666667,41,41.0333333,42,43,43.9666667,44,44.0333333,46,47.96]){const png=await page.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL()},t);writeFileSync(out+'/key-'+t.toFixed(3)+'.png',Buffer.from(png.split(',')[1],'base64'))}
 writeFileSync(out+'/errors.json',JSON.stringify(errors));if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.close()}
await run('python',['tools/transition-sheets.py',out]);
