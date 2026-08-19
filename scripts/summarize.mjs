#!/usr/bin/env node
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJson} from './lib/schema-validator.mjs';
import {assertRubric, summarizeReviews} from './lib/scoring.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/summarize.mjs <reviews.json>');
  process.exit(2);
}

const [input, rubric] = await Promise.all([
  readJson(path.resolve(inputPath)),
  readJson(path.join(repoRoot, 'benchmark/rubrics/core-rubric.v1.json'))
]);
const rubricErrors = assertRubric(rubric);
if (rubricErrors.length) throw new Error(rubricErrors.join('\n'));
const reviews = Array.isArray(input) ? input : input.reviews;
if (!Array.isArray(reviews)) throw new Error('Input must be an array of reviews or an object with reviews[]');
console.log(JSON.stringify(summarizeReviews(reviews, rubric), null, 2));
