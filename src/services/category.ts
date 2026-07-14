/**
 * 分类管理服务
 *
 * 提供分类的 CRUD 操作，包含名称校验和去重逻辑。
 * 删除分类时会级联删除该分类下的所有词语。
 */

import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { Category } from '@/types/category'
import { createId } from '@/utils/id'
import { isEmptyText, isTooLongText, normalizeText } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'
import { deleteWordsByCategoryId } from './word'

/**
 * 获取全部分类列表
 */
export function getCategories(): Category[] {
  return getStorageValue<Category[]>(STORAGE_KEYS.CATEGORIES, [])
}

/**
 * 根据 ID 查找分类
 */
export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((category) => category.id === id)
}

/**
 * 创建新分类
 * @throws {Error} 名称为空、过长或重复时抛出异常
 */
export function createCategory(name: string): Category {
  const normalizedName = normalizeText(name)

  if (isEmptyText(normalizedName)) {
    throw new Error('请输入分类名称')
  }

  if (isTooLongText(normalizedName)) {
    throw new Error('分类名称过长')
  }

  if (isCategoryNameDuplicated(normalizedName)) {
    throw new Error('分类名称已存在')
  }

  const now = new Date().toISOString()
  const category: Category = {
    id: createId('category'),
    name: normalizedName,
    createdAt: now,
    updatedAt: now
  }

  setStorageValue(STORAGE_KEYS.CATEGORIES, [...getCategories(), category])
  return category
}

/**
 * 删除分类，同时级联删除该分类下的所有词语
 */
export function deleteCategory(id: string): void {
  setStorageValue(
    STORAGE_KEYS.CATEGORIES,
    getCategories().filter((category) => category.id !== id)
  )
  // 级联删除关联词语
  deleteWordsByCategoryId(id)
}

/**
 * 检查分类名称是否已存在（不区分首尾空白）
 */
export function isCategoryNameDuplicated(name: string): boolean {
  const normalizedName = normalizeText(name)
  return getCategories().some((category) => category.name === normalizedName)
}
