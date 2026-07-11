<template>
  <view
    class="game-page"
    :style="{ backgroundColor: settings.backgroundColor }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <view class="game-page__topbar">
      <text class="game-page__timer">{{ formattedRemainingTime }}</text>
      <button class="game-page__exit" aria-label="退出猜词模式" @click.stop="handleExitGame">
        <text class="game-page__exit-icon">&times;</text>
      </button>
    </view>

    <view
      class="game-page__word-track"
      :class="{ 'game-page__word-track--static': !settings.isWordScrollEnabled }"
    >
      <text
        class="game-page__word"
        :class="{ 'game-page__word--static': !settings.isWordScrollEnabled }"
        :style="wordStyle"
      >
        {{ currentWord }}
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { DEFAULT_SETTINGS } from '@/constants/theme'
import {
  canStartGame,
  formatGameTime,
  getGameWords,
  getNextIndex,
  parseGameDurationSeconds
} from '@/services/game'
import { getSettings } from '@/services/settings'
import type { UserSettings } from '@/types/settings'
import type { WordItem } from '@/types/word'
import { startAutoLandscape, unlockPortrait } from '@/utils/orientation'
import { playFinalCountdownSound, playGameEndSound } from '@/utils/sound'
import { keepGameScreenAwake, releaseGameScreenAwake } from '@/utils/wakelock'

const categoryId = ref('')
const durationSeconds = ref(0)
const remainingSeconds = ref(0)
const words = ref<WordItem[]>([])
const currentIndex = ref(0)
const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })
const touchStartX = ref(0)
const lastSwipeAt = ref(0)
const wordTransform = ref('translate3d(110vw, 0, 0)')
const wordOpacity = ref(1)
const wordMoveDirection = ref<1 | -1>(1)
let animFrameId = 0
let restartTimer = 0
let staticTransitionTimer = 0
let animStartAt = 0
let animDuration = 12000
let isVolumeKeyBound = false
let gameTimer: ReturnType<typeof setInterval> | null = null
let isGameEnded = false
let isGameDataLoaded = false
let isGameTimerStarted = false
let endModalTimer = 0

type PlusVolumeKeyManager = {
  addEventListener?: (event: 'volumeupbutton' | 'volumedownbutton', listener: () => void) => void
  removeEventListener?: (event: 'volumeupbutton' | 'volumedownbutton', listener: () => void) => void
  setVolumeButtonEnabled?: (enable: boolean) => void
}

type PlusNavigatorManager = {
  hideSystemNavigation?: () => void
  setFullscreen?: (fullscreen: boolean) => void
  setStatusBarBackground?: (color: string) => void
  setStatusBarStyle?: (style: 'dark' | 'light') => void
  showSystemNavigation?: () => void
}

const currentWord = computed(() => {
  return words.value[currentIndex.value]?.text || ''
})

const formattedRemainingTime = computed(() => {
  return formatGameTime(remainingSeconds.value)
})

const wordStyle = computed(() => {
  return {
    color: settings.value.wordColor,
    transform: wordTransform.value,
    opacity: wordOpacity.value,
    fontSize: settings.value.isWordScrollEnabled ? '180rpx' : staticWordFontSize.value
  }
})

const staticWordFontSize = computed(() => {
  const length = Array.from(currentWord.value).length
  if (length <= 2) return '220rpx'
  if (length <= 4) return '154rpx'
  if (length <= 6) return '124rpx'
  return '104rpx'
})

onLoad((query) => {
  isGameEnded = false
  isGameDataLoaded = false
  isGameTimerStarted = false
  endModalTimer = 0
  categoryId.value = decodeURIComponent(String(query?.categoryId || ''))
  durationSeconds.value = parseGameDurationSeconds(String(query?.durationSeconds || '')) || 0
  remainingSeconds.value = durationSeconds.value
})

onShow(() => {
  settings.value = getSettings()
  enterGameFullscreen()
  startAutoLandscape()
  keepGameScreenAwake()
  if (!loadGameData()) return
  restartWordAnimation()
  bindVolumeKeys()
  startGameTimer()
})

