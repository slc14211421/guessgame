import type { StartGameResult } from '@/types/game'
import type { WordOrder } from '@/types/settings'
import type { WordItem } from '@/types/word'
import { getCategoryById } from './category'
import { getWordsByCategoryId } from './word'

export const GAME_DURATION_OPTIONS = [60, 120, 180, 300, 600] as const

export function getGameWords(categoryId: string, wordOrder: WordOrder = 'sequential'): WordItem[] {
  const words = getWordsByCategoryId(categoryId)
  if (wordOrder === 'random') {
    return shuffleWords(words)
  }
  return words
}

export function getNextIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0
  return currentIndex + 1 >= total ? 0 : currentIndex + 1
}

export function isValidGameDuration(seconds: number): boolean {
  return GAME_DURATION_OPTIONS.includes(seconds as (typeof GAME_DURATION_OPTIONS)[number])
}

export function parseGameDurationSeconds(value: string): number | undefined {
  const seconds = Number(value)
  return Number.isInteger(seconds) && isValidGameDuration(seconds) ? seconds : undefined
}

export function formatGameDuration(seconds: number): string {
  return `${seconds / 60}分钟`
}

export function formatGameTime(seconds: number): string {
  const normalizedSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(normalizedSeconds / 60)
  const restSeconds = normalizedSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

function shuffleWords(words: WordItem[]): WordItem[] {
  const shuffled = [...words]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  return shuffled
}

export function canStartGame(categoryId: string): StartGameResult {
  if (!categoryId) {
    return {
      ok: false,
      message: '请选择词语分组'
    }
  }

  if (!getCategoryById(categoryId)) {
    return {
      ok: false,
      message: '分类不存在'
    }
  }

  if (getWordsByCategoryId(categoryId).length === 0) {
    return {
      ok: false,
      message: '该分组暂无词语'
    }
  }

  return {
    ok: true
  }
}
