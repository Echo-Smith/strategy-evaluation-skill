# Strategy Evaluation SOP for BiRunZhiTan

## Purpose

Use this SOP when comparing a new Prompt, Memory, retrieval, tool, or interaction strategy. The goal is not to prove that one model is always better, but to decide whether a controlled strategy is ready for release using the same tasks, the same rubric, and real user feedback.

## 1. End-to-end workflow

```text
Define the data contract
  → freeze the Rubric and Badcase taxonomy
  → generate and freeze cases and source fixtures
  → run paired strategy experiments
  → generate the Chinese blind-review workbook
  → collect reviewer scores and real-user acceptance
  → import, validate, and summarize
  → freeze the candidate
  → run Holdout
  → release, iterate, or roll back
```

## 2. Evaluation set

Each case contains a task type, user input, expected behavior, frozen source material, difficulty, risk tags, rubric rules, and hard-failure rules.

The formal set is split into:

- Development: 48 pairs / 96 outputs for strategy selection and Badcase discovery;
- Holdout: 32 pairs / 64 outputs for generalization testing.

Holdout is only opened after the candidate is frozen. Do not tune the candidate based on Holdout results and then reuse the same results as evidence.

## 3. Rubric and Badcase taxonomy

Score every output from 1 to 5 on:

1. Task compliance;
2. Factual verifiability;
3. Structure and reasoning;
4. Style consistency;
5. Direct usability.

Also record acceptance level, hard failure, failure type, primary/secondary root cause, estimated edit burden, and notes.

The seven root-cause classes are input, retrieval, Prompt, Memory, tool, model, and interaction. Hard failures cannot be averaged away, such as fabricated key facts, presenting future events as completed, changing the original meaning, or leaking private information.

## 4. Paired experiment

Generate two outputs for each case and change only one strategy variable. Examples:

- generic Prompt vs structured personal-style Memory;
- no source constraint vs evidence gate;
- one-pass generation vs research—write—review.

Randomize the outputs as Chinese labels “方案甲” and “方案乙”. Reviewers must not infer the strategy identity from the label.

## 5. Workbook review

Reviewers fill only yellow cells.

In **方案评分 / Output Scoring**, score the five dimensions and fill acceptance, hard failure, root cause, edit burden, and notes.

In **成对选择 / Pair Choice**, compare the two outputs for the same case and record the preferred option, rationale, and real-user acceptance for each option.

Reviewer acceptance and real-user acceptance are separate metrics. If there is no real-user feedback, select “未收集” instead of guessing.

## 6. Report and decision

The importer calculates pass rate, weighted score, rubric means, reviewer acceptance, real-user acceptance, edit burden, hard-failure rate, pairwise wins, root causes, and treatment-vs-control deltas.

The candidate should be released only when Holdout does not regress the baseline, hard failures do not increase, real-user acceptance does not fall, edit burden does not worsen, high-risk slices pass, and regression/asset validation is green.

## 7. Knowledge-source routing regression

For explicit requests such as “use Lexiang Knowledge Base”, “use the knowledge base”, or “use IMA Knowledge Base”, verify that:

1. The correct provider is selected;
2. Only the requested knowledge provider is called;
3. Web search and supplemental web search are skipped;
4. The SSE `kb` event contains the provider;
5. The Agent trace records the source decision.

Use a deterministic source router for explicit source selection. Consider constrained ReAct only for an authorized multi-step fallback such as asking the user before going online after a knowledge-base miss.

IMA and Lexiang remain separate, coexisting providers. `KNOWLEDGE_PROVIDER` only selects the default for a generic “knowledge base” request: set it to `ima` for IMA or `lexiang` for Lexiang. An explicit “IMA” or “Lexiang” request overrides that default.

## 8. Required artifacts

Keep the case/source manifest, candidate-freeze record, Chinese workbook, normalized reviewer data, JSON/Markdown reports, regression results, and a short retrospective for every evaluation cycle.
