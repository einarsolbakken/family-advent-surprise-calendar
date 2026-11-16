import { copyFile, cp, mkdir, access, writeFile, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = '.output/public';
const output = 'dist/client';
await access(join(source, 'index.html'));
async function checkPublicFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.lovable') continue;
    if (entry.isSymbolicLink() || entry.name.startsWith('.env') || ['server', '_worker.js', 'wrangler.json', 'nitro.json'].includes(entry.name)) {
      throw new Error('Unsafe Pages output');
    }
    if (entry.isDirectory()) await checkPublicFiles(join(directory, entry.name));
  }
}
await checkPublicFiles(source);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true, filter: (path) => !['.lovable', '_headers'].includes(path.split(/[\\/]/).pop()) });
// Never ship the server bundle, build metadata, or credentials to Pages.
await writeFile(join(output, '.nojekyll'), '');
await copyFile(join(output, 'index.html'), join(output, '404.html'));
await mkdir(join(output, 'admin'), { recursive: true });
await copyFile(join(output, 'index.html'), join(output, 'admin/index.html'));
console.log(`Pages artifact ready: ${output}`);