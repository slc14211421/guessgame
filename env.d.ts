/// <reference types="@dcloudio/types" />

// 声明 .vue 单文件组件模块，使 TypeScript 能正确推断组件类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

// 扩展 plus 全局对象的类型声明（uni-app App 端原生能力）
declare const plus: {
  screen: {
    lockOrientation: (orientation: string) => void
  }
}
