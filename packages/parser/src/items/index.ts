import { join } from 'path';
import { readFileSync } from 'fs';
import type { DropTable, ItemExport, Recipe } from '@warframe-dropper/types';
import { findBestDropMatch } from '@warframe-dropper/types';
import { fetchExport, fetchIndex } from './fetch';
import { resolveItems, resolveRecipes, type RawExports } from './resolve';
import { resolveOutDir, writeSnapshot } from '../output';

function crossCheckIngredientNames(dropTable: DropTable, recipes: Record<string, Recipe>): void {
    const dropItemNames = [
        ...new Set(
            dropTable.sections.flatMap((s) =>
                s.groups.flatMap((g) =>
                    g.rotations.flatMap((r) => r.stages.flatMap((st) => st.drops.map((d) => d.item)))
                )
            )
        ),
    ];

    const allIngredientNames = [
        ...new Set(Object.values(recipes).flatMap((r) => r.ingredients.map((i) => i.name))),
    ];
    const unmatched = allIngredientNames.filter((name) => !findBestDropMatch(name, dropItemNames));
    console.log(
        `${allIngredientNames.length - unmatched.length}/${allIngredientNames.length} ingredient names matched against drop table`
    );
}

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

    const outDir = resolveOutDir();

    try {
        const dropTable: DropTable = JSON.parse(readFileSync(join(outDir, 'latest.json'), 'utf-8'));
        crossCheckIngredientNames(dropTable, recipes);
    } catch (err) {
        console.warn('Could not cross-check ingredient names against drop table:', err);
    }

    writeSnapshot(outDir, 'items-', itemExport);

    console.log('Done!');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
