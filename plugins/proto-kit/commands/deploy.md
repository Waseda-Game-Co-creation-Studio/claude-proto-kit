---
description: 現在のプロトタイプかスライドを Cloudflare Workers にデプロイする
argument-hint: "[directory]"
---

Deploy to Cloudflare Workers. Target directory: $ARGUMENTS (default: the current package).

0. If this repo is not set up yet (no `pnpm-workspace.yaml`, or `CLAUDE.md` has no `## Cloudflare`), run the
   `repo-setup` skill first.
1. Confirm wrangler login with `npx wrangler whoami`. If not logged in, stop and ask the user to run
   `npx wrangler login`.
2. If `wrangler` is not in the package's devDependencies, add it (`pnpm add -D wrangler`, see the `workflow`
   skill for build approval). If there is no `wrangler.jsonc`, create one as in the `web-prototype` skill, with the Worker name from the
   `workflow` skill.
3. Check the account: `wrangler.jsonc` must have `account_id`, and it must match the Account ID in this repo's
   `CLAUDE.md`. If either is missing or they differ, stop and follow the account rules in the `workflow` skill.
4. Run `pnpm build`, then `npx wrangler deploy`.
5. Report the deployed URL and which account it went to, open it, and show the user a screenshot.
