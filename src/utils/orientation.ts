type AccelerometerChangeResult = {
  x: number
  y: number
  z: number
}

type LandscapeOrientation = 'landscape-primary' | 'landscape-secondary'

let accelerometerHandler: ((result: AccelerometerChangeResult) => void) | undefined
let currentLandscapeOrientation: LandscapeOrientation | '' = ''

export function lockLandscape(): void {
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('landscape-primary')
  currentLandscapeOrientation = 'landscape-primary'
  // #endif
}

export function unlockPortrait(): void {
  // #ifdef APP-PLUS
  stopAutoLandscape()
  plus.screen.lockOrientation('portrait-primary')
  currentLandscapeOrientation = ''
  // #endif
}

export function startAutoLandscape(): void {
  // #ifdef APP-PLUS
  lockLandscape()
  if (accelerometerHandler) return

  accelerometerHandler = (result: AccelerometerChangeResult) => {
    const nextOrientation = getLandscapeOrientationByGravity(result.x, result.y)
    if (!nextOrientation || nextOrientation === currentLandscapeOrientation) return

    plus.screen.lockOrientation(nextOrientation)
    currentLandscapeOrientation = nextOrientation
  }

  uni.onAccelerometerChange(accelerometerHandler)
  uni.startAccelerometer({
    interval: 'normal'
  })
  // #endif
}

export function stopAutoLandscape(): void {
  // #ifdef APP-PLUS
  if (!accelerometerHandler) return

  uni.offAccelerometerChange(accelerometerHandler)
  uni.stopAccelerometer()
  accelerometerHandler = undefined
  // #endif
}

function getLandscapeOrientationByGravity(x: number, y: number): LandscapeOrientation | '' {
  if (Math.abs(x) < 0.45 || Math.abs(x) < Math.abs(y)) return ''
  return x > 0 ? 'landscape-primary' : 'landscape-secondary'
}
