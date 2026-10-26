---
description: 新しいプロトタイプを作る（web = ゲームなどの Web / 3D 試作、slides、pv）。何を作るかも一緒に書ける
argument-hint: <web|slides|pv> <name> [何を作るか（例：ジャンプでよけるミニゲーム）]
---

Create a new prototype. Arguments: $ARGUMENTS

The skills say **how** to build each kind of thing; **what** to build comes from the user. Before writing
anything, make sure you know the content.

0. If this repo is not set up yet (no `pnpm-workspace.yaml`, or `CLAUDE.md` has no `## Cloudflare`), run the
   `repo-setup` skill first. In an empty folder this needs no questions.
1. Read the type (`web`, `slides`, or `pv`) and the name from the arguments. Ask if the type is missing; if only
   the name is missing, derive a short one from the content.
2. Gather what to make, from (in this order) the arguments after the name, the conversation so far, and any file
   or URL the user pointed to (a planning doc, notes, an existing prototype in this repo). If it is still
   unclear, ask at most three short questions in one message, offering sensible defaults:
   - `web` (usually a game prototype): the core idea or genre, how the player controls it (keys, mouse, touch),
     and what one round looks like (goal, fail condition). Default: a single playable screen with keyboard input.
   - `slides`: the topic and the source material, who it is for, about how many slides. Default: about 8 slides.
   - `pv`: what it shows (a prototype in this repo, a capture, text and images), length and tone. Default: 15 s.
   Do not build a generic placeholder when the user had something specific in mind. A request like "anything is
   fine" or "surprise me" counts as an answer: pick something and say what you picked.
3. Decide the location from the repo's `CLAUDE.md` (for example `packages/<yyyymmdd>-<name>/`). If it says
   nothing, ask, and write the answer into `CLAUDE.md` (see the `workflow` skill).
4. Scaffold:
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
5. Install dependencies, make sure the build passes, start the dev server, and show the user a screenshot.
6. Summarize what was built (what the user can do with it now) and how to run it. Do not commit unless the user asks.
