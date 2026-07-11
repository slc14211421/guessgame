# 你比我猜 Android 应用技术开发文档

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品名称 | 你比我猜 |
| 客户端 | Android 手机端 |
| 开发框架 | uni-app |
| 推荐语言 | Vue 3 + TypeScript |
| 打包目标 | APK |
| 需求来源 | docs/development-requirements.md |
| 文档版本 | V1.0 |
| 编写日期 | 2026-07-10 |

## 2. 技术目标

1. 使用 uni-app 实现 Android 端可安装 APK。
2. 使用本地存储完成分类、词语、用户设置的持久化。
3. 将首页、词库维护、倒计时、猜词模式拆分为清晰页面。
4. 猜词模式支持横屏布局、跑马灯展示、滑动切词、游戏倒计时和提示音。
5. 提供可维护的模块结构，便于后续扩展得分、答对、跳过等能力。

## 3. 技术选型

| 模块 | 技术方案 | 说明 |
| --- | --- | --- |
| 应用框架 | uni-app | 负责跨端页面、生命周期、Android APK 打包。 |
| 前端框架 | Vue 3 | 推荐使用组合式 API 组织页面逻辑。 |
| 类型系统 | TypeScript | 约束分类、词语、设置等核心数据结构。 |
| 状态管理 | 页面状态 + 本地服务模块 | 首版状态简单，暂不强制引入 Pinia。 |
| 本地存储 | `uni.setStorageSync` / `uni.getStorageSync` | 保存分类、词语、设置。 |
| 路由 | uni-app `pages.json` | 管理页面路径、标题、横屏配置。 |
| 动画 | CSS animation / transform | 实现跑马灯文字移动。 |
| 打包 | HBuilderX / uni-app CLI | 打包 Android APK。 |

## 4. 总体架构

应用采用“页面 + 组件 + 服务 + 类型”的轻量分层。

```text
页面层 pages
  负责用户界面、页面生命周期、路由跳转、交互反馈

组件层 components
  负责可复用 UI，例如设置面板、颜色选择器、空状态

服务层 services
  负责本地存储、词库管理、设置管理、游戏状态计算

类型层 types
  负责核心数据结构定义

常量层 constants
  负责默认词库、存储 key、默认设置
```

### 4.1 数据流

```text
页面触发操作
  -> 调用 service 方法
  -> service 读取或写入 uni storage
  -> 返回最新数据
  -> 页面刷新视图
```

### 4.2 启动流程

1. App 启动。
2. 首页 `onShow` 调用 `services/storage.ts` 中的 `initLocalData()` 执行初始化检查。
3. 初始化完成后读取本地分类、词语、设置。
4. 如果词库不存在或格式异常，写入默认词库。
5. 首页展示分类列表和词语数量。

## 5. 推荐目录结构

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
      index/
        index.vue
      category/
        index.vue
      word/
        index.vue
      countdown/
        index.vue
      game/
        index.vue
    components/
      AppHeader/
        AppHeader.vue
      EmptyState/
        EmptyState.vue
      SettingsPanel/
        SettingsPanel.vue
      ColorPicker/
        ColorPicker.vue
    services/
      storage.ts
      category.ts
      word.ts
      settings.ts
      game.ts
    types/
      category.ts
      word.ts
      settings.ts
      game.ts
    constants/
      storageKeys.ts
      defaultData.ts
      theme.ts
    utils/
      id.ts
      validate.ts
    orientation.ts
    wakelock.ts
    styles/
      tokens.scss
      mixins.scss
      global.scss
```

## 6. 路由设计

### 6.1 页面路由

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/pages/index/index` | 展示分类、开始游戏、设置入口。 |
| 分类管理 | `/pages/category/index` | 新增、删除分类。 |
| 词语管理 | `/pages/word/index` | 管理指定分类下词语。 |
| 倒计时 | `/pages/countdown/index` | 5 秒倒计时。 |
| 猜词模式 | `/pages/game/index` | 横屏跑马灯展示词条。 |

