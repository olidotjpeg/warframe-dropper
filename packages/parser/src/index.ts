
import { join } from 'path';
import { fetchHtml } from "./fetch";
import { parseHtml } from "./parse";
import { mkdirSync, writeFileSync } from 'fs';

const OUT_DIR = join(
    new URL('.', import.meta.url).pathname,
    '../../../packages/web/public/data'
);

async function main() {
    console.log("Fetching drop table...");
    const html = await fetchHtml();

    console.log("Parsing HTML")
    const table = parseHtml(html);
    console.log(`Parsed ${table.sections.length} sections`)

    mkdirSync(OUT_DIR, { recursive: true });

    // Write latest.json
    const latestPath = join(OUT_DIR, 'latest.json');
    writeFileSync(latestPath, JSON.stringify(table, null, 2));
    console.log(`Wrote ${latestPath}`);

    // Writed dated snapshot
    const date = new Date().toISOString().slice(0, 10);
    const snapshotPath = join(OUT_DIR, `${date}.json`);
    writeFileSync(snapshotPath, JSON.stringify(table, null, 2));
    console.log(`Wrote ${snapshotPath}`)

    console.log('Done!');
}


main().catch((err) => {
  console.error(err);
  process.exit(1);
});