# WritingAgentBench

WritingAgentBench is a reproducible benchmark for writing agents. It evaluates more than prose quality: task and source constraints, tool traces, five rubric dimensions, hard failures, human acceptance, edit burden, latency, cost availability, and release gates.

> The public core supports reproducibility and comparison. Private enterprise suites support real business decisions. They share one protocol without sharing private data.

[中文](./README.md) · [Public core](./benchmark/public-core/DATASET_CARD.en.md) · [Methodology](./docs/methodology.en.md) · [Private extensions](./docs/private-extension.md) · [Skill](./skill/writing-agent-benchmark/SKILL.md)

## Product case: evaluation changed Luminbuddy's defaults

Luminbuddy tested two meaningful product strategies on frozen, paired samples instead of relying on a single aggregate score.

| Decision | Evidence | Product action |
| --- | --- | --- |
| Source-evidence gate | Holdout pass rate 75% → 100%; hard failures 18.8% → 0%; acceptance 75% → 100% | Enabled by default with a rollback flag |
| Personal style memory | Pass and acceptance fell from 93.8% to 87.5%; two hard failures appeared | Disabled by default; explicit opt-in only |
| Lexiang-only routing | 24/24 runs used Lexiang with `knowledgeOnly=true`; zero web-search false triggers | Added routing regression and production monitoring |

Only aggregate, privacy-safe evidence is public. Enterprise sources, raw traces, internal prompts, and private Holdouts remain inside Luminbuddy.

## Why it is different

- Writing-native tasks: topic ideation, drafting, polishing, deduplication, and abnormal inputs.
- Quality and reliability are separate: subjective 1–5 scores never silently mix with deterministic checks.
- Hard failures override averages.
- Human review and arbitration are first-class records.
- A public core and private enterprise suites share one contract.
- Reports connect quality to acceptance, edit burden, latency, cost availability, failures, and release decisions.

## Quick start

```bash
npm test
npm run validate
npm run privacy:scan
node scripts/summarize.mjs benchmark/examples/reviews.valid.json
```

Product integrations implement a small Adapter contract:

```text
prepare(case, candidate) -> productRequest
execute(productRequest) -> rawTrace
normalize(rawTrace) -> WABench output
collectOutcome(traceId) -> WABench outcome[]
```

This release contains a 72-case public core, 20 synthetic source fixtures, the protocol, rubric, taxonomy, CLI, and Skill. Luminbuddy private suites expose only their interface and aggregate methodology; raw records never enter this repository.

## License

[MIT](./LICENSE)
