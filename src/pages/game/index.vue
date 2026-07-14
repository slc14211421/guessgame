<!--
  游戏主页面
  核心玩法：词条从屏幕一侧滑入、滑出，玩家通过滑动或音量键切词。
  支持：用户自定义背景色/文字色、滚动/静态两种展示模式、横屏自适应、
  App 端全屏沉浸、音量键切词、屏幕常亮。
-->
<template>
  <view
    class="game-page"
    :style="{ backgroundColor: settings.backgroundColor }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- 顶部栏：倒计时 + 退出按钮 -->
    <view class="game-page__topbar">
      <text class="game-page__timer" :style="topbarTextStyle">{{ formattedRemainingTime }}</text>
      <button
        class="game-page__exit"
        :style="exitButtonStyle"
        aria-label="退出猜词模式"
        @click.stop="handleExitGame"
      >
        <text class="game-page__exit-icon" :style="topbarTextStyle">&times;</text>
      </button>
    </view>

    <!-- 词条展示区 -->
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
import { getReadableTextColor, isLightHexColor } from '@/utils/color'
import { startAutoLandscape, unlockPortrait } from '@/utils/orientation'
import { playFinalCountdownSound, playGameEndSound, stopGameAudio } from '@/utils/sound'
import { keepGameScreenAwake, releaseGameScreenAwake } from '@/utils/wakelock'

// ---- 游戏状态 ----
const categoryId = ref('')
const durationSeconds = ref(0)
const remainingSeconds = ref(0)
const words = ref<WordItem[]>([])
const currentIndex = ref(0)
const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS })

// ---- 触摸交互状态 ----
const touchStartX = ref(0)
const lastSwipeAt = ref(0)

// ---- 词条动画状态 ----
const wordTransform = ref('translate3d(110vw, 0, 0)')
const wordOpacity = ref(1)
/** 词条滑动方向：1 向右，-1 向左，每次切词交替 */
const wordMoveDirection = ref<1 | -1>(1)
let animFrameId = 0
let restartTimer = 0
let staticTransitionTimer = 0
let animStartAt = 0
/** 单次动画持续时间（毫秒） */
let animDuration = 12000

// ---- App 原生相关状态 ----
let isVolumeKeyBound = false
let gameTimer: ReturnType<typeof setInterval> | null = null
let isGameEnded = false
let isGameDataLoaded = false
let isGameTimerStarted = false
let endModalTimer = 0

/** App 端音量键管理器接口 */
type PlusVolumeKeyManager = {
  addEventListener?: (event: 'volumeupbutton' | 'volumedownbutton', listener: () => void) => void
  removeEventListener?: (event: 'volumeupbutton' | 'volumedownbutton', listener: () => void) => void
  setVolumeButtonEnabled?: (enable: boolean) => void
}

/** App 端导航栏管理器接口 */
type PlusNavigatorManager = {
  hideSystemNavigation?: () => void
  setFullscreen?: (fullscreen: boolean) => void
  setStatusBarBackground?: (color: string) => void
  setStatusBarStyle?: (style: 'dark' | 'light') => void
  showSystemNavigation?: () => void
}

// ---- 计算属性 ----

/** 当前展示的词条文本 */
const currentWord = computed(() => {
  return words.value[currentIndex.value]?.text || ''
})

/** 格式化后的剩余时间（MM:SS） */
const formattedRemainingTime = computed(() => {
  return formatGameTime(remainingSeconds.value)
})

/** 词条动态样式（颜色、位置、透明度、字号） */
const wordStyle = computed(() => {
  return {
    color: settings.value.wordColor,
    transform: wordTransform.value,
    opacity: wordOpacity.value,
    fontSize: settings.value.isWordScrollEnabled ? '180rpx' : staticWordFontSize.value
  }
})

const topbarTextColor = computed(() => getReadableTextColor(settings.value.backgroundColor))

const topbarTextStyle = computed(() => {
  return {
    color: topbarTextColor.value
  }
})

const exitButtonStyle = computed(() => {
  const isLightBackground = isLightHexColor(settings.value.backgroundColor)
  return {
    borderColor: isLightBackground ? 'rgba(17, 17, 17, 0.34)' : 'rgba(255, 255, 255, 0.5)',
    backgroundColor: isLightBackground ? 'rgba(17, 17, 17, 0.08)' : 'rgba(255, 255, 255, 0.12)'
  }
})

/** 静态模式下根据词条长度自适应字号 */
const staticWordFontSize = computed(() => {
  const length = Array.from(currentWord.value).length
  if (length <= 2) return '220rpx'
  if (length <= 4) return '154rpx'
  if (length <= 6) return '124rpx'
  return '104rpx'
})

// ---- 生命周期 ----

onLoad((query) => {
  // 重置所有状态
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
  // 进入沉浸模式
  enterGameFullscreen()
  startAutoLandscape()
  keepGameScreenAwake()
  // 加载游戏数据（仅首次）
  if (!loadGameData()) return
  restartWordAnimation()
  // 绑定 App 端音量键切词
  bindVolumeKeys()
  startGameTimer()
})

