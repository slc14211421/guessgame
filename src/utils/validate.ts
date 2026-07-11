export function normalizeText(value: string): string {
  return value.trim()
}

export function isEmptyText(value: string): boolean {
  return normalizeText(value).length === 0
}

export function getTextDisplayWidth(value: string): number {
  return Array.from(normalizeText(value)).reduce((total, char) => {
    return total + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1)
  }, 0)
}

export function isTooLongText(value: string, maxDisplayWidth = 24): boolean {
  return getTextDisplayWidth(value) > maxDisplayWidth
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
