<!--
  分类管理页面
  支持新增和删除词语分组，点击分组可进入对应的词语管理页
-->
<template>
  <view class="app-page category-page">
    <!-- 新增分类输入区 -->
    <view class="app-card create-panel">
      <input
        v-model="newCategoryName"
        class="app-input create-panel__input"
        maxlength="24"
        placeholder="请输入分类名称"
        confirm-type="done"
        @confirm="handleCreateCategory"
      />
      <button class="app-button create-panel__button" @click="handleCreateCategory">新增分类</button>
    </view>

    <!-- 分类列表 -->
    <view class="app-section">
      <view v-if="categories.length > 0" class="app-list">
        <view
          v-for="category in categories"
          :key="category.id"
          class="app-list-item category-row"
          @click="goWordManage(category.id)"
        >
          <view class="category-row__main">
            <text class="category-row__name">{{ category.name }}</text>
            <text class="category-row__hint">管理该分类下的词语</text>
          </view>
          <button
            class="app-button app-button--danger category-row__delete"
            @click.stop="handleDeleteCategory(category.id)"
          >
            删除
          </button>
        </view>
      </view>
      <EmptyState v-else title="暂无分类" description="创建第一个词语分组后即可维护词语" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import {
  createCategory,
  deleteCategory,
  getCategories
} from '@/services/category'
import type { Category } from '@/types/category'

const categories = ref<Category[]>([])
const newCategoryName = ref('')

// 每次页面显示时刷新分类列表
onShow(() => {
  loadCategories()
})

/** 加载全部分类 */
function loadCategories() {
  categories.value = getCategories()
}

/** 新增分类（含输入校验） */
function handleCreateCategory() {
  try {
    createCategory(newCategoryName.value)
    newCategoryName.value = ''
    loadCategories()
    uni.showToast({
      title: '分类已新增',
      icon: 'none'
    })
  } catch (error) {
    showError(error)
  }
}

/** 删除分类（二次确认，级联删除词语） */
function handleDeleteCategory(categoryId: string) {
  uni.showModal({
    title: '删除分类',
    content: '删除后该分类下的词语也会被删除，是否继续？',
    success: (res) => {
      if (!res.confirm) return

      deleteCategory(categoryId)
      loadCategories()
      uni.showToast({
        title: '分类已删除',
        icon: 'none'
      })
    }
  })
}

/** 跳转到该分类的词语管理页 */
function goWordManage(categoryId: string) {
  uni.navigateTo({
    url: `/pages/word/index?categoryId=${encodeURIComponent(categoryId)}`
  })
}

/** 显示错误提示 */
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

.category-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.category-row__main {
  min-width: 0;
}

.category-row__name {
  display: block;
  color: #172026;
  font-size: 32rpx;
  font-weight: 700;
}

.category-row__hint {
  display: block;
  margin-top: 8rpx;
  color: #6a747c;
  font-size: 24rpx;
}

.category-row__delete {
  flex-shrink: 0;
  min-height: 72rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
}
</style>
