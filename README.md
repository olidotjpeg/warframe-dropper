# Warframe Dropper

A tool for looking up where Warframe items drop from (missions, bounties, and relics) and browsing drop chances.

## Structure

This is an npm workspaces monorepo:

- `packages/parser` — scrapes/parses drop table data into a single `latest.json`.
- `packages/types` — shared TypeScript types for the drop table data (`DropTable`, `Section`, `Group`, `Rotation`, `Drop`, etc).
- `packages/web` — React + Vite frontend for searching items and browsing their drop sources.

## Getting started

Install dependencies from the repo root:

```sh
npm install
```

Run the frontend locally:

```sh
npm run dev
```

Regenerate the drop table data:

```sh
npm run parse
```

This writes the parsed data to `packages/web/public/data/latest.json`, which the frontend loads directly.

## Building for production

```sh
npm run build --workspace=packages/web
```
