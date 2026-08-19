import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {readJson} from '../scripts/lib/schema-validator.mjs';
import {assertRubric, scoreReview, summarizeReviews} from '../scripts/lib/scoring.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rubric = await readJson(path.join(root, 'benchmark/rubrics/core-rubric.v1.json'));
const reviews = await readJson(path.join(root, 'benchmark/examples/reviews.valid.json'));

test('rubric task weights are complete and total 100', () => {
  assert.deepEqual(assertRubric(rubric), []);
});

test('weighted score uses only the five 1-5 dimensions', () => {
  const result = scoreReview(reviews[0], rubric, 'writing');
  assert.equal(result.weightedTotal, 94);
  assert.equal(result.passed, true);
});

test('a hard failure overrides a passing aggregate score', () => {
  const review = structuredClone(reviews[0]);
  review.hardFailures = ['fact.fabricated_key_detail'];
  const result = scoreReview(review, rubric, 'writing');
  assert.ok(result.weightedTotal >= 80);
  assert.equal(result.hardFailure, true);
  assert.equal(result.passed, false);
});

test('summary keeps acceptance and modification burden explicit', () => {
  const summary = summarizeReviews(reviews, rubric);
  assert.equal(summary.reviewCount, 2);
  assert.equal(summary.passCount, 1);
  assert.equal(summary.hardFailureCount, 1);
  assert.equal(summary.acceptance.acceptanceRate, 0.5);
  assert.equal(summary.averageModificationBurden, 1);
  assert.deepEqual(summary.primaryRootCauses, {prompt: 1});
});
