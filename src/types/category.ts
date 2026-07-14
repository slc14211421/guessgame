/**
 * 词语分类（分组）数据结构
 */
export interface Category {
  /** 分类唯一标识 */
  id: string
  /** 分类名称，如"成语"、"水果"等 */
  name: string
  /** 创建时间（ISO 8601 格式） */
  createdAt: string
  /** 最后更新时间（ISO 8601 格式） */
  updatedAt: string
}
