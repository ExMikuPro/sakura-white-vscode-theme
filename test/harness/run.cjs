const vscode=require('vscode');
const fs=require('node:fs');
const assert=require('node:assert/strict');
exports.run=async function(){
 const installed=vscode.extensions.getExtension('ExMikuPro.sakura-white-theme');assert.ok(installed,'VSIX theme must be installed');
 assert.equal(installed.packageJSON.version,'0.1.0');assert.equal(installed.packageJSON.main,undefined);
 assert.ok(!vscode.extensions.getExtension('teabyii.ayu'),'Ayu must not be installed');
 assert.equal(vscode.workspace.getConfiguration('workbench').get('colorTheme'),'Sakura White');
 assert.equal(vscode.window.activeColorTheme.kind,vscode.ColorThemeKind.Light);
 const theme=JSON.parse(fs.readFileSync(vscode.Uri.joinPath(installed.extensionUri,'themes/sakura-white-color-theme.json').fsPath,'utf8'));
 assert.equal(theme.semanticHighlighting,true);assert.equal(theme.colors['editor.background'],'#FFFDFE');
 const folder=vscode.workspace.workspaceFolders[0];const doc=await vscode.workspace.openTextDocument(vscode.Uri.joinPath(folder.uri,'sample.ts'));await vscode.window.showTextDocument(doc);
 await vscode.commands.executeCommand('workbench.view.explorer');
 const report={vscodeVersion:vscode.version,installedVersion:installed.packageJSON.version,activeTheme:'Sakura White',kind:'Light',ayuInstalled:false,semanticHighlighting:true,uiColors:Object.keys(theme.colors).length,scope:'VSIX installation, contribution discovery, workspace theme selection, active light kind; not renderer color pixel assertions or an LSP matrix'};
 fs.writeFileSync(process.env.SAKURA_REPORT,JSON.stringify(report,null,2)+'\n');
 if(process.env.SAKURA_GUI_WAIT){fs.writeFileSync(process.env.SAKURA_GUI_READY,'ready');const until=Date.now()+180000;while(Date.now()<until&&!fs.existsSync(process.env.SAKURA_GUI_DONE))await new Promise(r=>setTimeout(r,500));}
};
