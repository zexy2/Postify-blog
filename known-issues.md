# Postify Known Issues

## Baseline
- `package.json` has no `test` script even though README documents `npm run test` and Vitest/Playwright dependencies exist.
- ESLint baseline warning: `src/components/ui/design-testimonial.jsx` has a missing `useEffect` dependency (`goNext`).
- Current design system comments/implementation mix several unrelated visual trends (glassmorphism, bento, glow cards, editorial serif), which weakens product identity.
- Current homepage communicates “technology journal/blog” rather than a unique reader outcome.

## Environment
- Oracle host does not have Node/npm installed globally. Build verification is performed in `node:20-alpine` Docker until/unless a host Node runtime is intentionally installed.
