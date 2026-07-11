<template>
  <view class="app-page home-page">
    <view class="home-toolbar">
      <button class="app-button app-button--ghost home-toolbar__manage" @click="goCategoryManage">
        分类管理
      </button>
      <button class="app-icon-button home-toolbar__settings" aria-label="打开设置" @click="openSettings">
        <SettingsIcon />
      </button>
    </view>

    <view class="app-section">
      <view v-if="categories.length > 0" class="app-list">
        <view
          v-for="category in categories"
          :key="category.id"
          class="app-list-item category-item"
          :class="{ 'app-list-item--selected': selectedCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <view class="category-item__main">
            <text class="category-item__name">{{ category.name }}</text>
            <text class="category-item__desc">点击选择该分组</text>
          </view>
          <text class="app-count-badge">{{ wordCounts[category.id] || 0 }} 个</text>
        </view>
      </view>
      <EmptyState v-else title="暂无词语分组" description="请先进入分类管理添加分组" />
    </view>

    <view class="app-section duration-section">
      <text class="duration-section__title">选择猜词时间</text>
      <view class="duration-options">
        <button
          v-for="seconds in GAME_DURATION_OPTIONS"
          :key="seconds"
          class="duration-options__item"
          :class="{ 'duration-options__item--selected': selectedGameDurationSeconds === seconds }"
          @click="selectGameDuration(seconds)"
        >
          {{ formatGameDuration(seconds) }}
        </button>
      </view>
    </view>

    <view class="home-footer">
      <button
        class="app-button"
        :class="{ 'app-button--disabled': !selectedCategoryId || !selectedGameDurationSeconds }"
        @click="startGame"
      >
        开始游戏
      </button>
    </view>

    <SettingsPanel
      :visible="showSettings"
      :settings="settings"
      @close="closeSettings"
      @save="handleSaveSettings"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import EmptyState from '@/components/EmptyState/EmptyState.vue'
import SettingsIcon from '@/components/SettingsIcon/SettingsIcon.vue'
import SettingsPanel from '@/components/SettingsPanel/SettingsPanel.vue'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import { getCategories } from '@/services/category'
import { canStartGame, formatGameDuration, GAME_DURATION_OPTIONS } from '@/services/game'
import { getSettings, saveSettings } from '@/services/settings'
import { initLocalData } from '@/services/storage'
import { getWords } from '@/services/word'
import type { Category } from '@/types/category'
import type { UserSettings } from '@/types/settings'
import { unlockGameAudio } from '@/utils/sound'

const categories = ref<Category[]>([])
const selectedCategoryId = ref('')
const selectedGameDurationSeconds = ref<number | undefined>()
const wordCounts = ref<Record<string, number>>({})
const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })
const showSettings = ref(false)

onShow(() => {
  initLocalData()
  loadPageData()
})

function loadPageData() {
  categories.value = getCategories()
  wordCounts.value = getWords().reduce<Record<string, number>>((counts, word) => {
    counts[word.categoryId] = (counts[word.categoryId] || 0) + 1
    return counts
  }, {})
  settings.value = getSettings()

  if (!categories.value.some((category) => category.id === selectedCategoryId.value)) {
    selectedCategoryId.value = ''
  }
}

function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
}

function selectGameDuration(seconds: number) {
  selectedGameDurationSeconds.value = seconds
}

function startGame() {
  const result = canStartGame(selectedCategoryId.value)

  if (!result.ok) {
    uni.showToast({
      title: result.message || '请选择词语分组',
      icon: 'none'
    })
    return
  }

  if (!selectedGameDurationSeconds.value) {
    uni.showToast({
      title: '请选择猜词时间',
      icon: 'none'
    })
    return
  }

  unlockGameAudio()
  uni.navigateTo({
    url:
      `/pages/countdown/index?categoryId=${encodeURIComponent(selectedCategoryId.value)}` +
      `&durationSeconds=${selectedGameDurationSeconds.value}`
  })
}

function goCategoryManage() {
  uni.navigateTo({
    url: '/pages/category/index'
  })
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function handleSaveSettings(nextSettings: UserSettings) {
  settings.value = saveSettings(nextSettings)
  showSettings.value = false
  uni.showToast({
    title: '设置已保存',
    icon: 'none'
  })
}
</script>

<style scoped lang="scss">
.home-page {
  padding-bottom: 148rpx;
}

.home-toolbar {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.home-toolbar__manage {
  flex: 1;
}

.home-toolbar__settings {
  flex-shrink: 0;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.category-item__main {
  min-width: 0;
}

.category-item__name {
  display: block;
  color: #172026;
  font-size: 34rpx;
  font-weight: 700;
}

.category-item__desc {
  display: block;
  margin-top: 8rpx;
  color: #6a747c;
  font-size: 24rpx;
}

.duration-section {
  box-sizing: border-box;
  padding: 26rpx;
  border: 2rpx solid #dde3e6;
  border-radius: 18rpx;
  background: #ffffff;
}

.duration-section__title {
  display: block;
  color: #172026;
  font-size: 30rpx;
  font-weight: 800;
}

.duration-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 20rpx;
}

.duration-options__item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  margin: 0;
  padding: 0 12rpx;
  border: 2rpx solid #dce4e7;
  border-radius: 14rpx;
  background: #f7f9fa;
  color: #33414a;
  font-size: 26rpx;
  font-weight: 700;
}

.duration-options__item::after {
  border: 0;
}

.duration-options__item--selected {
  border-color: #256f6c;
  background: #e6f3f1;
  color: #174d4b;
}

.home-footer {
  position: fixed;
  right: 24rpx;
  bottom: 32rpx;
  left: 24rpx;
  z-index: 5;
}
</style>
