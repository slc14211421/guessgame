/**
 * 词语数据项
 * 每个词语属于一个分组（categoryId），在猜词游戏中作为展示内容
 */
export interface WordItem {
  /** 词语唯一标识 */
  id: string
  /** 所属分组的 ID */
  categoryId: string
  /** 词语文本内容 */
  text: string
  /** 创建时间（ISO 8601 格式） */
  createdAt: string
  /** 最后更新时间（ISO 8601 格式） */
  updatedAt: string
}
