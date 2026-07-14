import type { UserSettings } from '@/types/settings'

/** 默认设置：黑底白字，顺序出词，开启滚动 */
export const DEFAULT_SETTINGS: UserSettings = {
  backgroundColor: '#111111',
  wordColor: '#FFFFFF',
  wordOrder: 'sequential',
  isWordScrollEnabled: true
}

/** 可选的主题颜色列表（背景色/文字色共用） */
export const THEME_COLORS = [
  '#111111',
  '#FFFFFF',
  '#256F6C',
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#FDD835',
  '#8E24AA'
]
