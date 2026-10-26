---
name: web-prototype
description: Build a playable game prototype (or any interactive Web / 3D prototype) with Vite + React + React Three Fiber and deploy it to Cloudflare Workers. Use when the user wants to try out a game idea, a mechanic, a 3D scene, or an interactive web toy in the browser.
---

# Web / 3D prototype (Vite + React + R3F)

The main use is **game prototyping**: getting a game idea playable in the browser quickly, so it can be tried,
tuned and shared by URL. What the game is comes from the user (see `/new`); this skill covers how to build it.

## Scaffold

```bash
pnpm create vite@latest <dir> --template react-ts --no-interactive
cd <dir>
pnpm add three @react-three/fiber @react-three/drei
pnpm add -D @types/three wrangler
```

Then clean up the template: delete `src/App.css` and `src/assets/`, replace `src/index.css` with a full-screen reset
(`html, body, #root { margin: 0; width: 100%; height: 100%; overflow: hidden }`), and add
`build: { chunkSizeWarningLimit: 2000 }` to `vite.config.ts` (three.js alone is about 1 MB, so the default 500 kB
warning always fires).

Layout:

```text
src/
├── App.tsx        # full-screen <Canvas>, UI overlay
├── scene/         # one component per scene / object, no DOM access
└── lib/           # pure helpers (math, data)
public/            # models (.glb), textures, audio
```

## Rules

- `<Canvas dpr={[1, 2]}>` and wrap loaders in `<Suspense>`; preload models with `useGLTF.preload`.
- In `useFrame`, use `delta` for motion and never allocate objects (reuse refs / vectors).
- Keep scene components free of DOM and global state, and let animated components accept an optional `time` prop.
  That way the same component can be rendered as video by Remotion (`@remotion/three`) driven by the frame number.
- Prefer drei helpers (OrbitControls, Environment, Text, etc.) over hand-written equivalents.
- R3F's default camera looks at the origin. When the action happens elsewhere, aim it with
  `onCreated={({ camera }) => camera.lookAt(x, y, z)}`, and reload the page to check (hot reload keeps the old camera).

## Game prototypes

- **Playable first.** Build the core loop before anything else: the player can act, there is a goal and a way to
  fail, and one key restarts (`R`). Use simple shapes and colors; no title screen, menus or art until asked.
- **State.** Per-frame values (positions, velocities) live in refs updated in `useFrame`. Things the HUD shows
  (score, time, phase `ready | playing | over`) live in React state, or a small `zustand` store when several
  components need them.
- **Input.** Keyboard via drei `KeyboardControls` (WASD and arrows). Clicks via pointer events on meshes. Add
  on-screen touch buttons only when the user wants to play on a phone.
- **Physics.** Plain math (distance or box overlap) for a few objects; `@react-three/rapier` when the game needs
  gravity, stacking or many collisions.
- **2D games** work the same way with an orthographic camera looking straight down.
- **Tuning.** Put every number a designer would want to tweak (speed, jump height, spawn rate, time limit) in
  `src/lib/tuning.ts`, so "make it faster" or "make it easier" is a one-line change.
- **HUD.** A DOM overlay with the score and a one-line "how to play" (e.g. "←→ で移動、Space でジャンプ、R でやり直し").
- **Sound** (if asked): start audio only after the first key press or click; browsers block autoplay.

## Verify

1. `pnpm build` passes with no type errors.
2. Run `pnpm dev` and open it in a browser. For a game, actually play it: send key presses or clicks, take a
   screenshot mid-play, and check that the goal, the fail condition and the restart all work. Show the user the
   screenshot and say how to play.

## Deploy (Cloudflare Workers, static assets)

Create `wrangler.jsonc` next to package.json (name and account rules: see the `workflow` skill):

```jsonc
{
  "name": "<Worker prefix from this repo's CLAUDE.md><name>",
  "account_id": "<Account ID from this repo's CLAUDE.md>",
  "compatibility_date": "<today, YYYY-MM-DD>",
  "assets": { "directory": "./dist", "not_found_handling": "single-page-application" }
}
```

Then `pnpm build && npx wrangler deploy`, and report the `*.workers.dev` URL.
