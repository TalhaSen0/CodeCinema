import {readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const walk=dir=>readdirSync(dir).flatMap(f=>{const p=dir+'/'+f;return statSync(p).isDirectory()?walk(p):[p]});
const inputs=[...walk('engine'),...walk('films/galileo').filter(p=>/\.(mjs|html|wav)$/.test(p)),...walk('tools').filter(p=>/\.(mjs|py)$/.test(p)),'package.json','package-lock.json'];
const outputs=['renders/galileo-final.mp4','renders/galileo-draft.mp4','renders/galileo-music-only.mp4'];
writeFileSync('review/delivery-manifest.json',JSON.stringify({created:new Date().toISOString(),inputs:Object.fromEntries(inputs.map(p=>[p,sha(p)])),outputs:Object.fromEntries(outputs.map(p=>[p,{bytes:statSync(p).size,sha256:sha(p)}]))},null,2));console.log('Delivery SHA-256 manifest saved.');