### 6.2 `pages.json` 建议

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "你比我猜"
      }
    },
    {
      "path": "pages/category/index",
      "style": {
        "navigationBarTitleText": "分类管理"
      }
    },
    {
      "path": "pages/word/index",
      "style": {
        "navigationBarTitleText": "词语管理"
      }
    },
    {
      "path": "pages/countdown/index",
      "style": {
        "navigationBarTitleText": "准备开始"
      }
    },
    {
      "path": "pages/game/index",
      "style": {
        "navigationStyle": "custom"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "你比我猜",
    "navigationBarBackgroundColor": "#ffffff",
    "backgroundColor": "#ffffff"
  }
}
```

## 7. 数据模型

### 7.1 分类模型

```ts
export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
```

### 7.2 词语模型

```ts
export interface WordItem {
  id: string
  categoryId: string
  text: string
  createdAt: string
  updatedAt: string
}
```

### 7.3 设置模型

```ts
export interface UserSettings {
  backgroundColor: string
  wordColor: string
  wordOrder: 'sequential' | 'random'
  isWordScrollEnabled: boolean
}
```

### 7.4 游戏页面入参

```ts
export interface GameRouteQuery {
  categoryId: string
  durationSeconds: string
}
```

### 7.5 倒计时页面入参

```ts
export interface CountdownRouteQuery {
  categoryId: string
  durationSeconds: string
}
```

## 8. 本地存储设计

### 8.1 Storage Key

```ts
export const STORAGE_KEYS = {
  CATEGORIES: 'guessgame_categories',
  WORDS: 'guessgame_words',
  SETTINGS: 'guessgame_settings',
  STORAGE_VERSION: 'guessgame_storage_version'
} as const
```

### 8.2 默认设置

```ts
export const DEFAULT_SETTINGS = {
  backgroundColor: '#111111',
  wordColor: '#FFFFFF',
  wordOrder: 'sequential',
  isWordScrollEnabled: true
}
```

### 8.3 默认词库

```ts
const DEFAULT_CREATED_AT = '2026-07-10T00:00:00.000Z'

export const DEFAULT_CATEGORIES = [
  {
    id: 'category_chengyu',
    name: '成语',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_fruit',
    name: '水果',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_vegetable',
    name: '蔬菜',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_animal',
    name: '动物',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'category_person',
    name: '人物',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  }
]
```

默认词语建议按 `categoryId` 关联存储：

```ts
export const DEFAULT_WORDS = [
  {
    id: 'word_chengyu_001',
    categoryId: 'category_chengyu',
    text: '画蛇添足',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'word_fruit_001',
    categoryId: 'category_fruit',
    text: '苹果',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'word_vegetable_001',
    categoryId: 'category_vegetable',
    text: '黄瓜',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'word_animal_001',
    categoryId: 'category_animal',
    text: '老虎',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  },
  {
    id: 'word_person_001',
    categoryId: 'category_person',
    text: '孙悟空',
    createdAt: DEFAULT_CREATED_AT,
    updatedAt: DEFAULT_CREATED_AT
  }
]
```

默认数据必须与 `Category`、`WordItem` 类型保持一致。推荐在 `initLocalData()` 中统一补全时间字段，避免默认数据分散维护；上方示例使用固定初始化时间，便于开发和测试对比。

### 8.4 存储服务接口

```ts
export function getStorageValue<T>(key: string, fallback: T): T
export function setStorageValue<T>(key: string, value: T): void
export function removeStorageValue(key: string): void
export function initLocalData(): void
```

`initLocalData()` 归属于 `services/storage.ts`，负责初始化分类、词语、用户设置和 `STORAGE_VERSION`。

### 8.5 初始化策略

1. 首页 `onShow` 先调用 `initLocalData()`，再读取页面数据。
2. `initLocalData()` 检查分类、词语、设置和 `STORAGE_VERSION` 是否存在。
3. 若分类或词语不存在，写入默认分类和默认词语。
4. 若设置不存在，写入 `DEFAULT_SETTINGS`。
5. 若本地数据读取异常或格式异常，使用默认数据覆盖异常数据。
6. 设置独立初始化，避免词库异常影响主题配置。

## 9. 服务模块设计

### 9.1 分类服务 `services/category.ts`

| 方法 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `getCategories` | 无 | `Category[]` | 获取全部分类。 |
| `getCategoryById` | `id` | `Category \| undefined` | 获取单个分类。 |
| `createCategory` | `name` | `Category` | 新增分类。 |
| `deleteCategory` | `id` | `void` | 删除分类，并删除关联词语。 |
| `isCategoryNameDuplicated` | `name` | `boolean` | 判断分类名称是否重复。 |

实现要求：

1. 新增分类时自动生成 `id`、`createdAt`、`updatedAt`。
2. 分类名称需要 `trim()`。
3. 删除分类时必须同步删除关联词语。
4. 删除后立即写回本地存储。

### 9.2 词语服务 `services/word.ts`

| 方法 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `getWords` | 无 | `WordItem[]` | 获取全部词语。 |
| `getWordsByCategoryId` | `categoryId` | `WordItem[]` | 获取分类下词语。 |
| `createWord` | `categoryId, text` | `WordItem` | 新增词语。 |
| `deleteWord` | `id` | `void` | 删除词语。 |
| `deleteWordsByCategoryId` | `categoryId` | `void` | 删除分类下全部词语。 |
| `isWordDuplicated` | `categoryId, text` | `boolean` | 判断分类内词语是否重复。 |

实现要求：

1. 词语内容需要 `trim()`。
2. 同一分类下不允许重复词语。
3. 删除词语后刷新页面数据。

### 9.3 设置服务 `services/settings.ts`

| 方法 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `getSettings` | 无 | `UserSettings` | 获取用户设置。 |
| `saveSettings` | `settings` | `UserSettings` | 保存设置。 |
| `resetSettings` | 无 | `UserSettings` | 恢复默认设置。 |

实现要求：

1. 色值必须是合法 Hex 颜色，例如 `#111111`。
2. 出词方式只允许 `sequential` 或 `random`。
3. 词条滚动开关必须归一化为布尔值，旧设置缺少该字段时使用默认值 `true`。
4. 保存设置后立即写入本地存储。
5. 设置面板关闭后页面需要使用最新设置刷新样式。

