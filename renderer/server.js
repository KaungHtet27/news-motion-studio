import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
const PORT=47831;
const OUTPUT=path.join(__dirname,'output');
fs.mkdirSync(OUTPUT,{recursive:true});
app.use(cors({origin:(origin,cb)=>{if(!origin||/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)||/^https:\/\/[a-z0-9-]+\.github\.io$/.test(origin))return cb(null,true);cb(new Error('Origin not allowed'))}}));
const upload=multer({dest:path.join(os.tmpdir(),'news-motion-studio'),limits:{fileSize:500*1024*1024,files:100}});
const run=(args)=>new Promise((resolve,reject)=>{const p=spawn(process.env.FFMPEG_PATH||'ffmpeg',args,{windowsHide:true});let err='';p.stderr.on('data',d=>err+=d.toString());p.on('error',reject);p.on('close',code=>code===0?resolve():reject(new Error(err.slice(-2500)||'FFmpeg failed with code '+code)))});
const safe=(s)=>path.basename(String(s||'')).replace(/[^\w.() -]/g,'_');
app.get('/health',(_req,res)=>res.json({ok:true,service:'News Motion Studio Local Renderer',ffmpeg:process.env.FFMPEG_PATH||'ffmpeg',output:OUTPUT}));
app.post('/render',upload.array('assets',100),async(req,res)=>{
 const files=req.files||[];
 const cleanup=()=>files.forEach(f=>{try{fs.unlinkSync(f.path)}catch{}});
 try{
  const project=JSON.parse(req.body.project||'{}');
  if(!Array.isArray(project.scenes)||!project.scenes.length)throw new Error('Project တွင် Scene မရှိပါ။');
  const preview=project.preview===true;
  const width=preview?540:1080,height=preview?960:1920,fps=preview?20:30;
  const work=fs.mkdtempSync(path.join(os.tmpdir(),'nms-render-'));
  const byName=new Map(files.map(f=>[safe(f.originalname),f]));
  const clips=[];let total=0;let audio=null;let subtitle=null;
  for(const f of files){const ext=path.extname(f.originalname).toLowerCase();if(['.mp3','.wav','.m4a','.aac','.ogg'].includes(ext)&&!audio)audio=f;if(ext==='.srt'&&!subtitle)subtitle=f;}
  for(let i=0;i<project.scenes.length;i++){
   const s=project.scenes[i],duration=Math.max(1,Math.min(60,Number(s.duration)||5));total+=duration;
   const asset=byName.get(safe(s.assetName));
   if(!asset)throw new Error('Scene '+(i+1)+' အတွက် Media ဖိုင် မရွေးထားပါ။');
   const ext=path.extname(asset.originalname).toLowerCase(),out=path.join(work,'scene-'+i+'.mp4');
   const common=['-y'];
   if(['.jpg','.jpeg','.png','.webp','.bmp'].includes(ext)){
    const frames=Math.round(duration*fps);
    let z="min(zoom+0.001,1.12)",x="iw/2-(iw/zoom/2)",y="ih/2-(ih/zoom/2)";
    if(s.motion==='pull-out')z="if(eq(on,1),1.12,max(zoom-0.001,1))";
    if(s.motion==='pan-left'){z='1.10';x='(iw-iw/zoom)*(1-on/'+frames+')'}
    if(s.motion==='pan-right'){z='1.10';x='(iw-iw/zoom)*(on/'+frames+')'}
    if(s.motion==='static'){z='1';x='iw/2-(iw/zoom/2)'}
    const vf=`scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=${width}x${height}:fps=${fps},setsar=1`;
    await run([...common,'-loop','1','-i',asset.path,'-t',String(duration),'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p',out]);
   }else if(['.mp4','.mov','.mkv','.webm','.m4v'].includes(ext)){
    const vf=`scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},fps=${fps},setsar=1`;
    await run([...common,'-stream_loop','-1','-i',asset.path,'-t',String(duration),'-vf',vf,'-an','-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p',out]);
   }else{throw new Error('မထောက်ပံ့သေးသော Scene media format: '+ext)}
   clips.push(out);
  }
  const list=path.join(work,'concat.txt');
  fs.writeFileSync(list,clips.map(p=>"file '"+p.replace(/\\/g,'/')+"'").join('\n'));
  const joined=path.join(work,'joined.mp4');
  await run(['-y','-f','concat','-safe','0','-i',list,'-c','copy',joined]);
  const stamp=new Date().toISOString().replace(/[:.]/g,'-');
  const output=path.join(OUTPUT,(preview?'preview-':'news-')+stamp+'.mp4');
  const args=['-y','-i',joined];
  if(audio)args.push('-i',audio.path);
  if(subtitle&&!preview){
   const subPath=subtitle.path.replace(/\\/g,'/').replace(/:/g,'\\:').replace(/'/g,"\\'");
   args.push('-vf',`subtitles='${subPath}':fontsdir='C\:/Windows/Fonts'`);
  }
  args.push('-t',String(total),'-map','0:v:0');
  if(audio)args.push('-map','1:a:0','-c:a','aac','-b:a','192k');
  else args.push('-an');
  args.push('-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p','-r',String(fps),'-movflags','+faststart',output);
  await run(args);
  fs.rmSync(work,{recursive:true,force:true});cleanup();
  res.json({ok:true,message:(preview?'Preview':'Final')+' render ပြီးပါပြီ။ Output: '+output,output});
 }catch(e){cleanup();res.status(400).json({error:e instanceof Error?e.message:String(e)})}
});
app.listen(PORT,'127.0.0.1',()=>console.log('News Motion Studio renderer listening at http://127.0.0.1:'+PORT));
