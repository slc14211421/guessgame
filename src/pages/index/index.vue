<!--
  首页
  提供：分类轮播选择、游戏时长选择、开始游戏入口、分类管理入口、设置入口
  核心交互：左右滑动分类卡片选择分组 → 选择猜词时间 → 点击"开始游戏"
-->
<template>
  <view class="app-page home-page">
    <!-- 顶部工具栏 -->
    <view class="home-toolbar">
      <button class="app-button app-button--ghost home-toolbar__manage" @click="goCategoryManage">
        分类管理
      </button>
      <button class="app-icon-button home-toolbar__settings" aria-label="打开设置" @click="openSettings">
        <SettingsIcon />
      </button>
    </view>

    <!-- 分类卡片轮播区（支持无限循环滑动） -->
    <view class="app-section app-panel app-panel--edge-scroll category-carousel-section">
      <text class="app-section-title">选择猜词卡片</text>
      <scroll-view
        v-if="categories.length > 0"
        class="category-carousel"
        scroll-x
        :scroll-left="categoryCarouselScrollLeft"
        :show-scrollbar="false"
        :scroll-with-animation="isCategoryCarouselAnimationEnabled"
        @scroll="handleCategoryCarouselScroll"
      >
        <view
          v-for="category in loopedCategories"
          :key="category.loopKey"
          class="category-card"
          :class="{ 'app-list-item--selected': selectedCategoryId === category.id }"
          @click="selectCategory(category.id)"
        >
          <view class="category-card__content">
            <text class="category-card__title">{{ category.name }}</text>
            <view class="category-card__meta">
              <text class="category-card__count">{{ wordCounts[category.id] || 0 }}</text>
              <text class="category-card__unit">个词条</text>
            </view>
            <text class="category-card__hint">
              {{ selectedCategoryId === category.id ? '已选中，点击开始' : '点击选择该分组' }}
            </text>
          </view>
        </view>
      </scroll-view>
      <EmptyState v-else title="暂无词语分组" description="请先进入分类管理添加分组" />
    </view>

    <!-- 猜词时间选择区 -->
    <view class="app-section app-panel duration-section">
      <text class="app-section-title">选择猜词时间</text>
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

    <!-- 底部固定开始按钮 -->
    <view class="home-footer">
      <button
        class="app-button"
        :class="{ 'app-button--disabled': !selectedCategoryId || !selectedGameDurationSeconds }"
        @click="startGame"
      >
        开始游戏
      </button>
    </view>

    <!-- 设置面板（底部弹出） -->
    <SettingsPanel
      :visible="showSettings"
      :settings="settings"
      @close="closeSettings"
      @save="handleSaveSettings"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
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
import { unlockPortrait } from '@/utils/orientation'
import { unlockGameAudio } from '@/utils/sound'

/** 分类列表 */
const categories = ref<Category[]>([])
/** 当前选中的分类 ID */
const selectedCategoryId = ref('')
/** 当前选中的游戏时长（秒） */
const selectedGameDurationSeconds = ref<number | undefined>()
/** 每个分类下的词条数量映射 */
const wordCounts = ref<Record<string, number>>({})
/** 用户设置 */
const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })
/** 设置面板是否可见 */
const showSettings = ref(false)

// ---- 分类卡片无限循环轮播 ----
const categoryCarouselScrollLeft = ref(0)
const isCategoryCarouselAnimationEnabled = ref(false)

/** 卡片宽度（rpx） */
const CATEGORY_CARD_WIDTH_RPX = 244
/** 卡片间距（rpx） */
const CATEGORY_CARD_GAP_RPX = 18
/** uni-app 设计稿基准宽度 */
const RPX_BASE_WIDTH = 750

/** 带循环标记的分类列表（用于无限轮播） */
interface LoopCategory extends Category {
  loopKey: string
}

/**
 * 三倍循环分类列表
 * 将原始列表复制三份，实现视觉上的无限循环滑动
 */
const loopedCategories = computed<LoopCategory[]>(() => {
  if (categories.value.length === 0) return []

  return [0, 1, 2].flatMap((copyIndex) => {
    return categories.value.map((category) => ({
      ...category,
      loopKey: `${copyIndex}-${category.id}`
    }))
  })
})

