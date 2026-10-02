const pixelId = '2335694503515598';
// No health details are sent to Meta. Contact identifies only a communication action.
function loadPixel(){
  if(window.fbq) return;
  const f=window.fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments)};
  f.queue=[];f.loaded=true;f.version='2.0';
  const s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);f('init',pixelId);f('track','PageView');
}
if(!navigator.doNotTrack) loadPixel();
document.querySelectorAll('.wa-link').forEach(link=>link.addEventListener('click',()=>{
  if(window.fbq) window.fbq('track','Contact');
}));
const form=document.querySelector('#lead-form');
if(form){
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const status=form.querySelector('.form-status');
    if(!form.reportValidity()) return;
    const button=form.querySelector('button[type=submit]');
    button.disabled=true;status.textContent='Enviando...';
    const data=Object.fromEntries(new FormData(form));
    const search=new URLSearchParams(location.search);
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid']) data[key]=search.get(key)||sessionStorage.getItem(key)||'';
    data.page=location.pathname;
    try{
      const response=await fetch('/api/lead',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});
      if(!response.ok) throw new Error('Não foi possível enviar.');
      if(window.fbq){
        window.fbq('track','Lead');
        if(window.SITE_CONFIG?.customEvent) window.fbq('trackCustom',window.SITE_CONFIG.customEvent);
      }
      location.assign('/obrigado/');
    }catch{status.textContent='Não conseguimos enviar agora. Tente novamente ou chame pelo WhatsApp.';button.disabled=false;}
  });
}
const search=new URLSearchParams(location.search);
for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','fbclid']){
  if(search.has(key)) sessionStorage.setItem(key,search.get(key).slice(0,300));
}
