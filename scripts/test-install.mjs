import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { runTests } from '@vscode/test-electron';
import { vscodePaths } from './vscode-paths.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const vsix=path.join(root,'dist/sakura-white-theme-0.1.0.vsix');assert.ok(fs.existsSync(vsix),'Run npm run package first');
const {executable,cli}=await vscodePaths();
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sakura-white-test-'));
const user=path.join(temp,'user'),extensions=path.join(temp,'extensions'),workspace=path.join(temp,'workspace');
fs.mkdirSync(workspace,{recursive:true});fs.cpSync(path.join(root,'test/fixtures'),workspace,{recursive:true});
const workspaceFile=path.join(temp,'review.code-workspace');
fs.writeFileSync(workspaceFile,JSON.stringify({folders:[{path:workspace}],settings:{'workbench.colorTheme':'Sakura White','editor.semanticHighlighting.enabled':true,'window.title':'Sakura White Theme — Isolated Review'}}));
const args=['--user-data-dir',user,'--extensions-dir',extensions];
function cliRun(a){const r=spawnSync(executable,[cli,...args,...a],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1'},encoding:'utf8',timeout:120000});assert.equal(r.status,0,'VS Code CLI failed: '+JSON.stringify({status:r.status,signal:r.signal,stderr:r.stderr,stdout:r.stdout,error:r.error?.message}));return r.stdout;}
try {
 cliRun(['--install-extension',vsix,'--force']);assert.match(cliRun(['--list-extensions']),/ExMikuPro.sakura-white-theme/i);
 await runTests({vscodeExecutablePath:executable,extensionDevelopmentPath:path.join(root,'test/harness'),extensionTestsPath:path.join(root,'test/harness/run.cjs'),launchArgs:[workspaceFile,...args,'--skip-welcome','--skip-release-notes'],extensionTestsEnv:{SAKURA_REPORT:path.join(root,'dist/install-report.json'),SAKURA_GUI_WAIT:process.env.SAKURA_GUI_WAIT||'',SAKURA_GUI_READY:path.join(root,'dist/gui-ready'),SAKURA_GUI_DONE:path.join(root,'dist/gui-done')}});
} finally {fs.rmSync(temp,{recursive:true,force:true});}
console.log('VSIX installed and Sakura White enabled in isolated VS Code.');
