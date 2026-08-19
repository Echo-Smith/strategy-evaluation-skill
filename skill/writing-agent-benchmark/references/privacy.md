# Privacy and publication guide

## Never publish

- Credentials, authorization headers, cookies, private endpoints, or `.env` files.
- Raw enterprise knowledge-base text or long source excerpts.
- Raw real-user inputs, modified full text, or reversible identifiers.
- Internal system prompts, personal memory content, or cross-user traces.
- Private Holdout answers or reviewer identities without authorization.

## Publish safely

- Use synthetic or manually redacted cases.
- Keep the original input hash as an irreversible source fingerprint and use a separate redacted-input hash.
- Publish aggregate metrics, coverage, schema versions, and short privacy-safe examples.
- Mark private suites with an organization/product namespace and `private_holdout` partition.
- Run repository privacy scanning before every public release.
