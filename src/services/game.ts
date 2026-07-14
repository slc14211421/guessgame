/**
 * 游戏逻辑服务
 *
 * 提供游戏核心功能：词条获取、索引循环、时长管理、开始校验等。
 */

import type { StartGameResult } from '@/types/game'
import type { WordOrder } from '@/types/settings'
import type { WordItem } from '@/types/word'
import { getCategoryById } from './category'
import { getWordsByCategoryId } from './word'

/** 可选的游戏时长（秒） */
export const GAME_DURATION_OPTIONS = [60, 120, 180, 300, 600] as const

/**
 * 根据出词方式获取游戏词条列表
 * - sequential: 保持原始顺序
 * - random: Fisher-Yates 洗牌随机排列
 */
export function getGameWords(categoryId: string, wordOrder: WordOrder = 'sequential'): WordItem[] {
  const words = getWordsByCategoryId(categoryId)
  if (wordOrder === 'random') {
    return shuffleWords(words)
  }
  return words
}

/**
 * 计算下一个词条索引（循环：到达末尾后回到开头）
 */
export function getNextIndex(currentIndex: number, total: number): number {
  if (total <= 0) return 0
  return currentIndex + 1 >= total ? 0 : currentIndex + 1
}

/** 校验是否为合法的游戏时长 */
export function isValidGameDuration(seconds: number): boolean {
  return GAME_DURATION_OPTIONS.includes(seconds as (typeof GAME_DURATION_OPTIONS)[number])
}

/** 从 URL 查询参数解析游戏时长（秒），非法值返回 undefined */
export function parseGameDurationSeconds(value: string): number | undefined {
  const seconds = Number(value)
  return Number.isInteger(seconds) && isValidGameDuration(seconds) ? seconds : undefined
}

/** 格式化游戏时长为可读字符串，如 "5分钟" */
export function formatGameDuration(seconds: number): string {
  return `${seconds / 60}分钟`
}

/** 格式化剩余时间为 MM:SS 格式，如 "01:05" */
export function formatGameTime(seconds: number): string {
  const normalizedSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(normalizedSeconds / 60)
  const restSeconds = normalizedSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(restSeconds).padStart(2, '0')}`
}

/**
 * Fisher-Yates 洗牌算法
 * 返回新的随机排列数组，不修改原数组
 */
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

/**
 * 校验是否可以开始游戏
 * 依次检查：是否选择分组、分组是否存在、分组下是否有词条
 */
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
