import { STORAGE_KEYS } from '@/constants/storageKeys'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import type { UserSettings, WordOrder } from '@/types/settings'
import { isValidHexColor } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'

const VALID_WORD_ORDERS: WordOrder[] = ['sequential', 'random']

export function getSettings(): UserSettings {
  const settings = getStorageValue<UserSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  return normalizeSettings(settings)
}

export function saveSettings(settings: UserSettings): UserSettings {
  const nextSettings = normalizeSettings(settings)
  setStorageValue(STORAGE_KEYS.SETTINGS, nextSettings)
  return nextSettings
}

export function resetSettings(): UserSettings {
  setStorageValue(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS })
  return { ...DEFAULT_SETTINGS }
}

function normalizeSettings(settings: UserSettings): UserSettings {
  return {
    backgroundColor: isValidHexColor(settings.backgroundColor)
      ? settings.backgroundColor
      : DEFAULT_SETTINGS.backgroundColor,
    wordColor: isValidHexColor(settings.wordColor)
      ? settings.wordColor
      : DEFAULT_SETTINGS.wordColor,
    wordOrder: VALID_WORD_ORDERS.includes(settings.wordOrder)
      ? settings.wordOrder
      : DEFAULT_SETTINGS.wordOrder,
    isWordScrollEnabled: typeof settings.isWordScrollEnabled === 'boolean'
      ? settings.isWordScrollEnabled
      : DEFAULT_SETTINGS.isWordScrollEnabled
  }
}