### 9.4 游戏服务 `services/game.ts`

| 方法 | 参数 | 返回 | 说明 |
| --- | --- | --- | --- |
| `getGameWords` | `categoryId` | `WordItem[]` | 获取游戏词语列表。 |
| `getNextIndex` | `currentIndex, total` | `number` | 获取下一个词语索引。 |
| `canStartGame` | `categoryId` | `{ ok: boolean; message?: string }` | 判断是否可开始游戏。 |
| `parseGameDurationSeconds` | `value` | `number \| undefined` | 校验并解析游戏时长参数。 |
| `formatGameDuration` | `seconds` | `string` | 格式化首页时长选项，例如 `5分钟`。 |
| `formatGameTime` | `seconds` | `string` | 格式化猜词页剩余时间，例如 `01:05`。 |

实现要求：

1. 首版词语顺序使用分类内存储顺序。
2. 最后一个词语后循环回到第一个。
3. 若分类不存在或词语为空，禁止进入游戏页。
4. 游戏时长仅允许 `60`、`120`、`180`、`300`、`600` 秒。

## 10. 页面实现方案

### 10.1 首页 `/pages/index/index.vue`

#### 页面状态

```ts
const categories = ref<Category[]>([])
const wordCounts = ref<Record<string, number>>({})
const selectedCategoryId = ref('')
const selectedGameDurationSeconds = ref<number | undefined>()
const settings = ref<UserSettings>(DEFAULT_SETTINGS)
const showSettings = ref(false)
```

#### 生命周期

1. `onShow` 中先调用 `initLocalData()`，再刷新页面数据。
2. 从本地读取分类、词语、设置。
3. 计算每个分类的词语数量。
4. 首版首页不应用背景色和词条颜色设置，只负责打开设置面板和保存设置。
5. 首页使用原生导航栏标题，内容区不再重复展示“你比我猜”标题；首行保留分类管理入口和设置入口。

#### 关键方法

| 方法 | 说明 |
| --- | --- |
| `loadPageData` | 加载分类、词语数量、用户设置。 |
| `selectCategory` | 设置当前选中的分类。 |
| `selectGameDuration` | 单选本局猜词时间。 |
| `startGame` | 校验分类、词语数量和游戏时长，跳转倒计时页。 |
| `openSettings` | 打开设置面板。 |
| `goCategoryManage` | 跳转分类管理页。 |

