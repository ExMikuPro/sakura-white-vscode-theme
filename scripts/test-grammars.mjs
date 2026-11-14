import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import tm from 'vscode-textmate';
import onig from 'vscode-oniguruma';
const require=createRequire(import.meta.url);
const { vscodePaths } = await import('./vscode-paths.mjs');
const vscodeRoot=process.env.VSCODE_EXTENSIONS_PATH || (await vscodePaths()).extensions;
const vscodeVersion=JSON.parse(fs.readFileSync(path.join(vscodeRoot,'../package.json'),'utf8')).version;
const grammars=new Map();
for(const dir of fs.readdirSync(vscodeRoot)) {const manifest=path.join(vscodeRoot,dir,'package.json');if(!fs.existsSync(manifest))continue;let p;try{p=JSON.parse(fs.readFileSync(manifest));}catch{continue;}for(const g of p.contributes?.grammars??[])grammars.set(g.scopeName,path.resolve(vscodeRoot,dir,g.path));}
const wasm=fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));await onig.loadWASM(wasm.buffer.slice(wasm.byteOffset,wasm.byteOffset+wasm.byteLength));
const theme=JSON.parse(fs.readFileSync(new URL('../themes/sakura-white-color-theme.json',import.meta.url)));
const registry=new tm.Registry({theme:{settings:[{settings:{foreground:theme.colors['editor.foreground'],background:theme.colors['editor.background']}},...theme.tokenColors]},onigLib:Promise.resolve({createOnigScanner:p=>new onig.OnigScanner(p),createOnigString:s=>new onig.OnigString(s)}),loadGrammar:async scope=>{const file=grammars.get(scope);return file?tm.parseRawGrammar(fs.readFileSync(file,'utf8'),file):null;}});
const cases=JSON.parse(fs.readFileSync(new URL('../test/fixtures/cases.json',import.meta.url)));
const results=[],unscopedFallbacks=[];
for(const test of cases){const grammar=await registry.loadGrammar(test.scope);assert.ok(grammar,test.language);const lines=fs.readFileSync(new URL(`../test/fixtures/${test.file}`,import.meta.url),'utf8').split('\n');let state=tm.INITIAL;const tokens=[],scopeTokens=[];for(const line of lines){const lexical=grammar.tokenizeLine(line,state);const r=grammar.tokenizeLine2(line,state);tokens.push(r.tokens);scopeTokens.push(lexical.tokens);state=r.ruleStack;}
for(const probe of test.probes){const line=lines[probe.line-1];let pos=-1;for(let occurrence=0;occurrence<(probe.occurrence??1);occurrence++)pos=line.indexOf(probe.text,pos+1);assert.ok(pos>=0,probe.text);const encoded=tokens[probe.line-1];let meta;for(let i=0;i<encoded.length;i+=2){if(encoded[i]<=pos)meta=encoded[i+1];else break;}const actual=registry.getColorMap()[(meta>>>15)&0x1ff];const scopes=scopeTokens[probe.line-1].find(t=>t.startIndex<=pos&&t.endIndex>pos)?.scopes??[];let ruleName=probe.rule;if(probe.rulesByScope){const match=Object.entries(probe.rulesByScope).find(([scope])=>scopes.some(s=>s===scope||s.startsWith(scope+'.')));assert.ok(match,`Unknown grammar classification for ${test.language}: ${probe.text}: ${scopes}`);ruleName=match[1];}const rule=theme.tokenColors.find(r=>r.name===ruleName);let expectedColor=rule.settings.foreground;if(probe.unscopedFallback?.vscodeVersion===vscodeVersion){assert.deepEqual(scopes,probe.unscopedFallback.scopes);expectedColor=theme.tokenColors.find(r=>r.scope===undefined).settings.foreground;unscopedFallbacks.push({language:test.language,line:probe.line,text:probe.text,scopes});}assert.equal(actual.toUpperCase(),expectedColor.toUpperCase(),`${test.language}: ${probe.text} expected ${probe.rule}`);}
results.push({language:test.language,probes:test.probes.length,pass:true});}
fs.mkdirSync(new URL('../dist/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../dist/grammar-report.json',import.meta.url),JSON.stringify({vscodeVersion,unscopedFallbacks,engine:'vscode-textmate with installed VS Code grammars',results},null,2)+'\n');console.log(`Grammar tests passed: ${results.length} languages, ${results.reduce((n,r)=>n+r.probes,0)} token color assertions.`);if(unscopedFallbacks.length)console.log(`Known unscoped grammar fallback assertions: ${unscopedFallbacks.length} (see grammar-report.json).`);registry.dispose();
