---
name: capture
description: Record a browser being driven automatically (Playwright) and turn it into a demo video with a drawn cursor, click ripples, drag zoom and captions (Remotion), then share it via R2. Use when the user wants a screen-recording style demo, a walkthrough video, or a PV that shows someone using a web page.
---

# Capture a browser demo

The recording has no cursor (Playwright drives the page from inside the browser). The script logs every mouse
move, click, drag and wheel with timestamps, and Remotion draws the cursor and effects from that log.

The two templates are in `templates/` next to this file (this skill's base directory).

0. If this repo is not set up yet (no `pnpm-workspace.yaml`, or `CLAUDE.md` has no `## Cloudflare`), run the
   `repo-setup` skill first.
1. Pick the video package: an existing `pv` package in this repo, or create one with `/new pv <name>`.
   Install Playwright there once: `pnpm add -D playwright` and `pnpm exec playwright install chromium`.
2. Copy the templates:
   - `templates/capture.mjs` → `capture/<name>.mjs`. Set `URL` and `NAME`, and write the steps between the
     `操作` markers with `moveTo`, `click`, `drag` and `wheel`. Keep the whole demo around 10–15 seconds.
   - `templates/CaptureDemo.tsx` → `src/CaptureDemo.tsx` (once per package). Register it in `src/Root.tsx`:
     `<Composition id="CaptureDemo" component={CaptureDemo} fps={30} durationInFrames={300} width={1280} height={720}
     defaultProps={{ name: "<name>", log: null }} calculateMetadata={calculateCaptureMetadata} />`.
     Adjust the title text and the captions for this demo.
   - Add `public/capture` to the package's `.gitignore` (the recording can be regenerated).
3. Run `node capture/<name>.mjs`. Look at `public/capture/<name>-last.png` to confirm the page (and any WebGL)
   rendered; if it is blank, wait longer before `ready` or check the URL.
4. Render 2–3 stills at a click, mid-drag and a wheel (`pnpm exec remotion still CaptureDemo out/x.png --frame=N`;
   frame = (event time − ready + 0.4) × 30) and check that the cursor lines up with the page.
5. Render (`pnpm exec remotion render CaptureDemo out/<name>-capture.mp4`), upload to R2 and give the URL, as in
   the `workflow` skill. Do not commit the video or the recording.

Limits: Playwright records at about 25 fps, and the drag zoom crops the edges of the frame slightly.
