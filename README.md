# Website Builder — proof of concept

This is the temporary customer-facing prototype for the future premium website-building venture. It is deliberately not the final brand or the final 10/10 marketing site.

## What this proves

- A customer can submit a focused business brief.
- The product presents three genuinely different creative directions.
- The customer chooses a direction before a full website is built.
- The experience explains the later build, revision and delivery stages.

## What is intentionally simulated

- Research and AI generation
- Accounts and project persistence
- Payments
- Full website generation
- Revision conversations
- Final deployment and source delivery

Those capabilities should be implemented only after the Stromation redesign proves the design engine can consistently produce premium work.

## Run locally

The public GitHub repository keeps the static site files at its root. Serve that directory with any static web server. The Sites deployment checkout keeps the same files in `dist/`. No build step is required in either layout.

Run `node scripts/release-check.mjs` before publishing. The checker supports both layouts and verifies required pages, favicon coverage, unique titles, metadata, internal links and current pricing.
