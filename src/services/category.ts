import { STORAGE_KEYS } from '@/constants/storageKeys'
import type { Category } from '@/types/category'
import { createId } from '@/utils/id'
import { isEmptyText, isTooLongText, normalizeText } from '@/utils/validate'
import { getStorageValue, setStorageValue } from './storage'
import { deleteWordsByCategoryId } from './word'

export function getCategories(): Category[] {
  return getStorageValue<Category[]>(STORAGE_KEYS.CATEGORIES, [])
}

export function getCategoryById(id: string): Category | undefined {
  return getCategories().find((category) => category.id === id)
}

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

export function deleteCategory(id: string): void {
  setStorageValue(
    STORAGE_KEYS.CATEGORIES,
    getCategories().filter((category) => category.id !== id)
  )
  deleteWordsByCategoryId(id)
}

export function isCategoryNameDuplicated(name: string): boolean {
  const normalizedName = normalizeText(name)
  return getCategories().some((category) => category.name === normalizedName)
}
