/**
 * 去除字符串首尾空白字符
 */
export function normalizeText(value: string): string {
  return value.trim()
}

/**
 * 判断文本是否为空（仅空白字符也视为空）
 */
export function isEmptyText(value: string): boolean {
  return normalizeText(value).length === 0
}

/**
 * 计算文本的"显示宽度"
 * - 中文字符（一-龥）计 2 个单位
 * - 其他字符（英文、数字、标点等）计 1 个单位
 * 用于词语长度校验，使中英文混排的长度判断更合理
 */
export function getTextDisplayWidth(value: string): number {
  return Array.from(normalizeText(value)).reduce((total, char) => {
    return total + (/[一-龥]/.test(char) ? 2 : 1)
  }, 0)
}

/**
 * 判断文本是否超过最大显示宽度
 * @param maxDisplayWidth - 默认 24，即最多 12 个中文字符或 24 个英文字符
 */
export function isTooLongText(value: string, maxDisplayWidth = 24): boolean {
  return getTextDisplayWidth(value) > maxDisplayWidth
}

/**
 * 校验字符串是否为合法的十六进制颜色值（如 #FF0000）
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
