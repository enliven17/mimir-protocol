# Mimir Protocol

Site and documentation for Mimir, the AI oracle for real-world questions: [protocol.mimirmarkets.xyz](https://protocol.mimirmarkets.xyz).

- `site/`: the landing page and shared assets.
- `content/docs/`: the documentation, one Markdown file per page. The sidebar order is the `NAV` list in `build.mjs`.
- `build.mjs`: renders the docs into `dist/` with `marked`, plus a search index.

```sh
npm install
npm run build   # writes dist/
```

Contracts, oracle and backend live in [enliven17/mimir-markets](https://github.com/enliven17/mimir-markets).

Fonts: Geist and Geist Mono (SIL OFL, `site/fonts/GEIST-LICENSE.txt`), Terminal Grotesque (SIL OFL, `site/fonts/TERMINAL-GROTESQUE-LICENSE.md`).
