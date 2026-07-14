# 你比我猜 Android 应用编码规范

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品名称 | 你比我猜 |
| 文档类型 | 编码规范 |
| 适用版本 | V1.0 |
| 技术栈 | uni-app + Vue 3 + TypeScript |
| 参考文档 | `docs/prd.md`、`docs/technical-development-document.md` |
| 编写日期 | 2026-07-10 |

## 2. 总体原则

本规范已通过根目录 `AGENTS.md` 接入项目工作流。所有后续代码、文档、SVG、配置和测试相关改动，均必须默认读取并遵守本规范。

1. 代码优先服务清晰可维护，不为首版功能引入不必要复杂度。
2. 页面只处理展示、交互和路由跳转，业务规则放到 `services/`。
3. 分类、词语、设置等核心数据必须使用 TypeScript 类型约束。
4. 本地存储必须通过统一封装访问，页面不得直接散落 `uni.getStorageSync` 和 `uni.setStorageSync`。
5. 猜词模式的可读性优先，布局和样式不得干扰词条展示。
6. SVG 原型和视觉资产需保持简洁，不使用 AI 常见紫蓝渐变、霓虹光效、玻璃拟态、漂浮光斑等套路。
7. App 全局必须使用同一套视觉样式规范，禁止在每个页面重复实现同类组件样式，避免后续维护成本失控。

## 3. 目录与职责

推荐目录结构如下：

```text
guessgame/
  package.json
  vite.config.ts
  src/
    App.vue
    main.ts
    manifest.json
    pages.json
    uni.scss
    pages/
    components/
    services/
    types/
    constants/
    utils/
    styles/
```

| 目录 | 职责 | 约束 |
| --- | --- | --- |
| `src/pages/` | 页面入口、页面状态、用户交互、路由跳转。 | 不直接实现复杂业务规则。 |
| `src/components/` | 可复用 UI 组件。 | 不直接读写本地存储。 |
| `src/services/` | 词库、设置、游戏、本地存储等业务逻辑。 | 对页面提供稳定函数接口。 |
| `src/types/` | TypeScript 类型定义。 | 不包含运行时代码。 |
| `src/constants/` | 默认词库、默认设置、存储 key、主题色。 | 不依赖页面和组件。 |
| `src/utils/` | 通用工具函数，例如 ID、校验、横屏处理。 | 保持纯函数优先。 |
| `src/styles/` | 全局样式变量、mixin、公共视觉规范。 | 不写页面专属业务样式。 |

## 4. 命名规范

### 4.1 文件命名

| 类型 | 规范 | 示例 |
| --- | --- | --- |
| 页面目录 | 小写单词 | `pages/game/index.vue` |
| 组件目录 | PascalCase | `components/SettingsPanel/SettingsPanel.vue` |
| 服务文件 | 小写单词 | `services/storage.ts` |
| 类型文件 | 小写单词 | `types/category.ts` |
| 常量文件 | camelCase | `constants/storageKeys.ts` |
| 工具文件 | 小写单词 | `utils/validate.ts` |
| SVG 原型 | kebab-case | `docs/svg/game-mode.svg` |

### 4.2 代码命名

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 变量 | camelCase | `selectedCategoryId` |
| 函数 | camelCase，动词开头 | `loadPageData`、`createWord` |
| 类型 / 接口 | PascalCase | `Category`、`WordItem` |
| 常量 | UPPER_SNAKE_CASE 或语义化 const | `STORAGE_KEYS`、`DEFAULT_SETTINGS` |
| 组件 | PascalCase | `SettingsPanel` |
| 事件处理函数 | `handle` 前缀 | `handleDeleteCategory` |
| 布尔变量 | `is` / `has` / `can` 前缀 | `isSelected`、`canStart` |

## 5. TypeScript 规范

### 5.1 类型定义

核心数据结构必须集中定义：

```ts
export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface WordItem {
  id: string
  categoryId: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  backgroundColor: string
  wordColor: string
  wordOrder: 'sequential' | 'random'
  isWordScrollEnabled: boolean
}
```

