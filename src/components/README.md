# Parametric Packaging Studio — Foundation

A Pacdora-style parametric dieline + 3D mockup generator, starting with a
Straight Tuck End (STE) box.

## Folder structure

```
pacdora-clone/
├─ package.json
├─ pages/
│  └─ index.js                 # main app page: controls + 2D + 3D + export
├─ src/
│  ├─ lib/
│  │  ├─ steDielineGenerator.js  # pure geometry engine (framework-agnostic)
│  │  ├─ exportUtils.js          # SVG / PDF download logic
│  │  └─ useBoxStore.js          # zustand store: L, W, H, T, glueFlapWidth, bleed
│  └─ components/
│     ├─ DielineSVG.jsx          # renders geometry as color-coded <svg>
│     └─ Box3DViewer.jsx         # react-three-fiber box + fold-angle slider
└─ README.md
```

## Setup

```bash
npx create-next-app@latest --js pacdora-clone   # or drop these files into an existing app
cd pacdora-clone
npm install three @react-three/fiber @react-three/drei zustand file-saver jspdf svg2pdf.js
npm run dev
```

## Tech stack rationale

| Layer | Choice | Why |
|---|---|---|
| App framework | **Next.js (React)** | File-based routing, easy to add API routes later (e.g. server-side PDF batching, saved projects), huge ecosystem, SSR not required here but useful for a dashboard/gallery later. |
| UI state | **Zustand** | Trivial global store for L/W/H/T shared between the 2D SVG, 3D viewer, and exporter without prop-drilling or Redux boilerplate. |
| 2D rendering | **Raw SVG (React-controlled)**, not Canvas | SVG gives you real vector output for free — the exact same DOM node you render on screen is what you export to `.svg`/`.pdf`. Canvas would require re-implementing vector export from scratch. |
| 3D rendering | **Three.js via React Three Fiber + drei** | Declarative scene graph fits React's component model, `OrbitControls`/lighting helpers from drei save boilerplate, and R3F scales cleanly if you later add more dieline templates (mailers, pillow boxes, etc.) each with their own 3D fold rig. |
| PDF export | **jsPDF + svg2pdf.js** | svg2pdf.js walks the live SVG DOM and draws vector paths into the PDF (not a rasterized snapshot), so the exported PDF stays true vector and true-to-scale. |

## Core geometry notes (see `steDielineGenerator.js` for full comments)

- **Panel order:** `[Glue Flap][Side 1][Front][Side 2][Back]`, front/back carry
  the length `L`, sides carry `W`.
- **Thickness compensation:** each side panel is shortened by one board
  thickness `T` so the assembled box closes without binding.
- **Flap formulas:** `dustDepth = sideW/2 - clearance`, `tuckDepth = dustDepth + overlap`,
  tuck flap corners chamfered by `dustDepth` so the tuck clears the dust flaps.
- **Edge tagging system:** every polygon edge is tagged `cut` or `fold` at
  creation time (shared inter-panel edges = fold, free edges = cut). Colors
  and the bleed offset are derived automatically from these tags — you don't
  hand-place lines, you describe the panels and the renderer figures out the
  line types.
- **Bleed:** computed per cut-edge by translating both endpoints along that
  edge's outward normal by 0.125". This is a per-edge offset, not a full
  polygon miter-join — accurate in direction and magnitude, with a documented
  caveat about corner gaps (see comments in the generator for how to upgrade
  to a true polygon offset library like Clipper if you need production-grade
  bleed joins).

## Known simplifications / next steps

- Back panel currently gets small dust-flap-style flaps rather than a full
  second tuck lock — trivial to swap using the same `tuckFlap()` builder.
- Bleed uses per-edge offsetting rather than true polygon offset (see above).
- Add more templates (mailer box, pillow box, gable box) by writing new
  generator functions that follow the same `{points, edgeTypes}` shape
  contract — `DielineSVG` and the exporters don't need to change at all.
- 3D viewer currently rigid-body hinges 4 walls + a static bottom; extend
  `Box3DViewer.jsx` to also animate the top tuck/dust flaps using the same
  angle input for a full open→closed animation.
