/**
 * 应用入口文件
 * 创建并导出 uni-app SSR 应用实例
 */
import { createSSRApp } from 'vue'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
