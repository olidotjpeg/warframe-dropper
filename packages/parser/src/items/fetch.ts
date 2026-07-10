import { decompress } from 'lzma1';

const INDEX_URL = 'https://origin.warframe.com/PublicExport/index_en.txt.lzma';
const CONTENT_BASE = 'http://content.warframe.com/PublicExport/Manifest/';

export interface IndexEntry {
    name: string;
    hash: string;
}

export async function fetchIndex(): Promise<IndexEntry[]> {
    console.log(`Fetching ${INDEX_URL}`);
    const res = await fetch(INDEX_URL);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const compressed = new Uint8Array(await res.arrayBuffer());
    const decompressed = decompress(compressed);
    const text = Buffer.from(decompressed).toString('utf-8');

    return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [name, hash] = line.split('!');
            return { name, hash };
        });
}

export async function fetchExport<T>(exportName: string, index: IndexEntry[]): Promise<T> {
    const fileName = `${exportName}_en.json`;
    const entry = index.find((e) => e.name === fileName);
    if (!entry) {
        throw new Error(`${fileName} not found in PublicExport index`);
    }

    const url = `${CONTENT_BASE}${entry.name}!${entry.hash}`;
    console.log(`Fetching ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
    }

    return res.json() as Promise<T>;
}
