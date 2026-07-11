import type { ItemExport, ShoppingListBuild } from '@warframe-dropper/types'
import { aggregateShoppingList, getRecipeIngredients, type AcquiredState } from '../utils/shoppingList'

interface Props {
  itemData: ItemExport
  builds: ShoppingListBuild[]
  acquired: AcquiredState
  onRemoveBuild: (id: string) => void
  onSetQuantity: (id: string, quantity: number) => void
  onToggleAcquired: (name: string, totalCount: number) => void
}

export function ShoppingListTab({
  itemData,
  builds,
  acquired,
  onRemoveBuild,
  onSetQuantity,
  onToggleAcquired,
}: Props) {
  if (builds.length === 0) {
    return (
      <p className="empty-state">
        No builds added yet — add something to build from the Search tab.
      </p>
    )
  }

  const resources = aggregateShoppingList(itemData, builds)

  return (
    <div>
      <div className="optimizer-section">
        <h2>Builds</h2>
        {builds.map((build) => {
          const ingredients = getRecipeIngredients(itemData, build.targetUniqueName)
          return (
            <div key={build.id} className="result-group">
              <div className="result-header">
                <strong>{build.targetName}</strong>
                <input
                  type="number"
                  min={1}
                  className="build-quantity-input"
                  value={build.quantity}
                  onChange={(e) => onSetQuantity(build.id, Math.max(1, Number(e.target.value)))}
                />
                <button onClick={() => onRemoveBuild(build.id)}>Remove</button>
              </div>
              <p>
                Needs:{' '}
                {ingredients
                  .map((ing) => `${ing.count * build.quantity}x ${ing.name}`)
                  .join(', ')}
              </p>
            </div>
          )
        })}
      </div>

      <h2>Resources needed (combined)</h2>
      {resources.map((resource) => {
        const have = Math.min(acquired[resource.name] ?? 0, resource.totalCount)
        const done = have >= resource.totalCount
        return (
          <div key={resource.name} className="result-group">
            <div className="result-header">
              <label>
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => onToggleAcquired(resource.name, resource.totalCount)}
                />
                <strong className="resource-label">{resource.name}</strong>
              </label>
              <span className="source-pill">
                {have} / {resource.totalCount}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
