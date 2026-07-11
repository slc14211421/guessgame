export type WordOrder = 'sequential' | 'random'

export interface UserSettings {
  backgroundColor: string
  wordColor: string
  wordOrder: WordOrder
  isWordScrollEnabled: boolean
}
