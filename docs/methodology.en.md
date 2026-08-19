# WritingAgentBench methodology

## Principles

1. Freeze the suite, candidate configuration, and runner before comparison.
2. Use Development for tuning and Holdout for decisions.
3. Keep the five subjective dimensions on a 1–5 scale; store deterministic rules as checks.
4. Let hard failures override averages.
5. Treat model judges as prechecks or independent reviewers, never as silent substitutes for human arbitration.
6. Mark unobserved usage, cost, and behavior as unavailable or unknown.

## Five dimensions

- Task compliance
- Source fidelity
- Structure and reasoning
- Style consistency
- Direct usability

The default pass rule is: weighted score at least 80, task compliance and source fidelity both at least 4, and no hard failure.

## Workflow

Define the decision, freeze evidence, run the real product path, produce blind review material, review and arbitrate, summarize quality and operational metrics, rerun on an independent Holdout, then record the release decision and rollback conditions.

Public reports contain versions, coverage, aggregate metrics, privacy-safe examples, and decision rationale. Raw enterprise sources, user inputs, internal prompts, credentials, and reversible traces stay private.
