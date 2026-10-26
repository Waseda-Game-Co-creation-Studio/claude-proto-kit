---
name: workflow
description: Shared conventions for where prototypes live, naming, Cloudflare accounts and deploys, rendering video to R2, previews, secrets, and git hygiene. Use whenever creating, deploying, rendering, or sharing anything in any repo (a personal sandbox or a team project).
---

# Workflow conventions

These rules are shared by everyone using this plugin. Anything specific to one repo (where packages go, the
Worker name prefix, the Cloudflare account, the R2 bucket) lives in that repo's `CLAUDE.md`, never here.

## The repo's CLAUDE.md decides

| Setting | Where it comes from |
| --- | --- |
| Where a new package goes (e.g. `packages/<yyyymmdd>-<name>/`) | the repo's `CLAUDE.md` |
| Worker name prefix (e.g. `sbx-`, `<project>-`) | the repo's `CLAUDE.md` |
| Cloudflare Account ID, workers.dev subdomain, R2 bucket and public URL | `## Cloudflare` in the repo's `CLAUDE.md` |

A repo without these is set up automatically by the `repo-setup` skill, which leaves the Cloudflare values as
`TODO`. Treat `TODO` as missing: at the first deploy, ask for the account (see Accounts below), and after the
deploy write the workers.dev subdomain from the printed URL into `CLAUDE.md`. Any other missing value: ask once,
then write it into `CLAUDE.md`.

## Naming

- Worker name = `<prefix from CLAUDE.md><name>`. Prototypes and slides are always separate Workers.

## Cloudflare

### Accounts (personal vs. team)

One Cloudflare login (`wrangler login`) can reach several accounts: the personal one and each team's account the
user was invited to. Which account a deploy goes to is decided only by `account_id` in `wrangler.jsonc`.

- Every `wrangler.jsonc` must have `account_id`. Never deploy without it, or wrangler may pick the wrong account.
- Take the ID from the repo's `CLAUDE.md` (`## Cloudflare` → `Account ID`): a personal sandbox uses the personal
  account, a team repo uses that team's account. Never copy an ID from another repo.
- If the repo's `CLAUDE.md` has no Account ID, stop and ask. `npx wrangler whoami` lists the accounts and
  their IDs, so show that list and let the user choose; then write the choice into that `CLAUDE.md`.
- R2 buckets belong to an account too: use the bucket listed in the same `CLAUDE.md`.
- `wrangler r2 …` commands do not read `account_id` from `wrangler.jsonc`, and fail when the login sees several
  accounts. Pass the same ID as an environment variable: PowerShell `$env:CLOUDFLARE_ACCOUNT_ID = '<id>'`,
  bash `CLOUDFLARE_ACCOUNT_ID=<id> npx wrangler r2 …`.
- R2 must be enabled once per account in the Cloudflare dashboard (error 10042 otherwise). That step accepts
  terms and may ask for billing details, so the user does it; never try to do it for them.

### Wrangler

- Use Wrangler for every project, new ones included: create `wrangler.jsonc` first, then the official `wrangler`
  skill applies. Do not use the `cf` CLI (beta), even where the Cloudflare skills suggest it for new projects.
- Wrangler is a devDependency of each project, pinned by the lockfile (`pnpm add -D wrangler`). Run it as
  `npx wrangler …`, which uses that local copy. Never `npx --yes wrangler` or `pnpm dlx wrangler`: both fetch an
  unpinned latest version, and `pnpm dlx` also stops at a build-approval prompt in an interactive terminal.
- pnpm blocks install scripts by default; wrangler needs `esbuild` and `workerd`. If pnpm reports
  `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds esbuild workerd` (it writes `allowBuilds` into
  `pnpm-workspace.yaml`). Approve only those two. Check login with `npx wrangler whoami`;
  if not logged in, ask the user to run `npx wrangler login` themselves.
- The R2 bucket name and public base URL are in the repo's `CLAUDE.md` under `## Cloudflare`. If they are missing, ask.
- R2 object commands need `--remote` (otherwise wrangler writes to a local simulator).

### Secrets and public endpoints

Everything deployed to workers.dev is public to anyone who has the URL.

- Never put API keys or tokens in front-end code or in `VITE_*` variables: Vite inlines them into the built JS,
  where anyone can read them.
- Keys belong to the Worker: `npx wrangler secret put <NAME>` for production, `.dev.vars` (gitignored) for local
  dev. The browser calls the Worker, and the Worker calls the external API.
- A Worker that calls a paid API (Claude, etc.) must have a rate limit (`ratelimits` in `wrangler.jsonc`) before
  it is deployed, so strangers cannot run up the bill.
- Before deploying, check that `dist/` contains no key-like strings (`sk-`, `api_key`, `token`); stop and tell
  the user if it does.

## Video: render → R2 → URL

```bash
pnpm exec remotion render <CompositionId> out/<name>.mp4          # add --gl=angle when the scene uses @remotion/three
npx wrangler r2 object put <bucket>/<yyyymmdd>-<name>.mp4 --file out/<name>.mp4 --content-type video/mp4 --remote
```

The shareable URL is `<public base URL>/<yyyymmdd>-<name>.mp4`. Check it with a HEAD request (200, `video/mp4`)
and a Range request (206), which `<video>` needs for seeking.

If the repo's `CLAUDE.md` names a bucket that does not exist yet (and R2 is enabled), create it and turn on its
public URL, then write the URL into `CLAUDE.md`:

```bash
npx wrangler r2 bucket create <bucket>
npx wrangler r2 bucket dev-url enable <bucket> --force   # --force skips the confirmation prompt
npx wrangler r2 bucket dev-url get <bucket>               # prints https://pub-….r2.dev
```

The r2.dev URL is rate-limited and meant for light use (a few viewers is fine). If the file is too large for wrangler, tell the
user and suggest rclone (S3-compatible API).

## Remotion

- If the repo has the official Remotion skills (`.claude/skills/remotion-*`), follow them.
- If not, install them once at the repo root as described in `/new` (pv), then commit them.
- Remotion is free for individuals and organizations of up to 3 people. A for-profit organization of 4 or more
  needs a company license: mention it when a team repo starts using Remotion.

## Previews

- Default: take a screenshot, or give the R2 / workers.dev URL, so the user can check from the chat (often on a phone).
- Hands-on testing: `npx wrangler versions upload` (preview URL, production untouched) or
  `cloudflared tunnel --url http://localhost:<port>` (temporary public URL).

## Git

- Never commit renders (mp4/webm/mov), `.env*`, `.dev.vars`, or `.wrangler/`.
- Suggest pushing at the end of a work session: cloud sessions only see pushed code.
- Team repos: work on a branch and open a PR; never push to `main`.
