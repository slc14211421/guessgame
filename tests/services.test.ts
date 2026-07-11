import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES, DEFAULT_WORDS } from '@/constants/defaultData'
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import { createCategory, deleteCategory, getCategories } from '@/services/category'
import {
  canStartGame,
  formatGameDuration,
  formatGameTime,
  getNextIndex,
  parseGameDurationSeconds
} from '@/services/game'
import { getSettings, saveSettings } from '@/services/settings'
import { initLocalData } from '@/services/storage'
import { createWord, getWords, getWordsByCategoryId } from '@/services/word'

const storage = new Map<string, unknown>()

beforeEach(() => {
  storage.clear()
  vi.stubGlobal('uni', {
    getStorageSync: (key: string) => storage.get(key),
    setStorageSync: (key: string, value: unknown) => {
      storage.set(key, value)
    },
    removeStorageSync: (key: string) => {
      storage.delete(key)
    }
  })
})

describe('storage initialization', () => {
  it('initializes default local data', () => {
    initLocalData()

    expect(storage.get(STORAGE_KEYS.CATEGORIES)).toEqual(DEFAULT_CATEGORIES)
    expect(storage.get(STORAGE_KEYS.WORDS)).toEqual(DEFAULT_WORDS)
    expect(storage.get(STORAGE_KEYS.SETTINGS)).toEqual(DEFAULT_SETTINGS)
    expect(storage.get(STORAGE_KEYS.STORAGE_VERSION)).toBe(STORAGE_VERSION)
  })

  it('recovers invalid local data', () => {
    storage.set(STORAGE_KEYS.CATEGORIES, [{ id: 'broken' }])
    storage.set(STORAGE_KEYS.WORDS, 'broken')
    storage.set(STORAGE_KEYS.SETTINGS, { backgroundColor: '#fff', wordColor: 'red' })

    initLocalData()

    expect(getCategories()).toEqual(DEFAULT_CATEGORIES)
    expect(getWords()).toEqual(DEFAULT_WORDS)
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })
})

describe('category and word services', () => {
  it('creates category and rejects duplicated names', () => {
    initLocalData()
    const category = createCategory('  电影  ')

    expect(category.name).toBe('电影')
    expect(() => createCategory('电影')).toThrow('分类名称已存在')
  })

  it('creates words, rejects duplicates, and deletes words with category', () => {
    initLocalData()
    const category = createCategory('电影')
    const word = createWord(category.id, '  流浪地球  ')

    expect(word.text).toBe('流浪地球')
    expect(() => createWord(category.id, '流浪地球')).toThrow('该词语已存在')

    deleteCategory(category.id)
    expect(getWordsByCategoryId(category.id)).toEqual([])
  })
})

describe('settings and game services', () => {
  it('normalizes invalid settings colors', () => {
    initLocalData()
    const settings = saveSettings({
      backgroundColor: '#123456',
      wordColor: 'white',
      wordOrder: 'sequential',
      isWordScrollEnabled: false
    })

    expect(settings).toEqual({
      backgroundColor: '#123456',
      wordColor: DEFAULT_SETTINGS.wordColor,
      wordOrder: 'sequential',
      isWordScrollEnabled: false
    })
  })

  it('keeps old settings and fills new display defaults', () => {
    storage.set(STORAGE_KEYS.SETTINGS, {
      backgroundColor: '#123456',
      wordColor: '#654321',
      wordOrder: 'random'
    })

    expect(getSettings()).toEqual({
      backgroundColor: '#123456',
      wordColor: '#654321',
      wordOrder: 'random',
      isWordScrollEnabled: DEFAULT_SETTINGS.isWordScrollEnabled
    })
  })

  it('checks game start state and loops word index', () => {
    initLocalData()

    expect(canStartGame('')).toEqual({
      ok: false,
      message: '请选择词语分组'
    })
    expect(canStartGame(DEFAULT_CATEGORIES[0].id)).toEqual({ ok: true })
    expect(getNextIndex(2, 3)).toBe(0)
  })

  it('parses and formats game duration', () => {
    expect(parseGameDurationSeconds('60')).toBe(60)
    expect(parseGameDurationSeconds('90')).toBeUndefined()
    expect(formatGameDuration(300)).toBe('5分钟')
    expect(formatGameTime(65)).toBe('01:05')
    expect(formatGameTime(-1)).toBe('00:00')
  })
})