#### 跳转逻辑

```ts
uni.navigateTo({
  url: `/pages/countdown/index?categoryId=${selectedCategoryId.value}&durationSeconds=${selectedGameDurationSeconds.value}`
})
```

### 10.2 设置面板 `components/SettingsPanel/SettingsPanel.vue`

#### Props

```ts
interface Props {
  visible: boolean
  settings: UserSettings
  showExitGame?: boolean
}
```

#### Emits

```ts
const emit = defineEmits<{
  close: []
  save: [settings: UserSettings]
  exitGame: []
}>()
```

#### 功能要求

1. 支持背景色选择。
2. 支持词条颜色选择。
3. 支持出词方式选择。
4. 支持词条滚动开关。
5. 支持保存并关闭。
6. 在猜词模式打开时，展示退出猜词模式入口。
7. 首版背景色和词条颜色仅作用于猜词模式；首页不应用主题样式。

### 10.3 分类管理页 `/pages/category/index.vue`

#### 页面状态

```ts
const categories = ref<Category[]>([])
const newCategoryName = ref('')
```

分类管理页使用原生导航栏标题，内容区不再重复展示“分类管理”标题，新增分类表单直接作为首个内容模块。

#### 关键方法

| 方法 | 说明 |
| --- | --- |
| `loadCategories` | 读取分类列表。 |
| `handleCreateCategory` | 校验并新增分类。 |
| `handleDeleteCategory` | 二次确认后删除分类和关联词语。 |
| `goWordManage` | 跳转指定分类的词语管理页。 |

#### 删除确认

```ts
uni.showModal({
  title: '删除分类',
  content: '删除后该分类下的词语也会被删除，是否继续？',
  success: (res) => {
    if (res.confirm) {
      deleteCategory(categoryId)
      loadCategories()
    }
  }
})
```

### 10.4 词语管理页 `/pages/word/index.vue`

#### 页面入参

```text
/pages/word/index?categoryId=category_chengyu
```

#### 页面状态

```ts
const categoryId = ref('')
const category = ref<Category | undefined>()
const words = ref<WordItem[]>([])
const newWordText = ref('')
```

#### 关键方法

| 方法 | 说明 |
| --- | --- |
| `loadWords` | 读取当前分类和词语列表。 |
| `handleCreateWord` | 校验并新增词语。 |
| `handleDeleteWord` | 删除指定词语。 |

#### 异常处理

1. `categoryId` 为空时返回上一页。
2. 分类不存在时提示“分类不存在”并返回分类管理页。
3. 词语为空时展示空状态。

### 10.5 倒计时页 `/pages/countdown/index.vue`

#### 页面状态

```ts
const categoryId = ref('')
const durationSeconds = ref(0)
const count = ref(5)
let timer: ReturnType<typeof setInterval> | null = null
```

#### 生命周期

1. `onLoad` 获取 `categoryId` 和 `durationSeconds`。
2. 校验 `categoryId`、词语数量和游戏时长。
3. Android 真机环境下调用 `lockLandscape()`，让倒计时页先进入横屏。
4. 播放完整游戏开始提醒语音，语音结束后启动 5 秒数字读秒。
5. `onUnload` 清理定时器；若用户返回首页则恢复竖屏，若跳转到猜词模式则保持横屏。

#### 倒计时逻辑

```ts
function startCountdown() {
  playGameReadySound(startReadCountdown)
}

function startReadCountdown() {
  count.value = 5
  playCountdownTickSound(count.value)
  timer = setInterval(() => {
    count.value -= 1
    if (count.value <= 0) {
      clearCountdown()
      isRedirectingToGame = true
      uni.redirectTo({
        url: `/pages/game/index?categoryId=${categoryId.value}&durationSeconds=${durationSeconds.value}`
      })
      return
    }
    playCountdownTickSound(count.value)
  }, 1000)
}
```

#### 清理要求

1. 页面销毁时必须清除 `timer`。
2. 用户返回时必须停止倒计时。

### 10.6 猜词模式页 `/pages/game/index.vue`

#### 页面状态

