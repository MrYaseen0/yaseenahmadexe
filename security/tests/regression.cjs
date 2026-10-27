/* eslint-disable @typescript-eslint/no-require-imports -- VM harness runs CommonJS-transpiled exact route handlers. */
const ts=require('typescript'),vm=require('vm'),fs=require('fs'),crypto=require('crypto');
let results=[]; function check(name,ok){results.push({name,pass:!!ok}); if(!ok)throw Error(name)}
function load(file,mocks={}){const source=fs.readFileSync(file,'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;const mod={exports:{}};vm.runInNewContext(js,{module:mod,exports:mod.exports,require:n=>n in mocks?mocks[n]:require(n),process,Buffer,console,Date,URL,TextDecoder,Uint8Array,Request,Response,setTimeout,clearTimeout},{filename:file});return mod.exports}
const req=(method,body,headers={})=>new Request('https://yaseenahmadexe.vercel.app/api/chat-history',{method,headers,...(body!==undefined?{body}: {})});
(async()=>{
const db={chatMessage:{findMany:async()=>[{content:'synthetic private'}],create:async({data})=>{db.last=data;return {id:'synthetic'}}}};
const before=load('security/archive/src/app/api/chat-history/route.ts.txt',{'@/lib/db':{db},'@/lib/rate-limit':{rateLimit:()=>({ok:true}),getClientIp:()=> 'test'}});
check('Before: unauthenticated history exposed', (await before.GET(new Request('https://example.test?sessionId=victim'))).status===200);
await before.POST(req('POST',JSON.stringify({sessionId:'victim',sender:'owner',content:'synthetic'})));check('Before: caller owner attribution accepted',db.last.sender==='owner');
check('Before: malformed JSON returned 500',(await before.POST(req('POST','{'))).status===500);
let authorized=false;const parsing=load('src/lib/request-json.ts');const after=load('src/app/api/chat-history/route.ts',{'@/lib/db':{db},'@/lib/auth':{verifyAdmin:async()=>authorized},'@/lib/request-json':parsing});
check('After: anonymous history rejected',(await after.GET(new Request('https://example.test?sessionId=victim'))).status===401);
check('After: anonymous owner spoof rejected',(await after.POST(req('POST',JSON.stringify({sessionId:'victim',sender:'owner',content:'synthetic'})))).status===401);
check('After: malformed JSON 400',(await after.POST(req('POST','{'))).status===400);
check('After: oversized chunked body 413',(await after.POST(req('POST','x'.repeat(20000)))).status===413);
check('After: array shape 400',(await after.POST(req('POST','[]'))).status===400);
authorized=true; check('After: authenticated history works',(await after.GET(new Request('https://example.test?sessionId=test'))).status===200);
check('After: wrong message type rejected',(await after.POST(req('POST',JSON.stringify({sessionId:[],content:{}})))).status===400);
await after.POST(req('POST',JSON.stringify({sessionId:'test',sender:'visitor',content:'synthetic'})));check('After: sender derived from authentication',db.last.sender==='owner');
const developer={name:'Test Owner',role:'Developer',email:'owner@example.test'};
const calendar=load('src/app/api/booking/calendar/route.ts',{'@/lib/portfolio-data':{developer}});
const cal=async(values)=>calendar.GET(new Request('https://example.test?'+new URLSearchParams({date:'2026-10-28',time:'10:00 AM',name:'Synthetic',email:'test@example.test',...values})));
for(const [name,fields] of Object.entries({'CRLF email':{email:'test@example.test\r\nX-AUDIT-PROBE:injected'},'parameter injection':{name:'Test;ROLE=CHAIR'},'invalid date':{date:'2026-02-30'},'invalid month':{date:'2026-99-99'},'invalid time':{time:'99:99 AM'}}))check('After: ICS '+name+' rejected',(await cal(fields)).status===400);
const valid=await cal({purpose:'Testing, safely'}),ics=await valid.text();check('After: valid ICS download',valid.status===200&&ics.includes('BEGIN:VEVENT'));check('After: ICS escaped TEXT',ics.includes('Testing\\, safely'));check('After: ICS octet folding',ics.split('\r\n').every(line=>Buffer.byteLength(line)<=75));
const testimonials=load('src/app/api/testimonials/route.ts',{'@/lib/db':{db:{testimonial:{findMany:async(opts)=>{check('After: testimonial projection excludes email',!opts.select.email&&!opts.select.approved);return []}}}},'@/lib/rate-limit':{},'@/lib/request-json':parsing});await testimonials.GET();
process.env.ADMIN_EMAIL='owner@example.test';process.env.ADMIN_PASSWORD_HASH=crypto.createHash('sha256').update('synthetic-password').digest('hex');process.env.AUTH_SECRET=crypto.randomBytes(32).toString('hex');
const sessions=new Map();const mockdb={$executeRawUnsafe:async(sql,...a)=>{if(sql.startsWith('INSERT'))sessions.set(a[0],a[1]);if(sql.startsWith('DELETE')&&sql.includes('$1'))sessions.delete(a[0]);return 1},$queryRawUnsafe:async(sql,id)=>sessions.has(id)?[{id}]:[]};
const auth=load('src/lib/auth.ts',{'@/lib/db':{db:mockdb}});
check('After: legacy password works',auth.verifyCredentials('owner@example.test','synthetic-password'));
check('After: bad password rejected',!auth.verifyCredentials('owner@example.test','wrong'));
const token=await auth.signAdminToken('owner@example.test');const authenticated=req('GET',undefined,{cookie:`${auth.ADMIN_COOKIE}=${token}`});
check('After: valid DB session accepted',await auth.verifyAdmin(authenticated));check('After: tampered token rejected',!auth.verifyToken(token+'x'));
check('After: cross-site write rejected',!(await auth.verifyAdmin(req('POST','{}',{cookie:`${auth.ADMIN_COOKIE}=${token}`,origin:'https://attacker.invalid'}))));
await auth.revokeAdmin(authenticated);check('After: logged-out token rejected',!(await auth.verifyAdmin(authenticated)));
mockdb.$queryRawUnsafe=async()=>{throw Error('DB down')};check('After: auth fails closed on DB outage',!(await auth.verifyAdmin(authenticated)));
const salt=crypto.randomBytes(16).toString('hex');process.env.ADMIN_PASSWORD_HASH=`scrypt$${salt}$${crypto.scryptSync('synthetic-password',salt,64).toString('hex')}`;const auth2=load('src/lib/auth.ts',{'@/lib/db':{db:mockdb}});check('After: scrypt password accepted',auth2.verifyCredentials('owner@example.test','synthetic-password'));
fs.writeFileSync('security/tests/results.json',JSON.stringify(results,null,2));console.log(`${results.length} checks passed`);
})().catch(e=>{console.error(e);process.exit(1)});
