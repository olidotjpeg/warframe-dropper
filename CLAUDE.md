# CLAUDE.md

## Project

Warframe Dropper: look up where Warframe items drop from (missions, bounties, relics) and browse drop chances.

npm workspaces monorepo:
- `packages/types` — shared TS interfaces for drop table data (`DropTable`, `Section`, `Group`, `Rotation`, `Drop`). No logic.
- `packages/parser` — scrapes/parses the source site into `DropTable` JSON. Entry: `src/index.ts`. Run: `npm run parse`.
- `packages/web` — React + Vite frontend. Entry: `src/App.tsx`, data loaded via `src/hooks/useDropData.ts`. Run: `npm run dev`.

Data flow: `parser` writes `packages/web/public/data/latest.json` (+ dated snapshot) → `web` fetches it at runtime. No backend — static site reading a static JSON file.

See the nested `CLAUDE.md` in each package for details specific to that package.

See `JOURNAL.md` for the history of decisions and discoveries from past sessions — check it for relevant context before starting non-trivial work. When you make a notable decision, hit a dead end, or learn something non-obvious during a session, propose a short journal entry rather than writing it directly; only add it once the user approves.

## How to think about changes here

**Think before coding.** Don't assume, don't hide confusion. State your assumptions explicitly — if uncertain, ask. If multiple interpretations of a request exist, present them rather than silently picking one. If a simpler approach exists, say so and push back when warranted. If something is genuinely unclear, stop and name what's confusing before writing code.

**Simplicity first.** Write the minimum code that solves the problem — nothing speculative. No features beyond what was asked, no abstractions for single-use code, no "flexibility" that wasn't requested, no error handling for scenarios that can't happen here. If it could be half the size, rewrite it. Ask: would a senior engineer call this overcomplicated?

**Surgical changes.** Touch only what the task requires. Don't "improve" adjacent code, comments, or formatting, and don't refactor things that aren't broken — match existing style even if you'd do it differently. If you notice unrelated dead code, mention it rather than deleting it. When your change makes an import/variable/function unused, remove it; don't remove pre-existing dead code unless asked. Every changed line should trace back to the request.

**Goal-driven execution.** Turn tasks into verifiable goals instead of vague ones — "fix the bug" becomes "write a test that reproduces it, then make it pass." For multi-step work, state a brief plan with a verification step per stage before implementing. Strong success criteria let you work independently; weak ones ("make it work") just cause back-and-forth.

These guidelines bias toward caution over speed — use judgment on trivial tasks.
