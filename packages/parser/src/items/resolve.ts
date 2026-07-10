import type { ExportItem, Ingredient, ItemCategory, Recipe } from '@warframe-dropper/types';

interface RawEntry {
    uniqueName: string;
    name: string;
    [key: string]: unknown;
}

interface RawIngredient {
    ItemType: string;
    ItemCount: number;
}

interface RawRecipe {
    uniqueName: string;
    resultType: string;
    buildTime?: number;
    buildPrice?: number;
    ingredients: RawIngredient[];
}

export interface RawExports {
    resources: { ExportResources: RawEntry[] };
    recipes: { ExportRecipes: RawRecipe[] };
    warframes: { ExportWarframes: RawEntry[] };
    weapons: { ExportWeapons: RawEntry[] };
    sentinels: { ExportSentinels: RawEntry[] };
}

export function resolveItems(raw: RawExports): ExportItem[] {
    const byUniqueName = new Map<string, ExportItem>();

    const add = (entries: RawEntry[], category: ItemCategory) => {
        for (const entry of entries) {
            if (!entry.uniqueName || !entry.name) continue;
            if (!byUniqueName.has(entry.uniqueName)) {
                byUniqueName.set(entry.uniqueName, {
                    uniqueName: entry.uniqueName,
                    name: entry.name,
                    category,
                });
            }
        }
    };

    add(raw.warframes.ExportWarframes, 'warframe');
    add(raw.weapons.ExportWeapons, 'weapon');
    add(raw.sentinels.ExportSentinels, 'sentinel');
    add(raw.resources.ExportResources, 'resource');

    return [...byUniqueName.values()];
}

function humanizeUniqueName(uniqueName: string): string {
    const lastSegment = uniqueName.split('/').pop() ?? uniqueName;
    return lastSegment.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
}

function resolveName(uniqueName: string, itemsByUniqueName: Map<string, ExportItem>): string {
    return itemsByUniqueName.get(uniqueName)?.name ?? humanizeUniqueName(uniqueName);
}

export function resolveRecipes(
    rawRecipes: RawRecipe[],
    items: ExportItem[]
): Record<string, Recipe> {
    const itemsByUniqueName = new Map(items.map((i) => [i.uniqueName, i]));
    const recipes: Record<string, Recipe> = {};

    for (const raw of rawRecipes) {
        if (!raw.resultType || !raw.ingredients?.length) continue;

        const ingredients: Ingredient[] = raw.ingredients.map((ing) => ({
            uniqueName: ing.ItemType,
            name: resolveName(ing.ItemType, itemsByUniqueName),
            count: ing.ItemCount,
        }));

        recipes[raw.resultType] = {
            resultUniqueName: raw.resultType,
            resultName: resolveName(raw.resultType, itemsByUniqueName),
            ingredients,
            buildTime: raw.buildTime,
            buildPrice: raw.buildPrice,
        };
    }

    return recipes;
}
