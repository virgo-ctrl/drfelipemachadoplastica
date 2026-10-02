const allowedProcedures=new Set(['','mastopexia','protese-de-mama','lipo-hd','abdominoplastia']);
const allowedCities=new Set(['','Recife','Caruaru','Outra cidade']);
const tracking=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid'];
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Método não permitido'});
  let data;
  try{data=typeof req.body==='string'?JSON.parse(req.body||'{}'):req.body||{};}catch{return res.status(400).json({error:'Dados inválidos'});}
  if(data.website) return res.status(200).json({ok:true});
  const name=String(data.name||'').trim().slice(0,100);
  const phone=String(data.phone||'').replace(/\D/g,'').slice(0,15);
  const procedure=String(data.procedure||'');
  const city=String(data.city||'');
  if(!name||phone.length<10||!allowedProcedures.has(procedure)||!allowedCities.has(city)||data.consent!=='on') return res.status(400).json({error:'Confira os campos obrigatórios'});
  if(!process.env.LEAD_WEBHOOK_URL) return res.status(503).json({error:'Destino de contato não configurado'});
  const lead={name,phone,procedure,city,page:String(data.page||'').slice(0,200),consent:true,receivedAt:new Date().toISOString()};
  for(const key of tracking) lead[key]=String(data[key]||'').slice(0,300);
  try{
    const result=await fetch(process.env.LEAD_WEBHOOK_URL,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(lead),signal:AbortSignal.timeout(8000)});
    if(!result.ok) throw new Error('Webhook recusou o envio');
    return res.status(200).json({ok:true});
  }catch{
    return res.status(502).json({error:'Falha no envio'});
  }
}
