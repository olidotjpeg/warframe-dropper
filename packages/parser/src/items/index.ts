import { join } from 'path';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import type { ItemExport } from '@warframe-dropper/types';
import { findBestDropMatch } from '@warframe-dropper/types';
import { fetchExport, fetchIndex } from './fetch';
import { resolveItems, resolveRecipes, type RawExports } from './resolve';

const OUT_DIR = join(
    new URL('.', import.meta.url).pathname,
    '../../../../packages/web/public/data'
);

async function main() {
    console.log('Fetching PublicExport index...');
    const index = await fetchIndex();
    console.log(`Index has ${index.length} entries`);

    console.log('Fetching item exports...');
    const raw: RawExports = {
        resources: await fetchExport('ExportResources', index),
        recipes: await fetchExport('ExportRecipes', index),
        warframes: await fetchExport('ExportWarframes', index),
        weapons: await fetchExport('ExportWeapons', index),
        sentinels: await fetchExport('ExportSentinels', index),
    };

    const allItems = resolveItems(raw);
    const recipes = resolveRecipes(raw.recipes.ExportRecipes, allItems);
    const buildableCount = allItems.filter((item) => recipes[item.uniqueName]).length;

    console.log(
        `Resolved ${allItems.length} items (${buildableCount} buildable), ${Object.keys(recipes).length} recipes`
    );

    // `items` includes non-buildable resources too, since resolving a recipe's
    // ingredients down to raw materials needs each ingredient's category
    // (e.g. Orokin Cell has its own "synthesize from raw materials" recipe,
    // but is a farmable resource and should be treated as a leaf, not expanded).
    const itemExport: ItemExport = {
        fetchedAt: new Date().toISOString(),
        items: allItems,
        recipes,
    };

    try {
        const dropTable = JSON.parse(readFileSync(join(OUT_DIR, 'latest.json'), 'utf-8'));
        const dropItemNames = [
            ...new Set(
                dropTable.sections.flatMap((s: any) =>
                    s.groups.flatMap((g: any) =>
                        g.rotations.flatMap((r: any) =>
                            r.stages.flatMap((st: any) => st.drops.map((d: any) => d.item))
                        )
                    )
                )
            ),
        ] as string[];

        const allIngredientNames = [
            ...new Set(Object.values(recipes).flatMap((r) => r.ingredients.map((i) => i.name))),
        ];
        const unmatched = allIngredientNames.filter(
            (name) => !findBestDropMatch(name, dropItemNames)
        );
        console.log(
            `${allIngredientNames.length - unmatched.length}/${allIngredientNames.length} ingredient names matched against drop table`
        );
    } catch (err) {
        console.warn('Could not cross-check ingredient names against drop table:', err);
    }

    mkdirSync(OUT_DIR, { recursive: true });

    const latestPath = join(OUT_DIR, 'items-latest.json');
    writeFileSync(latestPath, JSON.stringify(itemExport, null, 2));
    console.log(`Wrote ${latestPath}`);

    const date = new Date().toISOString().slice(0, 10);
    const snapshotPath = join(OUT_DIR, `items-${date}.json`);
    writeFileSync(snapshotPath, JSON.stringify(itemExport, null, 2));
    console.log(`Wrote ${snapshotPath}`);

    console.log('Done!');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
