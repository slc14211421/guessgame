export interface GameRouteQuery {
  categoryId: string
}

export interface CountdownRouteQuery {
  categoryId: string
}

export interface StartGameResult {
  ok: boolean
  message?: string
}
