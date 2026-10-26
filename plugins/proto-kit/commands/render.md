---
description: Remotion で動画を書き出して R2 にアップロードし、URL を返す
argument-hint: "<CompositionId> [name]"
---

Render a video and share it. Arguments: $ARGUMENTS

0. If this repo is not set up yet (no `pnpm-workspace.yaml`, or `CLAUDE.md` has no `## Cloudflare`), run the
   `repo-setup` skill first.
1. Read the composition id (ask if missing; list them with `pnpm exec remotion compositions` if unsure).
   The file name defaults to the composition id in kebab-case.
2. Render a few key frames with `pnpm exec remotion still` first and check them.
3. Render the full video to `out/<name>.mp4` (add `--gl=angle` when the scene uses `@remotion/three`).
4. Upload it to R2 and build the URL exactly as described in the `workflow` skill
   (bucket and public base URL come from the repo's `CLAUDE.md`).
5. Give the user the URL. Do not commit the rendered file.