### 5.2 类型使用规则

1. 禁止在核心业务数据上使用 `any`。
2. 路由参数需要显式转换和校验，不直接信任 query。
3. service 函数必须声明参数和返回类型。
4. 组件 `props` 和 `emits` 必须声明类型。
5. 可空数据使用 `undefined` 或 `null` 时必须在使用前判断。

推荐：

```ts
export function getWordsByCategoryId(categoryId: string): WordItem[] {
  return getWords().filter((word) => word.categoryId === categoryId)
}
```

不推荐：

```ts
export function getWordsByCategoryId(categoryId: any) {
  return getWords().filter((word: any) => word.categoryId === categoryId)
}
```

## 6. Vue 与 uni-app 页面规范

### 6.1 单文件组件顺序

`.vue` 文件统一按以下顺序组织：

```vue
<template>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
</style>
```

### 6.2 页面职责

页面可以做：

1. 维护页面级响应式状态。
2. 调用 service 获取或更新数据。
3. 处理用户点击、滑动、输入。
4. 做路由跳转和提示反馈。

页面不应做：

1. 直接拼装复杂业务数据。
2. 直接散落本地存储 key。
3. 在页面内复制 service 逻辑。
4. 写无法复用的大段校验逻辑。

### 6.3 生命周期

1. 首页 `onShow` 中先调用 `initLocalData()`，再加载页面数据。
2. 倒计时页 `onUnload` 必须清理定时器。
3. 猜词模式页 `onShow` 尝试进入横屏、启用屏幕常亮并根据手机横握方向自动切换正反横屏，`onUnload` 恢复竖屏并释放屏幕常亮。
4. 页面返回后需要刷新列表数据的，使用 `onShow` 统一加载。

## 7. 组件规范

### 7.1 组件边界

组件只负责可复用 UI 和局部交互，不直接操作全局业务数据。

| 组件 | 职责 |
| --- | --- |
| `SettingsPanel` | 展示设置项，触发保存、关闭、退出事件。 |
| `SettingsIcon` | 统一展示设置入口图标。 |
| `ColorPicker` | 展示色块并返回选中颜色。 |
| `EmptyState` | 展示空状态文案和操作入口。 |
| `AppHeader` | 非原生导航标题场景下的页面标题和右侧操作入口。 |

### 7.2 Props 与 Emits

组件必须显式声明 `props` 和 `emits`：

```ts
interface Props {
  visible: boolean
  settings: UserSettings
  showExitGame?: boolean
}

const emit = defineEmits<{
  close: []
  save: [settings: UserSettings]
  exitGame: []
}>()
```

### 7.3 组件样式

1. 组件样式默认使用 `scoped`。
2. 组件内部 class 使用语义化命名。
3. 组件不得依赖页面外层 DOM 结构。
4. 可复用组件的外观样式必须收敛在组件自身或公共样式中，页面不得重复复制按钮、面板、列表项、弹窗等组件样式。

## 8. Service 层规范

### 8.1 基本要求

1. service 函数保持小而明确。
2. service 层负责本地存储读写、数据校验、数据增删查。
3. service 层不调用页面跳转，不展示 toast，不依赖组件。
4. service 函数失败时返回明确结果或抛出可识别错误，页面负责提示。

### 8.2 存储服务

`services/storage.ts` 必须提供：

```ts
export function getStorageValue<T>(key: string, fallback: T): T
export function setStorageValue<T>(key: string, value: T): void
export function removeStorageValue(key: string): void
export function initLocalData(): void
```

规则：

1. 所有 storage key 统一来自 `constants/storageKeys.ts`。
2. `initLocalData()` 负责初始化分类、词语、设置和 `STORAGE_VERSION`。
3. 本地数据格式异常时使用默认数据兜底。
4. 页面不得直接硬编码 storage key。

### 8.3 词库服务

分类和词语服务需要保证：

1. 新增数据时生成 `id`、`createdAt`、`updatedAt`。
2. 分类名称和词语内容保存前必须 `trim()`。
3. 删除分类时同步删除该分类下全部词语。
4. 同一分类下词语不允许重复。
5. 分类名称不允许重复。

