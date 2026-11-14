import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVSIX } from '@vscode/vsce';
import { rewriteReadmeLinks } from './readme-links.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8'));
const stage=await fs.mkdtemp(path.join(os.tmpdir(),'sakura-white-package-'));
try {
  // Keep the source tree untouched. VSCE rewrites only its primary README, so normalize
  // the translated README in the disposable staging tree. Images stay in GitHub.
  const files=['package.json','.vscodeignore','README.md','README.zh-CN.md','CHANGELOG.md','LICENSE','THIRD_PARTY_NOTICES.md',manifest.icon,...manifest.contributes.themes.map(t=>t.path)];
  for(const file of files){const target=path.join(stage,file);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(root,file),target);}
  const translated=path.join(stage,'README.zh-CN.md');await fs.writeFile(translated,rewriteReadmeLinks(await fs.readFile(translated,'utf8')));
  await fs.mkdir(path.join(root,'dist'),{recursive:true});
  await createVSIX({cwd:stage,packagePath:path.join(root,'dist',`${manifest.name}-${manifest.version}.vsix`),dependencies:false,githubBranch:'main'});
} finally {await fs.rm(stage,{recursive:true,force:true});}
