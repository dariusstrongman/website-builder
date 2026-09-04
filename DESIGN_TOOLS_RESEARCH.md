# Design tooling: use the right capability for the right problem

Reviewed 2026-09-04. These are vendor-documented capabilities, not a claim that every tool was installed or tested. This project is currently plain HTML/CSS/JavaScript. Its public marketing pages should not acquire a React runtime just to add an effect.

## The requested tools

| Resource | Verified purpose | Best use here | Decision and boundary |
| --- | --- | --- | --- |
| [Motion](https://motion.dev/) | Animation library for JavaScript, React and Vue; MIT-licensed core; agent-oriented documentation and an AI Kit | Selection, layout and workflow-state transitions | Preferred library when native CSS cannot express the interaction cleanly. Not required for this release's simple disclosures and state changes. Premium Motion+ products are separate from the core license. |
| [React Bits](https://reactbits.dev/) | Animated components and creative tools; source can be customized | Prototype a specific gallery, typographic or image-treatment idea | Select a component after the visual concept, not before. Current [repository license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) is MIT plus a Commons Clause restriction on selling/redistributing the components themselves—not plain unrestricted MIT. Do not make these components the builder's downloadable stock library without permission. |
| [Refero](https://refero.design/mcp) | Reference research with an AI-facing MCP connection | Search actual pricing, onboarding, examples and navigation patterns before implementation | High-priority research integration for Claude. Account/OAuth and entitlement required for live library access. Not connected in this run. [Refero Styles](https://styles.refero.design/) also provides structured design-system references; adapt their reasoning, never copy another company's identity or assets. |
| [Unicorn Studio](https://www.unicorn.studio/) | Interactive real-time graphics and embeddable scenes | One purposeful signature scene, if it materially clarifies the product or brand | Optional art-production tool, not a layout engine. Its [performance guide](https://www.unicorn.studio/docs/performance/) covers resolution, layer downsampling, frame-rate caps and profiling. Require a static fallback, separate HTML copy, reduced-motion behavior and mobile performance evidence before shipping a scene. |
| [Mobbin](https://mobbin.com/) | Real product screens, video flows and interactive journeys | Study brief entry, direction selection, feedback, payment and handoff as full flows | Useful for the customer-facing builder, not just homepage inspiration. Reference access does not license copying a product's assets. No account access or paid library extraction performed. |
| [Pryzm](https://pryzm.design/) | Browser-based backgrounds, textures, loops and exported live components | Develop a controlled image-treatment family around the approved brand palette | Likely the intended correction to `pryzym.design`. Its page permits commercial exported backgrounds/loops but not standalone stock resale. Higher-quality/code exports depend on plan. No subscription purchased or source imported. |
| `kitzbitz.art` | Could not verify a relevant design tool at the supplied address | Unresolved | Direct lookup failed; search returned unrelated glass-art businesses. Request the corrected link instead of guessing or substituting another product. |

### Important for the venture, not merely this prototype

[React Bits Pro's license](https://pro.reactbits.dev/license) distinguishes client-project output from providing the underlying components, blocks or agent-kit content in reusable form. A website-generating product with source delivery needs its specific workflow checked before using paid kit content as reusable inventory. Do not infer that “commercial use” grants every form of redistribution. This is a product-licensing risk note, not a legal clearance.

## What is changing in the work

1. Research the exact page job. Pricing is a comparison problem; onboarding is a sequence; examples are inspectable evidence. Pick references for that job, not just a preferred homepage.
2. Capture the reason. Record hierarchy, color roles, density, image treatment, responsive behavior and interaction states. Distinguish observed rendering from text-only access.
3. Set the system. Define shared ink, neutral surfaces, action accent, type scale and spacing. Example brands can differ; the surrounding builder interface should remain coherent.
4. Choose one missing capability. Add an animation library for a real state-transition problem; a graphics tool for an authored asset; a reference connector for better research. Do not install all seven by default.
5. Adapt and test. Recolor, recrop and recompose assets to the chosen direction. Test keyboard use, slow networks, reduced motion and small screens. Do not treat a vendor's performance claim as our result.
6. Show the work. Large usable examples, honest plan details and real interactions are stronger proof than a section saying “premium quality.”

## Adopted in the v9 example rebuild

- **Mobbin:** connected as a flow-research source. It is used to study complete journeys and page roles, not to copy surface styling.
- **Motion:** used as a pinned progressive enhancement on the three portfolio studies. Content and native interactions still work if the CDN is unavailable, and `prefers-reduced-motion` disables the enhancement.
- **Refero:** retained as the web-pattern research layer for later production runs. It is not a runtime dependency.
- **React Bits:** intentionally not imported into this plain HTML build. Its patterns can inform prototypes, but adding React only for visual effects would increase weight and sameness.
- **Unicorn Studio:** reserved for a truly authored signature scene after a project file and static fallback exist. No generic WebGL embed ships merely to look expensive.
- **Pryzm:** reserved for original textures or background exports with documented licensing. It is not a substitute for art direction.

The three examples now prove three different interactions: project selection, class filtering and an inspectable signal-to-decision record. None depends on invented customer proof.

## This release

- New shared navigation and footer expose the product and resource pages coherently.
- Pricing uses matched plan structures, a scope selector, feature comparison and honest exclusions.
- Homepage leads into three inspectable design studies, not an anonymous dashboard.
- About uses an original AI-created brand image, not a fictional team photo or company history.
- One consistent interface palette replaces arbitrary section colors.
- Native state changes and small feedback transitions remain; no WebGL dependency or paid tool was added.

These changes improve the decision process and its implementation. They do not establish a numerical design rating or prove conversion uplift. Rendered review, user feedback and real commercial outcomes remain separate evidence.
