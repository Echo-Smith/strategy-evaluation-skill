---
name: writing-agent-benchmark
description: Design, validate, run, review, compare, and report reproducible writing-agent evaluations. Use when building public or private writing benchmarks, creating evaluation datasets and Rubrics, running Prompt/Memory/retrieval/tool strategy experiments, producing blind-review workbooks, classifying Badcases, enforcing Holdout or release gates, or adapting a writing product to WABench contracts.
---

# Writing Agent Benchmark

Build an auditable chain from a product decision to frozen evidence, human review, regression results, and a release decision.

## Workflow

### 1. Define the decision

State the candidate change, baseline, primary metrics, guardrails, and promotion criteria. Change one strategy variable per controlled comparison unless the goal is an explicitly frozen combined candidate.

### 2. Inspect existing assets

Locate datasets, prompts, memory rules, source fixtures, model configuration, runners, reviews, and prior reports. Preserve unrelated worktree changes. Read [contract.md](references/contract.md) before creating or mapping records.

### 3. Separate partitions

Use Development for iteration. Use a sealed public or private Holdout only after the candidate is frozen. Keep Red Team and live probes as separate suites. Never tune on Holdout and still describe it as unseen evidence.

### 4. Freeze reproducibility inputs

Record versions or hashes for the dataset, fixtures, Prompt, Memory, model, code, tools, feature flags, and runner. Mark unobserved usage or cost as unavailable; never replace missing evidence with zero.

### 5. Run the real product path

Prefer an Adapter that exercises retrieval, tools, generation, review, and streaming behavior. Save deterministic routing, format, privacy, latency, and tool assertions as checks. Do not silently mix check scores with the five 1–5 Rubric dimensions.

### 6. Review and arbitrate

Blind candidate identity and operational metadata. Record reviewer type, role, mode, time, and label source. Treat hard failures as overriding the weighted average. Read [review-and-release.md](references/review-and-release.md) before summarizing or issuing a release recommendation.

### 7. Diagnose Badcases

Record the observable symptom first, then use runtime evidence to select input, retrieval, Prompt, Memory, tool, model, or interaction as the primary root cause. Do not default every poor output to model failure.

### 8. Protect private data

Keep enterprise sources, raw user inputs, internal Prompt text, credentials, and reversible traces outside public artifacts. Read [privacy.md](references/privacy.md) before exporting a dataset, workbook, report, or repository.

### 9. Produce artifacts

Write the suite/candidate manifests, normalized outputs, review records, regression report, Badcase list, release decision, and rollback conditions. When the WABench repository CLI is available, run:

```bash
npm test
npm run validate
npm run privacy:scan
node scripts/summarize.mjs <reviews.json>
```

## Non-negotiable rules

- Keep public core and private enterprise suites contract-compatible but storage-isolated.
- Keep reviewer acceptance, semantic proxies, and real behavior acceptance separate.
- Exclude failed generation/Judge/tool runs from normal quality means while reporting them in completion and hard-failure metrics.
- Never fabricate reviews, user acceptance, edit burden, latency, cost, or Holdout results.
- Never release on aggregate score alone when a critical hard failure or source-boundary violation exists.
