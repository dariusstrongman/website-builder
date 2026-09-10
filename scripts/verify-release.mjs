import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';
const tests=['workspace','motion-lab'].flatMap(dir=>readdirSync(dir).filter(name=>name.endsWith('.test.mjs')).map(name=>join(dir,name))); 

for(const args of [['scripts/release-check.mjs'],['scripts/customer-copy-check.mjs'],['scripts/privacy-check.cjs'],['scripts/interaction-check.mjs'],['--test',...tests]]){
  const result=spawnSync(process.execPath,args,{stdio:'inherit'});
  if(result.status!==0)process.exit(result.status||1);
}
console.log('Verified release: source, customer copy, interactions, and unit behavior passed.');
