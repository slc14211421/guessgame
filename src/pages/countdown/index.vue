<!--
  倒计时页面
  游戏开始前的 5 秒倒计时，带音效提示。
  先播放"准备开始"音效，然后逐秒倒数至 0 后跳转到游戏页。
-->
<template>
  <view class="countdown-page">
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
/** 当前倒计时数字 */
const count = ref(5)
let timer: ReturnType<typeof setInterval> | null = null
/** 准备音效的超时降级计时器：如果音效 10 秒还未播完，强制开始倒数 */
let readyFallbackTimer: ReturnType<typeof setTimeout> | null = null
let isPageActive = false
let isRedirectingToGame = false
let isCountdownStarted = false

onLoad((query) => {
  isPageActive = true
  isRedirectingToGame = false
  isCountdownStarted = false
  // 进入游戏流程后锁定横屏
  lockLandscape()
  categoryId.value = decodeURIComponent(String(query?.categoryId || ''))
  durationSeconds.value = parseGameDurationSeconds(String(query?.durationSeconds || '')) || 0

  // 参数校验：分组无效或时长无效则返回首页
  const result = canStartGame(categoryId.value)
  if (!result.ok) {
    uni.showToast({
      title: result.message || '该分组暂无词语',
      icon: 'none'
    })
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  if (!durationSeconds.value) {
    uni.showToast({
      title: '请选择猜词时间',
      icon: 'none'
    })
    uni.reLaunch({ url: '/pages/index/index' })
    return
  }

  startCountdown()
})

onUnload(() => {
  isPageActive = false
  clearCountdown()
  clearReadyFallbackTimer()
  // 仅在非正常跳转游戏页时清理音频和屏幕方向
  if (!isRedirectingToGame) {
    stopGameAudio()
    unlockPortrait()
  }
})

/** 开始倒计时：先播放准备音效，完成后进入逐秒倒数 */
function startCountdown() {
  clearCountdown()
  clearReadyFallbackTimer()
  count.value = 5
  // 播放"准备开始"音效，播完后回调 startReadCountdown
  playGameReadySound(startReadCountdown)
  // 降级：10 秒后无论如何都开始倒数
  readyFallbackTimer = setTimeout(startReadCountdown, 10000)
}

/** 逐秒倒数：5 → 4 → 3 → 2 → 1 → 跳转游戏页 */
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
