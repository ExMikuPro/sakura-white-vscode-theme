import assert from 'node:assert/strict';
import fs from 'node:fs';
// CIE76 is a regression guard for palette separation, not a WCAG certification.
function lab(hex) {
  const rgb=hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  const xyz=[[.4124564,.3575761,.1804375],[.2126729,.7151522,.0721750],[.0193339,.1191920,.9503041]].map((row,i)=>row.reduce((n,w,j)=>n+w*rgb[j],0)/[.95047,1,1.08883][i]);
  const [x,y,z]=xyz.map(v=>v>216/24389?Math.cbrt(v):(24389/27*v+16)/116);return [116*y-16,500*(x-y),200*(y-z)];
}
export function validateSyntax(theme) {
  const palette=JSON.parse(fs.readFileSync(new URL('../docs/sakura-contrast-palette.json',import.meta.url),'utf8'));
  const roles={keyword:['keyword'],type:['class','struct','interface','enum','type','typeParameter','namespace'],function:['function','method','event'],string:['string','regexp'],number:['number','enumMember','variable.readonly','property.readonly'],comment:['comment'],variable:['variable','parameter','label'],property:['property'],macro:['macro','decorator'],operator:['operator']};
  const tm={keyword:'Keywords and storage',type:'Types and namespaces',function:'Functions and methods',string:'Strings',number:'Numeric overrides',comment:'Comments',variable:'Variables and parameters',property:'Properties and attributes',macro:'Decorators and macros',operator:'Operators and punctuation'};
  for(const [role,selectors]of Object.entries(roles)) {
    assert.equal(theme.tokenColors.find(r=>r.name===tm[role])?.settings.foreground,palette[role],`TextMate ${role}`);
    for(const selector of selectors)assert.equal(theme.semanticTokenColors[selector],palette[role],`Semantic ${selector} must agree with ${role}`);
  }
  const separations=[['function','type',25],['keyword','string',40],['number','string',25],['comment','string',20]].map(([a,b,min])=>{
    const x=lab(palette[a]),y=lab(palette[b]);const delta=Math.hypot(...x.map((v,i)=>v-y[i]));assert.ok(delta>=min,`${a}/${b} CIE76 ${delta.toFixed(2)} < ${min}`);return {roles:[a,b],minimum:min,deltaE76:Number(delta.toFixed(2))};
  });
  const variable=lab(palette.variable);assert.ok(Math.hypot(variable[1],variable[2])<20,'Ordinary variables must stay neutral');
  const deprecated=theme.semanticTokenColors['*.deprecated'];assert.deepEqual(deprecated,{strikethrough:true},'A modifier must not replace the semantic foreground');
  assert.equal(theme.semanticHighlighting,true);assert.equal(theme.type,'light');
  console.log(`Syntax roles agree across TextMate/semantic tokens. Function/type ΔE76: ${separations[0].deltaE76}.`);
  return {palette,separations,semanticTypes:Object.values(roles).flat().length};
}