```ts
const categoryId = ref('')
const durationSeconds = ref(0)
const remainingSeconds = ref(0)
const words = ref<WordItem[]>([])
const currentIndex = ref(0)
const settings = ref<UserSettings>(DEFAULT_SETTINGS)
const showSettings = ref(false)
const touchStartX = ref(0)
const lastSwipeAt = ref(0)
let gameTimer: ReturnType<typeof setInterval> | null = null
```

#### 生命周期

1. `onLoad` 获取 `categoryId` 并加载词语。
2. `onLoad` 获取并校验 `durationSeconds`，初始化本局剩余时间。
3. `onShow` 读取最新设置并尝试进入横屏，同时启用屏幕常亮并监听手机横握方向自动切换正反横屏。
4. `onShow` 启动本局游戏倒计时。
5. `onUnload` 清理游戏计时器，释放屏幕常亮，并恢复竖屏或默认方向。

#### 当前词语

```ts
const currentWord = computed(() => {
  return words.value[currentIndex.value]?.text || ''
})
```

#### 游戏倒计时与音效

1. 猜词页顶部居中显示 `formatGameTime(remainingSeconds)`，不再显示“滑动换词”提示。
2. `remainingSeconds` 每秒减 1。
3. 剩余时间小于等于 10 秒且大于 0 时，每秒调用 `playFinalCountdownSound(remainingSeconds)`。
4. 剩余时间为 0 时，清理计时器，调用 `playGameEndSound()` 播放结束语音，随后弹出“游戏结束”提示。
5. 用户确认后返回首页，并恢复竖屏、系统导航栏和音量键行为。

```ts
function startGameTimer() {
  remainingSeconds.value = durationSeconds.value
  gameTimer = setInterval(() => {
    remainingSeconds.value = Math.max(remainingSeconds.value - 1, 0)
    if (remainingSeconds.value <= 0) {
      handleGameEnd()
      return
    }
    if (remainingSeconds.value <= 10) {
      playFinalCountdownSound(remainingSeconds.value)
    }
  }, 1000)
}
```

#### 音效工具

封装 `utils/sound.ts` 播放打包在 `src/static/audio/` 下的 MP3 语音素材。App-Plus 真机环境优先使用 `plus.audio.createPlayer()` 播放 `_www/static/audio/` 本地资源，失败时回退到 `uni.createInnerAudioContext()`；H5 环境使用 `/static/audio/`。音频素材由百炼 CosyVoice 合成，应用运行时不依赖网络。

| 方法 | 触发时机 |
| --- | --- |
| `unlockGameAudio` | 首页点击开始游戏时，尝试解锁移动端音频播放。 |
| `playGameReadySound(onComplete?)` | 倒计时页横屏后播放“游戏在5秒后开始，请将手机屏幕对着你的队友，加油哦”，播放结束时触发回调。 |
| `playCountdownTickSound(second)` | 5 秒准备倒计时读秒。 |
| `playFinalCountdownSound(second)` | 猜词模式剩余 10 秒至 1 秒播放数字读秒。 |
| `playGameEndSound` | 猜词时间结束时播放“本局游戏结束，再接再厉哦”。 |

音效播放失败不得影响游戏流程；若运行环境不支持本地音频播放 API，应静默降级。

#### 滑动切词

```ts
function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.changedTouches[0].clientX
}

function handleTouchEnd(event: TouchEvent) {
  const endX = event.changedTouches[0].clientX
  const diffX = touchStartX.value - endX
  const now = Date.now()

  if (Math.abs(diffX) < 50) return
  if (now - lastSwipeAt.value < 300) return

  lastSwipeAt.value = now
  currentIndex.value = getNextIndex(currentIndex.value, words.value.length)
}
```

#### 真机音量键切词

1. Android App 真机环境下，猜词模式支持监听音量上键和音量下键切换到下一个词语。
2. 音量键按下时复用滑动切词的 300ms 防抖逻辑，避免长按或连续按键跳过多个词语。
3. 进入猜词页时调用 `plus.key.setVolumeButtonEnabled(false)`，让音量键不再调节系统音量，避免系统继续显示音量调节条。
4. 离开猜词页时必须解绑音量键监听，并调用 `plus.key.setVolumeButtonEnabled(true)` 恢复系统音量键行为，避免影响首页和其它页面。

