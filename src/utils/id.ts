/**
 * 生成全局唯一标识符
 * @param prefix - ID 前缀，如 "word"、"category"
 * @returns 格式为 `{prefix}_{时间戳36进制}_{随机串}` 的唯一 ID
 * @example createId('word') => "word_lm3x2y_a7k9b3"
 */
export function createId(prefix: string): string {
  // 毫秒级时间戳转 36 进制，保证时间维度唯一性
  const time = Date.now().toString(36)
  // 从随机小数中截取 6 位，保证随机维度唯一性
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${time}_${random}`
}
