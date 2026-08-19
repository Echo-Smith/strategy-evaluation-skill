# WABench contract guide

Use WABench Schema v1 records for suites, cases, source fixtures, candidates, runs, outputs, reviews, outcomes, regression reports, and release decisions.

## Core enums

- Task: `topic | writing | polish | dedupe | abnormal`
- Partition: `development | public_holdout | private_holdout | red_team | live_probe`
- Expected behavior: `answer | clarify | refuse | degrade`
- Reviewer: `human | model | rule`
- Traffic: `user | smoke | replay`
- Cost status: `observed | estimated | unavailable`

## Adapter boundary

```text
prepare(case, candidate) -> productRequest
execute(productRequest) -> rawTrace
normalize(rawTrace) -> WABench output
collectOutcome(traceId) -> WABench outcome[]
```

An Adapter owns product-specific execution. The benchmark owns the canonical records, Rubric, checks, aggregation, and release evidence.

## Scoring

Use five 1–5 scores: task compliance, source fidelity, structure and reasoning, style consistency, and direct usability. Task-specific weights must total 100. Deterministic checks may add evidence or trigger gates but must not be silently averaged with subjective scores.
