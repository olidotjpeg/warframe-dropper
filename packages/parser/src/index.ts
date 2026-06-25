import { fetchHtml } from "./fetch";
import { parseHtml } from "./parse";

async function main() {
    console.log("Fetching drop table...");
    const html = await fetchHtml();
    console.log(`Fetch ${html.length} bytes`)

    console.log("Parsing HTML")
    const table = parseHtml(html);
    console.log(`Parsed ${table.sections.length} sections`)
}


main().catch(console.error)