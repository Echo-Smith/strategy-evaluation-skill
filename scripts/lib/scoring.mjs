export const DIMENSIONS = ['taskCompliance', 'sourceFidelity', 'structureReasoning', 'styleConsistency', 'directUsability'];

export function assertRubric(rubric) {
  const errors = [];
  if (!rubric || rubric.version !== 'core-rubric.v1') errors.push('rubric.version must be core-rubric.v1');
  for (const dimension of DIMENSIONS) {
    if (!rubric?.dimensions?.[dimension]) errors.push(`missing dimension ${dimension}`);
  }
  for (const [taskType, weights] of Object.entries(rubric?.taskWeights || {})) {
    const unknown = Object.keys(weights).filter(key => !DIMENSIONS.includes(key));
    if (unknown.length) errors.push(`${taskType}: unknown dimensions ${unknown.join(', ')}`);
    const total = DIMENSIONS.reduce((sum, dimension) => sum + (weights[dimension] || 0), 0);
    if (total !== 100) errors.push(`${taskType}: weights total ${total}, expected 100`);
    for (const mandatory of ['taskCompliance', 'sourceFidelity', 'directUsability']) {
      if (!(weights[mandatory] > 0)) errors.push(`${taskType}: ${mandatory} must have positive weight`);
    }
  }
  const hardIds = (rubric?.hardFailures || []).map(item => item.id);
  if (new Set(hardIds).size !== hardIds.length) errors.push('hard failure ids must be unique');
  return errors;
}

export function scoreReview(review, rubric, taskType = 'writing') {
  const weights = rubric.taskWeights[taskType];
  if (!weights) throw new Error(`unknown task type: ${taskType}`);
  for (const dimension of DIMENSIONS) {
    const score = review.scores?.[dimension];
    if (typeof score !== 'number' || score < 1 || score > 5) throw new Error(`${dimension} must be between 1 and 5`);
  }
  const weightedTotal = DIMENSIONS.reduce((total, dimension) => total + (review.scores[dimension] / 5) * weights[dimension], 0);
  const hardFailure = (review.hardFailures || []).length > 0;
  const minimums = rubric.passRule.minimumDimensionScores;
  const passed = weightedTotal >= rubric.passRule.minimumTotal
    && Object.entries(minimums).every(([dimension, minimum]) => review.scores[dimension] >= minimum)
    && (!rubric.passRule.requiresNoHardFailure || !hardFailure);
  return {weightedTotal: Number(weightedTotal.toFixed(2)), hardFailure, passed};
}

function mean(values) {
  return values.length ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3)) : null;
}

function counts(values) {
  return values.reduce((result, value) => ({...result, [value]: (result[value] || 0) + 1}), {});
}

export function summarizeReviews(reviews, rubric) {
  const scored = reviews.map(review => ({review, result: scoreReview(review, rubric, review.taskType || 'writing')}));
  const accepted = reviews.filter(review => ['direct_use', 'light_edit'].includes(review.acceptance));
  const knownAcceptance = reviews.filter(review => review.acceptance !== 'unknown');
  return {
    reportVersion: 'wabench-summary.v1',
    rubricVersion: rubric.version,
    reviewCount: reviews.length,
    passCount: scored.filter(item => item.result.passed).length,
    passRate: reviews.length ? scored.filter(item => item.result.passed).length / reviews.length : null,
    weightedScoreMean: mean(scored.map(item => item.result.weightedTotal)),
    dimensionMeans: Object.fromEntries(DIMENSIONS.map(dimension => [dimension, mean(reviews.map(review => review.scores[dimension]))])),
    hardFailureCount: scored.filter(item => item.result.hardFailure).length,
    hardFailureRate: reviews.length ? scored.filter(item => item.result.hardFailure).length / reviews.length : null,
    acceptance: {
      counts: counts(reviews.map(review => review.acceptance)),
      knownCount: knownAcceptance.length,
      acceptanceRate: knownAcceptance.length ? accepted.length / knownAcceptance.length : null
    },
    averageModificationBurden: mean(reviews.map(review => review.modificationBurden).filter(value => Number.isInteger(value))),
    primaryRootCauses: counts(reviews.map(review => review.primaryRootCause).filter(Boolean)),
    generatedAt: new Date().toISOString()
  };
}
