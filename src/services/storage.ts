/**
 * 本地存储服务层
 *
 * 封装 uni-app 的 Storage API，提供类型安全的读写操作。
 * 同时负责首次启动时的数据初始化与版本迁移。
 */

import { DEFAULT_CATEGORIES } from '@/constants/defaultData'
import { DEFAULT_WORDS } from '@/constants/defaultWords'
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import type { Category } from '@/types/category'
import type { UserSettings } from '@/types/settings'
import type { WordItem } from '@/types/word'
import { isValidHexColor } from '@/utils/validate'

/** 内置词条 ID 格式：word_{分组名}_{序号}，如 word_chengyu_001 */
const DEFAULT_WORD_ID_PATTERN = /^word_(chengyu|fruit|vegetable|animal|person)_\d{3}$/

/**
 * 从本地存储读取数据，不存在时返回默认值
 */
export function getStorageValue<T>(key: string, fallback: T): T {
  try {
    const value = uni.getStorageSync(key) as T | undefined | null
    return value === undefined || value === null ? fallback : value
  } catch {
    return fallback
  }
}

/**
 * 写入数据到本地存储
 */
export function setStorageValue<T>(key: string, value: T): void {
  uni.setStorageSync(key, value)
}

/**
 * 从本地存储中移除指定键
 */
export function removeStorageValue(key: string): void {
  uni.removeStorageSync(key)
}

/**
 * 初始化本地数据
 *
 * 在应用每次启动时调用，负责：
 * 1. 首次使用时写入默认分类和词库
 * 2. 数据格式校验，异常时恢复默认值
 * 3. 存储版本迁移：保留用户自定义词条，同时将内置词库更新到最新版本
 */
export function initLocalData(): void {
  const categories = getStorageValue<unknown>(STORAGE_KEYS.CATEGORIES, null)
  const words = getStorageValue<unknown>(STORAGE_KEYS.WORDS, null)
  const settings = getStorageValue<unknown>(STORAGE_KEYS.SETTINGS, null)
  const version = getStorageValue<unknown>(STORAGE_KEYS.STORAGE_VERSION, null)
  const shouldMigrateStorage = version !== STORAGE_VERSION

  if (!isCategoryArray(categories)) {
    setStorageValue(STORAGE_KEYS.CATEGORIES, clone(DEFAULT_CATEGORIES))
  }

  if (!isWordArray(words)) {
    setStorageValue(STORAGE_KEYS.WORDS, clone(DEFAULT_WORDS))
  } else if (shouldMigrateStorage) {
    setStorageValue(STORAGE_KEYS.WORDS, migrateDefaultWords(words))
  }

  if (!isUserSettings(settings)) {
    setStorageValue(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS })
  }

  if (version !== STORAGE_VERSION) {
    setStorageValue(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION)
  }
}

/**
 * 迁移词库数据：保留用户自定义词条，将内置词库替换为最新版本
 */
function migrateDefaultWords(words: WordItem[]): WordItem[] {
  const userWords = words.filter((word) => !DEFAULT_WORD_ID_PATTERN.test(word.id))
  return [...clone(DEFAULT_WORDS), ...userWords]
}

/** 通过 JSON 序列化/反序列化进行深拷贝 */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// ---- 数据类型守卫函数 ----

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