#### 屏幕常亮

猜词模式进入时调用 `utils/wakelock.ts` 中的 `keepGameScreenAwake()`，同时启用 `uni.setKeepScreenOn({ keepScreenOn: true })` 和 App-Plus 原生 `plus.device.setWakelock(true)`；退出猜词模式或页面卸载时调用 `releaseGameScreenAwake()` 释放常亮。云打包 APK 需在 Android manifest 中声明 `android.permission.WAKE_LOCK`，避免真机调试基座可用但云包自动息屏的差异。

#### 横屏处理

推荐封装 `utils/orientation.ts`：

```ts
export function lockLandscape() {
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('landscape-primary')
  // #endif
}

export function unlockPortrait() {
  // #ifdef APP-PLUS
  plus.screen.lockOrientation('portrait-primary')
  // #endif
}
```

说明：

1. `plus.screen.lockOrientation` 仅在 App 运行环境生效。
2. 猜词模式进入时先锁定 `landscape-primary`，再通过 `uni.startAccelerometer` / `uni.onAccelerometerChange` 获取手机横握方向，在 `landscape-primary` 与 `landscape-secondary` 间切换。
3. 页面退出时必须停止加速度计监听并恢复 `portrait-primary`，避免影响其它页面方向。
4. H5 调试环境无法完全模拟 Android 横屏锁定和方向传感器，以布局适配为准。
5. 猜词页面进入时调用 `plus.navigator.setFullscreen(true)` 和 `plus.navigator.hideSystemNavigation()` 隐藏状态栏与底部系统导航栏，让用户设置的背景色覆盖全屏；退出时调用 `plus.navigator.showSystemNavigation()` 和 `plus.navigator.setFullscreen(false)` 恢复系统栏。

#### 跑马灯实现

词条滚动开启时，猜词页启动横向位移动画，切词后交替使用从右向左、从左向右的移动方向；词条滚动关闭时，清理动画定时器，切词瞬间轻微左右入场，再将词条固定在 `translate3d(0, 0, 0)`。静态模式需取消跑马灯布局的最小宽度和左右位移空间，按词长收敛字号，保持词条在视口中静态居中展示。

```vue
<template>
  <view
    class="game-page"
    :style="{ backgroundColor: settings.backgroundColor }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <view class="word-track">
      <text
        :key="currentWord"
        class="word-text"
        :style="{ color: settings.wordColor }"
      >
        {{ currentWord }}
      </text>
    </view>
  </view>
</template>
```

```scss
.game-page {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.word-track {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.word-text {
  display: inline-block;
  white-space: nowrap;
  font-size: 96rpx;
  font-weight: 700;
  animation: marquee 8s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(100vw);
  }
  100% {
    transform: translateX(-100%);
  }
}
```

#### 退出猜词模式

1. 点击右上角退出入口。
2. 调用 `unlockPortrait()` 并恢复系统状态栏、导航栏。
3. 使用 `uni.reLaunch({ url: '/pages/index/index' })` 返回首页。

## 11. 表单校验规则

| 对象 | 字段 | 规则 |
| --- | --- | --- |
| 分类 | `name` | 必填，去除前后空格，不超过 12 个中文字符或 24 个英文字符。 |
| 分类 | `name` | 分类名称不允许重复。 |
| 词语 | `text` | 必填，去除前后空格，不超过 12 个中文字符或 24 个英文字符。 |
| 词语 | `text` | 同一分类下不允许重复。 |
| 设置 | `backgroundColor` | 必须为合法 Hex 色值。 |
| 设置 | `wordColor` | 必须为合法 Hex 色值。 |

长度限制按显示宽度计算：中文字符宽度按 2 计算，英文、数字、空格和常见符号宽度按 1 计算，最大显示宽度为 24。分类名称和词语内容共用该规则，用于满足“不超过 12 个中文字符或 24 个英文字符”的要求。

### 11.1 校验工具建议

```ts
export function isEmptyText(value: string): boolean {
  return value.trim().length === 0
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value)
}

export function getTextDisplayWidth(value: string): number {
  return Array.from(value.trim()).reduce((total, char) => {
    return total + (/[\u4e00-\u9fa5]/.test(char) ? 2 : 1)
  }, 0)
}

export function isTooLongText(value: string, maxDisplayWidth = 24): boolean {
  return getTextDisplayWidth(value) > maxDisplayWidth
}
```

