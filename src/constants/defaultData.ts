import type { Category } from '@/types/category'

/** 默认数据的创建时间，用于区分内置数据与用户数据 */
export const DEFAULT_CREATED_AT = '2026-07-10T00:00:00.000Z'

/** 内置的五个默认词语分组 */
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

// 默认词语数据由脚本 scripts/generate-words.js 自动生成，从 defaultWords 模块导入
export { DEFAULT_WORDS } from '@/constants/defaultWords'
