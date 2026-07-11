import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { WordItem } from '@/types/word'
import { createId } from '@/utils/id'
import { isEmptyText, isTooLongText, normalizeText } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'

export function getWords(): WordItem[] {
  return getStorageValue<WordItem[]>(STORAGE_KEYS.WORDS, [])
}

export function getWordsByCategoryId(categoryId: string): WordItem[] {
  return getWords().filter((word) => word.categoryId === categoryId)
}

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

export function deleteWord(id: string): void {
  setStorageValue(
    STORAGE_KEYS.WORDS,
    getWords().filter((word) => word.id !== id)
  )
}

export function deleteWordsByCategoryId(categoryId: string): void {
  setStorageValue(
    STORAGE_KEYS.WORDS,
    getWords().filter((word) => word.categoryId !== categoryId)
  )
}

export function isWordDuplicated(categoryId: string, text: string): boolean {
  const normalizedText = normalizeText(text)
  return getWordsByCategoryId(categoryId).some((word) => word.text === normalizedText)
}
