---
name: web-prototype
description: Build a Web / 3D prototype with Vite + React + React Three Fiber and deploy it to Cloudflare Workers. Use when creating or editing a browser prototype, a 3D scene, or an interactive web toy.
---

# Web / 3D prototype (Vite + React + R3F)

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

## Verify

1. `pnpm build` passes with no type errors.
2. Run `pnpm dev`, open it in a browser, take a screenshot and show it to the user.

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
