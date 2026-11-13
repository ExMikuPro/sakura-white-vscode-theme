import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import yauzl from 'yauzl';
import { createHash } from 'node:crypto';
const filename=new URL('../dist/sakura-white-theme-0.1.0.vsix',import.meta.url);
const expected=['[Content_Types].xml','extension.vsixmanifest','extension/package.json','extension/readme.md','extension/README.zh-CN.md','extension/changelog.md','extension/LICENSE.txt','extension/THIRD_PARTY_NOTICES.md','extension/themes/sakura-white-color-theme.json'];
const zip=await new Promise((resolve,reject)=>yauzl.open(fileURLToPath(filename),{lazyEntries:true},(err,z)=>err?reject(err):resolve(z)));
const files=[];
await new Promise((resolve,reject)=>{
  zip.on('error',reject);zip.on('end',resolve);zip.on('entry',entry=>{
    try {assert.ok(expected.includes(entry.fileName),`Unexpected package entry: ${entry.fileName}`);assert.ok(entry.uncompressedSize<1024*1024);files.push(entry.fileName);}catch(e){zip.close();reject(e);return;}
    zip.openReadStream(entry,(err,stream)=>{if(err){reject(err);return;}const chunks=[];stream.on('data',b=>chunks.push(b));stream.on('error',reject);stream.on('end',()=>{try{
      const content=Buffer.concat(chunks),text=content.toString('utf8');
      assert.doesNotMatch(text,/(?:\/Users\/|[A-Z]:\\|file:\/\/|vscode_custom_css|globalState|keybindings|gh[pousr]_[\w]{20,}|github_pat_[\w]+|-----BEGIN [A-Z ]*PRIVATE KEY|(?:AKIA|ASIA)[A-Z0-9]{16})/i,entry.fileName);
      if(entry.fileName.startsWith('extension/') && entry.fileName!=='extension/package.json') {const localName=({'readme.md':'README.md','changelog.md':'CHANGELOG.md','LICENSE.txt':'LICENSE'})[entry.fileName.slice(10)]??entry.fileName.slice(10);const local=new URL('../'+localName,import.meta.url);let expectedContent=fs.readFileSync(local);if(entry.fileName==='extension/readme.md'||entry.fileName==='extension/changelog.md') expectedContent=Buffer.from(expectedContent.toString('utf8').replace(/\]\((?!https?:|#)([^)]+)\)/g,'](https://github.com/ExMikuPro/sakura-white-vscode-theme/blob/HEAD/$1)'));assert.deepEqual(content,expectedContent,entry.fileName);}
      if(entry.fileName==='extension/package.json'){const p=JSON.parse(text);assert.ok(!p.main&&!p.browser&&!p.dependencies);assert.deepEqual(Object.keys(p.contributes),['themes']);}
      zip.readEntry();
    }catch(e){zip.close();reject(e);}});});
  });zip.readEntry();
});
assert.deepEqual(files.sort(),expected.sort());
const report={file:'sakura-white-theme-0.1.0.vsix',files,bytes:fs.statSync(filename).size,sha256:createHash('sha256').update(fs.readFileSync(filename)).digest('hex'),privacyScan:'passed; explicit allowlist, local path and secret patterns, theme/license/doc byte comparison'};
fs.writeFileSync(new URL('../dist/package-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(`VSIX allowlist and privacy checks passed: ${files.length} files, ${report.bytes} bytes. SHA-256 ${report.sha256}`);
