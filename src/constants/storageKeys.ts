/** 当前存储结构版本号，用于数据迁移 */
export const STORAGE_VERSION = '3'

/**
 * 本地存储键名常量
 * 所有持久化数据统一使用以下键名，避免硬编码字符串
 */
export const STORAGE_KEYS = {
  /** 分类列表 */
  CATEGORIES: 'guessgame_categories',
  /** 词语列表 */
  WORDS: 'guessgame_words',
  /** 用户设置 */
  SETTINGS: 'guessgame_settings',
  /** 存储结构版本号 */
  STORAGE_VERSION: 'guessgame_storage_version'
} as const
