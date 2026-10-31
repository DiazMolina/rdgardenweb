import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Read-only local scan. Output locations only, never matched values.
const patterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['supabase-secret', /\bsb_secret_[A-Za-z0-9_-]{16,}/g],
  ['jwt-token', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ['credential-url', /(?:postgres(?:ql)?|mysql):\/\/[^\s:@/]+:[^\s@/]+@/g],
  ['provider-key', /\b(?:AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|sk_live_[A-Za-z0-9]{20,})/g],
];
const findings=[];
function scan(source, location) {
  for(const [rule,regex]of patterns){regex.lastIndex=0;for(const match of source.matchAll(regex))findings.push({rule,location,line:source.slice(0,match.index).split('\n').length});}
}
function walk(dir) {
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if(['node_modules','.git','.next','.idea','.claude','.cursor','.devin','.agents'].includes(entry.name)||entry.name.startsWith('.env'))continue;
    const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);
    else if(/\.(?:ts|tsx|js|mjs|cjs|json|toml|sql|md|yml|yaml)$/.test(file))scan(fs.readFileSync(file,'utf8'),file);
  }
}
walk('.');
const commits=execFileSync('git',['rev-list','--all'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
let historyFiles=0;
for(const commit of commits){
 const names=execFileSync('git',['ls-tree','-r','--name-only',commit],{encoding:'utf8'}).split('\n').filter(Boolean);
 for(const name of names){if(!/\.(ts|tsx|js|json|toml|sql|md|env|yml|yaml)$/.test(name)&&!path.basename(name).startsWith('.env'))continue;historyFiles++;scan(execFileSync('git',['show',`${commit}:${name}`],{encoding:'utf8',maxBuffer:10*1024*1024}),`history:${commit.slice(0,12)}:${name}`);}
}
const ignoredEnvironment=fs.existsSync('.env.local') && execFileSync('git',['check-ignore','.env.local'],{encoding:'utf8'}).trim()==='.env.local';
let clientSecretMatches=0;
let clientSecretCheckPerformed=false;
if(fs.existsSync('.env.local') && fs.existsSync('.next/static')) {
 const raw=fs.readFileSync('.env.local','utf8').match(/^SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g,'');
 if(raw&&raw.length>20){clientSecretCheckPerformed=true;const check=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())check(file);else if(/\.(js|json|map)$/.test(file)&&fs.readFileSync(file,'utf8').includes(raw))clientSecretMatches++;}};check('.next/static');}
}
const result={scanner:'Repository-specific regex scan; not Gitleaks',commits:commits.length,historyFiles,ignoredEnvironment,clientSecretCheckPerformed,clientSecretMatches,findings,excluded:'node_modules, build output except exact private-key client check, IDE/tool caches and local env values'};
console.log(JSON.stringify(result,null,2));
if(findings.length||clientSecretMatches)process.exitCode=1;
