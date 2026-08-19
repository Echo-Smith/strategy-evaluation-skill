# Private enterprise extensions / 企业私有扩展

WritingAgentBench uses one contract for public and private evaluation while keeping storage and publication policies separate.

## Namespace

Private suites must use an organization or product prefix, for example:

```text
luminbuddy.private.real-business-holdout
luminbuddy.private.lexiang-only
luminbuddy.private.strategy-holdout
```

## Required controls

- Store an irreversible source fingerprint separately from the redacted text hash.
- Record partition and privacy level on every case.
- Keep raw outputs, sources, reviewer identities, and behavior events in controlled storage.
- Publish only coverage, aggregate metrics, hashes, and privacy-safe excerpts.
- Run the same Schema and release gates as the public core.

## Luminbuddy boundary

Luminbuddy is the private product extension for the 笔润智谈 writing system. Lexiang sources, internal writing rules, real user traces, Prompt/Memory configuration, and private Holdouts are not part of the public core. Public reports may describe the method and aggregate outcome without copying those assets.
