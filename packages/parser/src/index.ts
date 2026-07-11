import { fetchHtml } from "./fetch";
import { parseHtml } from "./parse";
import { resolveOutDir, writeSnapshot } from "./output";

async function main() {
    console.log("Fetching drop table...");
    const html = await fetchHtml();

    console.log("Parsing HTML")
    const table = parseHtml(html);
    console.log(`Parsed ${table.sections.length} sections`)

    writeSnapshot(resolveOutDir(), '', table);

    console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
