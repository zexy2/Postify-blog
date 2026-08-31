# Contributing to Postify

Thanks for helping improve Postify. This project values contributions that are focused, reproducible, and easy to review.

## Before you start

- Search existing issues and pull requests before opening a duplicate.
- Use the repository issue forms for bugs and feature requests.
- For security-sensitive reports, follow [SECURITY.md](SECURITY.md) and do **not** publish exploit details in a public issue.
- Keep changes scoped. A small PR with one clear purpose is easier to verify and safer to ship.

## Development setup

### Requirements

- Node.js 24 LTS recommended
- npm
- A Supabase project for backend-backed/authenticated flows

### Install

```bash
git clone https://github.com/zexy2/postify.git
cd postify
npm ci
cp .env.example .env.local
npm run dev
```

Never put a Supabase `service_role` key or another server secret in a Vite-exposed environment variable.

## Branches

Create a branch from the latest `main`:

```bash
git switch main
git pull --ff-only
git switch -c feat/short-description
```

Suggested prefixes:

- `feat/` — product capability
- `fix/` — bug fix
- `docs/` — documentation only
- `test/` — tests or test infrastructure
- `refactor/` — behavior-preserving code change
- `chore/` — maintenance/tooling

## Quality gates

Run the checks relevant to your change before opening a PR.

```bash
npm run verify
npm run verify:security
npm run test:e2e:ui
npm run test:e2e:visual
```

`npm run verify` covers deterministic knowledge verification, unit tests, lint, build, and build smoke. Database changes are additionally validated in CI by replaying migrations on fresh PostgreSQL 16 and running `supabase/verify-verified-knowledge.sql`.

If a check cannot be run locally, say so explicitly in the PR and explain why.

## Product and UI changes

For visible changes:

1. Test the affected flow at realistic desktop and mobile sizes.
2. Check keyboard navigation and focus behavior.
3. Preserve readable contrast and reduced-motion behavior.
4. Add or update Playwright coverage when the behavior is important to the product contract.
5. Include before/after screenshots in the PR when they materially help reviewers.

Do not update visual baselines merely to make a failing visual test green. First confirm that the visual change is intended.

## Verified Knowledge changes

Trust signals are product behavior, not decorative labels.

- Never make `Postify verified` author-writable.
- Do not fabricate verification runs, evidence counts, runtime freshness, or authenticated-user results.
- Deterministic verifiers must remain checked in and reviewable.
- A displayed verification artifact must remain bound to the code/runtime it claims to represent.
- If freshness cannot be established safely, fail closed rather than presenting a stronger trust state.

## Database and Supabase changes

- Add new migrations; do not rewrite production migration history.
- Preserve Row Level Security boundaries.
- Avoid exposing private user data in public aggregates or machine-readable surfaces.
- Prefer additive, reversible schema evolution where practical.
- Never commit production secrets or local credentials.

## Commit messages

Use short, imperative Conventional Commit-style messages when practical:

```text
feat(knowledge): add evidence freshness signal
fix(ui): restore focus after closing dialog
docs: expand local setup guide
```

## Pull requests

A good PR should explain:

- what changed;
- why it changed;
- how it was tested;
- whether there are security/data implications;
- screenshots for meaningful UI changes;
- any known limitations or follow-up work.

The repository PR template will prompt for these details.

## Review expectations

Reviewers may ask for changes when a contribution:

- weakens verification or RLS boundaries;
- introduces an untested product-critical behavior;
- mixes unrelated refactors with the requested change;
- makes claims that are not supported by persisted or deterministic evidence;
- hides known failures instead of addressing or documenting them.

## Code of conduct

Participation in this project is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

By contributing, you agree that your contribution may be distributed under the repository’s [MIT License](LICENSE).
