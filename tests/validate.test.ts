import { describe, expect, it } from 'vitest'
import {
  getTextDisplayWidth,
  isEmptyText,
  isTooLongText,
  isValidHexColor
} from '@/utils/validate'

describe('validate utils', () => {
  it('calculates display width for Chinese and English text', () => {
    expect(getTextDisplayWidth('一二三四五六七八九十甲乙')).toBe(24)
    expect(getTextDisplayWidth('abcdefghijklmnopqrstuvwx')).toBe(24)
    expect(getTextDisplayWidth('苹果Apple')).toBe(9)
  })

  it('checks max display width', () => {
    expect(isTooLongText('一二三四五六七八九十甲乙')).toBe(false)
    expect(isTooLongText('一二三四五六七八九十甲乙丙')).toBe(true)
    expect(isTooLongText('abcdefghijklmnopqrstuvwx')).toBe(false)
    expect(isTooLongText('abcdefghijklmnopqrstuvwxy')).toBe(true)
  })

  it('validates empty text and hex colors', () => {
    expect(isEmptyText('   ')).toBe(true)
    expect(isValidHexColor('#111111')).toBe(true)
    expect(isValidHexColor('#fff')).toBe(false)
  })
})
