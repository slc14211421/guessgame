/**
 * 屏幕常亮（Wakelock）工具
 * 游戏进行中防止屏幕自动关闭
 */

/** App 端设备管理器接口 */
type PlusDeviceManager = {
  setWakelock?: (isLocked: boolean) => void
}

/**
 * 保持屏幕常亮
 * 同时通过 uni API 和原生 plus API 双重锁定
 */
export function keepGameScreenAwake() {
  uni.setKeepScreenOn({ keepScreenOn: true })
  setNativeWakeLock(true)
}

/**
 * 释放屏幕常亮，恢复系统默认熄屏策略
 */
export function releaseGameScreenAwake() {
  uni.setKeepScreenOn({ keepScreenOn: false })
  setNativeWakeLock(false)
}

/** 调用 App 原生 WakeLock API */
function setNativeWakeLock(isLocked: boolean) {
  if (typeof plus === 'undefined') return
  try {
    const device = (plus as unknown as { device?: PlusDeviceManager }).device
    device?.setWakelock?.(isLocked)
  } catch {
    // 某些调试运行时可能不暴露此 API
  }
}
