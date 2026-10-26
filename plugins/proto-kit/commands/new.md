---
description: 新しいプロトタイプを作る（web / slides / pv）
argument-hint: <web|slides|pv> <name>
---

Create a new prototype. Arguments: $ARGUMENTS

0. If this repo is not set up yet (no `pnpm-workspace.yaml`, or `CLAUDE.md` has no `## Cloudflare`), run the
   `repo-setup` skill first. In an empty folder this needs no questions.
1. Read the type (`web`, `slides`, or `pv`) and the name from the arguments. Ask if either is missing.
2. Decide the location from the repo's `CLAUDE.md` (for example `packages/<yyyymmdd>-<name>/`). If it says
   nothing, ask, and write the answer into `CLAUDE.md` (see the `workflow` skill).
3. Scaffold:
   - `web` → follow the `web-prototype` skill.
   - `slides` → follow the `slides` skill.
   - `pv` → `pnpm create video@latest --yes --three <dir>` (`--blank` instead of `--three` when there is no 3D).
     Inside a pnpm workspace, fold it into the workspace:
     - Delete the generated `pnpm-workspace.yaml`, `pnpm-lock.yaml` and `node_modules`, but first copy its
       `minimumReleaseAgeExclude` list into the root `pnpm-workspace.yaml` (pnpm otherwise refuses the
       just-released Remotion packages). Then run `pnpm install` at the root.
     - Delete the template's sample files (`demo.gif`, `LICENSE.md`, `public/*.mp4`, the phone/tablet scene) and
       write one `<Composition>` in `src/Root.tsx`. Add `"render": "remotion render <Id> out/<name>.mp4"` to scripts.
       Drop unused template deps (`@remotion/media`, `@remotion/zod-types`, `zod`, `mediabunny`, `@types/web`); if
       `@types/web` goes, set `"types": []` and `"lib": ["es2020", "dom"]` in `tsconfig.json`. Check with `tsc --noEmit`.
     - To reuse a scene from a `web` prototype, add it as `"<package>": "workspace:*"` and import its scene component.
       Use the same `react`, `react-dom`, `three` and `@react-three/fiber` versions as that package, or pnpm installs
       two copies of R3F and the scene breaks. Drive it with `time={frame / fps}`.
     - Official Remotion skills: if the repo root has no `.claude/skills/remotion-*`, run `npx remotion skills add`
       in the package, then move `.agents/skills/*` to `<repo>/.claude/skills/` and delete the package's `.agents`
       and `.claude`. On Windows it links them with junctions holding absolute paths, which break in git and on
       other PCs; one real copy at the root serves every video package.
4. Install dependencies, make sure the build passes, start the dev server, and show the user a screenshot.
5. Summarize what was created and how to run it. Do not commit unless the user asks.
