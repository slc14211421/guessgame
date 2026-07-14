/** 出词方式 */
export type WordOrder = 'sequential' | 'random'

/**
 * 用户自定义设置
 * 控制游戏界面的外观和行为
 */
export interface UserSettings {
  /** 游戏背景色（十六进制颜色值） */
  backgroundColor: string
  /** 词条文字颜色（十六进制颜色值） */
  wordColor: string
  /** 出词方式：顺序 或 随机 */
  wordOrder: WordOrder
  /** 是否开启词条滚动动画（关闭则静态展示） */
  isWordScrollEnabled: boolean
}
