import {existsSync,mkdirSync} from 'node:fs';
import {run} from './common.mjs';
const mode=process.argv[2]||'draft',final=mode==='final';
const fi=process.argv.indexOf('--film'),film=fi<0?'galileo':process.argv[fi+1];
if(!/^[a-z0-9-]+$/.test(film))throw new Error('Invalid film id');
mkdirSync('renders',{recursive:true});
const audio='films/'+film+'/assets/mix.wav';
if(!existsSync(audio))throw new Error('Run npm run audio first.');
await run(process.execPath,['tools/upstream/render.mjs','films/'+film+'/'+(final?'index.html':'draft.html'),'--root','.', '--workers','2','--fps','30','--audio',audio,'--out','renders/'+film+'-'+mode+'.mp4',...(final?['--crf','17']:['--fast'])]);
