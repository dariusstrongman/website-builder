const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
for(const entry of fs.readdirSync(root,{withFileTypes:true})){if(entry.isFile()&&/\.(html|css|js|mjs|svg|xml|txt|webmanifest)$/.test(entry.name))fs.copyFileSync(path.join(root,entry.name),path.join(out,entry.name));if(entry.isDirectory()&&['assets','workspace','motion-lab','preview'].includes(entry.name))fs.cpSync(path.join(root,entry.name),path.join(out,entry.name),{recursive:true,filter:p=>!p.endsWith('.test.mjs')});}
console.log('Static build complete: dist/index.html and retained public routes.');

