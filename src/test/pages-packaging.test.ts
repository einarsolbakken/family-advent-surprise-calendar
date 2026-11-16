import { afterEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const script = resolve('scripts/prepare-pages.mjs');
const fixtures: string[] = [];
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'calendar-pages-'));
  fixtures.push(root);
  await mkdir(join(root, '.output/public/assets'), { recursive: true });
  await writeFile(join(root, '.output/public/index.html'), '<main>Calendar</main>');
  await writeFile(join(root, '.output/public/assets/calendar.js'), 'calendar');
  return root;
}
afterEach(async () => { await Promise.all(fixtures.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe('GitHub Pages packaging', () => {
  it('copies public output and navigation fallbacks without the server bundle', async () => {
    const root = await fixture();
    await mkdir(join(root, '.output/server'), { recursive: true });
    await writeFile(join(root, '.output/server/index.mjs'), 'private server');
    execFileSync('node', [script], { cwd: root });
    expect(await readFile(join(root, 'dist/client/index.html'), 'utf8')).toBe('<main>Calendar</main>');
    expect(await readFile(join(root, 'dist/client/404.html'), 'utf8')).toBe('<main>Calendar</main>');
    expect(await readFile(join(root, 'dist/client/admin/index.html'), 'utf8')).toBe('<main>Calendar</main>');
    expect(await readFile(join(root, 'dist/client/assets/calendar.js'), 'utf8')).toBe('calendar');
    await expect(access(join(root, 'dist/client/server'))).rejects.toThrow();
  });
  it('refuses nested environment files before preparing an artifact', async () => {
    const root = await fixture();
    await writeFile(join(root, '.output/public/assets/.env'), 'not for publication');
    expect(() => execFileSync('node', [script], { cwd: root, stdio: 'pipe' })).toThrow();
    await expect(access(join(root, 'dist/client'))).rejects.toThrow();
  });
});