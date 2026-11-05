import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
import {pathToFileURL} from 'node:url';

// Accept an existing Playwright install; no browser binary is fetched by this check.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE?pathToFileURL(process.env.PLAYWRIGHT_MODULE).href:'playwright');
const root=resolve('dist'),out=resolve('artifacts/smoke');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.glb':'model/gltf-binary','.svg':'image/svg+xml','.json':'application/json','.woff2':'font/woff2'};
const server=createServer(async(req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+sep)){res.writeHead(404).end();return}
  try{res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file))}catch{res.writeHead(404).end()}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader',...(process.env.PLAYWRIGHT_SOFTWARE?['--use-gl=angle','--use-angle=swiftshader']:[])]});
const errors=[];
const samples={};
const rotationOnly=process.argv.includes('--rotation-only');
const log=page=>{
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  page.on('response',response=>{if(response.url().startsWith(base)&&!response.ok())errors.push(`${response.status()} ${response.url()}`)});
};
async function shot(page,name){
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  await page.screenshot({path:resolve(out,name+'.png'),animations:'disabled',timeout:45000});console.log(name);
}
const scenes=[['Workshop','The Workshop'],['City','The Little City'],['Matchday','Matchday'],['Riverside','A Little Breathing Room'],['Home','Home, Sweet Home']];
const dock=page=>page.getByRole('navigation',{name:'Explore destinations'});
const heading=(page,name)=>page.getByRole('heading',{name,exact:true});
async function waitForWorld(page){
  await page.locator('canvas').waitFor({timeout:60000});
  await page.getByText('The island is coming into view').waitFor({state:'hidden',timeout:60000});
  assert.equal(await page.locator('.guide-mode').count(),0,'3D should load successfully');
}
try{
  if(!rotationOnly){
  const desktop=await browser.newPage({viewport:{width:1280,height:800}});log(desktop);
  await desktop.addInitScript(()=>{
    const Native=window.AudioContext;
    window.audioContexts=0;
    window.AudioContext=class extends Native{constructor(...args){super(...args);window.audioContexts++}};
  });
  await desktop.goto(base+'/?metrics=1',{waitUntil:'domcontentloaded'});await waitForWorld(desktop);
  assert.equal(await desktop.evaluate(()=>window.audioContexts),0);
  await shot(desktop,'desktop-welcome');
  await desktop.emulateMedia({reducedMotion:'no-preference'});
  await desktop.keyboard.press('Tab');
  assert.equal(await desktop.locator(':focus-visible').count(),1,'keyboard focus is visible');
  await desktop.getByRole('button',{name:'Come on in'}).click();
  await desktop.locator('#overview-title').waitFor({timeout:15000});
  samples.render=await desktop.locator('canvas').getAttribute('data-render-stats');
  samples.softwareRenderer=await desktop.locator('canvas').evaluate(canvas=>{
    const gl=canvas.getContext('webgl2'),debug=gl?.getExtension('WEBGL_debug_renderer_info');
    return debug?/swiftshader|llvmpipe|software/i.test(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)):null;
  });
  await shot(desktop,'desktop-overview');
  samples.overviewMarkers=await desktop.locator('.world-marker:visible').count();
  assert.equal(samples.overviewMarkers,5);
  for(const [button,title] of scenes){
    await dock(desktop).getByRole('button',{name:button,exact:true}).click();
    await heading(desktop,title).waitFor({timeout:15000});
    await shot(desktop,'desktop-'+button.toLowerCase());
  }
  await desktop.emulateMedia({reducedMotion:'no-preference'});
  await dock(desktop).getByRole('button',{name:'Workshop'}).dispatchEvent('click');
  await dock(desktop).getByRole('button',{name:'City',exact:true}).dispatchEvent('click');
  await desktop.getByRole('button',{name:'Skip'}).dispatchEvent('click');
  await heading(desktop,'The Little City').waitFor();
  await desktop.emulateMedia({reducedMotion:'reduce'});
  await desktop.getByRole('button',{name:'Career archive'}).click();
  await desktop.getByRole('dialog').waitFor();await desktop.keyboard.press('Escape');
  await desktop.getByRole('dialog').waitFor({state:'hidden'});
  assert.equal(await desktop.getByRole('button',{name:'Career archive'}).evaluate(el=>el===document.activeElement),true);
  await desktop.getByRole('button',{name:'Ambient sound'}).click();
  assert.equal(await desktop.evaluate(()=>window.audioContexts),1);
  assert.equal(await desktop.getByRole('button',{name:'Ambient sound'}).getAttribute('aria-pressed'),'true');
  await desktop.getByRole('button',{name:'Ambient sound'}).click();
  assert.equal(await desktop.getByRole('button',{name:'Ambient sound'}).getAttribute('aria-pressed'),'false');
  await dock(desktop).getByRole('button',{name:'Workshop'}).focus();
  await desktop.keyboard.press('Enter');await heading(desktop,'The Workshop').waitFor();
  await desktop.getByRole('button',{name:'Project archive'}).click();
  await desktop.getByRole('dialog').waitFor();await desktop.getByRole('button',{name:'Close details'}).click();
  await desktop.getByRole('dialog').waitFor({state:'hidden'});
  await desktop.close();
  }
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce'});log(mobile);
  await mobile.goto(base,{waitUntil:'domcontentloaded'});await waitForWorld(mobile);
  if(!rotationOnly)await shot(mobile,'mobile-welcome');
  await mobile.getByRole('button',{name:'Come on in'}).click();await mobile.locator('#overview-title').waitFor();
  if(!rotationOnly)await shot(mobile,'mobile-overview');
  for(const [button,title] of rotationOnly?scenes.slice(-1):scenes){
    await dock(mobile).getByRole('button',{name:button,exact:true}).tap();
    await heading(mobile,title).waitFor({timeout:4000});
    assert.equal(await mobile.getByRole('button',{name:'Skip'}).count(),0);
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(!rotationOnly)await shot(mobile,'mobile-'+button.toLowerCase());
  }
  await mobile.setViewportSize({width:844,height:390});
  await dock(mobile).getByRole('button',{name:'Island overview'}).tap();
  await mobile.locator('#overview-title').waitFor();
  await mobile.waitForFunction(()=>{
    const markers=Array.from(document.querySelectorAll('.world-marker')).filter(marker=>marker.getClientRects().length);
    const dock=document.querySelector('.dock').getBoundingClientRect();
    return markers.length===5&&markers.every(marker=>marker.getBoundingClientRect().bottom<dock.top);
  },{},{timeout:12000});
  await shot(mobile,'mobile-landscape');
  await mobile.close();
  if(!rotationOnly){
  const fallback=await browser.newPage({viewport:{width:900,height:650}});log(fallback);
  await fallback.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args)};
  });
  await fallback.goto(base,{waitUntil:'domcontentloaded'});
  await fallback.getByRole('button',{name:'Explore the guide'}).click();
  await dock(fallback).getByRole('button',{name:'Workshop'}).click();await heading(fallback,'The Workshop').waitFor();
  await shot(fallback,'webgl-fallback');
  await fallback.close();
  }
  assert.deepEqual(errors,[]);
  console.log('Smoke checks passed',samples);
} finally {
  await writeFile(resolve(out,rotationOnly?'rotation-report.json':'report.json'),JSON.stringify({errors,...samples},null,2));
  await browser.close();server.close();
}
