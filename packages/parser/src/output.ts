import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';

export function resolveOutDir(): string {
    return join(
        new URL('.', import.meta.url).pathname,
        '../../../packages/web/public/data'
    );
}

export function writeSnapshot(outDir: string, prefix: string, data: unknown): void {
    mkdirSync(outDir, { recursive: true });

    const json = JSON.stringify(data, null, 2);

    const latestPath = join(outDir, `${prefix}latest.json`);
    writeFileSync(latestPath, json);
    console.log(`Wrote ${latestPath}`);

    const date = new Date().toISOString().slice(0, 10);
    const snapshotPath = join(outDir, `${prefix}${date}.json`);
    writeFileSync(snapshotPath, json);
    console.log(`Wrote ${snapshotPath}`);
}
