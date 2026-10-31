import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://localhost:3101';
const results={routes:[],browser:{}};
for(const [path,method]of [['/api/migrate','GET'],['/api/seed','GET'],['/api/seed','POST'],['/admin','GET'],['/admin/orders','GET'],['/admin/settings','GET'],['/login','GET'],['/.env.local','GET']]){
  const response=await fetch(base+path,{method,redirect:'manual',signal:AbortSignal.timeout(20000)});
  const body=await response.text();
  const item={path,method,status:response.status,redirect:response.headers.get('location'),nosniff:response.headers.get('x-content-type-options'),frame:response.headers.get('x-frame-options'),noStore:response.headers.get('cache-control'),csp:response.headers.get('content-security-policy')};
  assert.equal(item.nosniff,'nosniff');assert.equal(item.frame,'DENY');
  assert.ok(!body.includes('sampleOrder'));assert.ok(!body.includes('service_role_key'));
  if(path==='/api/migrate')assert.equal(response.status,401);
  if(path==='/api/seed')assert.equal(response.status,method==='GET'?405:401);
  if(path.startsWith('/admin')){assert.equal(response.status,307);assert.equal(item.redirect,'/login');}
  if(path==='/.env.local')assert.equal(response.status,404);
  if(path==='/login'){assert.equal(response.status,200);assert.match(item.csp,/strict-dynamic/);assert.doesNotMatch(item.csp,/unsafe-eval/);}
  results.routes.push(item);
}
const loginResponse=await fetch(base+'/login');const loginHtml=await loginResponse.text();
const actionName=loginHtml.match(/name="(\$ACTION_ID_[^"]+)"/)?.[1];assert.ok(actionName);
const csrfForm=new FormData();csrfForm.set(actionName,'');csrfForm.set('email','qa@example.invalid');csrfForm.set('password','local-security-fixture');
const csrf=await fetch(base+'/login',{method:'POST',body:csrfForm,headers:{Origin:'https://attacker.invalid'},redirect:'manual'});
results.csrf={status:csrf.status,rejected:csrf.status>=400,setCookie:!!csrf.headers.get('set-cookie')};await csrf.text();assert.equal(results.csrf.rejected,true);assert.equal(results.csrf.setCookie,false);
const targets=await(await fetch('http://127.0.0.1:9334/json')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(pending.has(data.id)){pending.get(data.id)(data);pending.delete(data.id)}});
const send=(method,params={})=>new Promise(resolve=>{pending.set(++id,resolve);ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const response=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(response.result?.exceptionDetails)throw new Error(JSON.stringify(response.result.exceptionDetails));return response.result?.result?.value;};
await send('Page.enable');await send('Runtime.enable');await send('Page.navigate',{url:base+'/login'});await new Promise(r=>setTimeout(r,1500));
results.browser.login=await evaluate(`({heading:document.querySelector('h1')?.textContent,themeScriptRan:!!document.documentElement.dataset.theme,scripts:[...document.scripts].every(s=>s.nonce.length>0)})`);
assert.equal(results.browser.login.themeScriptRan,true);assert.equal(results.browser.login.scripts,true);
// Parser-inserted attacks, using the actual production response/CSP. CDP evaluation
// is privileged and must not be used as the attack context for CSP assertions.
const fixtureResponse=await fetch(base+'/login');
const fixtureHtml=(await fixtureResponse.text()).replace('</body>','<script>window.__securityXss=true</script><button id="qa-xss" onclick="window.__securityEventXss=true">QA</button></body>');
const fixtureHeaders=[...fixtureResponse.headers.entries()].filter(([name])=>!['content-length','content-encoding','transfer-encoding'].includes(name)).map(([name,value])=>({name,value}));
ws.addEventListener('message',async event=>{const message=JSON.parse(event.data);if(message.method==='Fetch.requestPaused')await send('Fetch.fulfillRequest',{requestId:message.params.requestId,responseCode:200,responseHeaders:fixtureHeaders,body:Buffer.from(fixtureHtml).toString('base64')});});
await send('Fetch.enable',{patterns:[{urlPattern:'*qa=csp*',resourceType:'Document',requestStage:'Request'}]});
await send('Page.navigate',{url:base+'/login?qa=csp'});await new Promise(r=>setTimeout(r,1500));
const point=await evaluate(`(()=>{const b=document.querySelector('#qa-xss');const r=b.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
results.browser.xss=await evaluate(`({inlineScriptBlocked:window.__securityXss!==true,eventHandlerBlocked:window.__securityEventXss!==true,legitimateThemeScriptRan:!!document.documentElement.dataset.theme})`);
assert.equal(results.browser.xss.inlineScriptBlocked,true);assert.equal(results.browser.xss.eventHandlerBlocked,true);assert.equal(results.browser.xss.legitimateThemeScriptRan,true);
await send('Fetch.disable');
await send('Page.navigate',{url:base+'/'});await new Promise(r=>setTimeout(r,1500));
await evaluate(`new Promise(resolve=>{const check=()=>document.querySelector('.theme-toggle')?resolve(true):setTimeout(check,100);check();setTimeout(()=>resolve(false),20000)})`);
const before=await evaluate(`document.documentElement.dataset.theme`);
await evaluate(`document.querySelector('.theme-toggle').click()`);await new Promise(r=>setTimeout(r,200));
const after=await evaluate(`document.documentElement.dataset.theme`);
results.browser.themeHydrated={before,after,changed:before!==after};assert.notEqual(before,after);
await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
results.browser.mobile=await evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})`);assert.equal(results.browser.mobile.width,results.browser.mobile.scrollWidth);
await fs.writeFile('docs/security/dynamic.json',JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify(results,null,2));ws.close();