onUnload(() => {
  unlockPortrait()
  exitGameFullscreen()
  releaseGameScreenAwake()
  clearTimeout(animFrameId)
  clearTimeout(restartTimer)
  clearTimeout(staticTransitionTimer)
  clearTimeout(endModalTimer)
  clearGameTimer()
  unbindVolumeKeys()
})

watch(currentWord, () => {
  restartWordAnimation()
})

function loadGameData() {
  const result = canStartGame(categoryId.value)

  if (!result.ok) {
    uni.showToast({
      title: result.message || '该分组暂无词语',
      icon: 'none'
    })
    uni.reLaunch({
      url: '/pages/index/index'
    })
    return false
  }

  if (!durationSeconds.value) {
    uni.showToast({
      title: '请选择猜词时间',
      icon: 'none'
    })
    uni.reLaunch({
      url: '/pages/index/index'
    })
    return false
  }

  if (!isGameDataLoaded) {
    words.value = getGameWords(categoryId.value, settings.value.wordOrder)
    currentIndex.value = 0
    isGameDataLoaded = true
  }
  return true
}

function tick() {
  if (!settings.value.isWordScrollEnabled) {
    wordTransform.value = 'translate3d(0, 0, 0)'
    return
  }

  const elapsed = Date.now() - animStartAt
  const progress = Math.min(elapsed / animDuration, 1)
  const vw = wordMoveDirection.value * 110 * (1 - 2 * progress)
  wordTransform.value = `translate3d(${vw}vw, 0, 0)`
  if (progress < 1) {
    animFrameId = setTimeout(tick, 16) as unknown as number
  } else {
    wordTransform.value = `translate3d(${wordMoveDirection.value * 110}vw, 0, 0)`
    restartTimer = setTimeout(() => {
      animStartAt = Date.now()
      animFrameId = setTimeout(tick, 16) as unknown as number
    }, 800) as unknown as number
  }
}

function restartWordAnimation() {
  clearTimeout(animFrameId)
  clearTimeout(restartTimer)
  clearTimeout(staticTransitionTimer)
  if (!settings.value.isWordScrollEnabled) {
    wordOpacity.value = 0.4
    wordTransform.value = `translate3d(${wordMoveDirection.value * 8}vw, 0, 0)`
    staticTransitionTimer = setTimeout(() => {
      wordOpacity.value = 1
      wordTransform.value = 'translate3d(0, 0, 0)'
    }, 24) as unknown as number
    return
  }

  wordOpacity.value = 1
  wordTransform.value = `translate3d(${wordMoveDirection.value * 110}vw, 0, 0)`
  animStartAt = Date.now()
  animFrameId = setTimeout(tick, 16) as unknown as number
}

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX || 0
}

function handleTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX || 0
  const diffX = touchStartX.value - endX
  const now = Date.now()

  if (Math.abs(diffX) < 50) return
  if (now - lastSwipeAt.value < 300) return

  lastSwipeAt.value = now
  goNextWord()
}

