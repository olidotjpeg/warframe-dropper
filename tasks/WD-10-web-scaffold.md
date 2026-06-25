# WD-10: Scaffold Vite + React app

**Epic:** C — Web App
**Depends on:** WD-1
**Estimate:** S (1–2 hours)

## Goal

Create the `packages/web` package using Vite's official React + TypeScript template, then wire it into the workspace so `npm run dev` from the repo root starts the dev server.

## Acceptance Criteria

- [ ] `npm run dev` from the repo root starts a Vite dev server on `http://localhost:5173`
- [ ] The browser shows the Vite + React default page
- [ ] TypeScript compiles without errors (`npm run build` inside `packages/web` succeeds)
- [ ] `packages/web/public/data/` directory exists (where the parser writes JSON)

## Implementation Notes

### 1. Scaffold with Vite

Run from the **repo root**:

```sh
npm create vite@latest packages/web -- --template react-ts
```

This creates `packages/web/` with all the scaffolding. Vite will ask you to confirm — say yes.

After scaffolding, delete the placeholder files you won't use:
```sh
rm packages/web/src/App.css
rm packages/web/src/assets/react.svg
rm packages/web/public/vite.svg
```

### 2. Update `packages/web/package.json`

Add the workspace name and reference the types package:

```json
{
  "name": "@warframe-dropper/web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@warframe-dropper/types": "*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.4.0",
    "vite": "^5.4.0"
  }
}
```

### 3. Wire into the root `package.json`

The root `package.json` from WD-1 already has `"dev": "npm run dev --workspace=packages/web"`. No change needed — the workspace declaration covers it.

Run `npm install` from the root to pick up the new packages.

### 4. Create the data directory

```sh
mkdir -p packages/web/public/data
touch packages/web/public/data/.gitkeep
```

> **Why in `public/`?** Vite serves everything in `public/` as static files. The React app fetches `/data/latest.json` at runtime — it's not bundled into the JS.

### 5. Clear the boilerplate

Replace `packages/web/src/App.tsx` with a minimal shell (the real implementation comes in WD-11+):

```tsx
export default function App() {
  return <div>Warframe Dropper — coming soon</div>;
}
```

### Verify

```sh
npm run dev
```

Open `http://localhost:5173` — you should see the placeholder text.

## Definition of Done

- [ ] `npm run dev` starts without errors
- [ ] Browser shows the placeholder text
- [ ] `packages/web/public/data/` directory exists
- [ ] `npm run build --workspace=packages/web` exits with code 0
