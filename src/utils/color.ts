/**
 * 颜色可读性工具
 *
 * 用于猜词模式中根据背景色选择可读文字色，避免用户设置出低对比度组合。
 */

const MIN_ACCEPTABLE_CONTRAST_RATIO = 3
const DARK_TEXT_COLOR = '#111111'
const LIGHT_TEXT_COLOR = '#FFFFFF'

interface RgbColor {
  r: number
  g: number
  b: number
}

export function hasReadableContrast(foregroundColor: string, backgroundColor: string): boolean {
  return getContrastRatio(foregroundColor, backgroundColor) >= MIN_ACCEPTABLE_CONTRAST_RATIO
}

export function getReadableTextColor(backgroundColor: string): string {
  const darkContrast = getContrastRatio(DARK_TEXT_COLOR, backgroundColor)
  const lightContrast = getContrastRatio(LIGHT_TEXT_COLOR, backgroundColor)
  return darkContrast >= lightContrast ? DARK_TEXT_COLOR : LIGHT_TEXT_COLOR
}

export function isLightHexColor(color: string): boolean {
  return getRelativeLuminance(parseHexColor(color)) > 0.5
}

function getContrastRatio(foregroundColor: string, backgroundColor: string): number {
  const foregroundLuminance = getRelativeLuminance(parseHexColor(foregroundColor))
  const backgroundLuminance = getRelativeLuminance(parseHexColor(backgroundColor))
  const lighter = Math.max(foregroundLuminance, backgroundLuminance)
  const darker = Math.min(foregroundLuminance, backgroundLuminance)
  return (lighter + 0.05) / (darker + 0.05)
}

function getRelativeLuminance(color: RgbColor): number {
  const channels = [color.r, color.g, color.b].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  })

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function parseHexColor(color: string): RgbColor {
  const normalizedColor = color.replace('#', '')
  return {
    r: Number.parseInt(normalizedColor.slice(0, 2), 16),
    g: Number.parseInt(normalizedColor.slice(2, 4), 16),
    b: Number.parseInt(normalizedColor.slice(4, 6), 16)
  }
}
