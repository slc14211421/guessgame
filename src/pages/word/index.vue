<template>
  <view class="app-page">
    <AppHeader
      :title="category?.name || '词语管理'"
      subtitle="维护当前分类下的词语"
    />

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

function handleDeleteWord(wordId: string) {
  deleteWord(wordId)
  loadPageData()
  uni.showToast({
    title: '词语已删除',
    icon: 'none'
  })
}

function getCategoryIdFromQuery(query?: Record<string, string | undefined>): string {
  return decodeURIComponent(String(query?.categoryId || ''))
}

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
