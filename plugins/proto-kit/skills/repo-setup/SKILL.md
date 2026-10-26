---
name: repo-setup
description: Make any repository ready for proto-kit (pnpm workspace, CLAUDE.md with the fields the other skills read, approval rules for destructive wrangler commands, and the plugin reference for collaborators). Runs automatically the first time /new, /deploy, /render or /capture is used in a repo that is not set up; also on demand via /proto-init.
---

# Repo setup

A repo is **set up** when it has `pnpm-workspace.yaml` and a `CLAUDE.md` containing `## Cloudflare`. The other
commands check this first and run this skill when it is missing, so nobody has to prepare a repo by hand.

The templates are in `templates/` next to this file (this skill's base directory):

| Template | Goes to | What it does |
| --- | --- | --- |
| `CLAUDE.md` | `CLAUDE.md` | Where packages go, the Worker prefix, and the `## Cloudflare` section (filled at the first deploy) |
| `pnpm-workspace.yaml`, `package.json` | repo root | pnpm workspace; allows only the esbuild/workerd builds and Slidev's skill |
| `.claude/settings.json` | `.claude/settings.json` | Ask-before rules for `wrangler deploy`, `delete`, `secret` and similar; enables `proto-kit` (auto-update) and the Cloudflare plugin so collaborators are offered the install when they open the repo |
| `.gitignore`, `.gitattributes` | repo root | Keeps renders and secrets out; LF line endings for mixed Windows/Mac teams |

## Steps

1. Look at the repo first.
   - Empty or nearly empty (a README, a LICENSE): set it up without asking.
   - Already has its own layout (an app at the root, another package manager, a monorepo tool): ask before
     adding a pnpm workspace and `packages/`. If the user declines, only add `CLAUDE.md` and `.claude/settings.json`.
   - Not a git repo: run `git init -b main` first.
2. Copy the templates without destroying anything:
   - A file that does not exist yet: copy it.
   - `CLAUDE.md` exists: append only the missing sections; keep everything already there.
   - `.claude/settings.json` exists: merge — union `permissions.ask`, add the marketplace and plugin entries, keep
     every other key.
   - `.gitignore` / `.gitattributes` exist: append the missing lines.
   - `pnpm-workspace.yaml` exists: add the missing `allowBuilds` / `permissions` entries.
   - Claude Code asks the user before any write under `.claude/`. Say in one line that `.claude/settings.json`
     adds the ask-before rules for destructive wrangler commands, then write it; if the user declines, continue
     without it and mention that deploys will not prompt.
3. Fill in the placeholders without asking: `<Project name>` = the folder name, `<prefix>` = the folder name in
   lowercase with non-alphanumerics turned into `-` (shortened to about 20 characters), `<project>` in
   `package.json` = the same. Leave the Cloudflare values as `TODO`: the first deploy fills them in (see the
   `workflow` skill).
4. If the repo has collaborators and uses Remotion, mention once that a for-profit organization of 4 or more
   people needs a Remotion company license.
5. Tell the user in two or three lines what was added, then continue with the command that triggered the setup.
   Do not commit unless the user asks; on a shared repo, suggest a branch and a PR.
