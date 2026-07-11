const AUDIO_BASE_PATH = 'static/audio'
const APP_AUDIO_BASE_PATH = `_www/${AUDIO_BASE_PATH}`
const H5_AUDIO_BASE_PATH = `/${AUDIO_BASE_PATH}`

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

const GAME_READY_AUDIO = 'game-ready.mp3'
const GAME_END_AUDIO = 'game-end.mp3'

let warmupAudio: UniApp.InnerAudioContext | undefined
let currentVoiceAudio: UniApp.InnerAudioContext | undefined
let currentNativeAudio: PlusAudioPlayer | undefined

type PlusAudioPlayer = {
  play: (success?: () => void, error?: () => void) => void
  stop: () => void
}

type PlusAudioManager = {
  createPlayer?: (src: string) => PlusAudioPlayer
}

type PlusIoManager = {
  convertLocalFileSystemURL?: (src: string) => string
}

type PlayAudioOptions = {
  onComplete?: () => void
}

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
    // Audio is optional; gameplay must continue if the runtime blocks playback.
  }
}

export function playGameReadySound(onComplete?: () => void): void {
  playVoiceAudio(GAME_READY_AUDIO, { onComplete })
}

export function playCountdownTickSound(second = 1): void {
  const filename = COUNTDOWN_AUDIO[second]
  if (!filename) return
  playVoiceAudio(filename)
}

export function playGameStartSound(): void {
  playGameReadySound()
}

export function playFinalCountdownSound(second = 1): void {
  playCountdownTickSound(second)
}

export function playGameEndSound(): void {
  playVoiceAudio(GAME_END_AUDIO)
}

export function stopGameAudio(): void {
  stopCurrentVoiceAudio()
  stopCurrentNativeAudio()
}

function playVoiceAudio(filename: string, options: PlayAudioOptions = {}): void {
  const onComplete = createOnceCallback(options.onComplete)
  if (playNativeAudio(filename, onComplete)) return

  const sources = resolveAudioSources(filename)
  playSourceCandidate(sources, 0, onComplete)
}

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

function playSourceCandidate(sources: string[], index: number, onComplete?: () => void): void {
  const src = sources[index]
  if (!src) {
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
      destroyAudio(audio)
      playSourceCandidate(sources, index + 1, onComplete)
    })
    audio.play()
  } catch {
    playSourceCandidate(sources, index + 1, onComplete)
  }
}

function resolveAudioSources(filename: string): string[] {
  return [
    `${APP_AUDIO_BASE_PATH}/${filename}`,
    `${H5_AUDIO_BASE_PATH}/${filename}`,
    `${AUDIO_BASE_PATH}/${filename}`
  ]
}

function resolveNativeAudioSource(filename: string): string {
  const src = `${APP_AUDIO_BASE_PATH}/${filename}`
  try {
    const ioManager = (plus as unknown as { io?: PlusIoManager }).io
    return ioManager?.convertLocalFileSystemURL?.(src) || src
  } catch {
    return src
  }
}

function createAudioContext(): UniApp.InnerAudioContext {
  const audio = uni.createInnerAudioContext()
  audio.autoplay = false
  return audio
}

function createOnceCallback(callback?: () => void): (() => void) | undefined {
  if (!callback) return undefined
  let isCalled = false
  return () => {
    if (isCalled) return
    isCalled = true
    callback()
  }
}

function stopCurrentVoiceAudio(): void {
  if (!currentVoiceAudio) return
  try {
    currentVoiceAudio.stop()
    currentVoiceAudio.destroy()
  } catch {
    // Ignore teardown failures from platform-specific audio runtimes.
  }
  currentVoiceAudio = undefined
}

function stopCurrentNativeAudio(): void {
  if (!currentNativeAudio) return
  try {
    currentNativeAudio.stop()
  } catch {
    // Ignore teardown failures from platform-specific audio runtimes.
  }
  currentNativeAudio = undefined
}

function destroyAudio(audio: UniApp.InnerAudioContext): void {
  if (currentVoiceAudio === audio) {
    currentVoiceAudio = undefined
  }
  try {
    audio.destroy()
  } catch {
    // Ignore teardown failures from platform-specific audio runtimes.
  }
}

function destroyWarmupAudio(): void {
  if (!warmupAudio) return
  try {
    warmupAudio.destroy()
  } catch {
    // Ignore teardown failures from platform-specific audio runtimes.
  }
  warmupAudio = undefined
}
