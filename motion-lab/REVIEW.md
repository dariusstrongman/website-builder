# Maman Corp motion study — 2026-09-08

## Evidence and scope

Reviewed the live [Maman Corp home page](https://www.maman-corp.com/) in the browser at desktop and phone sizes, including the landing exit, Our Story, and Client Commitment transitions. Also read the [original art director's Home presentation](https://dribbble.com/shots/4971577-Maman-Corp-Home) and [Solution presentation](https://dribbble.com/shots/4971618-Maman-Corp-Solution). Clément Brichon credits Immersive Garden, Manuel Odelain and Dilshan Arukatti and notes retrospectively that the site may be overanimated. That is a useful caution: reproduce the spatial intent, not every interruption.

This corrects only the isolated `preview/premium-motion-lab` prototype. It does not change the commercial site, fulfillment pipeline, Stromation motion scoring, or main. No Maman imagery, branding, text, or source code is reused.

## What the live reference actually does

1. **A composition before an effect.** The opening has an architectural video field, a strong rectangular text plane, a contrasting scroll control, and alignment rails. Those surfaces establish a spatial language before anything moves.
2. **Ordered departures and arrivals.** On leaving the opening, text loses emphasis before the colored panel travels away. Large white surfaces then mask the image. The next chapter's headline and body arrive into the new layout. This is a sequence of different events, not the same fade on every element.
3. **Changing figure/ground.** Images, colored surfaces and reading planes exchange dominance. A large white reading plane can become the foreground while an architectural image remains visible at the edge. Motion changes the layout's hierarchy.
4. **Orientation survives.** Logo, alignment rails, chapter position and scroll affordance persist while the main composition changes. Not everything starts over at each chapter.
5. **There are settled reading states.** The reference allows its longer paragraphs to stay still. Mobile stacks the opening text and drops desktop navigation. The chapter content becomes a tall reading plane with its own side pagination, not a miniature desktop layout.
6. **Its input model is not our target.** In this browser the reference responds to scroll with timed chapter transitions that continue settling after input. We retain ordinary native scrolling, with deterministic reversible scrubbing, rather than reproducing section locking.

These are observations from the sampled live states, not claims about every page or Maman's internal implementation. The designer presentations corroborate authorship and intent, not our runtime measurements.

## Flaws in the previous preview

| Previous behavior | Consequence | Correction |
| --- | --- | --- |
| Three independent 210svh sticky sections | No object or layout carried through a chapter boundary | One persistent image and one continuous sticky stage |
| Nearly every transform used one linear `--p` | All elements moved together for most of the scroll; no emphasis or rest | Bounded eased cues, staggered headline lines, three explicit reading holds |
| Copy described continuity that did not exist | Explanations substituted for an observable result | Short concept copy; the image itself travels through the sequence |
| Tiny scale/translation changes on separate objects | The overall composition stayed largely unchanged | Full-bleed image → editorial plate → full world → browser → phone |
| No image handoff between scenes | Each chapter reset the visual story | Same DOM image and local asset throughout; staggered masking planes at the world reveal |
| `innerHeight` used while pinning under a 58px header | Progress was not the actual pinned travel; mobile viewport changes could disagree | Stage pins at zero; measured track minus measured stable stage determines progress |
| Absolute objects retained in reduced motion | Desktop/phone mockups could overlap | All chapters return to document flow; no overlapping device layers |
| Images pointed at mutable GitHub main | Preview rendering depended on main and an external image request | Branch-owned local asset paths, packaged with the preview |
| No favicon/noindex; generic release check expected marketing shell | Preview could fail checks or be treated as a normal landing page | Isolated preview asset checks while retaining all global metadata/link checks |

## Rebuilt storyboard

Progress is relative to the actual sticky travel, not the document height.

- **0–19%:** The image begins full-screen behind the opening statement. Text departs first, then the image settles into a plate. Desktop places the plate beside the brief; phone places it above the brief.
- **21–28%:** Hold the brief, its image and proportions completely still.
- **30–46%:** The same image expands back into the viewport. Two offset colored planes pass across it; the new wordmark and heading arrive after the handoff.
- **53–60%:** Hold the full image world with readable copy.
- **63.5–78.5%:** The world contracts into a browser composition. The last caption leaves before the next one arrives.
- **81–94%:** That browser narrows into a phone; the existing image recrops and the site's text area opens beneath it. No second device is swapped in.
- **95–100%:** Hold the final phone composition. Native page flow then resumes into a short closing section.

## Validation

- `node --test motion-lab/timeline.test.mjs`: five passing tests, including 10,000 progress samples for each layout, bounded geometry, continuity, offset/stable-height progress, reading holds, and exact reverse-scrub determinism.
- `node scripts/release-check.mjs`: passes all 29 pages; preview-specific shell exception still requires its stylesheet, module and noindex.
- Browser review: 390×844 and 375×667 portrait layouts, 1440×900 desktop, image continuity, colored-plane handoff, compact-phone copy boundaries, reduced-motion toggle and accessible chapter restoration. Desktop full-world composition and reverse return to the brief also reviewed. A short 844×390 viewport restores every chapter in document flow without horizontal overflow.
- No console warnings/errors observed during the reviewed local sequence. Image loads from the local branch, not GitHub main.
- Browser size simulation is not physical iOS Safari testing. OS-level reduced-motion is wired to the same fallback exercised by the control, but was not separately emulated. These technical checks do not establish aesthetic equivalence to Maman or a numeric design score.


## Motion-disabled regression — corrected after user feedback

The earlier short-viewport fallback was wrong for a motion preview. It disabled every animation at heights below 620 CSS pixels or widths below 350 pixels, disabled the enable control, and could reset scroll when browser chrome crossed that threshold. The earlier review incorrectly accepted that behavior. This is a confirmed implementation flaw; the user's exact viewport/OS preference has not been observed.

- Removed dimension-based motion gating. Compact layouts now retain the timeline and simplify secondary text to fit.
- OS reduced-motion remains the default, with an enabled, explicit `Enable motion` control for visitors who want to preview it. `Pause motion` returns to the reading layout.
- Resize only remeasures geometry; it cannot disable motion or reset scroll.
- Added entry-module event/layout regression tests, including 390×580, 844×390, 320×568, OS preference override, and crossing the old 620px threshold. Eleven tests pass; running the six new tests against the prior commit reproduces five failures.
- Browser-checked the active sequence at 390×580, including the brief and final phone composition, plus the landscape layout. No physical-device claim is made.


## Gesture-driven playback — revised to match the requested interaction

The prior revision intentionally retained scroll scrubbing; user feedback clarified that this was the wrong input model. A small wheel gesture or vertical swipe now requests the entire next transition, which finishes in roughly 1.3–1.5 seconds even when input stops. Stops are 0%, 24%, 56%, and 100%. An upward gesture completes the previous transition.

The choreography still uses native page position underneath, but a bounded animation advances it automatically. Trackpad inertia is consumed until the triggering gesture goes quiet, preventing accidental multi-chapter jumps. A claimed touch swipe can request only one scene; a fresh swipe is required for the next. PageDown/ArrowDown/Space and reverse keys work too; Escape cancels. Browser zoom, form controls, links, reduced-motion reading, and normal page scrolling outside the story retain their normal behavior. At the last stop, scrolling continues into the footer.

Verified a small browser wheel input moving from 0% to a settled 24% with no further input. Automated navigation tests cover completion, momentum, reverse, exit, cancellation, and complete forward/backward traversal; the entry-module fixture also exercises touch claiming and full completion. This is not physical iOS device verification.
