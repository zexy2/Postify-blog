import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { VERIFICATION_MANIFEST } from '../src/content/verificationManifest.js';
const execFileAsync=promisify(execFile);
const results={generatedAt:new Date().toISOString(),scope:'checked-in deterministic verification only',runs:{}};
let failed=false;
for(const check of VERIFICATION_MANIFEST){
  const started=Date.now();
  try{
    const {stdout,stderr}=await execFileAsync(process.execPath,['--input-type=module','--eval',check.code],{timeout:2500,maxBuffer:64*1024,env:{NODE_ENV:'test',PATH:process.env.PATH}});
    const passed=stdout.trim()===check.expectedStdout && !stderr.trim();
    results.runs[check.id]={id:check.id,postSlug:check.postSlug,status:passed?'passed':'failed',runtime:check.runtime,runtimeVersion:check.runtimeVersion,verifiedAt:new Date().toISOString(),durationMs:Date.now()-started,expectedStdout:check.expectedStdout};
    if(!passed) failed=true;
  }catch(error){results.runs[check.id]={id:check.id,postSlug:check.postSlug,status:'failed',runtime:check.runtime,runtimeVersion:check.runtimeVersion,verifiedAt:new Date().toISOString(),durationMs:Date.now()-started,error:String(error.message||error).slice(0,300)};failed=true;}
}
await mkdir('public',{recursive:true});
await writeFile('public/verification-runs.json',JSON.stringify(results,null,2)+'\n');
if(failed){console.error('Knowledge verification FAILED');process.exit(1)}
console.log(`Knowledge verification PASS: ${VERIFICATION_MANIFEST.length} deterministic run(s)`);
