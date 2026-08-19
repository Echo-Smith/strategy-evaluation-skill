import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { readJson, validateValue } from '../scripts/lib/schema-validator.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJsonl = async file => (await fs.readFile(file, 'utf8')).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const normalize = value => String(value).toLowerCase().replace(/[\p{P}\p{S}\s]/gu, '');

test('public core contains 60-100 unique synthetic cases that satisfy WABench v1', async () => {
  const [cases, schema, suite] = await Promise.all([
    readJsonl(path.join(root, 'benchmark/public-core/cases.v1.jsonl')),
    readJson(path.join(root, 'schemas/case.schema.json')),
    readJson(path.join(root, 'benchmark/public-core/suite-manifest.v1.json')),
  ]);
  assert.ok(cases.length >= 60 && cases.length <= 100);
  assert.equal(new Set(cases.map(item => item.caseId)).size, cases.length);
  assert.equal(new Set(cases.map(item => normalize(item.input))).size, cases.length);
  assert.deepEqual(new Set(cases.map(item => item.taskType)), new Set(['topic', 'writing', 'polish', 'dedupe', 'abnormal']));
  assert.ok(cases.every(item => item.privacyLevel === 'synthetic'));
  assert.deepEqual(suite.caseRefs, cases.map(item => item.caseId));
  for (const item of cases) {
    assert.deepEqual(validateValue(item, schema), [], item.caseId);
    assert.equal(Object.values(item.rubricWeights).reduce((sum, value) => sum + value, 0), 100, item.caseId);
  }
});

test('frozen cases reference only published synthetic fixtures', async () => {
  const [cases, fixtures, fixtureSchema] = await Promise.all([
    readJsonl(path.join(root, 'benchmark/public-core/cases.v1.jsonl')),
    readJsonl(path.join(root, 'benchmark/public-core/source-fixtures.v1.jsonl')),
    readJson(path.join(root, 'schemas/source-fixture.schema.json')),
  ]);
  const ids = new Set(fixtures.map(item => item.fixtureId));
  assert.ok(fixtures.length > 0);
  fixtures.forEach(item => {
    assert.deepEqual(validateValue(item, fixtureSchema), [], item.fixtureId);
    assert.equal(item.sourceType, 'simulated_knowledge_base');
    assert.equal(item.privacyLevel, 'public');
    assert.equal(item.metadata.synthetic, true);
  });
  cases.filter(item => item.sourceMode === 'frozen').forEach(item => {
    assert.ok(item.sourceFixtureRefs.length > 0, item.caseId);
    item.sourceFixtureRefs.forEach(ref => assert.ok(ids.has(ref), `${item.caseId}:${ref}`));
  });
});

test('audit report documents deduplication and publication exclusions', async () => {
  const audit = await readJson(path.join(root, 'benchmark/public-core/audit-report.v1.json'));
  assert.equal(audit.sourceInventory.syntheticStrategyCases, 80);
  assert.equal(audit.sourceInventory.duplicateInputsRemoved, 8);
  assert.equal(audit.sourceInventory.legacyWritingSeedsAudited, 65);
  assert.equal(audit.publicCore.caseCount, 72);
  assert.ok(audit.exclusions.some(value => value.includes('real-user')));
});
