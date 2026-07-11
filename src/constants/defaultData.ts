import type { Category } from '@/types/category'

export const DEFAULT_CREATED_AT = '2026-07-10T00:00:00.000Z'

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'category_chengyu',
    name: '成语',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_fruit',
    name: '水果',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_vegetable',
    name: '蔬菜',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_animal',
    name: '动物',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_person',
    name: '人物',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  }
]

export { DEFAULT_WORDS } from '@/constants/defaultWords'
