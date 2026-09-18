## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## shadcn/ui

shadcn components are available as React islands. Add them with `npx shadcn@latest add <name>` — **never run `shadcn init`**, it rewrites `src/styles/global.css` and destroys the Starlight bridging described below.

Four constraints, all easy to break:

- **Wrap components in `.not-content` when used inside MDX.** Starlight's markdown styles otherwise bleed into them: `<div class="not-content"><Button client:load>…</Button></div>`.
- **Dark mode is `data-theme`, not `.dark`.** `@astrojs/starlight-tailwind` already redefines the `dark:` variant to target `[data-theme=dark]`, so Starlight's own theme toggle drives shadcn tokens with no extra JS. Reintroducing shadcn's `.dark` selector would silently never match.
- **Dark is the base state.** Tokens in `global.css` put dark values on bare `:root` and light values under `:root[data-theme='light']`, mirroring starlight-tailwind's inversion.
- **Full Tailwind Preflight is intentionally not imported.** starlight-tailwind restores only the border reset that shadcn needs. Importing `tailwindcss/preflight.css` would break Starlight's typography.

Structural tokens (`--background`, `--foreground`, `--border`, `--primary`, `--ring`, …) are aliased to Starlight's `--sl-*` variables so components match the docs chrome. Change the site accent via Starlight/Tailwind's accent scale, not by editing individual shadcn tokens.

The shadcn MCP server is registered in `.mcp.json` for browsing and installing components conversationally.

## Content structure

Seven documentation sections live under `src/content/docs/`: `features`, `custom-features`, `api`,
`architecture`, `low-level-design`, `flows`, and `platform-evaluation`. Each is wired into the sidebar as a group wrapping
an `autogenerate` config, so new pages dropped into those directories appear automatically —
`astro.config.mjs` only needs editing to add a *new* section.

Platform facts (operating companies, their order backends, payment providers, and marketing
platforms) belong in `src/data/platform.ts`, not hardcoded into pages. The home page renders from
it, and later pages should too. **Unconfirmed values are `null`, never guessed** — the UI renders
those as an explicit "Not documented" badge so gaps stay visible.

Home-page sections are React components in `src/components/home/`. They render statically with no
client directive; only `OpCoMatrix` is hydrated (`client:load`) because it uses tabs.

## Platform evaluation (Intershop vs commercetools)

Every rating, claim, and source lives in `src/data/evaluation.ts`; the MDX pages under
`platform-evaluation/` hold narrative only and render tables through components in
`src/components/evaluation/`. Evidence discipline is the point of the section:

- Each claim has an **evidence tag**: `documented` (vendor docs, release notes, source code),
  `vendor-claim` (press releases, blogs, customer stories, marketplace listings), `verified` (tested
  by our team, or a fact about our own production platform), or `unconfirmed`. Never upgrade a tag
  without new evidence.
- Unknown capabilities use the `unknown` rating ("Not confirmed"), never a guess.
- Every claim cites source ids from `sources`; citation numbers come from their order in that
  object, so append new sources rather than reordering.
- Bump `evaluationMeta.asOf` whenever facts change; the banner on every page shows it.
- Settled decisions from the evaluation's scoping: the section compares and recommends a **PoC as
  next step**, not a platform; the commercetools target is **one Project, one Store per OpCo**
  (labelled *Proposal*); cost is **qualitative only — no figures**; it does **not** recommend an API
  layer between AEM and commerce.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