## 12. UI 与交互实现要求

### 12.1 首页

1. 分类卡片需要展示分类名称和词语数量。
2. 被选中的分类需要有明显选中态。
3. 猜词时间使用单选按钮展示，选项为 1、2、3、5、10 分钟。
4. 开始游戏按钮在无选择分类或无选择猜词时间时置灰。
5. 分类管理入口需要明确可见。
6. 首版首页不应用用户设置中的背景色和词条颜色，避免与猜词模式主题配置混淆。
7. 首页和分类管理页内容区不得重复展示与原生导航栏相同的页面标题。

### 12.2 设置面板

1. 可使用底部弹层或居中弹窗。
2. 颜色选择首版可使用预设色块，降低实现复杂度。
3. 保存后使用 `uni.showToast` 提示“设置已保存”。

推荐预设色：

```ts
export const THEME_COLORS = [
  '#111111',
  '#FFFFFF',
  '#E53935',
  '#1E88E5',
  '#43A047',
  '#FDD835',
  '#8E24AA'
]
```

### 12.3 猜词模式

1. 页面必须隐藏默认导航栏。
2. 顶部居中展示剩余时间，字体加粗，不再显示“滑动换词”提示。
3. 退出入口固定在右上角。
4. 词条需要大字号、高对比。
5. 滑动区域应覆盖整个页面。
6. 词条滚动开启时，切词后重新触发跑马灯动画并左右交替方向；关闭时，切词后轻微左右入场并静态展示新词条。

## 13. 错误处理与反馈

| 场景 | 处理方式 |
| --- | --- |
| 未选择分类点击开始 | `uni.showToast({ title: '请选择词语分组', icon: 'none' })` |
| 分类无词语 | `uni.showToast({ title: '该分组暂无词语', icon: 'none' })` |
| 新增分类为空 | 提示“请输入分类名称”。 |
| 分类重复 | 提示“分类名称已存在”。 |
| 新增词语为空 | 提示“请输入词语”。 |
| 词语重复 | 提示“该词语已存在”。 |
| 分类不存在 | 提示后返回分类管理页。 |
| 本地存储异常 | 使用默认数据兜底，并提示“数据已恢复默认”。 |

## 14. Android 打包配置

### 14.1 `manifest.json`

建议配置项：

1. 应用名称：你比我猜。
2. AppID：使用 uni-app 生成的 AppID。
3. Android 包名：例如 `com.example.guessgame`，正式发布前替换为实际包名。
4. 版本号：首版建议 `1.0.0`。
5. 权限：首版不申请摄像头、麦克风、定位等敏感权限；为猜词模式屏幕常亮声明普通权限 `android.permission.WAKE_LOCK`。

### 14.2 屏幕方向

1. 应用首页、管理页和设置面板保持竖屏。
2. 倒计时页进入时通过页面生命周期调用 App-Plus API 锁定横屏，用户返回首页时恢复竖屏。
3. 倒计时页跳转猜词模式时保持横屏，由猜词模式继续接管横屏和自动正反横屏逻辑。
4. 退出猜词模式时恢复竖屏。
5. 若真机上出现方向恢复不稳定，可在首页 `onShow` 再次调用 `portrait-primary` 兜底。

### 14.3 调试建议

1. H5 调试用于快速验证页面和数据逻辑。
2. 真机 App 调试用于验证横屏、触摸滑动、APK 存储表现。
3. APK 打包前清理测试数据，验证首次启动默认词库。

## 15. 测试方案

### 15.1 单元测试建议

重点覆盖服务层纯逻辑：

| 模块 | 测试点 |
| --- | --- |
| `category.ts` | 新增分类、删除分类、名称重复判断。 |
| `word.ts` | 新增词语、删除词语、按分类查询、重复判断。 |
| `settings.ts` | 默认设置、保存设置、非法色值和缺失设置字段兜底。 |
| `game.ts` | 空词库校验、下一个索引、末尾循环、游戏时长解析和时间格式化。 |
| `validate.ts` | 空文本、长度、Hex 色值校验。 |

