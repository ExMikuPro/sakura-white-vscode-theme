import fs from 'node:fs';
import path from 'node:path';
import { downloadAndUnzipVSCode, resolveCliPathFromVSCodeExecutablePath } from '@vscode/test-electron';
export async function vscodePaths() {
  const executable=process.env.VSCODE_EXECUTABLE_PATH || await downloadAndUnzipVSCode(process.env.VSCODE_VERSION || 'stable');
  const base=path.dirname(executable);
  let app=process.platform==='darwin'?path.resolve(base,'../Resources/app'):path.resolve(base,'resources/app');
  const hasGrammars=dir=>fs.existsSync(path.join(dir,'extensions/typescript-basics/package.json'));
  // Windows distributions can place application resources beneath a versioned directory.
  // Discover that root rather than assuming it always sits beside the launcher.
  if(!hasGrammars(app)) {
    const seen=[];
    function find(dir,depth) {
      if(hasGrammars(dir))return dir;
      if(depth===0)return;
      for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
        if(!entry.isDirectory()||['node_modules','extensions','locales','.git','data'].includes(entry.name))continue;
        const next=path.join(dir,entry.name);if(seen.length<100)seen.push(path.relative(base,next));
        const found=find(next,depth-1);if(found)return found;
      }
    }
    app=find(base,5);if(!app)throw new Error(`Cannot locate VS Code application resources. Directories: ${JSON.stringify(seen)}`);
  }
  // 1.85's official CLI wrapper requires this vendor startup flag in node mode.
  const wrappers=[resolveCliPathFromVSCodeExecutablePath(executable),path.join(app,'bin',process.platform==='win32'?'code.cmd':'code')];
  const wrapper=wrappers.find(file=>fs.existsSync(file));
  const cliFlags=wrapper&&fs.readFileSync(wrapper,'utf8').includes('--ms-enable-electron-run-as-node')?['--ms-enable-electron-run-as-node']:[];
  return {executable,app,extensions:path.join(app,'extensions'),cli:path.join(app,'out/cli.js'),cliFlags};
}
