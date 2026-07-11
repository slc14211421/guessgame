<template>
  <view class="countdown-page">
    <!-- <text class="countdown-page__label">准备开始</text> -->
    <text class="countdown-page__number">{{ count }}</text>
    <button class="app-button app-button--ghost countdown-page__back" @click="handleBack">
      返回首页
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { canStartGame, parseGameDurationSeconds } from '@/services/game'
import { lockLandscape, unlockPortrait } from '@/utils/orientation'
import { playCountdownTickSound, playGameReadySound, stopGameAudio } from '@/utils/sound'

const categoryId = ref('')
const durationSeconds = ref(0)
const count = ref(5)
let timer: ReturnType<typeof setInterval> | null = null
let readyFallbackTimer: ReturnType<typeof setTimeout> | null = null
let isPageActive = false
let isRedirectingToGame = false
let isCountdownStarted = false

onLoad((query) => {
  isPageActive = true
  isRedirectingToGame = false
  isCountdownStarted = false
  lockLandscape()
  categoryId.value = decodeURIComponent(String(query?.categoryId || ''))
  durationSeconds.value = parseGameDurationSeconds(String(query?.durationSeconds || '')) || 0
  const result = canStartGame(categoryId.value)

  if (!result.ok) {
    uni.showToast({
      title: result.message || '该分组暂无词语',
      icon: 'none'
    })
    uni.reLaunch({
      url: '/pages/index/index'
    })
    return
  }

  if (!durationSeconds.value) {
    uni.showToast({
      title: '请选择猜词时间',
      icon: 'none'
    })
    uni.reLaunch({
      url: '/pages/index/index'
    })
    return
  }

  startCountdown()
})

onUnload(() => {
  isPageActive = false
  clearCountdown()
  clearReadyFallbackTimer()
  if (!isRedirectingToGame) {
    stopGameAudio()
    unlockPortrait()
  }
})

function startCountdown() {
  clearCountdown()
  clearReadyFallbackTimer()
  count.value = 5
  playGameReadySound(startReadCountdown)
  readyFallbackTimer = setTimeout(startReadCountdown, 10000)
}

function startReadCountdown() {
  if (!isPageActive || isCountdownStarted) return
  isCountdownStarted = true
  clearReadyFallbackTimer()
  count.value = 5
  playCountdownTickSound(count.value)
  timer = setInterval(() => {
    count.value -= 1

    if (count.value <= 0) {
      clearCountdown()
      isRedirectingToGame = true
      uni.redirectTo({
        url:
          `/pages/game/index?categoryId=${encodeURIComponent(categoryId.value)}` +
          `&durationSeconds=${durationSeconds.value}`
      })
      return
    }

    playCountdownTickSound(count.value)
  }, 1000)
}

function clearCountdown() {
  if (!timer) return
  clearInterval(timer)
  timer = null
}

function clearReadyFallbackTimer() {
  if (!readyFallbackTimer) return
  clearTimeout(readyFallbackTimer)
  readyFallbackTimer = null
}

function handleBack() {
  clearCountdown()
  clearReadyFallbackTimer()
  stopGameAudio()
  unlockPortrait()
  uni.reLaunch({
    url: '/pages/index/index'
  })
}
</script>

<style scoped lang="scss">
.countdown-page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx 32rpx;
  background: #f5f7f8;
}

.countdown-page__label {
  color: #6a747c;
  font-size: 34rpx;
  font-weight: 700;
}

.countdown-page__number {
  margin-top: 26rpx;
  color: #172026;
  font-size: 188rpx;
  font-weight: 800;
  line-height: 1;
}

.countdown-page__back {
  width: 100%;
  margin-top: 72rpx;
}
</style>
