import { copyFile, mkdir, access, writeFile, rm, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const output = 'dist/client';
await access(join(output, 'index.html'));
// Never ship the server bundle, build metadata, or credentials to Pages.
await rm(join(output, '.lovable'), { recursive: true, force: true });
await writeFile(join(output, '.nojekyll'), '');
await copyFile(join(output, 'index.html'), join(output, '404.html'));
await mkdir(join(output, 'admin'), { recursive: true });
await copyFile(join(output, 'index.html'), join(output, 'admin/index.html'));
const entries = await readdir(output);
if (entries.some((name) => name === '.env' || name === 'server')) throw new Error('Unsafe Pages output');
console.log(`Pages artifact ready: ${output}`);