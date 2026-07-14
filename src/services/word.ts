/**
 * 词语管理服务
 *
 * 提供词语的 CRUD 操作，包含输入校验和去重逻辑。
 * 数据持久化到本地存储。
 */

import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { WordItem } from '@/types/word'
import { createId } from '@/utils/id'
import { isEmptyText, isTooLongText, normalizeText } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'

/**
 * 获取全部词语列表
 */
export function getWords(): WordItem[] {
  return getStorageValue<WordItem[]>(STORAGE_KEYS.WORDS, [])
}

/**
 * 获取指定分组下的所有词语
 */
export function getWordsByCategoryId(categoryId: string): WordItem[] {
  return getWords().filter((word) => word.categoryId === categoryId)
}

/**
 * 创建新词语
 * @throws {Error} 文本为空、过长或与已有词条重复时抛出异常
 */
export function createWord(categoryId: string, text: string): WordItem {
  const normalizedText = normalizeText(text)

  if (isEmptyText(normalizedText)) {
    throw new Error('请输入词语')
  }

  if (isTooLongText(normalizedText)) {
    throw new Error('词语过长')
  }

  if (isWordDuplicated(categoryId, normalizedText)) {
    throw new Error('该词语已存在')
  }

  const now = new Date().toISOString()
  const word: WordItem = {
    id: createId('word'),
    categoryId,
    text: normalizedText,
    createdAt: now,
    updatedAt: now
  }

  setStorageValue(STORAGE_KEYS.WORDS, [...getWords(), word])
  return word
}

/**
 * 删除指定词语
 */
export function deleteWord(id: string): void {
  setStorageValue(
    STORAGE_KEYS.WORDS,
    getWords().filter((word) => word.id !== id)
  )
}

/**
 * 删除某个分组下的所有词语（级联删除，随分类删除时调用）
 */
export function deleteWordsByCategoryId(categoryId: string): void {
  setStorageValue(
    STORAGE_KEYS.WORDS,
    getWords().filter((word) => word.categoryId !== categoryId)
  )
}

/**
 * 检查同一分组下是否已存在相同文本的词语（不区分首尾空白）
 */
export function isWordDuplicated(categoryId: string, text: string): boolean {
  const normalizedText = normalizeText(text)
  return getWordsByCategoryId(categoryId).some((word) => word.text === normalizedText)
}
