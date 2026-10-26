---
name: slides
description: Write a presentation with Slidev (Markdown + Vue + UnoCSS/Tailwind classes), embed 3D or video, and deploy it to Cloudflare Workers. Use when creating or editing slides, a deck, or a talk.
---

# Slides (Slidev)

## Content first

The deck's content comes from the user, not from this skill.

1. Collect the topic, who it is for, about how many slides, and the source material: files or URLs the user points
   to (a game design doc, notes, a prototype in this repo), plus anything said in the conversation. Ask once, in
   one message, only for what is missing (see `/new`).
2. Write a one-line-per-slide outline and show it to the user before writing the deck. Skip this for 5 slides or
   fewer, or when the user said to just make it.
3. Use only facts from the sources. A missing figure or name becomes a visible `TODO` on the slide, never an
   invented one.
4. A game pitch usually runs: title, the one-line hook, how it plays (embed the prototype), what makes it fun,
   target players, next steps. Embed a live prototype from this repo instead of describing it.

## Scaffold (non-interactive)

```bash
mkdir <dir> && cd <dir>
pnpm init
pnpm add -D @slidev/cli @slidev/theme-default wrangler
```

Add scripts to package.json. The build step deletes `dist/_redirects`: Slidev writes one, but Workers rejects it
as an infinite loop, and SPA routing is already handled by `not_found_handling` in `wrangler.jsonc`.

```json
{
  "dev": "slidev",
  "build": "slidev build && node -e \"require('fs').rmSync('dist/_redirects',{force:true})\"",
  "export": "slidev export"
}
```

`@slidev/cli` ships Slidev's official agent skill. If pnpm says "Agent skills awaiting approval: @slidev/cli",
run `pnpm approve @slidev/cli` once per workspace (it records the approval in `pnpm-workspace.yaml`). pnpm then
links the skill into `.claude/skills/pnpm-@slidev+cli-slidev` (gitignored, recreated by `pnpm install`). Follow it
for Slidev syntax; this skill only adds our build and deploy conventions.

Create `slides.md` (first block = global headmatter):

```markdown
---
theme: default
title: <title>
transition: slide-left
---

# Title

---
layout: two-cols
---

# Left
::right::
# Right

<!-- presenter notes go in HTML comments at the end of a slide -->
```

## Rules

- `---` separates slides; per-slide frontmatter sets `layout`, `class`, `background`.
- Use `v-click` / `<v-clicks>` for step-by-step reveals.
- Style with utility classes (`class="text-4xl text-center"`); avoid custom CSS unless needed.
- Media goes in `public/`. Video: `<video src="/clip.webm" autoplay loop muted playsinline class="w-full" />`.
  Large videos go to R2 instead (see the `workflow` skill) and use the R2 URL.
- 3D: Slidev is Vue, so do not port R3F code into it. Embed the deployed R3F prototype with
  `<iframe src="https://<prototype>.workers.dev/" class="w-full h-100 rounded" />`, or use a WebM recording.
- PDF export (`pnpm export`) needs `pnpm add -D playwright-chromium` first.

## Verify

1. `pnpm build` passes.
2. Run `pnpm dev`, open `http://localhost:3030/1`, `/2`, … and screenshot the key slides for the user.

## Deploy

Slides get their own Worker (separate from prototypes). `slidev build` outputs `dist/`; use the same
`wrangler.jsonc` shape as the `web-prototype` skill. Only if the deck is served under a sub-path,
build with `slidev build --base /<path>/`.
