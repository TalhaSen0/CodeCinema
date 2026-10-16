import {resolve} from 'node:path';
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
export const env={...process.env,CHROME:chromium.executablePath(),FFMPEG:resolve('.tools/ffmpeg.exe'),FFPROBE:resolve('.tools/ffprobe.exe')};
export function run(cmd,args,extra={}) {return new Promise((yes,no)=>{const p=spawn(cmd,args,{stdio:'inherit',env,...extra});p.on('error',no);p.on('exit',c=>c===0?yes():no(new Error(cmd+' exited '+c)));});}
