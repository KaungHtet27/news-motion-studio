import { useEffect, useMemo, useState } from 'react';

type Scene = { id:number; title:string; duration:number; motion:string; transition:string; note:string; file?:File; url?:string };
const initial:Scene[]=[
{id:1,title:'OPENING • HEADLINE',duration:5,motion:'push-in',transition:'fade',note:'အဓိကသတင်းခေါင်းစဉ်'},
{id:2,title:'LOCATION • CONTEXT',duration:10,motion:'pan-right',transition:'dissolve',note:'တည်နေရာမြေပုံနှင့် အကြောင်းအရာ'},
{id:3,title:'MAIN EVENT',duration:20,motion:'push-in',transition:'cut',note:'ဖြစ်ရပ်နှင့်သက်ဆိုင်သော မူရင်းဓာတ်ပုံ / ဗီဒီယို'},
{id:4,title:'EXPLAINER • DATA',duration:15,motion:'parallax',transition:'wipe',note:'အချက်အလက်၊ ကိန်းဂဏန်း၊ ရှင်းလင်းချက်'},
{id:5,title:'CONCLUSION • SOURCES',duration:10,motion:'pull-out',transition:'fade',note:'နိဂုံးနှင့် သတင်းရင်းမြစ်များ'}
];
const BRIDGE='http://127.0.0.1:47831';
export default function App(){
 const [headline,setHeadline]=useState('သတင်းခေါင်းစဉ်ကို ဒီနေရာတွင် ရေးပါ');
 const [script,setScript]=useState('');
 const [scenes,setScenes]=useState<Scene[]>(initial);
 const [assets,setAssets]=useState<File[]>([]);
 const [bridge,setBridge]=useState<'checking'|'online'|'offline'>('checking');
 const [status,setStatus]=useState('အလုပ်စတင်ရန် Project အချက်အလက်များ ဖြည့်ပါ။');
 const [busy,setBusy]=useState(false);
 const total=useMemo(()=>scenes.reduce((n,s)=>n+s.duration,0),[scenes]);
 useEffect(()=>{let active=true; const ping=()=>fetch(BRIDGE+'/health').then(r=>{if(!r.ok)throw Error();return r.json()}).then(()=>active&&setBridge('online')).catch(()=>active&&setBridge('offline'));ping();const t=setInterval(ping,8000);return()=>{active=false;clearInterval(t)}},[]);
 function addAssets(list:FileList|null){if(!list)return;const next=Array.from(list);setAssets(a=>[...a,...next]);setScenes(old=>old.map((s,i)=>!s.file&&next[i]?{...s,file:next[i],url:URL.createObjectURL(next[i])}:s));}
 function update(id:number,key:keyof Scene,value:any){setScenes(old=>old.map(s=>s.id===id?{...s,[key]:value}:s));}
 async function render(preview:boolean){
  if(bridge!=='online'){setStatus('Local Renderer မချိတ်ဆက်ရသေးပါ။ Windows companion ကို စတင်ပါ။');return}
  setBusy(true);setStatus('Renderer သို့ Project ပို့နေသည်…');
  try{
   const form=new FormData();form.append('project',JSON.stringify({headline,script,scenes:scenes.map(({file,url,...s})=>({...s,assetName:file?.name||null})),settings:{width:1080,height:1920,fps:30,format:'mp4',subtitleEncoding:'UTF-8'},preview}));
   assets.forEach((f)=>form.append('assets',f,f.name));
   const r=await fetch(BRIDGE+'/render',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw Error(data.error||'Render failed');
   setStatus(data.message||'Render job စတင်ပြီးပါပြီ။');
  }catch(e){setStatus('Render မအောင်မြင်ပါ: '+(e instanceof Error?e.message:String(e)))}
  finally{setBusy(false)}
 }
 return <div className="app">
  <header className="top"><div className="brand"><div className="globe">◎</div><div><b>NEWS MOTION STUDIO</b><small>HYBRID DOCUMENTARY NEWS • LOCAL RENDER</small></div></div><div className="topright"><span className={'dot '+bridge}></span><span>{bridge==='online'?'LOCAL RENDERER CONNECTED':bridge==='checking'?'CHECKING RENDERER':'RENDERER OFFLINE'}</span></div></header>
  <main><section className="hero"><div><p className="eyebrow">INTERNATIONAL NEWS VIDEO WORKSPACE</p><h1>သတင်းကို <em>လှုပ်ရှားမှု</em> နဲ့ ပြောပြပါ။</h1><p className="muted">ဓာတ်ပုံ၊ မြေပုံ၊ စာတန်းနဲ့ Documentary-style motion ကို timeline တစ်ခုထဲမှာ စီစဉ်ပါ။</p></div><div className="duration"><strong>{total}s</strong><small>ESTIMATED VIDEO</small></div></section>
  <div className="workspace"><section className="panel editor"><div className="panelhead"><h2>01 / STORY & ASSETS</h2><span className="tag">PROJECT SETUP</span></div><label>သတင်းခေါင်းစဉ်</label><input value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="သတင်းခေါင်းစဉ်"/><label>မြန်မာ Narration Script</label><textarea value={script} onChange={e=>setScript(e.target.value)} placeholder="အသံဖတ်မည့် သတင်းစာသားကို ထည့်ပါ…" rows={7}/><div className="upload" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addAssets(e.dataTransfer.files)}}><input id="asset-input" type="file" accept="image/*,video/*,audio/*,.srt" multiple onChange={e=>addAssets(e.target.files)}/><label htmlFor="asset-input"><span className="uploadicon">＋</span><b>Media ဖိုင်များ ထည့်ရန်</b><small>ဓာတ်ပုံ • ဗီဒီယို • Narration • SRT — သင့် PC ထဲတွင်သာ ရှိမည်</small></label></div><div className="assetlist">{assets.map((f,i)=><div key={i}><span>▣ {f.name}</span><small>{(f.size/1024/1024).toFixed(1)} MB</small></div>)}</div><p className="hint">သတိပြုရန် — Reuters/AP စသည့် သတင်းဌာနပိုင် footage များကို အသုံးပြုခွင့်/လိုင်စင် စစ်ဆေးပါ။ AI illustration ကိုလည်း အမှန်တကယ်ရိုက်ကူးထားသော footage အဖြစ် မဖော်ပြပါနှင့်။</p></section>
  <section className="panel timeline"><div className="panelhead"><h2>02 / MOTION STORYBOARD</h2><button className="subtle" onClick={()=>setScenes(s=>[...s,{id:Date.now(),title:'NEW SCENE',duration:5,motion:'push-in',transition:'dissolve',note:'Scene description'}])}>＋ Scene</button></div><div className="scene-list">{scenes.map((s,i)=><article className="scene" key={s.id}><div className="scene-num">{String(i+1).padStart(2,'0')}</div><div className="scene-body"><input className="scene-title" value={s.title} onChange={e=>update(s.id,'title',e.target.value)}/><div className="scene-note">{s.file?.name||s.note}</div><div className="controls"><label>Media<select value={s.file?.name||''} onChange={e=>{const f=assets.find(x=>x.name===e.target.value);update(s.id,'file',f);update(s.id,'url',f?URL.createObjectURL(f):undefined)}}><option value="">Select media</option>{assets.filter(f=>/\\.(jpe?g|png|webp|bmp|mp4|mov|mkv|webm|m4v)$/i.test(f.name)).map(f=><option key={f.name} value={f.name}>{f.name}</option>)}</select></label><label>Motion<select value={s.motion} onChange={e=>update(s.id,'motion',e.target.value)}><option value="push-in">Slow Zoom In</option><option value="pull-out">Slow Zoom Out</option><option value="pan-left">Pan Left</option><option value="pan-right">Pan Right</option><option value="parallax">Parallax Motion</option><option value="static">Static</option></select></label><label>Transition<select value={s.transition} onChange={e=>update(s.id,'transition',e.target.value)}>{['fade','dissolve','cut','wipe'].map(x=><option key={x}>{x}</option>)}</select></label><label>Seconds<input type="number" min="1" max="60" value={s.duration} onChange={e=>update(s.id,'duration',Math.max(1,Number(e.target.value)||1))}/></label></div></div><button className="remove" title="Remove scene" onClick={()=>setScenes(a=>a.filter(x=>x.id!==s.id))}>×</button></article>)}</div><div className="timelinefoot"><span>{scenes.length} SCENES</span><b>{total} SEC TOTAL</b></div><div className="renderbox"><div><b>03 / LOCAL EXPORT</b><p>1080 × 1920 · 30 FPS · MP4 H.264 · Burmese UTF-8</p></div><div className="renderactions"><button className="preview" disabled={busy} onClick={()=>render(true)}>PREVIEW RENDER</button><button className="primary" disabled={busy} onClick={()=>render(false)}>{busy?'WORKING…':'FINAL RENDER ↗'}</button></div></div></section></div>
  <section className="statusbar"><div><span className="pulse"></span><b>WORKSPACE STATUS</b></div><p>{status}</p><small>Media ကို Cloud သို့ အလိုအလျောက် မတင်ပါ။ Local Bridge ချိတ်ဆက်ပြီးမှ Render လုပ်နိုင်ပါမည်။</small></section>
  </main><footer>NEWS MOTION STUDIO <span>BUILT FOR WHAT ARE THEY DOING? · FREE / LOCAL-FIRST</span></footer>
 </div>
}