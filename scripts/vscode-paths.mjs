import path from 'node:path';
import { downloadAndUnzipVSCode } from '@vscode/test-electron';
export async function vscodePaths() {
  const executable=process.env.VSCODE_EXECUTABLE_PATH || await downloadAndUnzipVSCode(process.env.VSCODE_VERSION || 'stable');
  const app=process.platform==='darwin'?path.resolve(path.dirname(executable),'../Resources/app'):path.resolve(path.dirname(executable),'resources/app');
  return {executable,app,extensions:path.join(app,'extensions'),cli:path.join(app,'out/cli.js')};
}
