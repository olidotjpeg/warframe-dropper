import type { ItemExport } from '@warframe-dropper/types'
import { useJsonFetch } from './useJsonFetch'

export function useItemData() {
  return useJsonFetch<ItemExport>('data/items-latest.json', 'npm run parse:items')
}
