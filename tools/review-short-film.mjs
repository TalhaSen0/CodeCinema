import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const film=process.argv[2],out=process.argv[3];
if(!film||!out||!/^[a-z0-9-]+$/.test(film))throw new Error('film id and review folder required');
mkdirSync(out,{recursive:true});
const server=await serveDir(process.cwd()),browser=await chromium.launch();
const errors=[],checks=[],overflow=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 const url=server.url(`films/${film}/index.html`);
 await page.goto(url);await page.waitForFunction(()=>window.__film?.ready);
 const duration=await page.evaluate(()=>__film.duration);
 for(let t=0;t<duration;t+=.25){
  const boxes=await page.evaluate(t=>{__film.seek(t);return __film.textBoxes},t);
  for(const b of boxes||[])if(b.x<60||b.x+b.width>1860||b.y<0||b.y+b.height>1080)overflow.push({t,...b});
 }
 for(const t of [0,3,7.6,8.1,10,17,23.7,24.1,27,31.9]){
  const grab=()=>page.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL('image/png')},t);
  const a=await grab();writeFileSync(`${out}/browser-${t}.png`,Buffer.from(a.split(',')[1],'base64'));
  await page.evaluate(()=>__film.seek(1));const b=await grab();
  await page.reload();await page.waitForFunction(()=>window.__film?.ready);const c=await grab();
  checks.push({t,repeat:a===b,cold:a===c,hash:createHash('sha256').update(a).digest('hex')});
 }
 writeFileSync(`${out}/browser-checks.json`,JSON.stringify({errors,overflow,checks},null,2));
 if(errors.length||overflow.length||checks.some(c=>!c.repeat||!c.cold))throw new Error('Browser review failed');
 console.log('Browser: no errors/overflow; ten repeated and cold seeks match.');
}finally{await browser.close();server.close()}
