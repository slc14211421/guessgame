type PlusDeviceManager = {
  setWakelock?: (isLocked: boolean) => void
}

export function keepGameScreenAwake() {
  uni.setKeepScreenOn({ keepScreenOn: true })
  setNativeWakeLock(true)
}

export function releaseGameScreenAwake() {
  uni.setKeepScreenOn({ keepScreenOn: false })
  setNativeWakeLock(false)
}

function setNativeWakeLock(isLocked: boolean) {
  if (typeof plus === 'undefined') return
  try {
    const device = (plus as unknown as { device?: PlusDeviceManager }).device
    device?.setWakelock?.(isLocked)
  } catch {
    // Some debug runtimes may not expose this App-Plus API.
  }
}
