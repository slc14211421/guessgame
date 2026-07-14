/**
 * 用户设置服务
 *
 * 提供设置的读写和重置操作。
 * 所有写入的值都会经过 normalizeSettings 校验，
 * 非法值自动回退到默认设置。
 */

import { STORAGE_KEYS } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import type { UserSettings, WordOrder } from '@/types/settings'
import { getReadableTextColor, hasReadableContrast } from '@/utils/color'
import { isValidHexColor } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'

/** 合法的出词方式列表 */
const VALID_WORD_ORDERS: WordOrder[] = ['sequential', 'random']

/**
 * 获取当前用户设置（自动修正非法值）
 */
export function getSettings(): UserSettings {
  const settings = getStorageValue<unknown>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  return normalizeSettings(settings)
}

/**
 * 保存用户设置并返回规范化后的结果
 */
export function saveSettings(settings: UserSettings): UserSettings {
  const nextSettings = normalizeSettings(settings)
  setStorageValue(STORAGE_KEYS.SETTINGS, nextSettings)
  return nextSettings
}

/**
 * 重置设置为默认值
 */
export function resetSettings(): UserSettings {
  setStorageValue(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS })
  return { ...DEFAULT_SETTINGS }
}

/**
 * 规范化设置对象：逐一校验每个字段，非法值回退到默认值
 */
function normalizeSettings(settings: unknown): UserSettings {
  const settingRecord = isRecord(settings) ? settings : {}
  const backgroundColor =
    typeof settingRecord.backgroundColor === 'string' &&
    isValidHexColor(settingRecord.backgroundColor)
      ? settingRecord.backgroundColor
      : DEFAULT_SETTINGS.backgroundColor
  const wordColor =
    typeof settingRecord.wordColor === 'string' && isValidHexColor(settingRecord.wordColor)
      ? settingRecord.wordColor
      : DEFAULT_SETTINGS.wordColor

  return {
    backgroundColor,
    wordColor: hasReadableContrast(wordColor, backgroundColor)
      ? wordColor
      : getReadableTextColor(backgroundColor),
    wordOrder:
      typeof settingRecord.wordOrder === 'string' &&
      VALID_WORD_ORDERS.includes(settingRecord.wordOrder as WordOrder)
        ? (settingRecord.wordOrder as WordOrder)
      : DEFAULT_SETTINGS.wordOrder,
    isWordScrollEnabled:
      typeof settingRecord.isWordScrollEnabled === 'boolean'
        ? settingRecord.isWordScrollEnabled
        : DEFAULT_SETTINGS.isWordScrollEnabled
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
