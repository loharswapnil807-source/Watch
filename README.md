# The Continuum of Time

A cinematic, research-led exploration of Swiss watchmaking heritage, India's mechanical legacy, and the contemporary Indian brand Argos Watches. Inspired by the immersive experience architecture of [Edolus](https://edolus.com), with an original visual design and procedural 3D watch.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

The development server prints its local URL. Create and preview a production build with:

```sh
npm run build
npm run preview
```

## The experience

- An aperture-style opening sequence with loading progress and a skip control.
- A locally generated Three.js watch: steel bracelet, applied indices, sunburst dial, crown, hands, jewel bearings, gears, winding rotor, and case.
- A pinned scroll sequence that separates the crystal, bezel, hands, dial, movement, case, and caseback, pauses in an exploded view, and reassembles them. Scrolling backwards reverses the sequence.
- An explicit disassemble/reassemble control, also usable without scrolling.
- Keyboard-accessible historical timeline tabs.
- Swiss history, HMT's Indian legacy, and Argos's contemporary story with source references.
- Official outbound Argos collection links; the experience itself does not process payments.
- Opt-in synthesized mechanical ticking. No audio plays until the visitor enables it.
- Responsive navigation, a focus-managed mobile menu, skip link, reduced-motion support, and a locally drawn CSS fallback when WebGL is unavailable.
- Off-screen rendering suspension, lower mobile pixel density, mobile frame limiting, and a code-split 3D engine.
- Locally hosted fonts and imagery; no external network request is needed to explore the site.

## Project structure

```text
index.html                 Semantic content and archival references
src/main.js                Loading, navigation, timeline, scroll orchestration
src/story.js               Historical milestones and scroll choreography
src/watch-model.js         Original procedural watch geometry
src/watch-scene.js         Rendering, lighting, and viewport lifecycle
src/ambience.js            User-initiated Web Audio synthesis
src/style.css              Responsive editorial design
src/watch-fallback.css     Non-WebGL watch illustration
public/images/credits.json Image sources and ownership
tests/experience.spec.js   Browser-level behavior verification
```

The 3D watch is a conceptual illustration, not a replica of a commercial Argos model or a manufacturing diagram. Historical Swiss watchmaking is presented as context, not a claim that Argos watches are Swiss Made. Argos describes Indian design and assembly with selected globally sourced components. The founding year is attributed to external reporting; the website does not assert an unverified full founder list.

## Verification

```sh
npx playwright install chromium
npm run build
npm test
```

The browser suite checks opening behavior, reversible scroll choreography, timeline keyboard interaction, manual assembly control, mobile navigation and layout, product links, and reduced-motion/non-WebGL fallbacks.

## Deployment

`npm run build` creates `dist/`, suitable for any static host. Vite uses relative asset paths, so the output can also be served under a repository subpath such as `/Watch/`.

The GitHub Actions workflow runs the browser checks and publishes a build artifact on pushes and pull requests. To deploy to GitHub Pages, set the repository's Pages source to **GitHub Actions** and manually run the **Verify and build** workflow on `main`. Deployment requires Pages to be enabled on the repository.

## Research and credits

- [Federation of the Swiss Watch Industry — Historical origins](https://www.fhs.swiss/eng/origins.html)
- [Federation of the Swiss Watch Industry — Swiss Made](https://www.fhs.swiss/eng/swissmade.html)
- [HMT Watches](https://www.hmtwatches.in/)
- [Argos Watches — About](https://www.argoswatch.in/pages/about-us)
- [Argos Watches — FAQs](https://www.argoswatch.in/pages/faqs)
- [Argos — Indian watchmaking editorial](https://www.argoswatch.in/blogs/news/why-india-was-once-the-worlds-largest-timepiece-consumer)
- [Inc42 — Argos company profile](https://inc42.com/company/argos-watches/)
- [Edolus — Immersive UX reference](https://edolus.com)

Argos product photography, names, and trademarks belong to Argos Watches. The alpine image is illustrative and sourced from Unsplash. Exact image URLs are recorded in `public/images/credits.json`. All watch geometry and dial textures in this project are generated locally.
