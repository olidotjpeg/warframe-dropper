# WD-1: Initialize monorepo with npm workspaces

**Epic:** A — Infrastructure
**Depends on:** none
**Estimate:** S (1–2 hours)

## Goal

Set up the project skeleton: a root `package.json` with npm workspaces, a shared TypeScript config, and the empty directory structure that all other tickets will fill in. After this ticket, `npm install` works and the workspace layout is ready.

## Acceptance Criteria

- [ ] `npm install` succeeds from the repo root with no errors
- [ ] Running `npm run parse` from the root produces "not implemented yet" (or similar) without crashing
- [ ] `packages/types/`, `packages/parser/`, and `packages/web/` directories exist
- [ ] TypeScript is installed at the root and `tsc --version` works

## Implementation Notes

### 1. Root `package.json`

Create `/package.json`:

```json
{
  "name": "warframe-dropper",
  "private": true,
  "workspaces": [
    "packages/types",
    "packages/parser",
    "packages/web"
  ],
  "scripts": {
    "parse": "tsx packages/parser/src/index.ts",
    "dev": "npm run dev --workspace=packages/web"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "tsx": "^4.7.0"
  }
}
```

> **Why `private: true`?** Prevents accidentally publishing the root package to npm. Workspaces require it.

> **Why `tsx` at the root?** The `parse` script runs TypeScript directly without a build step. `tsx` handles this — think of it as `ts-node` but faster.

### 2. Root `tsconfig.json`

Create `/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 3. Create empty package directories

```sh
mkdir -p packages/types/src
mkdir -p packages/parser/src
mkdir -p packages/web/src
mkdir -p packages/web/public/data
```

### 4. Install dependencies

```sh
npm install
```

npm will create a `node_modules/` at the root and hoist shared dependencies there. You'll see a `package-lock.json` appear — commit this file.

### Gotchas

- Do **not** run `npm install` inside individual `packages/` directories at this stage — the workspace root handles everything.
- The `packages/web/public/data/` directory needs to exist so the parser can write JSON there later (WD-9). Create it now and add a `.gitkeep` file so git tracks it.

## Definition of Done

- [ ] `npm install` exits with code 0
- [ ] `ls packages/` shows `types  parser  web`
- [ ] `npx tsc --version` prints a version number
- [ ] All created files are committed to git
