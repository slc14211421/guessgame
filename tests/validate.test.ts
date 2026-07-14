/**
 * 校验工具函数单元测试
 * 测试文本显示宽度计算、空文本判断、超长判断和颜色值校验
 */
import { describe, expect, it } from 'vitest'
import {
  getTextDisplayWidth,
  isEmptyText,
  isTooLongText,
  isValidHexColor
} from '@/utils/validate'

describe('validate utils', () => {
  it('calculates display width for Chinese and English text', () => {
    // 12个中文 = 24 单位
    expect(getTextDisplayWidth('一二三四五六七八九十甲乙')).toBe(24)
    // 24个英文 = 24 单位
    expect(getTextDisplayWidth('abcdefghijklmnopqrstuvwx')).toBe(24)
    // "苹果" (4) + "Apple" (5) = 9
    expect(getTextDisplayWidth('苹果Apple')).toBe(9)
  })

  it('checks max display width', () => {
    // 12中文刚好 24，不超
    expect(isTooLongText('一二三四五六七八九十甲乙')).toBe(false)
    // 13中文 = 26 > 24
    expect(isTooLongText('一二三四五六七八九十甲乙丙')).toBe(true)
    // 24英文刚好 24，不超
    expect(isTooLongText('abcdefghijklmnopqrstuvwx')).toBe(false)
    // 25英文 = 25 > 24
    expect(isTooLongText('abcdefghijklmnopqrstuvwxy')).toBe(true)
  })

  it('validates empty text and hex colors', () => {
    // 纯空白视为空
    expect(isEmptyText('   ')).toBe(true)
    // 6位合法 hex 颜色
    expect(isValidHexColor('#111111')).toBe(true)
    // 3位简写不合法
    expect(isValidHexColor('#fff')).toBe(false)
  })
})
