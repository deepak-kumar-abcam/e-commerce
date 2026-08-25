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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
