/**
 * 音频播放工具
 *
 * 支持多平台音频播放策略：
 * - App 端优先使用原生音频播放器（PlusAudioPlayer）
 * - 降级方案使用 uni.createInnerAudioContext（H5 / 小程序）
 * - 自动尝试多个音频路径以兼容不同平台的静态资源路径
 * - iOS 静音模式下通过预热音频（volume=0 的静默播放）解锁音频
 */

/** 音频资源的基础路径 */
const AUDIO_BASE_PATH = 'static/audio'
/** App 端（plus）的音频路径前缀 */
const APP_AUDIO_BASE_PATH = `_www/${AUDIO_BASE_PATH}`
/** H5 端的音频路径前缀 */
const H5_AUDIO_BASE_PATH = `/${AUDIO_BASE_PATH}`

/** 倒计时音效文件映射（秒数 → 文件名） */
const COUNTDOWN_AUDIO: Record<number, string> = {
  1: 'countdown-1.mp3',
  2: 'countdown-2.mp3',
  3: 'countdown-3.mp3',
  4: 'countdown-4.mp3',
  5: 'countdown-5.mp3',
  6: 'countdown-6.mp3',
  7: 'countdown-7.mp3',
  8: 'countdown-8.mp3',
  9: 'countdown-9.mp3',
  10: 'countdown-10.mp3'
}

/** 准备开始 / 游戏结束音效文件名 */
const GAME_READY_AUDIO = 'game-ready.mp3'
const GAME_END_AUDIO = 'game-end.mp3'

/** 用于解锁 iOS 静默音频的预热实例 */
let warmupAudio: UniApp.InnerAudioContext | undefined
/** 当前正在播放的 Web 音频上下文（用于停止和清理） */
let currentVoiceAudio: UniApp.InnerAudioContext | undefined
/** 当前正在播放的原生音频播放器（App 端） */
let currentNativeAudio: PlusAudioPlayer | undefined

/** App 端原生音频播放器接口 */
type PlusAudioPlayer = {
  play: (success?: () => void, error?: () => void) => void
  stop: () => void
}

/** App 端音频管理器 */
type PlusAudioManager = {
  createPlayer?: (src: string) => PlusAudioPlayer
}

/** App 端 IO 管理器（用于路径转换） */
type PlusIoManager = {
  convertLocalFileSystemURL?: (src: string) => string
}

/** 播放音频的可选参数 */
type PlayAudioOptions = {
  onComplete?: () => void
}

/**
 * 解锁游戏音频（iOS 静音模式兼容）
 * 通过播放一段静默音频来"激活"音频会话，
 * 确保后续游戏音效可以正常播放
 */
export function unlockGameAudio(): void {
  if (warmupAudio) return
  try {
    warmupAudio = createAudioContext()
    warmupAudio.src = resolveAudioSources(COUNTDOWN_AUDIO[1])[0]
    warmupAudio.volume = 0
    warmupAudio.obeyMuteSwitch = false
    warmupAudio.onError(() => destroyWarmupAudio())
    warmupAudio.onEnded(() => destroyWarmupAudio())
    warmupAudio.play()
    setTimeout(() => {
      destroyWarmupAudio()
    }, 160)
  } catch {
    // 音频为可选功能；播放失败不影响游戏进行
  }
}

/** 播放"准备开始"音效 */
export function playGameReadySound(onComplete?: () => void): void {
  playVoiceAudio(GAME_READY_AUDIO, { onComplete })
}

/** 播放倒计时滴答音效 */
export function playCountdownTickSound(second = 1): void {
  const filename = COUNTDOWN_AUDIO[second]
  if (!filename) return
  playVoiceAudio(filename)
}

/** 播放游戏开始音效 */
export function playGameStartSound(): void {
  playGameReadySound()
}

/** 播放倒计时最后 10 秒提示音 */
export function playFinalCountdownSound(second = 1): void {
  playCountdownTickSound(second)
}

/** 播放游戏结束音效 */
export function playGameEndSound(): void {
  playVoiceAudio(GAME_END_AUDIO)
}

/** 停止所有正在播放的音频 */
export function stopGameAudio(): void {
  stopCurrentVoiceAudio()
  stopCurrentNativeAudio()
}

/**
 * 播放音频文件（内部入口）
 * 优先尝试原生播放，降级到 Web Audio 多路径尝试
 */
function playVoiceAudio(filename: string, options: PlayAudioOptions = {}): void {
  const onComplete = createOnceCallback(options.onComplete)
  // 优先使用原生音频（App 端）
  if (playNativeAudio(filename, onComplete)) return

  // 降级：逐个尝试不同平台的音频路径
  const sources = resolveAudioSources(filename)
  playSourceCandidate(sources, 0, onComplete)
}

