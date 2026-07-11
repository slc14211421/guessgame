# 你比我猜

`你比我猜` 是一款面向 Android 手机端的离线猜词聚会游戏。用户选择词语分组和猜词时间后进入 5 秒倒计时，随后进入横屏猜词模式；游戏过程中以大字号展示当前词条，支持滑动或音量键切换词语，也支持按偏好配置背景色、词条颜色、出词方式和词条滚动开关。

## 项目状态

当前 V1.0 基本功能已完成，并已完成基础功能测试。项目可继续进入最终 APK 打包、安装分发和更多机型兼容性验证阶段。

已覆盖的核心验收项：

- 首页分组选择、开始游戏、倒计时、进入猜词模式。
- 开始游戏前单选 1、2、3、5、10 分钟猜词时间。
- 准备倒计时读秒音效、游戏开始音效、最后 10 秒提示音和游戏结束音效。
- 分类新增、删除，以及分类下词语新增、删除。
- 分类、词语、用户设置本地持久化。
- 猜词模式横屏展示，并根据手机横握方向自动切换正反横屏。
- 猜词模式顶部居中加粗展示剩余时间。
- 猜词模式背景色满屏展示，隐藏底部系统导航栏白边。
- 词条滚动开启时跑马灯展示，关闭时静态居中展示。
- 切词时词条左右交替移动。
- 滑动切词和音量键切词。
- 音量键切词时不显示系统音量调节条。
- 退出猜词模式后恢复竖屏和系统导航栏。
- 支持通用自拍杆蓝牙遥控器切词。

## 核心功能

### 游戏流程

1. 首页选择一个词语分组。
2. 单选猜词时间：1 分钟、2 分钟、3 分钟、5 分钟或 10 分钟。
3. 点击开始游戏。
4. 进入 5 秒倒计时，并播放读秒提示音。
5. 倒计时结束后播放游戏开始音效，并自动进入横屏猜词模式。
6. 在猜词模式中滑动或按音量键切换下一个词语。
7. 游戏剩余 10 秒开始播放倒计时提示音。
8. 游戏结束时播放结束音效，并提示返回首页。

### 词库管理

- 首次启动自动初始化默认分类和默认词语。
- 默认分类包括：成语、水果、蔬菜、动物、人物。
- 支持新增、删除分类。
- 支持进入分类后新增、删除词语。
- 删除分类时同步删除该分类下全部词语。
- 分类名称和词语内容按显示宽度校验：中文按 2，英文、数字、空格和常见符号按 1，最大宽度 24。
- 同一分类下词语不允许重复。

### 设置能力

- 支持设置猜词模式背景色。
- 支持设置猜词模式词条颜色。
- 支持顺序出词和随机出词。
- 支持开启或关闭词条滚动。
- 设置保存后立即生效，并在下次打开应用时继续保留。
- 首页不应用猜词模式的背景色和词条颜色设置。

### 猜词模式

- 横屏全屏展示，隐藏默认导航栏和底部系统导航栏。
- 顶部居中加粗展示本局剩余时间。
- 背景色使用用户设置并铺满屏幕。
- 词条使用超大字号、高对比展示。
- 开启词条滚动时，词条以跑马灯形式移动。
- 关闭词条滚动时，词条静态居中展示。
- 连续切词时，词条左右交替入场或滚动。
- 支持滑动切词，末尾继续切词会循环回到第一个词语。
- Android 真机支持音量上键和音量下键切词。
- 支持游戏时间结束提示。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 应用框架 | uni-app |
| 前端框架 | Vue 3 |
| 开发语言 | TypeScript |
| 样式 | SCSS |
| 本地存储 | uni storage，同步封装在 `services/storage.ts` |
| 单元测试 | Vitest |
| 构建目标 | H5、App、Android APK |

## 目录结构

```text
guessgame/
  docs/                    项目文档和 SVG 页面稿
  src/
    App.vue                应用入口组件
    main.ts                Vue/uni-app 启动入口
    manifest.json          App 配置
    pages.json             页面路由配置
    uni.scss               全局 SCSS 入口
    pages/                 页面入口
      index/               首页
      category/            分类管理页
      word/                词语管理页
      countdown/           倒计时页
      game/                猜词模式页
    components/            可复用组件
      AppHeader/
      ColorPicker/
      EmptyState/
      SettingsIcon/
      SettingsPanel/
    services/              业务服务和本地存储封装
    types/                 TypeScript 类型定义
    constants/             默认数据、存储 key、主题常量
    utils/                 ID、校验、横屏、音效等工具
    styles/                全局视觉 token、mixin、公共样式
  tests/                   单元测试
  package.json
  vite.config.ts
  vitest.config.ts
  tsconfig.json
```