onUnload(() => {
  // 清理所有资源
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

// 词条切换时重新启动动画
watch(currentWord, () => {
  restartWordAnimation()
})

// ---- 数据加载 ----

/** 加载游戏词条数据，校验失败返回 false */
function loadGameData() {
  const result = canStartGame(categoryId.value)

  if (!result.ok) {
    uni.showToast({
      title: result.message || '该分组暂无词语',
      icon: 'none'
    })
    uni.reLaunch({ url: '/pages/index/index' })
    return false
  }

  if (!durationSeconds.value) {
    uni.showToast({
      title: '请选择猜词时间',
      icon: 'none'
    })
    uni.reLaunch({ url: '/pages/index/index' })
    return false
  }

  if (!isGameDataLoaded) {
    words.value = getGameWords(categoryId.value, settings.value.wordOrder)
    currentIndex.value = 0
    isGameDataLoaded = true
  }
  return true
}

// ---- 词条滚动动画 ----

/**
 * 单帧动画：使用 requestAnimationFrame 风格的 setTimeout 循环
 * 词条从屏幕一侧（110vw）滑到另一侧（-110vw）
 */
function tick() {
  // 静态模式：固定在屏幕中央
  if (!settings.value.isWordScrollEnabled) {
    wordTransform.value = 'translate3d(0, 0, 0)'
    return
  }

  const elapsed = Date.now() - animStartAt
  const progress = Math.min(elapsed / animDuration, 1)
  const vw = wordMoveDirection.value * 110 * (1 - 2 * progress)
  wordTransform.value = `translate3d(${vw}vw, 0, 0)`

  if (progress < 1) {
    // 动画进行中，继续下一帧（约 60fps）
    animFrameId = setTimeout(tick, 16) as unknown as number
  } else {
    // 动画结束，暂停 800ms 后开始下一轮
    wordTransform.value = `translate3d(${wordMoveDirection.value * 110}vw, 0, 0)`
    restartTimer = setTimeout(() => {
      animStartAt = Date.now()
      animFrameId = setTimeout(tick, 16) as unknown as number
    }, 800) as unknown as number
  }
}

/** 重新启动词条动画（词条切换时调用） */
function restartWordAnimation() {
  clearTimeout(animFrameId)
  clearTimeout(restartTimer)
  clearTimeout(staticTransitionTimer)

  // 静态模式：微小的入场过渡动画
  if (!settings.value.isWordScrollEnabled) {
    wordOpacity.value = 0.4
    wordTransform.value = `translate3d(${wordMoveDirection.value * 8}vw, 0, 0)`
    staticTransitionTimer = setTimeout(() => {
      wordOpacity.value = 1
      wordTransform.value = 'translate3d(0, 0, 0)'
    }, 24) as unknown as number
    return
  }

  // 滚动模式：从屏幕侧边滑入
  wordOpacity.value = 1
  wordTransform.value = `translate3d(${wordMoveDirection.value * 110}vw, 0, 0)`
  animStartAt = Date.now()
  animFrameId = setTimeout(tick, 16) as unknown as number
}

// ---- 触摸交互 ----

function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0]?.clientX || 0
}

/** 滑动结束：判断是否为有效的水平滑动（阈值 50px，间隔 300ms 防抖） */
function handleTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0]?.clientX || 0
  const diffX = touchStartX.value - endX
  const now = Date.now()

  if (Math.abs(diffX) < 50) return
  if (now - lastSwipeAt.value < 300) return

  lastSwipeAt.value = now
  goNextWord()
}

// ---- 退出游戏 ----

function handleExitGame() {
  clearTimeout(endModalTimer)
  clearGameTimer()
  stopGameAudio()
  releaseGameScreenAwake()
  unbindVolumeKeys()
  unlockPortrait()
  exitGameFullscreen()
  uni.reLaunch({ url: '/pages/index/index' })
}

// ---- App 端音量键切词 ----

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
    // 某些调试运行时可能不暴露此 API
  }
}

function getPlusKeyManager() {
  return (plus as unknown as { key?: PlusVolumeKeyManager }).key
}

// ---- App 端全屏沉浸 ----

function enterGameFullscreen() {
  if (typeof plus === 'undefined') return
  try {
    const navigator = getPlusNavigatorManager()
    navigator?.setStatusBarBackground?.(settings.value.backgroundColor)
    navigator?.setStatusBarStyle?.(isLightHexColor(settings.value.backgroundColor) ? 'dark' : 'light')
    navigator?.setFullscreen?.(true)
    navigator?.hideSystemNavigation?.()
  } catch {
    // 某些调试运行时可能不暴露所有 navigator API
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
    // 某些调试运行时可能不暴露所有 navigator API
  }
}

function getPlusNavigatorManager() {
  return (plus as unknown as { navigator?: PlusNavigatorManager }).navigator
}

// ---- 游戏计时 ----

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

    // 最后 10 秒播放提示音
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

/** 游戏结束：播放结束音效 → 弹出提示框 */
function handleGameEnd() {
  if (isGameEnded) return
  isGameEnded = true
  clearGameTimer()
  playGameEndSound()
  // 延迟弹出提示框，等音频播放一会儿
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

// ---- 切词逻辑 ----

/** 音量键按下时切词（与滑动共用防抖） */
function onVolumeKey() {
  const now = Date.now()
  if (now - lastSwipeAt.value < 300) return
  lastSwipeAt.value = now
  goNextWord()
}

/** 切换到下一个词条，并交替滑动方向 */
function goNextWord() {
  // 交替滑动方向，产生来回的视觉效果
  wordMoveDirection.value = wordMoveDirection.value === 1 ? -1 : 1
  const nextIndex = getNextIndex(currentIndex.value, words.value.length)
  // 如果只有一个词条（下一个还是同一个），手动重启动画
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
