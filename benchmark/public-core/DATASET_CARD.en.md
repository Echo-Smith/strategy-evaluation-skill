# WritingAgentBench Public Core v1 Dataset Card

- Cases: 72
- Origin: 52 deduplicated synthetic strategy cases plus 20 rewritten legacy style cases
- Source fixtures: 20, all synthetic
- Privacy: all records are synthetic; no real-user traces, enterprise knowledge-base text, private rule IDs, or experiment partitions
- Task mix: abnormal 5, dedupe 8, polish 10, topic 11, writing 38
- Difficulty mix: L1 24, L2 26, L3 22

## Construction

Two legacy evaluation collections were audited for schema fit and publication risk. Exact strategy-pair duplicates were removed. Time-sensitive claims, first-person experience claims, health-risk prompts, and product-specific details were excluded or rewritten. Remaining records were normalized to WABench Schema v1, the five-dimension rubric, and hard-failure gates.

## Intended use

Use this set to compare topic ideation, drafting, polishing, deduplication, and abnormal-input handling in writing agents. A public score does not represent enterprise effectiveness. Knowledge-base routing, real-user acceptance, and modification burden require a separate private holdout.

## Limitations

Chinese public-issue writing is over-represented. No real-user records are published. The set does not measure any specific enterprise knowledge base. Twenty style cases were risk-rewritten and are not verbatim reproductions of a product style.
