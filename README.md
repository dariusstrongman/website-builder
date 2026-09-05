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
