// Read-only local analysis. Never writes the input or any personal settings.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'jsonc-parser';
const source = process.argv[2]; assert.ok(source, 'Usage: node scripts/analyze-profile.mjs /path/to/profile');
function decode(value) {
  for(let i=0;typeof value==='string' && i<10;i++) { const errors=[];value=parse(value,errors,{allowTrailingComma:true});assert.equal(errors.length,0,'Invalid JSON/JSONC'); }
  return value;
}
const profile=decode(fs.readFileSync(source,'utf8'));let settings=decode(profile.settings);
if(settings.settings!==undefined) settings=decode(settings.settings);
const selected=settings['workbench.colorTheme'];const target=`[${selected}]`;
const resolve=(object={})=>({...Object.fromEntries(Object.entries(object).filter(([k])=>!k.startsWith('['))),...(object[target]??{})});
const ui=resolve(settings['workbench.colorCustomizations']);const tm=resolve(settings['editor.tokenColorCustomizations']);const sem=resolve(settings['editor.semanticTokenColorCustomizations']);
const shorthand=['comments','strings','numbers','keywords','types','functions','variables'].map(k=>tm[k]).filter(Boolean);
const textMate=(tm.textMateRules??[]).map(r=>r.settings?.foreground).filter(Boolean);
const semantic=Object.values(sem.rules??{}).map(s=>typeof s==='string'?s:s.foreground).filter(Boolean);
const colors=[...Object.values(ui),...shorthand,...textMate,...semantic].filter(x=>typeof x==='string' && /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(x));
console.log(JSON.stringify({baseTheme:selected,iconTheme:settings['workbench.iconTheme'],effectiveUIEntries:Object.keys(ui).length,uiHexDefinitions:Object.values(ui).filter(x=>typeof x==='string'&&x.startsWith('#')).length,defaultSentinels:Object.values(ui).filter(x=>x==='default').length,textMateShorthandColors:shorthand.length,textMateRuleColors:textMate.length,semanticColors:semantic.length,effectiveHexDefinitions:colors.length,uniqueHexLiterals:new Set(colors.map(x=>x.toUpperCase())).size,appearanceKeysInspected:Object.keys(settings).filter(k=>/font|window\.|appearance|custom_css|layout|color|theme/i.test(k))},null,2));
