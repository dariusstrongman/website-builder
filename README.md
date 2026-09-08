# Website Builder — proof of concept

This repository is the public-facing prototype for the premium Website Builder venture. It is still not the final brand or a live autonomous checkout/fulfillment product, but the underlying Stromation fulfillment system has moved well beyond the original static mockup.

## What this public prototype demonstrates

- A customer can submit a focused business brief.
- The product presents three genuinely different creative directions.
- A customer can compare direction logic before a full website is built.
- The experience explains research, proof-slice review, revision and delivery.
- The visual system demonstrates that different industries should not receive the same template with new colors.

## Current production workflow behind the concept

The Stromation customer-website pipeline now enforces a premium build process:

1. customer truth and business research
2. benchmark/reference selection
3. 2–3 genuinely divergent creative directions
4. rendered concept studies
5. independent direction ranking
6. approved direction lock
7. proof-slice-first implementation
8. deterministic craft/slop/repetition checks
9. independent visual review against the canonical 100-point scorecard
10. targeted rework before full-site expansion
11. desktop/mobile browser evidence
12. final review, approval and source-package delivery

The canonical ship bar is **92/100 with category floors**, not a self-assigned aesthetic score. Passing technical tests alone does not prove a premium website.

## What remains intentionally separate from this public repository

- Production customer accounts and persistence
- Live payment/order ingestion
- Customer-specific deployment/hosting
- Venture-specific email identity and communications
- Autonomous commercial operation
- Proof that the system can repeatedly produce 9.5+/10 websites in real end-to-end builds

The next major proof is two intentionally different internal customer builds, both judged on their actual rendered design rather than source checks alone.

## Design benchmark philosophy

The benchmark library is used for principles, not copying. Current reference lessons include Gamma, Clay, Tend, Linear, Vercel, Raycast, Attio, Stripe, Cursor, ElevenLabs, Ramp and Drawer.ai. Drawer.ai was added specifically for restraint, long-page composure, product-UI integration, technical clarity and selective motion.

See `DESIGN_STANDARD.md` and `BENCHMARK_LIBRARY.md` for the current quality doctrine.

## Run locally

The public GitHub repository keeps the static site files at its root. Serve that directory with any static web server. The Sites deployment checkout keeps the same files in `dist/`. No build step is required in either layout.

Run `node scripts/release-check.mjs` before publishing. The checker supports both layouts and verifies required pages, favicon coverage, unique titles, metadata, internal links and current pricing.


## Customer workspace preview

`project.html` is the customer working surface. It is separate from the marketing walkthrough and `motion-lab.html`. The homepage links to it from the studio section.

Implemented: local brief drafts, explicit brief review, existing public intake submission, a separate fictional Northline sample with three rendered layouts, direction notes and confirmation, version browsing, desktop/mobile previews, section feedback, explicit sample handoff approval, and downloadable sample HTML/project records. Real and sample drafts survive reload independently. No automatic generation timers or simulated percentage counters are used.

Real briefs stop at scope review after the existing `/website-order` receipt. Sample controls load prepared records; they never call Sol or publish a customer website. A prepared revision variant illustrates the review loop and does not claim to implement freeform feedback. The sample business brief is fixed so every concept represents the same business.

Before the new end-to-end Sol test: connect authenticated customer project reads, artifact URLs, direction/feedback/approval writes and durable version-specific decisions to the fulfillment system. The current runtime intake handler records orders; it does not expose those customer workspace endpoints. Keep operator tokens and provider credentials server-side. Existing internal proof jobs are separate from a test of this customer flow.

Validation: `node --test workspace/model.test.mjs`, `node scripts/release-check.mjs`, `node scripts/interaction-check.mjs`. Desktop/mobile browser checks exercised sample selection, preview sizes, two build milestones, revision request and explicit approval. No real order was submitted during workspace QA.
