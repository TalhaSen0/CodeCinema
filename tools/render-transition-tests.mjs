import {mkdirSync} from 'node:fs';
import {run} from './common.mjs';
mkdirSync('review/revision/clips',{recursive:true});
for(const [name,a,b]of [['arm',3.7,7.3],['entry',9.5,14.5],['turn',23.5,29.5],['exit',40.5,44.5]]){
 await run(process.execPath,['tools/upstream/render.mjs','films/galileo/draft.html','--root','.','--workers','2','--fps','30','--from',String(a),'--to',String(b),'--fast','--out',`review/revision/clips/${name}.mp4`]);
}
