import {run,env} from './common.mjs';
await run(env.FFMPEG,['-v','error','-y','-i','renders/galileo-final.mp4','-i','films/galileo/assets/score.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','renders/galileo-music-only.mp4']);
