import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const base=process.env.TEST_BASE_URL||'http://localhost:4173';
mkdirSync('reports',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
try{
  for(const width of [390,1280]){
    const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/',{waitUntil:'networkidle'});
    await page.screenshot({path:`reports/home-${width}.png`,fullPage:true});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow) throw new Error(`Overflow horizontal em ${width}px`);
    if(errors.length) throw new Error(`Erros JS em ${width}px: ${errors.join(', ')}`);
    for(const path of ['/mastopexia/','/protese-de-mama/','/lipo-hd/','/abdominoplastia/','/politica-de-privacidade/']){
      const response=await page.goto(base+path,{waitUntil:'domcontentloaded'});
      if(response.status()!==200) throw new Error(`${path}: ${response.status()}`);
      if(await page.locator('h1').count()!==1) throw new Error(`${path}: H1 inválido`);
    }
    await page.goto(base+'/mastopexia/',{waitUntil:'domcontentloaded'});
    await page.route('**/api/lead',route=>route.fulfill({status:200,contentType:'application/json',body:'{"ok":true}'}));
    await page.locator('#name').fill('Teste Automatizado');
    await page.locator('#phone').fill('(81) 99999-9999');
    await page.locator('#city').selectOption('Recife');
    await page.locator('input[name=consent]').check();
    await page.locator('button[type=submit]').click();
    await page.waitForURL('**/obrigado/');
    console.log(`${width}px: captura, rotas e formulário OK`);
    await page.close();
  }
}finally{await browser.close();}
