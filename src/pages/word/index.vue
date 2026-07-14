<!--
  词语管理页面
  展示某个分类下的所有词语，支持新增和删除
-->
<template>
  <view class="app-page">
    <AppHeader
      :title="category?.name || '词语管理'"
      subtitle="维护当前分类下的词语"
    />

    <!-- 新增词语输入区 -->
    <view class="app-section app-card create-panel">
      <input
        v-model="newWordText"
        class="app-input"
        maxlength="24"
        placeholder="请输入词语"
        confirm-type="done"
        @confirm="handleCreateWord"
      />
      <button class="app-button" @click="handleCreateWord">新增词语</button>
    </view>

    <!-- 词语列表 -->
    <view class="app-section">
      <view v-if="words.length > 0" class="app-list">
        <view v-for="word in words" :key="word.id" class="app-list-item word-row">
          <text class="word-row__text">{{ word.text }}</text>
          <button
            class="app-button app-button--danger word-row__delete"
            @click="handleDeleteWord(word.id)"
          >
            删除
          </button>
        </view>
      </view>
      <EmptyState v-else title="暂无词语" description="添加词语后即可用于猜词模式" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import AppHeader from '@/components/AppHeader/AppHeader.vue'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import { getCategoryById } from '@/services/category'
import {
  createWord,
  deleteWord,
  getWordsByCategoryId
} from '@/services/word'
import type { Category } from '@/types/category'
import type { WordItem } from '@/types/word'

/** 当前分类 ID（从路由参数获取） */
const categoryId = ref('')
const category = ref<Category | undefined>()
const words = ref<WordItem[]>([])
const newWordText = ref('')

onLoad((query) => {
  categoryId.value = getCategoryIdFromQuery(query)
  loadPageData()
})

onShow(() => {
  if (categoryId.value) {
    loadPageData()
  }
})

/** 加载分类信息和词语列表，分类不存在时重定向回分类页 */
function loadPageData() {
  if (!categoryId.value) {
    backToCategoryPage('分类不存在')
    return
  }

  category.value = getCategoryById(categoryId.value)

  if (!category.value) {
    backToCategoryPage('分类不存在')
    return
  }

  words.value = getWordsByCategoryId(categoryId.value)
}

/** 新增词语（含校验和去重） */
function handleCreateWord() {
  try {
    createWord(categoryId.value, newWordText.value)
    newWordText.value = ''
    loadPageData()
    uni.showToast({
      title: '词语已新增',
      icon: 'none'
    })
  } catch (error) {
    showError(error)
  }
}

/** 删除词语 */
function handleDeleteWord(wordId: string) {
  deleteWord(wordId)
  loadPageData()
  uni.showToast({
    title: '词语已删除',
    icon: 'none'
  })
}

/** 从 URL 查询参数提取分类 ID */
function getCategoryIdFromQuery(query?: Record<string, string | undefined>): string {
  return decodeURIComponent(String(query?.categoryId || ''))
}

/** 分类不存在时重定向回分类管理页 */
function backToCategoryPage(message: string) {
  uni.showToast({
    title: message,
    icon: 'none'
  })
  uni.redirectTo({
    url: '/pages/category/index'
  })
}

function showError(error: unknown) {
  uni.showToast({
    title: error instanceof Error ? error.message : '操作失败',
    icon: 'none'
  })
}
</script>

<style scoped lang="scss">
.create-panel {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.word-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.word-row__text {
  min-width: 0;
  color: #172026;
  font-size: 34rpx;
  font-weight: 700;
}

.word-row__delete {
  flex-shrink: 0;
  min-height: 72rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}
</style>
