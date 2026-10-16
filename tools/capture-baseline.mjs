import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
// Read the saved commit into a review-only directory; never replace working source.
const base='review/baseline-source';
for(const path of execFileSync('git',['ls-tree','-r','--name-only','cc2b213','engine','films/galileo'],{encoding:'utf8'}).trim().split('\n').filter(p=>/\.(mjs|html)$/.test(p))){const target=base+'/'+path;mkdirSync(dirname(target),{recursive:true});writeFileSync(target,execFileSync('git',['show','cc2b213:'+path]))}
const server=await serveDir(process.cwd()),browser=await chromium.launch();
try{const p=await browser.newPage();await p.goto(server.url(base+'/films/galileo/index.html')+'?capture=1');await p.waitForFunction(()=>__film?.ready);const d=await p.evaluate(()=>{__film.seek(2);return document.querySelector('canvas').toDataURL()});writeFileSync('review/baseline/browser-2.png',Buffer.from(d.split(',')[1],'base64'))}finally{await browser.close();server.close()}
