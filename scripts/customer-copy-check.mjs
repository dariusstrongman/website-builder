import {readFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const files=['index.html','project.html','about.html','pricing.html','faq.html','how-it-works.html','examples.html','app.js','workspace/main.mjs','workspace/live.mjs','scripts/sync-chrome.mjs'];
const banned=[/AI credits?/i,/created instantly in this browser/i,/no live generation/i,/prepared records/i,/interpreted by Sol/i,/temporary product name/i,/product prototype/i,/Try the prototype/i,/no customer account/i,/Saved on this browser/i];
const errors=[];
for(const file of files){const source=readFileSync(join(root,file),'utf8');for(const pattern of banned)if(pattern.test(source))errors.push(`${file}: customer copy contains ${pattern}`)}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Customer copy check passed: ${files.length} customer-facing sources contain no internal release language.`);
