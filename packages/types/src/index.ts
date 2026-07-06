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