function handleExitGame() {
  clearTimeout(endModalTimer)
  clearGameTimer()
  unlockPortrait()
  exitGameFullscreen()
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

function bindVolumeKeys() {
  if (typeof plus === 'undefined') return
  setVolumeButtonEnabled(false)
  if (!isVolumeKeyBound) {
    const keyManager = getPlusKeyManager()
    keyManager?.addEventListener?.('volumeupbutton', onVolumeKey)
    keyManager?.addEventListener?.('volumedownbutton', onVolumeKey)
    isVolumeKeyBound = true
  }
}

function unbindVolumeKeys() {
  if (typeof plus === 'undefined') return
  if (isVolumeKeyBound) {
    const keyManager = getPlusKeyManager()
    keyManager?.removeEventListener?.('volumeupbutton', onVolumeKey)
    keyManager?.removeEventListener?.('volumedownbutton', onVolumeKey)
    isVolumeKeyBound = false
  }
  setVolumeButtonEnabled(true)
}

function setVolumeButtonEnabled(isEnabled: boolean) {
  try {
    getPlusKeyManager()?.setVolumeButtonEnabled?.(isEnabled)
  } catch {
    // Some debug runtimes may not expose this App-Plus API.
  }
}

function getPlusKeyManager() {
  return (plus as unknown as { key?: PlusVolumeKeyManager }).key
}

function enterGameFullscreen() {
  if (typeof plus === 'undefined') return
  try {
    const navigator = getPlusNavigatorManager()
    navigator?.setStatusBarBackground?.(settings.value.backgroundColor)
    navigator?.setStatusBarStyle?.('light')
    navigator?.setFullscreen?.(true)
    navigator?.hideSystemNavigation?.()
  } catch {
    // Some debug runtimes may not expose all navigator APIs.
  }
}

function exitGameFullscreen() {
  if (typeof plus === 'undefined') return
  try {
    const navigator = getPlusNavigatorManager()
    navigator?.showSystemNavigation?.()
    navigator?.setFullscreen?.(false)
    navigator?.setStatusBarBackground?.('#f5f7f8')
    navigator?.setStatusBarStyle?.('dark')
  } catch {
    // Some debug runtimes may not expose all navigator APIs.
  }
}

function getPlusNavigatorManager() {
  return (plus as unknown as { navigator?: PlusNavigatorManager }).navigator
}

function startGameTimer() {
  if (!durationSeconds.value || isGameEnded || isGameTimerStarted) return
  isGameTimerStarted = true
  clearGameTimer()
  remainingSeconds.value = durationSeconds.value
  gameTimer = setInterval(() => {
    remainingSeconds.value = Math.max(remainingSeconds.value - 1, 0)

    if (remainingSeconds.value <= 0) {
      handleGameEnd()
      return
    }

    if (remainingSeconds.value <= 10) {
      playFinalCountdownSound(remainingSeconds.value)
    }
  }, 1000)
}

function clearGameTimer() {
  if (!gameTimer) return
  clearInterval(gameTimer)
  gameTimer = null
}

function handleGameEnd() {
  if (isGameEnded) return
  isGameEnded = true
  clearGameTimer()
  playGameEndSound()
  endModalTimer = setTimeout(() => {
    uni.showModal({
      title: '游戏结束',
      content: '本轮猜词时间已到',
      showCancel: false,
      confirmText: '返回首页',
      success: () => {
        handleExitGame()
      }
    })
  }, 360) as unknown as number
}

function onVolumeKey() {
  const now = Date.now()
  if (now - lastSwipeAt.value < 300) return
  lastSwipeAt.value = now
  goNextWord()
}

function goNextWord() {
  wordMoveDirection.value = wordMoveDirection.value === 1 ? -1 : 1
  const nextIndex = getNextIndex(currentIndex.value, words.value.length)
  const shouldRestartManually = words.value[nextIndex]?.text === currentWord.value
  currentIndex.value = nextIndex
  if (shouldRestartManually) {
    restartWordAnimation()
  }
}
</script>

<style scoped lang="scss">
.game-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.game-page__topbar {
  position: absolute;
  z-index: 4;
  top: 12rpx;
  right: 18rpx;
  left: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
}

.game-page__timer {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 150rpx;
  height: 56rpx;
  color: rgba(255, 255, 255, 0.86);
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1;
}

.game-page__exit {
  position: absolute;
  top: 2rpx;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  margin: 0;
  padding: 0;
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 10rpx;
  background: rgba(255, 255, 255, 0.12);
}

.game-page__exit::after {
  border: 0;
}

.game-page__exit-icon {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 700;
  line-height: 1;
}

.game-page__word-track {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.game-page__word-track--static {
  justify-content: center;
  padding: 0 7vw;
  box-sizing: border-box;
}

.game-page__word {
  display: inline-block;
  min-width: 100%;
  padding: 0 8vw;
  box-sizing: border-box;
  color: #ffffff;
  font-size: 180rpx;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
  will-change: transform;
}

.game-page__word--static {
  min-width: 0;
  max-width: 100%;
  padding: 0;
  overflow-wrap: anywhere;
  line-height: 0.95;
  white-space: normal;
  transition: transform 220ms ease-out, opacity 160ms ease-out;
  will-change: auto;
}
</style>
