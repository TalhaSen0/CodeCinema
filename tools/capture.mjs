import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {run} from './common.mjs';
const out=process.argv[2]||'review/current';mkdirSync(out,{recursive:true});
const server=await serveDir(process.cwd()),browser=await chromium.launch();
const errors=[];
try{const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(server.url('films/galileo/index.html')+'?capture=1');await p.waitForFunction(()=>window.__film?.ready);
 const times=process.argv.includes('--quick')?[0,2,5,7,11,13.5,16,19.5,25.5,28,31,35.5,39,42,46]:Array.from({length:96},(_,i)=>i*.5);
 const manifest=[];for(const t of times){const data=await p.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL('image/png')},t);const file=`frame-${String(Math.round(t*1000)).padStart(6,'0')}.png`;writeFileSync(out+'/'+file,Buffer.from(data.split(',')[1],'base64'));manifest.push({t,file})}
 for(const [name,a,b]of [['hand-page',3.8,7.8],['portal',10,14],['page-turn',23.5,29.5],['race',34,38],['return',41,44]]){const m=[];for(let i=0;i<=Math.ceil((b-a)*12);i++){const t=Math.min(b,a+i/12);const data=await p.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL('image/png')},t);const file=`${name}-${String(i).padStart(2,'0')}.png`;writeFileSync(out+'/'+file,Buffer.from(data.split(',')[1],'base64'));m.push({t,file})}writeFileSync(out+'/'+name+'.json',JSON.stringify(m))}
 writeFileSync(out+'/manifest.json',JSON.stringify(manifest));writeFileSync(out+'/errors.json',JSON.stringify(errors));if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.close()}
await run('python',['tools/contact-sheet.py',out]);
