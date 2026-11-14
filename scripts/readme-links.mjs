import path from 'node:path';
export const repository='https://github.com/ExMikuPro/sakura-white-vscode-theme';
// Same image/content bases as VSCE's --githubBranch main. Only local Markdown links change.
export function rewriteReadmeLinks(markdown) {
  return markdown.replace(/(!?)\[([^\]]*)\]\((?![a-z][a-z\d+.-]*:|#)([^)]+)\)/gi,(_,image,label,target)=>`${image}[${label}](${repository}/${image?'raw':'blob'}/main/${path.posix.normalize(target)})`);
}
