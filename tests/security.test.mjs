import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { webcrypto } from 'node:crypto';
const { uuid, integer, safeUrl, isAdmin, validateOrder, validateForm } = load('src/lib/security/validation.ts', {});
const { safeJson, spreadsheetText } = load('src/lib/security/output.ts', {});

const id = '11111111-1111-4111-8111-111111111111';
const customer = { customer_name:'Prueba local',customer_email:'',customer_phone:'999999999',shipping_address:'Dirección de prueba',payment_method:'Yape',total_amount:0.01 };
const line = { id, quantity:1, selectedSize:'Standard', price:0.01, name:'Nombre del navegador' };
function load(file, dependencies, environment = {}) {
  const source=fs.readFileSync(file,'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const loadedModule={exports:{}};
  vm.runInNewContext(compiled,{module:loadedModule,exports:loadedModule.exports,require:name=>{
    if(!(name in dependencies))throw new Error(`Unmocked dependency: ${name}`);
    return dependencies[name];
  },process:{env:environment},FormData,Headers,URL,Buffer,crypto:webcrypto,console,setTimeout,clearTimeout},{filename:file});
  return loadedModule.exports;
}
const files = fs.readdirSync('src/app/admin',{recursive:true}).filter(name=>name.endsWith('actions.ts')).map(name=>path.join('src/app/admin',name));

test('UUIDs and stock reject SQL/time/blind payloads and invalid numbers',()=>{
  for(const payload of ["' OR 1=1--","';SELECT pg_sleep(5)--","' AND (SELECT 1)=1--",'../../etc/passwd','__proto__',null])assert.throws(()=>uuid(payload));
  for(const value of [-1,NaN,Infinity,1.2,'2'])assert.throws(()=>integer(value));
});
test('admin authorization ignores user_metadata and matches server roles or exact IDs',()=>{
  assert.equal(isAdmin(null),false);assert.equal(isAdmin({id,user_metadata:{role:'admin'}}),false);
  assert.equal(isAdmin({id,app_metadata:{role:'customer'}}),false);assert.equal(isAdmin({id,app_metadata:{role:'admin'}}),true);
  assert.equal(isAdmin({id},id),true);assert.equal(isAdmin({id},id.slice(0,10)),false);
});
test('verified getUser response is required for protected operations',async()=>{
  for(const [user,error,allowed]of [[null,null,false],[{id,user_metadata:{role:'admin'}},null,false],[{id,app_metadata:{role:'admin'}},{message:'invalid token'},false],[{id,app_metadata:{role:'admin'}},null,true]]){
    const api=load('src/lib/security/admin.ts',{'server-only':{},'@/lib/supabaseServer':{createClient:async()=>({auth:{getUser:async()=>({data:{user},error})}})},'./validation':{isAdmin}});
    if(allowed)assert.equal((await api.requireAdmin()).id,id);else await assert.rejects(api.requireAdmin(),/Acceso no autorizado/);
  }
});
test('all admin actions reject before any privileged database operation',async()=>{
  let checked=0;
  for(const file of files){let dbCalls=0;const api=load(file,{
    '@/lib/security/admin':{requireAdmin:async()=>{throw new Error('blocked');}},
    '@/lib/security/validation':{},'@/lib/supabaseAdmin':{supabaseAdmin:{from:()=>{dbCalls++;throw new Error('unexpected database access');}}},
    'next/cache':{revalidatePath:()=>{}},'next/navigation':{redirect:()=>{}},
  });
    for(const action of Object.values(api)){await assert.rejects(action(),/blocked/);checked++;}assert.equal(dbCalls,0,file);
  }
  assert.equal(checked,16);
});
test('every admin data loader has a server-side guard',()=>{
  for(const file of fs.readdirSync('src/app/admin',{recursive:true}).filter(name=>name.endsWith('page.tsx'))){
    const source=fs.readFileSync(path.join('src/app/admin',file),'utf8');
    if(!source.includes('supabaseAdmin'))continue;
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    const visit=node=>{if(ts.isFunctionDeclaration(node)&&node.body&&node.body.getText(ast).includes('supabaseAdmin')){
      assert.match(node.body.statements[0].getText(ast),/^await requireAdmin\(\)/,file);
    }ts.forEachChild(node,visit);};visit(ast);
  }
});
test('structured data cannot close its script or insert HTML',()=>{
  const payload={name:'</script><script>alert(1)</script>',description:'<&\u2028\u2029'};
  const json=safeJson(payload);assert.equal(json.includes('<'),false);assert.deepEqual(JSON.parse(json),payload);
});
test('exported spreadsheet escapes stored HTML and formula prefixes',()=>{
  for(const payload of ['=HYPERLINK("https://example.invalid")',' +SUM(1,1)','\t@SUM(1,1)','-1+1'])assert.match(spreadsheetText(payload),/^&#39;/);
  assert.equal(spreadsheetText('<img src=x onerror=alert(1)>').includes('<'),false);
});
test('unsafe URL schemes, private image hosts and protocol-relative links rejected',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,test','//evil.invalid','/\\evil.invalid','https://user:pass@example.invalid'])assert.throws(()=>safeUrl(url));
  for(const url of ['http://example.invalid/a','https://127.0.0.1/a','https://169.254.169.254/a','https://[::1]/a','https://localhost/a'])assert.throws(()=>safeUrl(url,true));
  assert.equal(safeUrl('/catalogo'),'/catalogo');assert.equal(safeUrl('https://images.unsplash.com/photo',true),'https://images.unsplash.com/photo');
});
test('forms reject mass payloads, negative prices, fractional stock and file uploads',()=>{
  for(const [key,value]of [['price','-1'],['price','Infinity'],['stock','1.5'],['button_link','javascript:alert(1)'],['whatsapp_link','https://evil.invalid']]){const form=new FormData();form.set(key,value);assert.throws(()=>validateForm(form));}
  const form=new FormData();form.set('photo',new Blob(['not an image']),'a.html');assert.throws(()=>validateForm(form));
});
test('checkout strips browser prices, totals, names and unexpected properties',()=>{
  const input=validateOrder({...customer,status:'Entregado'},[line],id);
  assert.equal(input.customer.total_amount,undefined);assert.equal(input.customer.status,undefined);assert.equal(input.items[0].price,undefined);assert.equal(input.items[0].name,undefined);
  for(const quantity of [-1,0,0.1,101,NaN,'1'])assert.throws(()=>validateOrder(customer,[{...line,quantity}],id));
  assert.throws(()=>validateOrder(customer,[],id));assert.throws(()=>validateOrder(customer,[line,line],id));
});
test('CSP is request-specific, production-safe, no-store for admin and overrides untrusted nonce',async()=>{
  const api=load('src/proxy.ts',{'@supabase/ssr':{},'next/server':{NextResponse:{next:options=>({headers:new Headers(),options})}}},{NODE_ENV:'production',NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co'});
  const request={headers:new Headers({'x-nonce':'attacker'}),nextUrl:{pathname:'/admin'}};
  const a=await api.proxy(request),b=await api.proxy(request);
  const csp=a.headers.get('Content-Security-Policy');assert.match(csp,/strict-dynamic/);assert.match(csp,/frame-ancestors 'none'/);assert.doesNotMatch(csp,/unsafe-eval/);
  assert.notEqual(a.options.request.headers.get('x-nonce'),'attacker');assert.notEqual(a.headers.get('Content-Security-Policy'),b.headers.get('Content-Security-Policy'));
  assert.equal(a.headers.get('Cache-Control'),'private, no-store');
});
test('diagnostic and seed handlers reject anonymous callers; GET seed never writes',async()=>{
  for(const file of ['src/app/api/migrate/route.ts','src/app/api/seed/route.ts']){
    let calls=0;
    const api=load(file,{'next/server':{NextResponse:{json:(body,options={})=>({body,status:options.status||200})}},
      '@/lib/security/admin':{requireAdmin:async()=>{throw new Error('denied');}},'@/lib/supabaseAdmin':{supabaseAdmin:{from:()=>{calls++;throw new Error('unexpected');}}},'@faker-js/faker':{faker:{}},
    });
    const r=await api.GET();assert.equal(r.status,file.includes('seed')?405:401);
    if(api.POST)assert.equal((await api.POST()).status,401);assert.equal(calls,0);
  }
});

test('authorized admin actions still reject invalid IDs, stock, flags and status before database access',async()=>{
  let calls=0;
  const dependencies={
    '@/lib/security/admin':{requireAdmin:async()=>({id})},
    '@/lib/security/validation':{...load('src/lib/security/validation.ts',{})},
    '@/lib/supabaseAdmin':{supabaseAdmin:{from:()=>{calls++;throw new Error('unexpected write');}}},
    'next/cache':{revalidatePath:()=>{}},'next/navigation':{redirect:()=>{}},
  };
  const products=load('src/app/admin/actions.ts',dependencies);
  await assert.rejects(products.updateProductStock(id,-1));
  await assert.rejects(products.deleteProduct("' OR 1=1 --"));
  await assert.rejects(products.toggleProductVisibility(id,'true'));
  const orders=load('src/app/admin/orders/actions.ts',dependencies);
  await assert.rejects(orders.updateOrderStatus(id,'Pago verificado por cliente'));
  assert.equal(calls,0);
});

test('server session cookies are HttpOnly, Secure in production and SameSite=Lax',async()=>{
  let options;
  const api=load('src/lib/supabaseServer.ts',{
    '@supabase/ssr':{createServerClient:(_url,_key,input)=>{options=input;return {}; }},
    'next/headers':{cookies:async()=>({getAll:()=>[],set:()=>{}})},
  },{NODE_ENV:'production'});
  await api.createClient();
  assert.equal(options.cookieOptions.httpOnly,true);assert.equal(options.cookieOptions.secure,true);assert.equal(options.cookieOptions.sameSite,'lax');
});

test('catalog query arrays, unknown sort and excessive pages stay within safe bounds',()=>{
  const { catalogFilters } = load('src/lib/security/validation.ts',{});
  const input=catalogFilters({category:['bad','input'],price:'0);drop table',sort:'price; SELECT pg_sleep(5)',page:'999999999999',q:'x'.repeat(300)});
  assert.equal(input.currentCategory,'Todas');assert.equal(input.currentSort,'newest');assert.equal(input.currentPriceRange,'all');assert.equal(input.currentPage,10000);assert.equal(input.search.length,100);
  assert.equal(catalogFilters({page:'NaN'}).currentPage,1);
});

test('checkout action sends canonical inputs to RPC and never falls back after a database failure',async()=>{
  let payload;let fail=false;let directWrites=0;
  const api=load('src/app/checkout/actions.ts',{
    '@/lib/supabaseAdmin':{supabaseAdmin:{rpc:async(name,input)=>{
      assert.equal(name,'secure_checkout');payload=input;
      return fail ? {error:{message:'sensitive-internal-details'}} : {data:{orderId:id,totalAmount:25.25,subtotal:25.25,packagingFee:0,items:[{...line,name:'Canonical',price:25.25}]}};
    },from:()=>{directWrites++;throw new Error('insecure fallback');}}},
    '@/lib/security/validation':{validateOrder},
    '@/lib/security/rateLimit':{rateLimit:async()=>'a'.repeat(64)},
    '@/lib/storeContact':{},'next/cache':{revalidatePath:()=>{}},
  });
  const result=await api.submitOrder(customer,[line],id);
  assert.equal(result.success,true);assert.equal(result.totalAmount,25.25);assert.equal(payload.p_items[0].price,undefined);assert.equal(payload.p_customer.total_amount,undefined);
  fail=true;const rejected=await api.submitOrder(customer,[line],id);
  assert.equal(rejected.success,false);assert.equal(JSON.stringify(rejected).includes('sensitive-internal-details'),false);assert.equal(directWrites,0);
});
