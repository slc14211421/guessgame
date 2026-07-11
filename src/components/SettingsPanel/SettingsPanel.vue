<template>
  <view v-if="visible" class="settings-mask" @click="handleClose">
    <view class="settings-panel" @click.stop>
      <view class="settings-panel__header">
        <text class="settings-panel__title">设置</text>
        <button class="settings-panel__close-btn" aria-label="关闭设置" @click="handleClose">
          <text class="settings-panel__close">&times;</text>
        </button>
      </view>

      <view class="settings-panel__divider" />

      <view class="settings-panel__body">
        <view class="settings-panel__group settings-panel__group--first">
          <text class="settings-panel__label">背景色</text>
          <ColorPicker v-model="draftSettings.backgroundColor" :colors="THEME_COLORS" />
        </view>

        <view class="settings-panel__group">
          <text class="settings-panel__label">词条颜色</text>
          <ColorPicker v-model="draftSettings.wordColor" :colors="THEME_COLORS" />
        </view>

        <view class="settings-panel__group">
          <text class="settings-panel__label">出词方式</text>
          <view class="settings-panel__radio-group">
            <view
              class="settings-panel__radio"
              :class="{ 'settings-panel__radio--active': draftSettings.wordOrder === 'sequential' }"
              @click="draftSettings.wordOrder = 'sequential'"
            >
              <view class="settings-panel__radio-dot">
                <view v-if="draftSettings.wordOrder === 'sequential'" class="settings-panel__radio-dot--inner" />
              </view>
              <text class="settings-panel__radio-text">顺序出词</text>
            </view>
            <view
              class="settings-panel__radio"
              :class="{ 'settings-panel__radio--active': draftSettings.wordOrder === 'random' }"
              @click="draftSettings.wordOrder = 'random'"
            >
              <view class="settings-panel__radio-dot">
                <view v-if="draftSettings.wordOrder === 'random'" class="settings-panel__radio-dot--inner" />
              </view>
              <text class="settings-panel__radio-text">随机出词</text>
            </view>
          </view>
        </view>

        <view class="settings-panel__group">
          <text class="settings-panel__label">词条滚动</text>
          <view class="settings-panel__radio-group">
            <view
              class="settings-panel__radio"
              :class="{ 'settings-panel__radio--active': draftSettings.isWordScrollEnabled }"
              @click="draftSettings.isWordScrollEnabled = true"
            >
              <view class="settings-panel__radio-dot">
                <view v-if="draftSettings.isWordScrollEnabled" class="settings-panel__radio-dot--inner" />
              </view>
              <text class="settings-panel__radio-text">开启滚动</text>
            </view>
            <view
              class="settings-panel__radio"
              :class="{ 'settings-panel__radio--active': !draftSettings.isWordScrollEnabled }"
              @click="draftSettings.isWordScrollEnabled = false"
            >
              <view class="settings-panel__radio-dot">
                <view v-if="!draftSettings.isWordScrollEnabled" class="settings-panel__radio-dot--inner" />
              </view>
              <text class="settings-panel__radio-text">静态展示</text>
            </view>
          </view>
        </view>
      </view>

      <view class="settings-panel__divider" />

      <view class="settings-panel__footer">
        <button class="app-button settings-panel__btn-save" @click="handleSave">保存</button>
        <button
          v-if="showExitGame"
          class="app-button app-button--danger settings-panel__btn-exit"
          @click="handleExitGame"
        >
          退出
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { THEME_COLORS } from '@/constants/theme'
import type { UserSettings } from '@/types/settings'
import ColorPicker from '@/components/ColorPicker/ColorPicker.vue'

interface Props {
  visible: boolean
  settings: UserSettings
  showExitGame?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [settings: UserSettings]
  exitGame: []
}>()

const draftSettings = reactive<UserSettings>({
  backgroundColor: props.settings.backgroundColor,
  wordColor: props.settings.wordColor,
  wordOrder: props.settings.wordOrder,
  isWordScrollEnabled: props.settings.isWordScrollEnabled
})

watch(
  () => props.settings,
  (settings) => {
    draftSettings.backgroundColor = settings.backgroundColor
    draftSettings.wordColor = settings.wordColor
    draftSettings.wordOrder = settings.wordOrder
    draftSettings.isWordScrollEnabled = settings.isWordScrollEnabled
  },
  { deep: true }
)

function handleClose() {
  emit('close')
}

function handleSave() {
  emit('save', { ...draftSettings })
}

function handleExitGame() {
  emit('exitGame')
}
</script>

<style scoped lang="scss">
.settings-mask {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(23, 32, 38, 0.42);
}

.settings-panel {
  box-sizing: border-box;
  width: 100%;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
  padding: 28rpx 28rpx 32rpx;
}

.settings-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settings-panel__title {
  color: #172026;
  font-size: 34rpx;
  font-weight: 700;
}

.settings-panel__close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 12rpx;
  background: #f5f6f7;
  flex-shrink: 0;
}

.settings-panel__close-btn::after {
  border: 0;
}

.settings-panel__close {
  color: #6a747c;
  font-size: 34rpx;
  line-height: 1;
}

.settings-panel__divider {
  height: 2rpx;
  margin: 16rpx 0;
  background: #f0f1f2;
}

.settings-panel__body {
  padding: 4rpx 0;
}

.settings-panel__group {
  margin-top: 20rpx;
}

.settings-panel__group--first {
  margin-top: 0;
}

.settings-panel__label {
  display: block;
  margin-bottom: 14rpx;
  color: #172026;
  font-size: 26rpx;
  font-weight: 700;
}

.settings-panel__radio-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.settings-panel__radio {
  display: flex;
  align-items: center;
  gap: 14rpx;
  padding: 12rpx 0;
}

.settings-panel__radio-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 3rpx solid #d0d5d8;
  box-sizing: border-box;
  flex-shrink: 0;
}

.settings-panel__radio--active .settings-panel__radio-dot {
  border-color: #256f6c;
}

.settings-panel__radio-dot--inner {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #256f6c;
}

.settings-panel__radio-text {
  color: #6a747c;
  font-size: 28rpx;
  line-height: 1;
}

.settings-panel__radio--active .settings-panel__radio-text {
  color: #172026;
  font-weight: 600;
}

.settings-panel__footer {
  display: flex;
  flex-direction: row;
  gap: 14rpx;
  margin-top: 8rpx;
}

.settings-panel__btn-save {
  flex: 1;
  min-height: 80rpx !important;
  font-size: 28rpx !important;
  border-radius: 16rpx !important;
}

.settings-panel__btn-exit {
  min-width: 140rpx;
  min-height: 80rpx !important;
  font-size: 28rpx !important;
  border-radius: 16rpx !important;
}
</style>
