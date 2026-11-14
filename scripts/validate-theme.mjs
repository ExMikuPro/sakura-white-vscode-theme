import fs from 'node:fs';
import assert from 'node:assert/strict';
import { parse } from 'jsonc-parser';
import { validateSyntax } from './validate-syntax.mjs';
export const root = new URL('../', import.meta.url);
export function readJSONC(path) {
  const errors = []; const value = parse(fs.readFileSync(new URL(path, root), 'utf8'), errors, { allowTrailingComma: true });
  assert.equal(errors.length, 0, `JSONC errors in ${path}: ${JSON.stringify(errors)}`); return value;
}
export const hex = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
function rgba(value) {
  assert.match(value, hex); let h = value.slice(1); if (h.length < 5) h = [...h].map(c => c + c).join('');
  return [0, 2, 4, 6].map((i) => i === 6 && h.length === 6 ? 1 : parseInt(h.slice(i, i + 2), 16) / 255);
}
export function composite(fg, bg) {
  const f = rgba(fg), b = rgba(bg); return '#' + f.slice(0, 3).map((v, i) => Math.round((v * f[3] + b[i] * (1 - f[3])) * 255).toString(16).padStart(2, '0')).join('');
}
export function contrast(fg, bg) {
  const luminance = c => rgba(c).slice(0, 3).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((n, v, i) => n + v * [.2126, .7152, .0722][i], 0);
  const a = luminance(composite(fg, bg)), b = luminance(bg); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
const theme = readJSONC('themes/sakura-white-color-theme.json');
const syntaxReport=validateSyntax(theme);
fs.mkdirSync(new URL('dist/',root),{recursive:true});fs.writeFileSync(new URL('dist/syntax-report.json',root),JSON.stringify(syntaxReport,null,2)+'\n');
const pkg = readJSONC('package.json');
assert.deepEqual(Object.keys(theme).sort(), ['$schema','name','type','colors','tokenColors','semanticHighlighting','semanticTokenColors'].sort());
assert.equal(theme.type, 'light'); assert.equal(theme.semanticHighlighting, true);
assert.equal(pkg.version, '0.1.0'); assert.equal(pkg.contributes.themes[0].uiTheme, 'vs');
assert.equal(pkg.contributes.themes[0].path, './themes/sakura-white-color-theme.json');
assert.deepEqual(Object.keys(pkg.contributes), ['themes']);
assert.ok(!pkg.main && !pkg.browser && !pkg.activationEvents && !pkg.dependencies, 'Declarative theme must not activate code');
for (const [key, value] of Object.entries(theme.colors)) { assert.match(key, /^[a-zA-Z][\w]*(\.[\w]+)*$/); assert.match(value, hex, key); }
for (const key of ['editor.background','editor.foreground','terminal.background','terminal.foreground','terminal.ansiBrightWhite','sideBar.background','tab.activeBackground','statusBar.background','editorSuggestWidget.background','notifications.background','quickInput.background','menu.background','diffEditor.insertedTextBackground','editorBracketHighlight.foreground6']) assert.ok(theme.colors[key], `Missing ${key}`);
const styles = new Set(['','italic','bold','underline','strikethrough']);
for (const rule of theme.tokenColors) {
  assert.ok(rule.name && rule.settings); const scopes = typeof rule.scope === 'string' ? [rule.scope] : rule.scope;
  if(rule.scope===undefined){assert.equal(rule.name,'Default code foreground');assert.equal(rule.settings.foreground,'#414A5A');assert.equal(theme.tokenColors.filter(r=>r.scope===undefined).length,1);}else{assert.ok(Array.isArray(scopes) && scopes.length);for(const scope of scopes)assert.match(scope,/^[\w., +:()|\->]+$/,`Invalid scope ${scope}`);}
  assert.deepEqual(Object.keys(rule.settings).sort(), ['fontStyle','foreground']); assert.match(rule.settings.foreground, hex);
  for (const style of rule.settings.fontStyle.split(' ')) assert.ok(styles.has(style));
}
const types = new Set('namespace class enum interface struct typeParameter type parameter variable property enumMember decorator event function method macro label comment string keyword number regexp operator *'.split(' '));
const modifiers = new Set('declaration definition readonly static deprecated abstract async modification documentation defaultLibrary'.split(' '));
for (const [selector, style] of Object.entries(theme.semanticTokenColors)) {
  assert.match(selector, /^(?:\*|[a-zA-Z]\w*)(?:\.[a-zA-Z]\w*)*(?::[a-zA-Z][\w-]*)?$/);
  const [type, ...mods] = selector.split(':')[0].split('.'); assert.ok(types.has(type), selector); mods.forEach(m => assert.ok(modifiers.has(m), selector));
  if (typeof style === 'string') assert.match(style, hex);
  else { for (const [k,v] of Object.entries(style)) { assert.ok(['foreground','bold','italic','underline','strikethrough'].includes(k)); if (k === 'foreground') assert.match(v, hex); else assert.equal(typeof v, 'boolean'); } }
}
const checks = [], c = theme.colors;
const check = (label, fg, bg) => checks.push({label, foreground:fg, background:bg, ratio:Number(contrast(fg,bg).toFixed(3)), pass:contrast(fg,bg)>=4.5});
const codeBackgrounds = ['editor.background','editor.lineHighlightBackground','editor.selectionBackground','editor.inactiveSelectionBackground','editor.selectionHighlightBackground','editor.wordHighlightBackground','editor.wordHighlightStrongBackground','editor.findMatchBackground','editor.findMatchHighlightBackground','diffEditor.insertedTextBackground','diffEditor.removedTextBackground'];
for (const key of codeBackgrounds) {
  const bg = composite(c[key], c['editor.background']); check(`editor.foreground on ${key}`,c['editor.foreground'],bg);
  for (const rule of theme.tokenColors) check(`TextMate ${rule.name} on ${key}`,rule.settings.foreground,bg);
  for (const [sel,style] of Object.entries(theme.semanticTokenColors)) { const fg=typeof style==='string'?style:style.foreground; if(fg) check(`Semantic ${sel} on ${key}`,fg,bg); }
}
const pair = (fg,bg) => check(fg,c[fg],c[bg]);
for (const p of ['button','button.secondary','input','dropdown','badge','activityBar','activityBarBadge','sideBar','titleBar.active','titleBar.inactive','tab.active','tab.inactive','statusBar','statusBar.debugging','statusBar.noFolder','terminal','editorWidget','editorSuggestWidget','editorHoverWidget','quickInput','menu','notifications','editorInlayHint','editorInlayHint.type','editorInlayHint.parameter']) {
  const dotted = ['button','input','dropdown','badge','activityBar','activityBarBadge','sideBar','statusBar','terminal','editorWidget','editorSuggestWidget','editorHoverWidget','quickInput','menu','notifications','editorInlayHint'].includes(p);
  const fg=p+(dotted?'.foreground':'Foreground'),bg=p+(dotted?'.background':'Background');pair(fg,bg);
}
for(const [fg,bg] of [['button.foreground','button.hoverBackground'],['list.activeSelectionForeground','list.activeSelectionBackground'],['list.focusForeground','list.focusBackground'],['list.inactiveSelectionForeground','list.inactiveSelectionBackground'],['editorSuggestWidget.selectedForeground','editorSuggestWidget.selectedBackground'],['peekViewResult.selectionForeground','peekViewResult.selectionBackground'],['statusBarItem.errorForeground','statusBarItem.errorBackground'],['statusBarItem.remoteForeground','statusBarItem.remoteBackground'],['statusBarItem.warningForeground','statusBarItem.warningBackground'],['descriptionForeground','sideBar.background'],['input.placeholderForeground','input.background'],['editorLineNumber.foreground','editor.background'],['editorGhostText.foreground','editor.background'],['editorCodeLens.foreground','editor.background']]) pair(fg,bg);
for(const [k,v] of Object.entries(c)) if(k.startsWith('terminal.ansi')) check(k,v,c['terminal.background']);
const failures=checks.filter(x=>!x.pass);
fs.mkdirSync(new URL('dist/',root),{recursive:true}); fs.writeFileSync(new URL('dist/contrast-report.json',root),JSON.stringify({threshold:4.5,method:'WCAG 2 relative luminance, sRGB alpha compositing; normal text; decorative borders and icons excluded',checks:checks.length,failures,results:checks},null,2)+'\n');
console.log(`Validated ${Object.keys(c).length} UI colors, ${theme.tokenColors.length} TextMate rules, ${Object.keys(theme.semanticTokenColors).length} semantic rules. Contrast: ${checks.length-failures.length}/${checks.length}.`);
if(failures.length) {console.table(failures);process.exitCode=1;}
