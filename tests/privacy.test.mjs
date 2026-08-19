import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {privacyScan} from '../scripts/lib/privacy.mjs';

test('privacy scanner accepts a redacted aggregate record', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wabench-safe-'));
  await fs.writeFile(path.join(root, 'report.json'), JSON.stringify({passRate: 0.9, inputHash: `sha256:${'a'.repeat(64)}`}));
  assert.deepEqual(await privacyScan(root), []);
});

test('privacy scanner blocks raw inputs and credential files', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wabench-unsafe-'));
  await fs.writeFile(path.join(root, 'trace.json'), JSON.stringify({rawInput: 'private user text'}));
  await fs.writeFile(path.join(root, '.env'), 'EXAMPLE_SECRET=redacted');
  const errors = await privacyScan(root);
  assert.ok(errors.some(error => error.includes('rawInput')));
  assert.ok(errors.some(error => error.includes('forbidden public file type')));
});

test('privacy scanner blocks long source excerpts', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wabench-source-'));
  await fs.writeFile(path.join(root, 'fixture.json'), JSON.stringify({excerpt: 'x'.repeat(1201)}));
  const errors = await privacyScan(root);
  assert.ok(errors.some(error => error.includes('source excerpt exceeds')));
});
