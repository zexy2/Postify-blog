# Security Policy

Security reports are taken seriously. Please help us protect Postify users by reporting vulnerabilities privately and giving maintainers a reasonable opportunity to investigate before public disclosure.

## Supported version

Postify is deployed continuously from `main`. Security fixes target the current production release and the current `main` branch.

| Version | Supported |
|---|---|
| Current `main` / production | ✅ |
| Historical commits or old forks | ❌ |

## Reporting a vulnerability

**Do not open a public issue containing vulnerability details, proof-of-concept code, secrets, or user data.**

Use GitHub’s private vulnerability reporting flow:

1. Open the repository’s **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe the issue, affected surface, reproduction steps, impact, and any suggested mitigation.
4. Attach only the minimum data necessary to reproduce the issue. Redact credentials and personal data.

Repository security page: https://github.com/zexy2/postify/security

If GitHub’s private reporting control is temporarily unavailable, open a public issue containing **only** the title `Private security contact requested` and no vulnerability details. A maintainer can then establish a private channel.

## What to include

A useful report normally contains:

- affected URL, component, route, API, migration, or workflow;
- vulnerability class and expected impact;
- exact reproduction steps;
- browser/runtime/environment information when relevant;
- whether authentication is required;
- whether real user data could be exposed or modified;
- minimal proof of concept, when necessary;
- a mitigation idea, if you have one.

## Scope priorities

High-priority areas include:

- authentication and account takeover;
- Supabase Row Level Security bypasses;
- unauthorized reads or writes of user data;
- exposure of secrets or privileged credentials;
- stored or reflected script injection;
- authorization bypasses;
- verification/trust-state forgery, including ways to obtain `Postify verified` without the required deterministic release evidence;
- CI/CD or supply-chain paths that could publish unverified or attacker-controlled artifacts;
- privacy leaks through evidence, notes, aggregates, or machine-readable knowledge surfaces.

## Security boundaries

Postify intentionally treats several boundaries as fail-closed contracts:

- `Postify verified` is not author-writable metadata.
- Browser-exposed Vite variables must not contain Supabase `service_role` or other server secrets.
- Row Level Security is part of the database security model and is verified in CI on fresh PostgreSQL.
- The deterministic knowledge verifier is not an arbitrary/untrusted-code sandbox.
- Public evidence surfaces must not reveal private user identity or private notes.
- Production release verification is tied to the deployed source SHA.

## Disclosure and response

Please avoid public disclosure until maintainers have had a reasonable opportunity to validate and remediate the issue. We will aim to acknowledge a valid private report, keep the reporter informed when practical, and credit the reporter if they want attribution and disclosure is safe.

Do not test in a way that intentionally degrades service availability, destroys data, accesses data belonging to unrelated users, or meaningfully disrupts production.

## Secrets accidentally committed

If you discover a committed credential, assume the credential is compromised even if the commit is later removed. Report it privately so the credential can be revoked/rotated and repository history can be assessed.
