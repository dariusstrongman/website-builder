import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot=join(dirname(fileURLToPath(import.meta.url)),'..');
const root=existsSync(join(projectRoot,'dist','index.html'))?join(projectRoot,'dist'):projectRoot;
const htmlFiles=readdirSync(root).filter(name=>name.endsWith('.html'));
const errors=[];
const titles=new Map();

for(const name of htmlFiles){
  const html=readFileSync(join(root,name),'utf8');
  const noindex=/name="robots"[^>]+content="[^"]*noindex/i.test(html);
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1];
  if(!title) errors.push(`${name}: missing title`);
  else if(titles.has(title)) errors.push(`${name}: duplicate title with ${titles.get(title)}`);
  else titles.set(title,name);
  if(!/rel="icon"[^>]+href="favicon\.svg"/i.test(html)) errors.push(`${name}: missing favicon`);
  if(name!=='404.html'&&!noindex&&!/name="description"/i.test(html)) errors.push(`${name}: missing meta description`);
  if(name!=='404.html'&&!noindex&&!/rel="canonical"/i.test(html)) errors.push(`${name}: missing canonical URL`);
  const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  for(const id of new Set(ids)) if(ids.filter(value=>value===id).length>1) errors.push(`${name}: duplicate id ${id}`);
  for(const match of html.matchAll(/href="([^"]+)"/g)){
    const href=match[1];
    if(href==='#') errors.push(`${name}: empty hash link`);
    const target=href.split('#')[0];
    if(target&&!/^(https?:|mailto:|tel:)/.test(target)&&!existsSync(join(root,target))) errors.push(`${name}: missing link target ${target}`);
  }
  for(const match of html.matchAll(/src="([^"]+)"/g)){
    const src=match[1];
    if(src&&!/^https?:/.test(src)&&!existsSync(join(root,src))) errors.push(`${name}: missing source ${src}`);
  }
}

for(const required of ['favicon.svg','robots.txt','sitemap.xml','feed.xml','styles.css','app.js']) if(!existsSync(join(root,required))) errors.push(`missing required asset ${required}`);
const sitemap=readFileSync(join(root,'sitemap.xml'),'utf8');
for(const name of htmlFiles){
  const html=readFileSync(join(root,name),'utf8');
  const noindex=/name="robots"[^>]+content="[^"]*noindex/i.test(html);
  if(name!=='404.html'&&!noindex){
    const slug=name==='index.html'?'':name;
    const expected=`https://website-builder-poc.dariusstroman.chatgpt.site/${slug}`;
    if(!sitemap.includes(`<loc>${expected}</loc>`)) errors.push(`${name}: missing from sitemap`);
  }
}
const feed=readFileSync(join(root,'feed.xml'),'utf8');
if(!/<rss version="2\.0">/.test(feed)||!/<channel>/.test(feed)) errors.push('feed.xml: invalid RSS shell');
const all=htmlFiles.map(name=>readFileSync(join(root,name),'utf8')).join('\n');
for(const stale of ['$2,500','$5,000','$10,000+']) if(all.includes(stale)) errors.push(`stale price remains: ${stale}`);

if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Release check passed: ${htmlFiles.length} pages, ${titles.size} unique titles, favicon and internal links verified.`);
