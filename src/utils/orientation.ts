/**
 * 屏幕方向管理工具
 *
 * 在 App 端（APP-PLUS）通过重力感应自动切换横屏方向，
 * 确保无论用户如何握持设备，词条文字始终正向显示。
 * H5 和小程序端不涉及此逻辑。
 */

/** 加速度计变化回调参数 */
type AccelerometerChangeResult = {
  x: number
  y: number
  z: number
}

/** 横屏方向 */
type LandscapeOrientation = 'landscape-primary' | 'landscape-secondary'

/** 加速度计监听回调引用 */
let accelerometerHandler: ((result: AccelerometerChangeResult) => void) | undefined
/** 当前横屏方向 */
let currentLandscapeOrientation: LandscapeOrientation | '' = ''

/**
 * 锁定为横屏主方向（仅在 APP-PLUS 环境生效）
 */
export function lockLandscape(): void {
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('landscape-primary')
  currentLandscapeOrientation = 'landscape-primary'
  // #endif
}

/**
 * 解锁并恢复竖屏（仅在 APP-PLUS 环境生效）
 */
export function unlockPortrait(): void {
  // #ifdef APP-PLUS
  stopAutoLandscape()
  plus.screen.lockOrientation('portrait-primary')
  currentLandscapeOrientation = ''
  // #endif
}

/**
 * 启动重力感应自动横屏
 * 监听加速度计数据，根据重力方向自动切换横屏主/副方向
 */
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

/**
 * 停止重力感应自动横屏
 */
export function stopAutoLandscape(): void {
  // #ifdef APP-PLUS
  if (!accelerometerHandler) return

  uni.offAccelerometerChange(accelerometerHandler)
  uni.stopAccelerometer()
  accelerometerHandler = undefined
  // #endif
}

/**
 * 根据重力加速度分量判断横屏方向
 * @param x - X 轴加速度
 * @param y - Y 轴加速度
 * @returns 横屏方向，或空字符串表示不切换
 */
function getLandscapeOrientationByGravity(x: number, y: number): LandscapeOrientation | '' {
  // 仅当 X 轴倾斜超过阈值且为主要分量时才切换
  if (Math.abs(x) < 0.45 || Math.abs(x) < Math.abs(y)) return ''
  return x > 0 ? 'landscape-primary' : 'landscape-secondary'
}
