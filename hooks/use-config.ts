import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

type Config = {
  theme: 'zinc'
}

const configAtom = atomWithStorage<Config>('config', {
  theme: 'zinc',
})

export function useConfig() {
  return useAtom(configAtom)
}
