import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..','dist');
const htmlFiles=readdirSync(root).filter(name=>name.endsWith('.html'));
const errors=[];
const titles=new Map();

for(const name of htmlFiles){
  const html=readFileSync(join(root,name),'utf8');
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1];
  if(!title) errors.push(`${name}: missing title`);
  else if(titles.has(title)) errors.push(`${name}: duplicate title with ${titles.get(title)}`);
  else titles.set(title,name);
  if(!/rel="icon"[^>]+href="favicon\.svg"/i.test(html)) errors.push(`${name}: missing favicon`);
  if(name!=='404.html'&&!/name="description"/i.test(html)) errors.push(`${name}: missing meta description`);
  if(name!=='404.html'&&!/rel="canonical"/i.test(html)) errors.push(`${name}: missing canonical URL`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  for(const id of new Set(ids)) if(ids.filter(value=>value===id).length>1) errors.push(`${name}: duplicate id ${id}`);
  for(const match of html.matchAll(/href="([^"]+)"/g)){
    const href=match[1];
    if(href==='#') errors.push(`${name}: empty hash link`);
    const target=href.split('#')[0];
    if(target&&!/^(https?:|mailto:|tel:)/.test(target)&&!existsSync(join(root,target))) errors.push(`${name}: missing link target ${target}`);
  }
}

for(const required of ['favicon.svg','robots.txt','sitemap.xml','styles.css','app.js']) if(!existsSync(join(root,required))) errors.push(`missing required asset ${required}`);
const all=htmlFiles.map(name=>readFileSync(join(root,name),'utf8')).join('\n');
for(const stale of ['$2,500','$5,000','$10,000+']) if(all.includes(stale)) errors.push(`stale price remains: ${stale}`);

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Release check passed: ${htmlFiles.length} pages, ${titles.size} unique titles, favicon and internal links verified.`);
