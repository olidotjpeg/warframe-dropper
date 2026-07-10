# packages/parser

Scrapes the official Warframe drop table HTML page and converts it into `DropTable` JSON (see `@warframe-dropper/types`).

- `src/fetch.ts` — downloads the raw HTML from the DigitalOcean CDN URL.
- `src/parse.ts` — the real complexity lives here. Uses cheerio to walk `<h3 id>` sections, each containing a `<table>` in one of three row layouts (`Pattern` 1/2/3), auto-detected per-section by `detectPattern`. Getting the pattern classification wrong silently produces empty/garbled groups rather than an error, so when debugging bad output, check `detectPattern`'s regex/colspan heuristics first.
- `src/index.ts` — orchestrates fetch → parse → write `latest.json` + a dated snapshot (`YYYY-MM-DD.json`) into `packages/web/public/data/`.

Run with `npm run parse` from repo root. There is no test suite — verifying a parser change means running it and diffing the resulting JSON against a prior snapshot (the dated files in `packages/web/public/data/` double as fixtures for this).

The three patterns correspond to different content types on the source page (missions/relics/keys vs. enemy drop tables vs. bounty-style staged content) — see comments above each `parsePatternN` function.
