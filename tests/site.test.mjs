import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import handler from '../api/lead.js';
execFileSync(process.execPath,['scripts/build.mjs']);
const read=path=>readFileSync(`site/${path}`,'utf8');
const pages=['index.html','mastopexia/index.html','protese-de-mama/index.html','lipo-hd/index.html','abdominoplastia/index.html'];
test('páginas têm H1, metadados, dados estruturados válidos e links internos existentes',()=>{
  for(const file of pages){
    const html=read(file);
    assert.match(html,/<h1>[^<]+<\/h1>/);
    assert.match(html,/<meta name="description"/);
    assert.match(html,/<meta property="og:image"/);
    const scripts=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
    assert.equal(scripts.length,1);
    const graph=JSON.parse(scripts[0][1]);
    assert.equal(graph[0]['@type'][0],'Physician');
    assert.equal(graph[1]['@type'],'FAQPage');
    for(const [,url] of html.matchAll(/href="(\/[a-z][^"#?]*\/)"/g)){
      assert.doesNotThrow(()=>read(`${url.slice(1)}index.html`),`${file}: ${url}`);
    }
  }
});
test('formulário envia somente lead válido ao webhook configurado',async()=>{
  const previous=process.env.LEAD_WEBHOOK_URL;
  process.env.LEAD_WEBHOOK_URL='https://example.test/lead';
  let sent;
  const original=globalThis.fetch;
  globalThis.fetch=async(_url,opts)=>{sent=JSON.parse(opts.body);return {ok:true};};
  const mock=()=>({status(code){this.code=code;return this},json(value){this.value=value;return this}});
  try{
    let res=mock();await handler({method:'POST',body:{name:'Ana',phone:'(81) 99999-9999',procedure:'mastopexia',city:'Recife',consent:'on',utm_source:'meta',fbclid:'abc'}},res);
    assert.equal(res.code,200);assert.equal(sent.phone,'81999999999');assert.equal(sent.utm_source,'meta');assert.equal(sent.fbclid,'abc');
    res=mock();await handler({method:'POST',body:{name:'Ana',phone:'123',consent:'on'}},res);assert.equal(res.code,400);
    res=mock();await handler({method:'POST',body:{website:'bot'}},res);assert.equal(res.code,200);
  }finally{globalThis.fetch=original;if(previous===undefined)delete process.env.LEAD_WEBHOOK_URL;else process.env.LEAD_WEBHOOK_URL=previous;}
});
