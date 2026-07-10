export interface Drop {
    item: string;
    rarity: string;
    chance: number;
}

export interface Stage {
    name: string;
    drops: Drop[];
}

export interface Rotation {
    name: string;
    stages: Stage[];
}

export interface Group {
    name: string;
    dropChance?: number;
    rotations: Rotation[];
}

export interface Section {
    id: string;
    name: string;
    groups: Group[];
}

export interface DropTable {
    fetchedAt: string;
    lastUpdate: string;
    sections: Section[];
}

export interface CollapsedSource {
    groupName: string;
    stageName: string;
    rotations: { rotationName: string; rarity: string; chance: number }[];
}

export type ItemCategory =
    | 'resource'
    | 'warframe'
    | 'weapon'
    | 'sentinel'
    | 'archwing'
    | 'other';

export interface ExportItem {
    uniqueName: string;
    name: string;
    category: ItemCategory;
}

export interface Ingredient {
    uniqueName: string;
    name: string;
    count: number;
}

export interface Recipe {
    resultUniqueName: string;
    resultName: string;
    ingredients: Ingredient[];
    buildTime?: number;
    buildPrice?: number;
}

export interface ItemExport {
    fetchedAt: string;
    items: ExportItem[];
    recipes: Record<string, Recipe>;
}

export interface ShoppingListBuild {
    id: string;
    targetUniqueName: string;
    targetName: string;
    quantity: number;
    addedAt: string;
}

export interface AggregatedResource {
    name: string;
    totalCount: number;
    fromBuilds: { buildId: string; targetName: string; count: number }[];
}

export * from './matching';

