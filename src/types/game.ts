/** 游戏页路由参数 */
export interface GameRouteQuery {
  categoryId: string
}

/** 倒计时页路由参数 */
export interface CountdownRouteQuery {
  categoryId: string
}

/** 开始游戏的前置校验结果 */
export interface StartGameResult {
  /** 是否满足开始条件 */
  ok: boolean
  /** 不满足时的提示信息 */
  message?: string
}
