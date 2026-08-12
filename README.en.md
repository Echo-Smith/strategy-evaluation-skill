# Strategy Evaluation Skill

A reusable evaluation toolkit for writing assistants. It helps teams compare Prompt, Memory, retrieval, tool, and interaction strategies, then make release decisions using blind review, real-user acceptance, Holdout validation, and regression gates.

## Contents

- `skill/SKILL.md`: the Codex/Agent Strategy Evaluation Skill.
- `skill/agents/openai.yaml`: UI metadata for the Skill.
- `docs/strategy-evaluation-sop.md`: Chinese SOP.
- `docs/strategy-evaluation-sop.en.md`: English SOP.
- `README.md`: Chinese overview.

## Core workflow

Define the data contract → freeze Rubric and Badcase taxonomy → run paired strategy experiments → generate a Chinese blind-review workbook → import real-user acceptance → freeze the candidate → run Holdout → release or roll back.

## Use cases

- Prompt or Memory A/B comparisons
- Retrieval and evidence-gate evaluation
- One-pass generation vs research—write—review workflows
- Topic selection, writing, polishing, deduplication, and abnormal-input evaluation
- Lexiang/IMA knowledge-source routing regression

## Principles

- Use Development for strategy selection and Holdout for generalization.
- Change one strategy variable per experiment.
- Keep reviewer acceptance separate from real-user acceptance.
- Hard failures override aggregate scores.
- Never fabricate missing evaluation or user data.
- Keep private knowledge-base content, credentials, Prompts, and model configuration out of public reports.

## Using the Skill

Install the `skill/` directory into your Agent Skill directory and invoke it with `$strategy-evaluation`.

See the [Chinese SOP](docs/strategy-evaluation-sop.md) or [English SOP](docs/strategy-evaluation-sop.en.md).

## License

MIT
