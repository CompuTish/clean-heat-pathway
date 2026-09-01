# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Clean Energy Delivery Board invariants

- This is an educational operations model for a fictional English neighbourhood, not an engineering, connection, planning, procurement, regulatory, or safety tool.
- Do not accept or store real addresses, customer details, or other personal data.
- Keep regulatory explanations narrowly tied to the official sources in the README and show the review date in the product.
- Keep all site names, distances, capacities, documents, resources, people, and outcomes fictional. The scenarios are static and deterministic; do not introduce live data without explicit approval.
- Source belongs to this nested repository. Firebase serves only the exported client files tracked by the parent repository in `clean_heat_demo/public/`.
- Production releases must use the parent repository's named Firebase target and explicit `--project personal-promo-websites`. Never use a bare Firebase deploy.
- The selected visual source is `design/clean-energy-delivery-board-option-2-neighbourhood-map.png`. Preserve its map-first operations-board hierarchy, blue outlines, pale-blue/gold states, restrained density, and identifiable illustrated assets unless Isabel or Aatish approves a new direction.