## 数据模型

### Category

```ts
export interface Category {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
```

### WordItem

```ts
export interface WordItem {
  id: string
  categoryId: string
  text: string
  createdAt: string
  updatedAt: string
}
```

### UserSettings

```ts
export interface UserSettings {
  backgroundColor: string
  wordColor: string
  wordOrder: 'sequential' | 'random'
  isWordScrollEnabled: boolean
}
```

## 本地开发

安装依赖：

```bash
npm install
```

启动 H5 调试：

```bash
npm run dev:h5
```

启动 App 调试构建：

```bash
npm run dev:app
```

构建 H5：

```bash
npm run build:h5
```

构建 App 产物：

```bash
npm run build:app
```

运行单元测试：

```bash
npm test
```

运行 TypeScript 类型检查：

```bash
npm run typecheck
```

## Android 打包

推荐流程：

1. 执行 `npm run build:app`。
2. 打开 HBuilderX。
3. 导入构建产物目录 `dist/build/app`。
4. 使用 Android 真机运行，重点验证横屏、系统栏、音量键、触摸滑动和本地存储。
5. 真机验收通过后输出 APK。

注意事项：

- 真机能力依赖 App-Plus 环境，H5 无法完整模拟横屏锁定、系统导航栏隐藏和音量键监听。
- 音量键切词使用 `plus.key.setVolumeButtonEnabled(false)`，需要 HBuilderX 3.3.0 或更高版本支持。
- 猜词模式使用 `plus.navigator.setFullscreen(true)` 和 `plus.navigator.hideSystemNavigation()` 隐藏系统栏，退出时恢复。
- 应用首版不申请摄像头、麦克风、定位、通讯录等敏感权限。

## 测试

自动化测试命令：

```bash
npm run typecheck
npm test
```

当前单元测试覆盖：

- 文本显示宽度校验。
- 空文本和 Hex 色值校验。
- 分类新增、删除和重复判断。
- 词语新增、删除和分类查询。
- 设置保存、默认值和非法值兜底。
- 游戏开始校验、末尾循环切词、游戏时长解析和时间格式化。

真机重点验证：

- APK 安装后首次启动正常。
- 首次启动自动生成默认分类和默认词语。
- 分类、词语、设置在杀进程和重启后仍保留。
- 倒计时结束后自动进入猜词模式。
- 准备倒计时、游戏开始、最后 10 秒和游戏结束音效正常。
- 猜词模式横屏展示，并可根据横握方向自动调整。
- 猜词模式顶部剩余时间显示正常。
- 猜词模式背景色满屏，无底部白边。
- 词条滚动和静态居中显示正常。
- 滑动切词、音量键切词正常。
- 音量键切词时不显示系统音量调节条。
- 退出猜词模式后恢复竖屏和系统导航栏。

## 文档索引

| 文档 | 说明 |
| --- | --- |
| `docs/req.txt` | 原始需求说明。 |
| `docs/development-requirements.md` | 开发需求文档。 |
| `docs/prd.md` | 产品需求文档。 |
| `docs/technical-development-document.md` | 技术开发文档。 |
| `docs/coding-standards.md` | 编码规范。 |
| `docs/android-packaging-guide.md` | Android APK 打包指南。 |
| `docs/development-progress.md` | 开发进度跟踪。 |
| `docs/svg/` | 页面 SVG 原型稿。 |
| `AGENTS.md` | 仓库协作和实现约束。 |

## 开发约束

本项目必须遵守 `AGENTS.md` 和 `docs/coding-standards.md` 中的规则。关键约束如下：

- 使用 uni-app + Vue 3 + TypeScript。
- 页面只负责展示、交互和路由跳转。
- 业务规则放在 `src/services/`。
- 页面和组件不得直接访问 `uni.getStorageSync` 或 `uni.setStorageSync`。
- 存储 key 只能来自 `src/constants/storageKeys.ts`。
- 核心数据必须使用 `Category`、`WordItem`、`UserSettings` 类型。
- 猜词模式优先保证远距离可读性。
- App 全局使用同一套视觉样式规范。
- 页面视觉不得使用大面积紫蓝渐变、霓虹光效、玻璃拟态、漂浮光斑等常见 AI 生成感套路。

## 后续规划

V1.0 已完成基础玩法和真机关键能力。后续版本可考虑：

- 支持上一个词语。
- 支持答对、跳过和得分统计。
- 支持编辑分类和词语名称。
- 支持批量导入、导出词库。
- 支持分享词库或云端同步。
- 支持更多默认词库内容。