### 8.4 游戏服务

游戏服务需要保证：

1. `canStartGame(categoryId)` 统一校验分类是否存在、词语是否为空。
2. `getNextIndex(currentIndex, total)` 在末尾循环回到 `0`。
3. 猜词时长只允许使用 1、2、3、5、10 分钟。
4. 首版词语顺序使用分类内存储顺序。

## 9. 校验与错误处理规范

### 9.1 文本校验

分类名称和词语内容统一使用显示宽度校验：

```ts
export function getTextDisplayWidth(value: string): number {
  return Array.from(value.trim()).reduce((total, char) => {
    return total + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1)
  }, 0)
}

export function isTooLongText(value: string, maxDisplayWidth = 24): boolean {
  return getTextDisplayWidth(value) > maxDisplayWidth
}
```

规则：

1. 中文字符宽度按 2 计算。
2. 英文、数字、空格和常见符号按 1 计算。
3. 最大显示宽度为 24。
4. 空字符串、全空格字符串均视为无效。

### 9.2 颜色校验

用户设置中的颜色必须是合法 Hex 色值：

```ts
export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}
```

猜词模式背景色和词条颜色必须避免明显不可读。保存设置时若颜色组合明显不可读，应由设置服务自动修正词条颜色；蓝底白字等可读组合允许保留，页面不得各自实现不同的兜底规则。

### 9.3 反馈文案

| 场景 | 文案 |
| --- | --- |
| 未选择分类点击开始 | 请选择词语分组 |
| 未选择猜词时间点击开始 | 请选择猜词时间 |
| 分类无词语 | 该分组暂无词语 |
| 新增分类为空 | 请输入分类名称 |
| 分类重复 | 分类名称已存在 |
| 新增词语为空 | 请输入词语 |
| 词语重复 | 该词语已存在 |
| 本地存储异常 | 数据已恢复默认 |

提示统一使用 `uni.showToast({ icon: 'none' })`，危险操作统一使用 `uni.showModal` 二次确认。

## 10. 样式与视觉规范

### 10.1 基础要求

1. 样式使用 `scss`。
2. 页面布局优先使用 flex。
3. 移动端尺寸优先使用 `rpx`。
4. 公共颜色、间距、字号、圆角、阴影、层级、动效参数必须沉淀到 `uni.scss`、`styles/` 或常量样式中。
5. 页面视觉保持简洁明了，操作路径清晰。
6. App 必须维护一套全局视觉样式系统，页面只能引用全局 token、公共 class、mixin 或可复用组件来实现统一视觉。
7. 页面级 `style scoped` 只允许编写当前页面的布局结构、局部间距微调和一次性状态样式。
8. 按钮、输入框、色块、卡片、列表、弹窗、顶部栏、空状态等通用 UI 不得在多个页面重复实现样式；出现第二处使用时必须抽成组件、公共 class 或 mixin。
9. 新增视觉样式前必须优先检查 `uni.scss`、`styles/` 和 `components/` 是否已有可复用实现。
10. 已由原生导航栏展示页面标题时，内容区不得重复展示同名页面标题。
11. 页面级面板外框、分区标题等重复结构优先复用 `.app-panel`、`.app-section-title` 等全局样式。

### 10.2 禁用视觉套路

禁止使用以下常见 AI 生成感视觉：

1. 大面积紫蓝渐变。
2. 霓虹发光。
3. 玻璃拟态。
4. 漂浮光斑、渐变圆球。
5. 过度梦幻或与聚会猜词无关的装饰背景。

### 10.3 猜词模式样式

1. 猜词模式必须隐藏默认导航栏。
2. 词条使用超大字号，短词尽量占满横屏主要视区。
3. 词条颜色和背景色使用用户设置。
4. 滑动区域覆盖整个页面。
5. 除顶部剩余时间和退出入口外，不放置干扰元素。
6. 词条滚动开启时，切词后需重新触发跑马灯动画，且滚动方向左右交替。
7. 词条滚动关闭时，切词后可轻微左右入场，最终当前词条应静态居中展示。

