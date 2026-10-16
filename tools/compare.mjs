import {run} from './common.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
mkdirSync('renders/comparison',{recursive:true});mkdirSync('review/comparison',{recursive:true});
const server=await serveDir(process.cwd()),browser=await chromium.launch();
try {const metrics={};for(const variant of ['a','b']){
 const page=await browser.newPage();await page.goto(server.url('films/galileo/compare-'+variant+'.html')+'?capture=1');await page.waitForFunction(()=>window.__film?.ready);
 metrics[variant]=await page.evaluate(()=>{let total=0;for(let i=0;i<120;i++){let start=performance.now();__film.seek(i/12);document.querySelector('canvas').getContext('2d').getImageData(0,0,1,1);total+=performance.now()-start}return {averageDrawMs:total/120}});
 for(const t of [0,2,4.5,5.5,7,9.5]){await page.evaluate(t=>__film.seek(t),t);const data=await page.evaluate(()=>document.querySelector('canvas').toDataURL());writeFileSync(`review/comparison/${variant}-${t}.png`,Buffer.from(data.split(',')[1],'base64'))}
 if(variant==='b'){mkdirSync('films/galileo/assets/layers',{recursive:true});const images=await page.evaluate(()=>__film.sprites());for(const [key,data]of Object.entries(images))writeFileSync('films/galileo/assets/layers/'+key+'.png',Buffer.from(data.split(',')[1],'base64'))}
 await page.close();
 await run(process.execPath,['tools/upstream/render.mjs','films/galileo/compare-'+variant+'.html','--root','.','--out','renders/comparison/'+variant+'.mp4','--fps','30','--workers','2','--fast']);
 }writeFileSync('review/comparison/metrics.json',JSON.stringify(metrics,null,2));
}finally{await browser.close();server.close()}
