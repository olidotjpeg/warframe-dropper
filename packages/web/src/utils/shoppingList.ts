import type {
  AggregatedResource,
  ExportItem,
  ItemExport,
  ShoppingListBuild,
} from '@warframe-dropper/types'
import { findBestDropMatch } from '@warframe-dropper/types'
import { load } from './storage'

export function getBuildableItems(itemExport: ItemExport): ExportItem[] {
  return itemExport.items.filter((i) => itemExport.recipes[i.uniqueName])
}

export function matchBuildableItem(buildableItems: ExportItem[], dropItemName: string): ExportItem | null {
  const names = buildableItems.map((i) => i.name)
  const match = findBestDropMatch(dropItemName, names)
  if (!match) return null
  return buildableItems.find((i) => i.name === match.match) ?? null
}

interface LeafIngredient {
  uniqueName: string
  name: string
  count: number
}

/**
 * Recursively flattens a recipe's ingredients down to raw farmable resources.
 *
 * Some resources (e.g. Orokin Cell, Neural Sensors) have their own foundry
 * "synthesize from raw materials" recipe in ExportRecipes even though the
 * realistic way to get them is farming the drop directly — expanding those
 * would multiply totals by their (huge) synthesis cost. So recursion stops
 * at anything tagged category 'resource', not just anything lacking a recipe.
 */
export function getRecipeIngredients(itemExport: ItemExport, uniqueName: string): LeafIngredient[] {
  const leaves = new Map<string, LeafIngredient>()
  const categoryByUniqueName = new Map(itemExport.items.map((i) => [i.uniqueName, i.category]))

  function expand(targetUniqueName: string, multiplier: number, path: Set<string>) {
    const recipe = itemExport.recipes[targetUniqueName]
    if (!recipe || path.has(targetUniqueName)) return
    const nextPath = new Set(path).add(targetUniqueName)

    for (const ingredient of recipe.ingredients) {
      const count = ingredient.count * multiplier
      const isResource = categoryByUniqueName.get(ingredient.uniqueName) === 'resource'
      const subRecipe = itemExport.recipes[ingredient.uniqueName]
      if (subRecipe && !isResource) {
        expand(ingredient.uniqueName, count, nextPath)
      } else {
        const existing = leaves.get(ingredient.uniqueName)
        leaves.set(ingredient.uniqueName, {
          uniqueName: ingredient.uniqueName,
          name: ingredient.name,
          count: (existing?.count ?? 0) + count,
        })
      }
    }
  }

  expand(uniqueName, 1, new Set())
  return [...leaves.values()]
}

export function aggregateShoppingList(
  itemExport: ItemExport,
  builds: ShoppingListBuild[]
): AggregatedResource[] {
  const totals = new Map<string, AggregatedResource>()

  for (const build of builds) {
    const ingredients = getRecipeIngredients(itemExport, build.targetUniqueName)
    for (const ingredient of ingredients) {
      const count = ingredient.count * build.quantity
      const existing = totals.get(ingredient.name)
      if (existing) {
        existing.totalCount += count
        existing.fromBuilds.push({ buildId: build.id, targetName: build.targetName, count })
      } else {
        totals.set(ingredient.name, {
          name: ingredient.name,
          totalCount: count,
          fromBuilds: [{ buildId: build.id, targetName: build.targetName, count }],
        })
      }
    }
  }

  return [...totals.values()].sort((a, b) => b.totalCount - a.totalCount)
}

export function loadBuilds(): ShoppingListBuild[] {
  return load('shoppingListBuilds', [])
}

export function saveBuilds(builds: ShoppingListBuild[]) {
  localStorage.setItem('shoppingListBuilds', JSON.stringify(builds))
}

export type AcquiredState = Record<string, number>

export function loadAcquired(): AcquiredState {
  return load('shoppingListAcquired', {})
}

export function saveAcquired(acquired: AcquiredState) {
  localStorage.setItem('shoppingListAcquired', JSON.stringify(acquired))
}
