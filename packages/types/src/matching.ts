export function normalizeItemName(s: string): string {
    return s
        .toLowerCase()
        .replace(/\bblueprint\b/g, '')
        .replace(/[()]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export function findBestDropMatch(
    name: string,
    dropItemNames: string[]
): { match: string; exact: boolean } | null {
    const normalized = normalizeItemName(name);
    if (!normalized) return null;

    for (const candidate of dropItemNames) {
        if (normalizeItemName(candidate) === normalized) {
            return { match: candidate, exact: true };
        }
    }

    const tokens = new Set(normalized.split(' '));
    let best: { match: string; score: number } | null = null;
    for (const candidate of dropItemNames) {
        const candidateNormalized = normalizeItemName(candidate);
        const candidateTokens = candidateNormalized.split(' ').filter(Boolean);
        if (candidateTokens.length === 0) continue;
        const overlap = candidateTokens.filter((t) => tokens.has(t)).length;
        const score = overlap / Math.max(tokens.size, candidateTokens.length);
        if (score >= 0.75 && (!best || score > best.score)) {
            best = { match: candidate, score };
        }
    }

    return best ? { match: best.match, exact: false } : null;
}
