#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertRubric, DIMENSIONS} from './lib/scoring.mjs';
import {readJson, validateValue} from './lib/schema-validator.mjs';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(process.argv[2] || defaultRoot);
const schemaDir = path.join(root, 'schemas');
const examplesDir = path.join(root, 'benchmark/examples');
const errors = [];

const contracts = [
  'suite-manifest', 'case', 'source-fixture', 'candidate-manifest', 'run',
  'output', 'review', 'outcome', 'regression-report', 'release-decision'
];

const schemas = {};
for (const name of contracts) {
  const schemaPath = path.join(schemaDir, `${name}.schema.json`);
  try {
    schemas[name] = await readJson(schemaPath);
  } catch (error) {
    errors.push(`${name}: missing or invalid schema (${error.message})`);
  }
}

const examples = [
  ['suite-manifest.valid.json', 'suite-manifest'],
  ['case.valid.json', 'case'],
  ['source-fixture.valid.json', 'source-fixture'],
  ['candidate-manifest.valid.json', 'candidate-manifest'],
  ['run.valid.json', 'run'],
  ['output.valid.json', 'output'],
  ['outcome.valid.json', 'outcome'],
  ['regression-report.valid.json', 'regression-report'],
  ['release-decision.valid.json', 'release-decision']
];

const loadedExamples = {};
for (const [file, schemaName] of examples) {
  try {
    const record = await readJson(path.join(examplesDir, file));
    loadedExamples[schemaName] = record;
    for (const error of validateValue(record, schemas[schemaName])) errors.push(`${file}: ${error}`);
  } catch (error) {
    errors.push(`${file}: missing or invalid JSON (${error.message})`);
  }
}

try {
  const reviews = await readJson(path.join(examplesDir, 'reviews.valid.json'));
  if (!Array.isArray(reviews) || reviews.length === 0) errors.push('reviews.valid.json: must contain at least one review');
  else reviews.forEach((review, index) => validateValue(review, schemas.review).forEach(error => errors.push(`reviews.valid.json[${index}]: ${error}`)));
} catch (error) {
  errors.push(`reviews.valid.json: missing or invalid JSON (${error.message})`);
}

try {
  const rubric = await readJson(path.join(root, 'benchmark/rubrics/core-rubric.v1.json'));
  errors.push(...assertRubric(rubric).map(error => `rubric: ${error}`));
  if (JSON.stringify(Object.keys(rubric.dimensions).sort()) !== JSON.stringify([...DIMENSIONS].sort())) {
    errors.push('rubric: dimensions must exactly match WABench core dimensions');
  }
} catch (error) {
  errors.push(`rubric: missing or invalid JSON (${error.message})`);
}

try {
  const taxonomy = await readJson(path.join(root, 'benchmark/taxonomies/root-causes.v1.json'));
  const expected = ['input', 'retrieval', 'prompt', 'memory', 'tool', 'model', 'interaction'];
  const actual = (taxonomy.rootCauses || []).map(item => item.id);
  if (JSON.stringify(actual) !== JSON.stringify(expected)) errors.push(`taxonomy: expected ${expected.join(', ')}`);
} catch (error) {
  errors.push(`taxonomy: missing or invalid JSON (${error.message})`);
}

const suite = loadedExamples['suite-manifest'];
const exampleCase = loadedExamples.case;
const fixture = loadedExamples['source-fixture'];
if (suite && exampleCase && !suite.caseRefs.includes(exampleCase.caseId)) errors.push('cross-reference: suite must reference the example case');
if (exampleCase?.sourceMode === 'frozen' && !exampleCase.sourceFixtureRefs.length) errors.push('cross-reference: frozen case requires source fixture refs');
if (exampleCase && fixture && !exampleCase.sourceFixtureRefs.includes(fixture.fixtureId)) errors.push('cross-reference: case must reference the example fixture');
if (exampleCase?.rubricWeights) {
  const total = Object.values(exampleCase.rubricWeights).reduce((sum, weight) => sum + weight, 0);
  if (total !== 100) errors.push(`case: rubric weights total ${total}, expected 100`);
}

try {
  const skill = await fs.readFile(path.join(root, 'skill/writing-agent-benchmark/SKILL.md'), 'utf8');
  if (!skill.startsWith('---\nname: writing-agent-benchmark\n')) errors.push('skill: invalid or missing frontmatter');
  if (/\bTODO\b/.test(skill)) errors.push('skill: TODO placeholder remains');
} catch (error) {
  errors.push(`skill: missing (${error.message})`);
}

if (errors.length) {
  console.error(`WABench validation failed with ${errors.length} issue(s):`);
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`WABench validation passed: ${contracts.length} schemas, ${examples.length + 1} example groups, Rubric, taxonomy, and Skill.`);
