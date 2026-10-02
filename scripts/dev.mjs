import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, join, extname, normalize } from 'node:path';
import handler from '../api/lead.js';
const root=resolve('site');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.webp':'image/webp'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
  if(req.url==='/api/lead' && req.method==='POST'){
    let body='';for await(const part of req){body+=part;if(body.length>20000){res.writeHead(413).end();return;}}
    try{req.body=JSON.parse(body);}catch{res.writeHead(400).end();return;}
    res.status=code=>({json:value=>{res.writeHead(code,{'content-type':'application/json'}).end(JSON.stringify(value));}});
    return handler(req,res);
  }
  const url=new URL(req.url,'http://localhost');
  const safe=normalize(decodeURIComponent(url.pathname)).replace(/^[/\\]+/,'');
  if(safe.startsWith('..')){res.writeHead(403).end();return;}
  let path=join(root,safe||'index.html');
  if(url.pathname.endsWith('/') && safe) path=join(path,'index.html');
  try{const data=await readFile(path);res.writeHead(200,{'content-type':types[extname(path)]||'application/octet-stream'}).end(data);}
  catch{const html=await readFile(join(root,'404.html'));res.writeHead(404,{'content-type':'text/html; charset=utf-8'}).end(html);}
}).listen(port,()=>console.log(`http://localhost:${port}`));
