import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
export const previewFiles=['sakura-white-overview.png','sakura-white-syntax.png','sakura-white-details.png'];
export function checkPreviews() {
  const signature=Buffer.from('89504e470d0a1a0a','hex');
  const results=previewFiles.map(name=>{
    const bytes=fs.readFileSync(new URL(`../docs/images/${name}`,import.meta.url));assert.deepEqual(bytes.subarray(0,8),signature,`Real PNG required: ${name}`);assert.equal(bytes.readUInt32BE(16),2880);assert.equal(bytes.readUInt32BE(20),1620);assert.ok(bytes.length<2*1024*1024,`${name} needs compression`);
    let offset=8;while(offset<bytes.length){const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8);assert.ok(!['tEXt','zTXt','iTXt','eXIf'].includes(type),`Metadata must be stripped: ${name}`);offset+=length+12;}assert.equal(offset,bytes.length);
    return {name,width:2880,height:1620,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
  });
  for(const file of ['README.md','README.zh-CN.md']) {
    const text=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');const images=[...text.matchAll(/!\[([^\]]+)\]\(([^)]+)\)/g)];assert.equal(images.length,3,`${file}: three previews with alt text required`);
    assert.deepEqual(images.map(m=>m[2]).sort(),previewFiles.map(n=>'docs/images/'+n).sort());
  }
  const icon=fs.readFileSync(new URL('../assets/icon.png',import.meta.url));assert.deepEqual(icon.subarray(0,8),signature);assert.equal(icon.readUInt32BE(16),icon.readUInt32BE(20));assert.ok(icon.readUInt32BE(16)>=128,'Marketplace icon must be at least 128px square');
  return results;
}