### 15.2 手工测试清单

| 编号 | 场景 | 预期 |
| --- | --- | --- |
| TC-01 | 首次启动应用 | 自动生成默认分类和默认词语。 |
| TC-02 | 首页未选择猜词时间开始 | 提示“请选择猜词时间”。 |
| TC-03 | 首页选择分类和猜词时间并开始 | 进入倒计时页，Android 真机环境下立即横屏。 |
| TC-04 | 准备语音播放 | 完整播放“游戏在5秒后开始，请将手机屏幕对着你的队友，加油哦”。 |
| TC-05 | 准备语音结束 | 开始 5 秒数字读秒，读秒结束后自动进入猜词模式。 |
| TC-06 | 猜词模式展示 | 横屏布局，顶部居中显示剩余时间，词条按滚动设置跑马灯或静态显示。 |
| TC-07 | 向左滑动 | 切换到下一个词语。 |
| TC-08 | 连续切词 | 词条左右交替移动。 |
| TC-09 | 最后一个词语继续滑动 | 回到第一个词语。 |
| TC-10 | 游戏剩余 10 秒 | 每秒播放倒计时提示音。 |
| TC-11 | 游戏时间结束 | 播放结束音效并提示返回首页。 |
| TC-12 | 修改背景色 | 猜词模式背景色立即变化并持久保存。 |
| TC-13 | 修改词条颜色 | 词条颜色立即变化并持久保存。 |
| TC-14 | 关闭词条滚动 | 猜词模式词条静态居中展示并持久保存。 |
| TC-15 | 新增分类 | 首页分类列表新增对应分组。 |
| TC-16 | 删除分类 | 分类及其词语被删除。 |
| TC-17 | 新增词语后重启 | 新增词语仍然存在。 |
| TC-18 | 分类无词语开始游戏 | 提示“该分组暂无词语”。 |

### 15.3 真机重点验证

1. APK 安装后首次启动是否正常。
2. 本地存储在杀进程后是否保留。
3. 猜词页横屏锁定是否生效。
4. 猜词页左右横握手机时是否自动切换正反横屏。
5. 退出猜词页是否恢复竖屏。
6. 不同屏幕尺寸下词条是否可读。
7. 快速连续滑动是否稳定。
8. HBuilderX 云打包 APK 中，猜词模式在系统自动息屏时间之后是否仍保持屏幕常亮。

## 16. 开发里程碑

| 阶段 | 开发内容 | 验收产出 |
| --- | --- | --- |
| M1 | 初始化 uni-app 项目、配置 TypeScript、创建页面路由。 | 项目可运行，页面可跳转。 |
| M2 | 实现数据模型、本地存储、默认词库初始化。 | 重启后数据可持久化。 |
| M3 | 实现首页、分类管理、词语管理。 | 可维护词库并看到词语数量变化。 |
| M4 | 实现倒计时和猜词模式。 | 可完成完整游戏流程。 |
| M5 | 实现设置面板、颜色持久化、横屏恢复。 | 设置生效并保留。 |
| M6 | 真机测试和 APK 打包。 | 输出可安装 APK。 |

## 17. 风险与处理

| 风险 | 影响 | 处理建议 |
| --- | --- | --- |
| H5 调试无法验证横屏锁定 | 开发阶段误判横屏效果 | 关键节点必须使用 Android 真机 App 调试。 |
| 本地存储数据格式被破坏 | 页面加载异常 | 读取时增加类型校验和默认数据兜底。 |
| 跑马灯在低端机卡顿 | 游戏体验下降 | 使用 CSS transform 动画，避免频繁 JS 更新位置。 |
| 长词条显示不完整 | 用户无法读完整词语 | 使用 `white-space: nowrap` 和循环滚动。 |
| 快速滑动重复触发 | 词条跳过过多 | 设置 300ms 防抖。 |
| 删除分类误操作 | 用户词库丢失 | 删除分类前二次确认。 |

## 18. 后续扩展预留

1. 游戏顺序支持随机模式。
2. 支持上一个词语。
3. 支持计时器、跳过、答对、得分统计。
4. 支持批量导入词库。
5. 支持编辑分类和词语。
6. 支持云端同步和分享词库。