// 每次页面显示时刷新数据
onShow(() => {
  unlockPortrait()
  initLocalData()
  loadPageData()
})

/** 加载首页所需数据：分类、词条统计、设置 */
function loadPageData() {
  categories.value = getCategories()
  // 统计每个分类下的词条数量
  wordCounts.value = getWords().reduce<Record<string, number>>((counts, word) => {
    counts[word.categoryId] = (counts[word.categoryId] || 0) + 1
    return counts
  }, {})
  settings.value = getSettings()

  // 若之前选中的分类已不存在，清除选中状态
  if (!categories.value.some((category) => category.id === selectedCategoryId.value)) {
    selectedCategoryId.value = ''
  }

  resetCategoryCarouselPosition()
}

/** 选中某个分类 */
function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
}

/** 重置轮播位置到中间段 */
function resetCategoryCarouselPosition() {
  if (categories.value.length === 0) return

  isCategoryCarouselAnimationEnabled.value = false
  categoryCarouselScrollLeft.value = getCategoryCarouselSegmentWidth()
}

/**
 * 处理分类轮播滚动事件
 * 当滚动到边界时，无缝跳转到另一段对应位置（实现无限循环）
 */
function handleCategoryCarouselScroll(event: { detail: { scrollLeft: number } }) {
  if (categories.value.length <= 1) return

  const scrollLeft = event.detail.scrollLeft
  const segmentWidth = getCategoryCarouselSegmentWidth()
  if (segmentWidth <= 0) return

  // 滚到左侧边界 → 跳到右侧对应位置
  if (scrollLeft < segmentWidth * 0.5) {
    jumpCategoryCarousel(scrollLeft + segmentWidth)
    return
  }

  // 滚到右侧边界 → 跳到左侧对应位置
  if (scrollLeft > segmentWidth * 1.5) {
    jumpCategoryCarousel(scrollLeft - segmentWidth)
  }
}

/** 无动画跳转到指定滚动位置 */
function jumpCategoryCarousel(nextScrollLeft: number) {
  isCategoryCarouselAnimationEnabled.value = false
  categoryCarouselScrollLeft.value = nextScrollLeft

  nextTick(() => {
    isCategoryCarouselAnimationEnabled.value = true
  })
}

/** 计算单段（一份原始列表）的总宽度 */
function getCategoryCarouselSegmentWidth() {
  return categories.value.length * getCategoryCarouselCardStride()
}

/** 计算单个卡片+间距的像素宽度 */
function getCategoryCarouselCardStride() {
  const { windowWidth } = uni.getSystemInfoSync()
  return ((CATEGORY_CARD_WIDTH_RPX + CATEGORY_CARD_GAP_RPX) * windowWidth) / RPX_BASE_WIDTH
}

function selectGameDuration(seconds: number) {
  selectedGameDurationSeconds.value = seconds
}

/** 开始游戏：校验选择 → 解锁音频 → 跳转倒计时页 */
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

  // 提前解锁音频（iOS 静音模式兼容）
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

.category-carousel-section {
  padding-left: 26rpx;
}

.category-carousel {
  width: 100%;
  margin-top: 20rpx;
  white-space: nowrap;
}

.category-card {
  display: inline-flex;
  box-sizing: border-box;
  width: 244rpx;
  min-height: 244rpx;
  margin-right: 18rpx;
  padding: 22rpx;
  vertical-align: top;
  border: 2rpx solid #dfe5e8;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 26rpx rgba(23, 32, 38, 0.07);
  transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
}

.category-card:active {
  transform: scale(0.98);
}

.category-card.app-list-item--selected {
  border-color: #256f6c;
  background: #edf8f6;
}

.category-card__content {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
}

.category-card__title {
  overflow: hidden;
  color: #172026;
  font-size: 36rpx;
  font-weight: 800;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-card__meta {
  display: flex;
  align-items: baseline;
  margin-top: 18rpx;
  gap: 8rpx;
}

.category-card__count {
  color: #256f6c;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1;
}

.category-card__unit {
  color: #33414a;
  font-size: 24rpx;
  font-weight: 700;
}

.category-card__hint {
  display: block;
  margin-top: auto;
  padding-top: 18rpx;
  color: #6a747c;
  font-size: 22rpx;
  line-height: 1.2;
  white-space: normal;
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