## 11. SVG 资产规范

### 11.1 文件要求

1. SVG 页面稿统一放在 `docs/svg/`。
2. 文件名使用 kebab-case，例如 `game-mode.svg`。
3. 每个 SVG 必须包含 `<title>` 和 `<desc>`。
4. SVG 必须使用文本和基础形状绘制，不嵌入外部图片。
5. SVG 中的中文文案需与 PRD 保持一致。

### 11.2 视觉要求

1. SVG 页面稿需要体现核心页面结构和关键状态。
2. 猜词模式 SVG 需体现超大词条、横屏布局、顶部剩余时间和退出入口。
3. 退出入口可使用图标表达，不强制显示“退出”文字。
4. SVG 视觉需保持中性、清晰、克制。

## 12. 路由与参数规范

### 12.1 页面路径

| 页面 | 路径 |
| --- | --- |
| 首页 | `/pages/index/index` |
| 分类管理 | `/pages/category/index` |
| 词语管理 | `/pages/word/index` |
| 倒计时 | `/pages/countdown/index` |
| 猜词模式 | `/pages/game/index` |

### 12.2 路由参数

1. 词语管理页使用 `categoryId` 参数。
2. 倒计时页使用 `categoryId` 和 `durationSeconds` 参数。
3. 猜词模式页使用 `categoryId` 和 `durationSeconds` 参数。
4. 页面接收参数后必须校验，为空或无效时给出提示并返回安全页面。

## 13. 测试规范

### 13.1 单元测试重点

| 模块 | 测试点 |
| --- | --- |
| `storage.ts` | 初始化默认数据、异常数据兜底。 |
| `category.ts` | 新增、删除、重复校验。 |
| `word.ts` | 新增、删除、按分类查询、重复校验。 |
| `settings.ts` | 默认设置、保存设置、非法色值兜底。 |
| `game.ts` | 开始游戏校验、猜词时长解析、剩余时间格式化、下一个索引、末尾循环。 |
| `validate.ts` | 空文本、显示宽度、Hex 色值。 |

### 13.2 手工测试要求

1. 首次启动自动生成默认词库。
2. 分类和词语新增后重启仍存在。
3. 删除分类时关联词语被删除。
4. 无词语分类不能开始游戏。
5. 选择猜词时间后，倒计时结束进入猜词模式。
6. 猜词模式横屏展示、顶部剩余时间、超大字号、跑马灯或静态展示正常。
7. 滑动切词末尾循环。
8. 设置保存后在猜词模式立即生效并持久化。
9. 猜词模式可根据手机横握方向自动切换正反横屏，退出后恢复竖屏。
10. Android 真机倒计时页进入后立即横屏，完整播放游戏开始提醒语音后再开始 5 秒数字读秒。
11. 最后 10 秒和游戏结束音效正常。
12. HBuilderX 云打包 APK 中猜词模式保持屏幕常亮，不因系统自动息屏中断游戏。

## 14. 注释与文档规范

1. 代码应通过清晰命名表达意图，避免无意义注释。
2. 复杂逻辑前可以写短注释说明原因。
3. 禁止注释与代码行为不一致。
4. 新增核心 service 或工具函数时，应补充简短函数说明或测试用例。
5. 修改 PRD、技术文档、编码规范时，需保持三者术语一致。

## 15. 提交前检查清单

提交前必须确认：

1. 代码无 TypeScript 类型错误。
2. 页面路径已写入 `pages.json`。
3. 页面无直接硬编码 storage key。
4. 分类、词语、设置数据可持久化。
5. 倒计时定时器在页面卸载时清理。
6. 猜词模式退出后恢复竖屏。
7. 猜词模式退出后释放屏幕常亮。
8. 文案与 PRD 保持一致。
9. SVG 资产命名、结构、视觉风格符合规范。
10. 手工测试覆盖核心游戏流程。
11. 页面样式已复用全局视觉规范，无重复实现同类组件样式。
