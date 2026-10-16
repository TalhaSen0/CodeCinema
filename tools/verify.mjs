import {chromium} from 'playwright';
import {serveDir} from './upstream/lib.mjs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {env} from './common.mjs';
import {DURATION,narration,events} from '../films/galileo/production.mjs';
import {makeTracks} from '../engine/physics.mjs';
const video=process.argv[2]||'renders/galileo-final.mp4';
const failures=[],checks={};mkdirSync('review',{recursive:true});
function check(name,ok,detail){checks[name]={ok,detail};if(!ok)failures.push(name);console.log((ok?'PASS ':'FAIL ')+name+' '+JSON.stringify(detail));}
if(!existsSync(video))throw new Error('Missing '+video);
const probe=JSON.parse(execFileSync(env.FFPROBE,['-v','error','-count_frames','-show_streams','-show_format','-of','json',video],{encoding:'utf8'}));
const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio'),draft=video.includes('draft');
check('resolution',v.width===(draft?960:1920)&&v.height===(draft?540:1080),[v.width,v.height]);
check('fps and frame count',v.r_frame_rate==='30/1'&&+v.nb_read_frames===DURATION*30,{fps:v.r_frame_rate,frames:v.nb_read_frames});
check('codecs',v.codec_name==='h264'&&a?.codec_name==='aac',{video:v.codec_name,audio:a?.codec_name});
check('HD colour',v.pix_fmt==='yuv420p'&&v.color_space==='bt709'&&v.color_range==='tv', {pixelFormat:v.pix_fmt,space:v.color_space,range:v.color_range});
check('duration sync',Math.abs(+v.duration-DURATION)<1/30&&Math.abs(+a?.duration-DURATION)<.05,{video:v.duration,audio:a?.duration});
execFileSync(env.FFMPEG,['-v','error','-xerror','-i',video,'-f','null','-'],{stdio:['ignore','pipe','pipe']});check('complete decode',true,DURATION*30+' frames decoded');
const pixels=execFileSync(env.FFMPEG,['-v','error','-i',video,'-vf','scale=96:54,format=gray','-f','rawvideo','-'],{maxBuffer:64*1024*1024}),S=96*54,N=pixels.length/S;
const means=[],std=[],diff=[0];for(let i=0;i<N;i++){const f=pixels.subarray(i*S,(i+1)*S);let sum=0,sq=0,d=0;for(let k=0;k<S;k++){sum+=f[k];sq+=f[k]*f[k];if(i)d+=Math.abs(f[k]-pixels[(i-1)*S+k])}means.push(sum/S);std.push(Math.sqrt(sq/S-(sum/S)**2));if(i)diff.push(d/S)}
const empty=means.flatMap((m,i)=>m<4||std[i]<2?[i]:[]),jumps=diff.flatMap((d,i)=>d>25?[{frame:i,t:i/30,diff:d}]:[]);
check('nonempty frames',empty.length===0,{empty,minMean:Math.min(...means),minContrast:Math.min(...std)});
check('unexpected jumps',jumps.length===0,{threshold:25,maxDifference:Math.max(...diff),jumps});
const server=await serveDir(process.cwd()),browser=await chromium.launch(),errors=[];const hashes=[];
try{const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(server.url('films/galileo/index.html')+'?capture=1');await page.waitForFunction(()=>window.__film?.ready);
 const hash=async t=>createHash('sha256').update(await page.evaluate(t=>{__film.seek(t);return document.querySelector('canvas').toDataURL()},t)).digest('hex');
 for(const t of [.1,4.7,5.8,7,10,11.5,13.9,14,19,24,26.2,28.99,29,35.5,38.5,41,42.6,44,47.96]){const a=await hash(t),b=await hash(t);await hash((t+23.2)%48);const c=await hash(t);hashes.push({t,hash:a,ok:a===b&&b===c})}
 check('seek determinism',hashes.every(h=>h.ok),hashes.map(h=>({t:h.t,ok:h.ok})));
 check('browser errors',errors.length===0,errors);
 const overflow=await page.evaluate(()=>{const bad=[];for(let t=0;t<48;t+=.25){__film.seek(t);for(const b of __film.textBoxes)if(b.x0<0||b.y0<0||b.x1>b.width||b.y1>b.height)bad.push({t,...b})}return bad});
 check('text overflow',overflow.length===0,{samples:192,overflow});
}finally{await browser.close();server.close()}
const audio=JSON.parse(readFileSync('review/audio-timings.json','utf8'));
check('narration fit',audio.cues.every(c=>c.actualEnd<=c.end&&c.actualEnd<=DURATION),audio.cues.map(c=>({start:c.start,end:c.actualEnd,slotEnd:c.end})));
check('shared audio events',JSON.stringify(audio.events)===JSON.stringify(events),events);
const pcm=execFileSync(env.FFMPEG,['-v','error','-i',video,'-vn','-ac','2','-f','f32le','-'],{maxBuffer:64*1024*1024});let peak=0;for(let i=0;i<pcm.length;i+=4)peak=Math.max(peak,Math.abs(pcm.readFloatLE(i)));check('audio clipping',peak<1,{decodedStereoPeak:peak});
const m=makeTracks();check('scientific time order',m.curves[2].duration<m.curves[1].duration&&m.curves[1].duration<m.curves[0].duration,m.curves.map(c=>({id:c.id,time:c.duration})));
writeFileSync(process.argv[3]||'review/verification.json',JSON.stringify({video,checks,hashes,failures,probe},null,2));
if(failures.length)process.exitCode=1;
