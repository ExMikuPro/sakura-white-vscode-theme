import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import tm from 'vscode-textmate';
import onig from 'vscode-oniguruma';
const require=createRequire(import.meta.url);
const { vscodePaths } = await import('./vscode-paths.mjs');
const vscodeRoot=process.env.VSCODE_EXTENSIONS_PATH || (await vscodePaths()).extensions;
const grammars=new Map();
for(const dir of fs.readdirSync(vscodeRoot)) {const manifest=path.join(vscodeRoot,dir,'package.json');if(!fs.existsSync(manifest))continue;let p;try{p=JSON.parse(fs.readFileSync(manifest));}catch{continue;}for(const g of p.contributes?.grammars??[])grammars.set(g.scopeName,path.resolve(vscodeRoot,dir,g.path));}
const wasm=fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));await onig.loadWASM(wasm.buffer.slice(wasm.byteOffset,wasm.byteOffset+wasm.byteLength));
const theme=JSON.parse(fs.readFileSync(new URL('../themes/sakura-white-color-theme.json',import.meta.url)));
const registry=new tm.Registry({theme:{settings:[{settings:{foreground:theme.colors['editor.foreground'],background:theme.colors['editor.background']}},...theme.tokenColors]},onigLib:Promise.resolve({createOnigScanner:p=>new onig.OnigScanner(p),createOnigString:s=>new onig.OnigString(s)}),loadGrammar:async scope=>{const file=grammars.get(scope);return file?tm.parseRawGrammar(fs.readFileSync(file,'utf8'),file):null;}});
const cases=JSON.parse(fs.readFileSync(new URL('../test/fixtures/cases.json',import.meta.url)));
const results=[];
for(const test of cases){const grammar=await registry.loadGrammar(test.scope);assert.ok(grammar,test.language);const lines=fs.readFileSync(new URL(`../test/fixtures/${test.file}`,import.meta.url),'utf8').split('\n');let state=tm.INITIAL;const tokens=[];for(const line of lines){const r=grammar.tokenizeLine2(line,state);tokens.push(r.tokens);state=r.ruleStack;}
for(const probe of test.probes){const line=lines[probe.line-1];const pos=line.indexOf(probe.text);assert.ok(pos>=0,probe.text);const encoded=tokens[probe.line-1];let meta;for(let i=0;i<encoded.length;i+=2){if(encoded[i]<=pos)meta=encoded[i+1];else break;}const actual=registry.getColorMap()[(meta>>>15)&0x1ff];const rule=theme.tokenColors.find(r=>r.name===probe.rule);assert.equal(actual.toUpperCase(),rule.settings.foreground.toUpperCase(),`${test.language}: ${probe.text} expected ${probe.rule}`);}
results.push({language:test.language,probes:test.probes.length,pass:true});}
fs.mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../dist/grammar-report.json',import.meta.url),JSON.stringify({engine:'vscode-textmate with installed VS Code grammars',results},null,2)+'\n');console.log(`Grammar tests passed: ${results.length} languages, ${results.reduce((n,r)=>n+r.probes,0)} token color assertions.`);registry.dispose();
