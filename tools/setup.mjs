import {mkdirSync,copyFileSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import ffprobe from 'ffprobe-static';
mkdirSync('.tools',{recursive:true}); mkdirSync('tools/upstream',{recursive:true});
const ffmpeg=execFileSync('python',['-c','import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],{encoding:'utf8'}).trim();
copyFileSync(ffmpeg,'.tools/ffmpeg.exe'); copyFileSync(ffprobe.path,'.tools/ffprobe.exe');
if(!existsSync(chromium.executablePath())) execFileSync(process.execPath,['node_modules/playwright/cli.js','install','chromium'],{stdio:'inherit'});
for(const file of ['lib.mjs','render.mjs','verify.mjs']) {
 let src=readFileSync('vendor/opus-js-animations/skills/opus-js-animations/scripts/'+file,'utf8');
 if(file==='lib.mjs') src=src.replace("rel.split(sep).map(encodeURIComponent)","rel.split(/[\\\\/]/).map(encodeURIComponent)");
 if(file==='render.mjs') {
  src=src.replaceAll("spawn('ffmpeg'", "spawn(process.env.FFMPEG || 'ffmpeg'").replaceAll("spawnSync('ffmpeg'", "spawnSync(process.env.FFMPEG || 'ffmpeg'").replaceAll("spawnSync('ffprobe'", "spawnSync(process.env.FFPROBE || 'ffprobe'");
  src=src.replace("`file '${s}'`", "`file '${s.replaceAll('\\\\', '/')}'`");
  src=src.replaceAll('spawnSync(', 'checkedSync(');
  src=src.replace('const args = parseArgs',"const checkedSync = (cmd, args, options) => { const r = spawnSync(cmd,args,options); if (r.error || r.status !== 0) throw new Error(r.error?.message || `${cmd} exited ${r.status}`); return r; };\nconst args = parseArgs");
  src=src.replaceAll("await new Promise(r => ff.on('close', r));", "await new Promise((r,j) => { ff.on('error',j); ff.on('close',code => code === 0 ? r() : j(new Error('FFmpeg exited '+code))); });");
  src=src.replace("if (film.logs.length) console.error('\\npage errors:\\n' + film.logs.join('\\n'));", "if (film.logs.length) throw new Error('Page errors: '+film.logs.join('\\n'));");
 }
 writeFileSync('tools/upstream/'+file,src);
}
copyFileSync('vendor/opus-js-animations/LICENSE','tools/upstream/LICENSE');
console.log('Chromium, FFmpeg, FFprobe and MIT render harness ready.');
