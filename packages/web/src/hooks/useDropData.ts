import type { DropTable } from '@warframe-dropper/types'
import { useJsonFetch } from './useJsonFetch'

export function useDropData() {
  return useJsonFetch<DropTable>('data/latest.json', 'npm run parse')
}
