# Review and release guide

## Blind review

Hide candidate identity, model label, Prompt configuration, latency, cost, and prior scores. Retain only information required to judge the task and its allowed sources.

For each review, record reviewer alias, reviewer type, role, review mode, reviewed time, tag source, five scores, acceptance label, modification burden, hard failures, symptoms, root causes, and evidence notes.

## Default release gate

- Weighted score at least 80.
- Task compliance at least 4.
- Source fidelity at least 4.
- No hard failure.
- No regression beyond the declared acceptance, edit-burden, reliability, latency, or cost guardrails.

Failed generation, Judge, retrieval, or tools remain reliability failures. Do not convert them into ordinary zero-score writing samples.

## Arbitration

Arbitrate when reviewers differ by two or more points on a dimension, disagree on pass/fail, disagree on hard failures, or assign incompatible root causes. Preserve original reviews and create a separate arbitration record.
