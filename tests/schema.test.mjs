import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {readJson, validateValue} from '../scripts/lib/schema-validator.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
  ['suite-manifest.valid.json', 'suite-manifest'], ['case.valid.json', 'case'],
  ['source-fixture.valid.json', 'source-fixture'], ['candidate-manifest.valid.json', 'candidate-manifest'],
  ['run.valid.json', 'run'], ['output.valid.json', 'output'], ['outcome.valid.json', 'outcome'],
  ['regression-report.valid.json', 'regression-report'], ['release-decision.valid.json', 'release-decision']
];

for (const [file, schemaName] of pairs) {
  test(`${file} satisfies ${schemaName} schema`, async () => {
    const [data, schema] = await Promise.all([
      readJson(path.join(root, 'benchmark/examples', file)),
      readJson(path.join(root, 'schemas', `${schemaName}.schema.json`))
    ]);
    assert.deepEqual(validateValue(data, schema), []);
  });
}

test('every review satisfies the review schema', async () => {
  const [reviews, schema] = await Promise.all([
    readJson(path.join(root, 'benchmark/examples/reviews.valid.json')),
    readJson(path.join(root, 'schemas/review.schema.json'))
  ]);
  reviews.forEach(review => assert.deepEqual(validateValue(review, schema), []));
});

test('invalid case reports field-level enum errors', async () => {
  const [data, schema] = await Promise.all([
    readJson(path.join(root, 'benchmark/examples/invalid/case.invalid.json')),
    readJson(path.join(root, 'schemas/case.schema.json'))
  ]);
  const errors = validateValue(data, schema);
  assert.ok(errors.some(error => error.includes('$.taskType')));
  assert.ok(errors.some(error => error.includes('$.expectedBehavior')));
  assert.ok(errors.some(error => error.includes('$.privacyLevel')));
});

test('deterministic checks cannot inject an undeclared numeric score', async () => {
  const [output, schema] = await Promise.all([
    readJson(path.join(root, 'benchmark/examples/output.valid.json')),
    readJson(path.join(root, 'schemas/output.schema.json'))
  ]);
  output.checks[0].score = 0.9;
  const errors = validateValue(output, schema);
  assert.ok(errors.some(error => error.includes('additional property')));
});
