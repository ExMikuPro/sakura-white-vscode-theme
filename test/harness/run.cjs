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
 await vscode.extensions.getExtension('vscode.typescript-language-features')?.activate();
 let legend,tokens;
 for(let attempt=0;attempt<80;attempt++) {
  legend=await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokensLegend',doc.uri);
  tokens=await vscode.commands.executeCommand('vscode.provideDocumentSemanticTokens',doc.uri);
  if(legend&&tokens?.data?.length)break;
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 assert.ok(legend&&tokens?.data?.length,'TypeScript must supply real semantic tokens');
 const typesSeen=new Set();for(let i=0;i<tokens.data.length;i+=5)typesSeen.add(legend.tokenTypes[tokens.data[i+3]]);
 for(const type of ['interface','function','property','parameter'])assert.ok(typesSeen.has(type),`Missing semantic provider type: ${type}`);
 for(const [type,color]of Object.entries({interface:'#6941A1',function:'#245B91',property:'#47587A',parameter:'#414A5A'}))assert.equal(theme.semanticTokenColors[type],color);
 const semanticProvider={language:'typescript',tokenCount:tokens.data.length/5,typesSeen:[...typesSeen].sort()};
 await vscode.commands.executeCommand('workbench.view.explorer');
 const report={vscodeVersion:vscode.version,installedVersion:installed.packageJSON.version,activeTheme:'Sakura White',kind:'Light',ayuInstalled:false,semanticHighlighting:true,semanticProvider,uiColors:Object.keys(theme.colors).length,scope:'VSIX installation, contribution discovery, workspace theme selection, active light kind; real TS semantic-provider output and theme role agreement; not renderer color pixel assertions or a full LSP matrix'};
 fs.writeFileSync(process.env.SAKURA_REPORT,JSON.stringify(report,null,2)+'\n');
 if(process.env.SAKURA_GUI_WAIT){fs.writeFileSync(process.env.SAKURA_GUI_READY,'ready');const until=Date.now()+180000;while(Date.now()<until&&!fs.existsSync(process.env.SAKURA_GUI_DONE))await new Promise(r=>setTimeout(r,500));}
};