/**
 * 使用 App 原生音频播放器播放
 * @returns 是否成功启动原生播放
 */
function playNativeAudio(filename: string, onComplete?: () => void): boolean {
  if (typeof plus === 'undefined') return false

  try {
    const audioManager = (plus as unknown as { audio?: PlusAudioManager }).audio
    const createPlayer = audioManager?.createPlayer
    if (!createPlayer) return false

    stopCurrentVoiceAudio()
    stopCurrentNativeAudio()
    const player = createPlayer(resolveNativeAudioSource(filename))
    currentNativeAudio = player
    player.play(
      () => {
        if (currentNativeAudio === player) {
          currentNativeAudio = undefined
        }
        onComplete?.()
      },
      () => {
        // 原生播放失败，降级到 Web Audio
        if (currentNativeAudio === player) {
          currentNativeAudio = undefined
          playSourceCandidate(resolveAudioSources(filename), 0, onComplete)
        }
      }
    )
    return true
  } catch {
    stopCurrentNativeAudio()
    return false
  }
}

/**
 * 逐个尝试音频路径候选列表，直到某个路径播放成功
 */
function playSourceCandidate(sources: string[], index: number, onComplete?: () => void): void {
  const src = sources[index]
  if (!src) {
    // 所有路径都尝试完毕
    onComplete?.()
    return
  }

  try {
    stopCurrentVoiceAudio()
    const audio = createAudioContext()
    currentVoiceAudio = audio
    audio.src = src
    audio.volume = 1
    audio.obeyMuteSwitch = false
    audio.onEnded(() => {
      destroyAudio(audio)
      onComplete?.()
    })
    audio.onError(() => {
      // 当前路径失败，尝试下一个
      destroyAudio(audio)
      playSourceCandidate(sources, index + 1, onComplete)
    })
    audio.play()
  } catch {
    playSourceCandidate(sources, index + 1, onComplete)
  }
}

/**
 * 按优先级返回音频文件的候选路径列表
 * App 路径 → H5 路径 → 原始相对路径
 */
function resolveAudioSources(filename: string): string[] {
  return [
    `${APP_AUDIO_BASE_PATH}/${filename}`,
    `${H5_AUDIO_BASE_PATH}/${filename}`,
    `${AUDIO_BASE_PATH}/${filename}`
  ]
}

/**
 * 获取原生音频文件的本地绝对路径（App 端需要路径转换）
 */
function resolveNativeAudioSource(filename: string): string {
  const src = `${APP_AUDIO_BASE_PATH}/${filename}`
  try {
    const ioManager = (plus as unknown as { io?: PlusIoManager }).io
    return ioManager?.convertLocalFileSystemURL?.(src) || src
  } catch {
    return src
  }
}

/** 创建一个未自动播放的音频上下文实例 */
function createAudioContext(): UniApp.InnerAudioContext {
  const audio = uni.createInnerAudioContext()
  audio.autoplay = false
  return audio
}

/**
 * 包装回调函数，确保只被调用一次（防止重复触发）
 */
function createOnceCallback(callback?: () => void): (() => void) | undefined {
  if (!callback) return undefined
  let isCalled = false
  return () => {
    if (isCalled) return
    isCalled = true
    callback()
  }
}

/** 停止并销毁当前 Web 音频实例 */
function stopCurrentVoiceAudio(): void {
  if (!currentVoiceAudio) return
  try {
    currentVoiceAudio.stop()
    currentVoiceAudio.destroy()
  } catch {
    // 忽略平台差异导致的销毁异常
  }
  currentVoiceAudio = undefined
}

/** 停止当前原生音频播放器 */
function stopCurrentNativeAudio(): void {
  if (!currentNativeAudio) return
  try {
    currentNativeAudio.stop()
  } catch {
    // 忽略平台差异导致的停止异常
  }
  currentNativeAudio = undefined
}

/** 销毁 Web 音频实例 */
function destroyAudio(audio: UniApp.InnerAudioContext): void {
  if (currentVoiceAudio === audio) {
    currentVoiceAudio = undefined
  }
  try {
    audio.destroy()
  } catch {
    // 忽略平台差异导致的销毁异常
  }
}

/** 销毁预热音频实例 */
function destroyWarmupAudio(): void {
  if (!warmupAudio) return
  try {
    warmupAudio.destroy()
  } catch {
    // 忽略平台差异导致的销毁异常
  }
  warmupAudio = undefined
}
