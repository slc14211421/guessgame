/**
 * 服务层单元测试
 *
 * 覆盖：存储初始化与版本迁移、分类/词语 CRUD、设置规范化、游戏逻辑校验。
 * 使用 Map 模拟 uni-app 本地存储 API。
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_CATEGORIES, DEFAULT_WORDS } from '@/constants/defaultData'
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import { createCategory, deleteCategory, getCategories } from '@/services/category'
import {
  canStartGame,
  formatGameDuration,
  formatGameTime,
  getGameWords,
  getNextIndex,
  parseGameDurationSeconds
} from '@/services/game'
import { getSettings, saveSettings } from '@/services/settings'
import { initLocalData } from '@/services/storage'
import { createWord, getWords, getWordsByCategoryId } from '@/services/word'

/** 模拟 uni-app 本地存储 */
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
    // 写入格式错误的数据
    storage.set(STORAGE_KEYS.CATEGORIES, [{ id: 'broken' }])
    storage.set(STORAGE_KEYS.WORDS, 'broken')
    storage.set(STORAGE_KEYS.SETTINGS, { backgroundColor: '#fff', wordColor: 'red' })

    initLocalData()

    // 应回退到默认值
    expect(getCategories()).toEqual(DEFAULT_CATEGORIES)
    expect(getWords()).toEqual(DEFAULT_WORDS)
    expect(getSettings()).toEqual(DEFAULT_SETTINGS)
  })

  it('syncs default words on storage version migration', () => {
    // 构造一个在旧版词库中存在但新版中已被删除的"过期内置词条"
    const userWord = {
      id: 'word_custom_001',
      categoryId: DEFAULT_CATEGORIES[0].id,
      text: '用户词条',
      createdAt: '2026-07-14T00:00:00.000Z',
      updatedAt: '2026-07-14T00:00:00.000Z'
    }
    const staleDefaultWord = {
      ...DEFAULT_WORDS[0],
      id: 'word_fruit_289',
      categoryId: 'category_fruit',
      text: '火山荔核'
    }

    storage.set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
    storage.set(STORAGE_KEYS.WORDS, [DEFAULT_WORDS[0], staleDefaultWord, userWord])
    storage.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
    storage.set(STORAGE_KEYS.STORAGE_VERSION, '1')

    initLocalData()

    // 迁移后应保留用户词条，并同步到最新默认词库
    expect(getWords()).toEqual([...DEFAULT_WORDS, userWord])
    // 过期的内置词条应被移除
    expect(getWords().some((word) => word.id === staleDefaultWord.id)).toBe(false)
    expect(storage.get(STORAGE_KEYS.STORAGE_VERSION)).toBe(STORAGE_VERSION)
  })
})

describe('category and word services', () => {
  it('creates category and rejects duplicated names', () => {
    initLocalData()
    // 创建时自动去除首尾空白
    const category = createCategory('  电影  ')

    expect(category.name).toBe('电影')
    // 同名分类不可重复创建
    expect(() => createCategory('电影')).toThrow('分类名称已存在')
  })

  it('creates words, rejects duplicates, and deletes words with category', () => {
    initLocalData()
    const category = createCategory('电影')
    // 创建词语时自动去除首尾空白
    const word = createWord(category.id, '  流浪地球  ')

    expect(word.text).toBe('流浪地球')
    // 同分组下不可重复
    expect(() => createWord(category.id, '流浪地球')).toThrow('该词语已存在')

    // 删除分类应级联删除其下词语
    deleteCategory(category.id)
    expect(getWordsByCategoryId(category.id)).toEqual([])
  })
})

describe('settings and game services', () => {
  it('normalizes invalid settings colors', () => {
    initLocalData()
    const settings = saveSettings({
      backgroundColor: '#123456',
      wordColor: 'white', // 非法颜色值
      wordOrder: 'sequential',
      isWordScrollEnabled: false
    })

    // 非法 wordColor 应回退到默认值
    expect(settings).toEqual({
      backgroundColor: '#123456',
      wordColor: DEFAULT_SETTINGS.wordColor,
      wordOrder: 'sequential',
      isWordScrollEnabled: false
    })
  })

  it('keeps old settings and fills new display defaults', () => {
    // 旧版设置不含 isWordScrollEnabled 字段
    storage.set(STORAGE_KEYS.SETTINGS, {
      backgroundColor: '#123456',
      wordColor: '#FFFFFF',
      wordOrder: 'random'
    })

    // 新版本应自动补全缺失字段的默认值
    expect(getSettings()).toEqual({
      backgroundColor: '#123456',
      wordColor: '#FFFFFF',
      wordOrder: 'random',
      isWordScrollEnabled: DEFAULT_SETTINGS.isWordScrollEnabled
    })
  })

  it('fixes unreadable text color settings', () => {
    initLocalData()

    const settings = saveSettings({
      backgroundColor: '#FFFFFF',
      wordColor: '#FFFFFF',
      wordOrder: 'sequential',
      isWordScrollEnabled: true
    })

    expect(settings.wordColor).toBe('#111111')
  })

  it('allows readable blue background with white text', () => {
    initLocalData()

    const settings = saveSettings({
      backgroundColor: '#1E88E5',
      wordColor: '#FFFFFF',
      wordOrder: 'sequential',
      isWordScrollEnabled: true
    })

    expect(settings.wordColor).toBe('#FFFFFF')
  })

  it('checks game start state and loops word index', () => {
    initLocalData()

    // 未选择分组不可开始
    expect(canStartGame('')).toEqual({
      ok: false,
      message: '请选择词语分组'
    })
    // 有词条的分组可以开始
    expect(canStartGame(DEFAULT_CATEGORIES[0].id)).toEqual({ ok: true })
    // 索引越界后循环回到 0
    expect(getNextIndex(2, 3)).toBe(0)
  })

  it('parses and formats game duration', () => {
    expect(parseGameDurationSeconds('60')).toBe(60)
    // 非法时长返回 undefined
    expect(parseGameDurationSeconds('90')).toBeUndefined()
    expect(formatGameDuration(300)).toBe('5分钟')
    expect(formatGameTime(65)).toBe('01:05')
    // 负数处理为 00:00
    expect(formatGameTime(-1)).toBe('00:00')
  })

  it('randomizes game words without mutating stored order', () => {
    initLocalData()
    const categoryId = DEFAULT_CATEGORIES[0].id
    const originalWords = getWordsByCategoryId(categoryId)

    const gameWords = getGameWords(categoryId, 'random')

    expect(gameWords).toHaveLength(originalWords.length)
    expect(getWordsByCategoryId(categoryId)).toEqual(originalWords)
  })
})
