// EMILX DEVELOPER BOT — backend proxy
// Node.js 18+. API key stays on the server.
const http = require('http');
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
const PORT = Number(process.env.PORT || 3000);
const BASE = (process.env.AI_BASE_URL || '').replace(/\/+$/, '');
const MODEL = process.env.AI_MODEL || '';
const KEY = process.env.AI_API_KEY || '';
const server = http.createServer(async (req,res) => {
  const headers = {'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
  const send=(code,obj)=>{res.writeHead(code,{...headers,'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(obj));};
  if(req.method==='GET' && req.url==='/api/health') return send(200,{configured:!!(BASE&&MODEL&&KEY)});
  if(req.method==='POST' && req.url==='/api/chat'){
    if(!(BASE&&MODEL&&KEY)) return send(503,{error:'API belum dikonfigurasi di file .env server.'});
    let raw='';req.on('data',c=>{raw+=c;if(raw.length>100000){req.destroy();}});
    req.on('end',async()=>{
      try{
        const body=JSON.parse(raw||'{}');
        if(!Array.isArray(body.messages)||body.messages.length===0) return send(400,{error:'Pesan kosong.'});
        const msgs=body.messages.slice(-20).filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').map(m=>({role:m.role,content:m.content.slice(0,8000)}));
        const response=await fetch(BASE+'/chat/completions',{method:'POST',headers:{'Authorization':'Bearer '+KEY,'Content-Type':'application/json'},body:JSON.stringify({model:MODEL,messages:msgs,temperature:0.7})});
        const data=await response.json().catch(()=>({}));
        if(!response.ok) return send(response.status,{error:data.error?.message||data.message||'API provider menolak permintaan. Periksa URL, model, dan API Key.'});
        const reply=data.choices?.[0]?.message?.content;
        if(typeof reply!=='string') return send(502,{error:'Format balasan dari provider tidak dikenali.'});
        return send(200,{reply});
      }catch(e){return send(500,{error:'Kesalahan server saat menghubungi provider.'});}
    });return;
  }
  if(req.method==='GET'){
    const requested=req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]);
    const file=path.join(__dirname,'public',requested.replace(/^\/+/,''));
    if(!file.startsWith(path.join(__dirname,'public'))) return send(403,{error:'Forbidden'});
    fs.readFile(file,(err,data)=>{if(err){res.writeHead(404,headers);return res.end('Not found');}
      const type=file.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream';
      res.writeHead(200,{...headers,'Content-Type':type});res.end(data);});
    return;
  }
  send(404,{error:'Not found'});
});
server.listen(PORT,'0.0.0.0',()=>console.log('EMILX BOT running on port '+PORT));
