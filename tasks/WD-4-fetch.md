# WD-4: Implement fetch.ts

**Epic:** B — Parser
**Depends on:** WD-3
**Estimate:** S (30 minutes)

## Goal

Implement the `fetchHtml()` function that downloads the official Warframe drop table HTML page and returns it as a string. This is intentionally simple — one function, one HTTP GET, no retries needed.

## Acceptance Criteria

- [ ] `fetchHtml()` returns a string longer than 1 000 000 characters (the real page is ~3 MB)
- [ ] The function logs the byte count to stdout
- [ ] Running `npm run parse` no longer crashes on the fetch step (it will crash on "not implemented" in parse — that's fine)

## Implementation Notes

### The URL

```
https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html
```

This is a static CDN file. It does not require authentication or cookies.

### Implementation

Replace the placeholder in `packages/parser/src/fetch.ts`:

```typescript
const URL =
  'https://warframe-web-assets.nyc3.cdn.digitaloceanspaces.com/uploads/cms/hnfvc0o3jnfvc873njb03enrf56.html';

export async function fetchHtml(): Promise<string> {
  console.log(`Fetching ${URL}`);
  const res = await fetch(URL);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  console.log(`Downloaded ${html.length.toLocaleString()} characters`);
  return html;
}
```

> **`fetch()` is built into Node.js 18+.** No extra library needed. If you're on an older Node version, run `node --version` and upgrade if needed.

### Quick manual test

You can test the function in isolation before wiring it into the full parser:

```sh
node --input-type=module <<'EOF'
import { fetchHtml } from './packages/parser/src/fetch.ts';
const html = await fetchHtml();
console.log('First 200 chars:', html.slice(0, 200));
EOF
```

Or simpler, just run `npm run parse` — it will now get through the fetch step and crash on the parse step instead.

## Definition of Done

- [ ] `npm run parse` prints "Downloaded X characters" before crashing on "not implemented"
- [ ] The character count printed is > 1,000,000
- [ ] No unhandled promise rejections
