import { DEFAULT_CATEGORIES } from '@/constants/defaultData'
import { DEFAULT_WORDS } from '@/constants/defaultWords'
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import type { Category } from '@/types/category'
import type { UserSettings } from '@/types/settings'
import type { WordItem } from '@/types/word'
import { isValidHexColor } from '@/utils/validate'

export function getStorageValue<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key) as T | undefined | null
    return value === undefined || value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function setStorageValue<T>(key: string, value: T): void {
  uni.setStorageSync(key, value)
}

export function removeStorageValue(key: string): void {
  uni.removeStorageSync(key)
}

export function initLocalData(): void {
  const categories = getStorageValue<unknown>(STORAGE_KEYS.CATEGORIES, null)
  const words = getStorageValue<unknown>(STORAGE_KEYS.WORDS, null)
  const settings = getStorageValue<unknown>(STORAGE_KEYS.SETTINGS, null)
  const version = getStorageValue<unknown>(STORAGE_KEYS.STORAGE_VERSION, null)

  if (!isCategoryArray(categories)) {
    setStorageValue(STORAGE_KEYS.CATEGORIES, clone(DEFAULT_CATEGORIES))
  }

  if (!isWordArray(words)) {
    setStorageValue(STORAGE_KEYS.WORDS, clone(DEFAULT_WORDS))
  }

  if (!isUserSettings(settings)) {
    setStorageValue(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS })
  }

  if (version !== STORAGE_VERSION) {
    setStorageValue(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION)
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isCategoryArray(value: unknown): value is Category[] {
  return Array.isArray(value) && value.every(isCategory)
}

function isWordArray(value: unknown): value is WordItem[] {
  return Array.isArray(value) && value.every(isWord)
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isWord(value: unknown): value is WordItem {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.categoryId === 'string' &&
    typeof value.text === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

function isUserSettings(value: unknown): value is UserSettings {
  if (!isRecord(value)) return false
  return (
    typeof value.backgroundColor === 'string' &&
    typeof value.wordColor === 'string' &&
    isValidHexColor(value.backgroundColor) &&
    isValidHexColor(value.wordColor)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
