---
name: strategy-evaluation
description: Run controlled Prompt, Memory, retrieval, tool, and interaction strategy evaluations for writing assistants. Use when creating or reviewing evaluation sets, generating paired blind-review workbooks, importing reviewer and real-user acceptance data, running Holdout gates, producing regression reports, or checking explicit knowledge-base source routing.
---

# Strategy Evaluation

Use this skill to run a reproducible strategy evaluation from frozen cases to a release decision. The human-facing Chinese SOP is at `docs/evaluation/strategy-evaluation-sop.md`; the English SOP is at `docs/evaluation/strategy-evaluation-sop.en.md`.

## Operating rules

- Treat the evaluation set, source fixtures, Prompt/Memory configuration, model configuration, and runner as versioned evidence.
- Keep development and Holdout partitions separate. Never score Holdout with a changed candidate and call it a frozen comparison.
- Change one strategy variable per paired experiment. Randomize outputs as `方案甲` and `方案乙` before human review.
- Never fabricate reviewer scores, real-user acceptance, or Holdout results. If data is missing, report it as missing.
- Keep reviewer acceptance separate from real-user acceptance.
- Hard failures override aggregate scores.
- Do not expose private source text, credentials, prompts, or model configuration in blind packets or public reports.

## Workflow

### 1. Inspect the project

Read the current evaluation manifest, Rubric, Badcase taxonomy, and existing reports. Check `FILE_INDEX.md` before adding files. Preserve unrelated worktree changes.

### 2. Validate or generate assets

Use the project scripts when available:

- `npm run eval:validate`
- `npm run eval:generate-strategy`
- `npm run eval:run-strategy -- --partition development ...`

For a new strategy, create a manifest that identifies the changed Prompt/Memory/tool variable and keeps all other variables fixed.

### 3. Run the development experiment

Run paired outputs with retrieval and post-write review settings defined by the experiment manifest. Store raw outputs privately, then generate a blind packet that removes model, arm, Prompt, and run metadata.

### 4. Generate the Chinese workbook

Build the workbook with four sheets:

- `评测进度`
- `方案评分`
- `成对选择`
- `填写说明与评分标准`

Use yellow cells for human input, Chinese dropdowns, frozen panes, progress formulas, and a formula-error scan. Do not ask reviewers to re-enter the cases into the writing assistant.

### 5. Import and summarize

Normalize the workbook into review records. Treat literal `50` or other known spreadsheet filler as empty input; never classify it as a root cause or note. Validate row completeness and output hashes before summarizing.

Report at minimum:

- pass rate and weighted score;
- five rubric means;
- reviewer acceptance and real-user acceptance;
- average edit burden;
- hard-failure rate;
- paired wins and paired pass outcomes;
- normalized root causes;
- treatment-minus-control deltas.

### 6. Freeze and run Holdout

Write a candidate-freeze record with hashes for cases, fixtures, Prompt, Memory, runner, and manifest. Only after the freeze, run the sealed Holdout partition and produce a new blind workbook. Wait for human completion before making a final release recommendation.

### 7. Evaluate explicit knowledge-source routing

For messages containing `乐享知识库`, `知识库`, `IMA 知识库`, or equivalent explicit source instructions, assert:

- the expected provider is selected;
- `knowledgeOnly` is true;
- the requested query is stripped of source-control words;
- web search is not called;
- supplemental web retrieval is not called;
- SSE reports a `kb` event with provider and no `websearch` event;
- the Agent trace records the decision reason.

Prefer a deterministic source router for explicit source selection. Use constrained ReAct only when the product explicitly authorizes a multi-step fallback or asks the user before changing sources.

### 8. Release gate

Release only if the Holdout result is no worse than the baseline on the agreed gates, no critical hard failure is introduced, real-user acceptance does not regress, regression tests pass, and evaluation assets validate. Otherwise keep the candidate frozen, revise the strategy in a new experiment, or roll back.

## Output checklist

Before handing off, verify that the following are on disk:

- evaluation manifest and frozen source records;
- raw outputs and blind packet in the private evaluation area;
- Chinese reviewer workbook;
- normalized reviewer import;
- JSON and Markdown report;
- candidate-freeze or release decision record;
- regression test output;
- short retrospective describing what changed and what was learned.
