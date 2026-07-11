# 你比我猜 V1.0 开发进度跟踪

## 1. 文档信息

| 项目 | 内容 |
| --- | --- |
| 产品名称 | 你比我猜 |
| 文档类型 | 开发进度跟踪文档 |
| 目标版本 | V1.0 |
| 技术栈 | uni-app + Vue 3 + TypeScript |
| 当前阶段 | 功能开发完成，进入新增计时音效回归与 APK 输出前检查 |
| 最近更新 | 2026-07-11 |
| 关联文档 | `docs/prd.md`、`docs/technical-development-document.md`、`docs/coding-standards.md` |

## 2. 当前总览

当前项目已完成 V1.0 核心功能落地，源码统一放在 `src/` 目录下，已具备 H5 构建和 App 构建产物生成能力。

| 维度 | 状态 | 说明 |
| --- | --- | --- |
| 产品文档 | 已完成 | PRD、开发需求文档、技术开发文档已建立。 |
| SVG 原型 | 已完成 | 首页、设置、分类管理、词语管理、倒计时、猜词模式页面稿已放入 `docs/svg/`。 |
| 工程初始化 | 已完成 | 已建立 uni-app + Vue 3 + TypeScript 工程结构。 |
| 全局视觉规范 | 已完成 | 已建立 `src/uni.scss`、`src/styles/tokens.scss`、`src/styles/mixins.scss`、`src/styles/global.scss`。 |
| 数据与服务层 | 已完成 | 分类、词语、设置、游戏、本地存储和音效工具已实现。 |
| 页面与组件 | 已完成 | 5 个核心页面和 4 个公共组件已实现。 |
| 自动化验证 | 已通过 | 单元测试、类型检查和 App 构建已通过；H5 构建可按需复核。 |
| 真机验证 | 部分通过 | 基本功能已通过，新增猜词时长、音效和游戏结束流程需回归。 |
| APK 输出 | 待执行 | `npm run build:app` 已重新通过，需通过 HBuilderX 完成 APK 打包。 |

## 3. 里程碑进度

| 里程碑 | 目标 | 状态 | 当前说明 |
| --- | --- | --- | --- |
| M1 | 产品与技术文档确认 | 已完成 | PRD、技术开发文档、编码规范、SVG 页面稿已整理。 |
| M2 | 项目初始化 | 已完成 | `src/` 源码根、路由、manifest、构建脚本已建立。 |
| M3 | 词库管理完成 | 已完成 | 分类和词语新增、删除、重复校验、持久化已实现。 |
| M4 | 核心游戏流程完成 | 已完成 | 首页选择分组和猜词时长、5 秒倒计时、猜词模式、顶部剩余时间、滑动和音量键切词已实现。 |
| M5 | 设置、横屏与音效完成 | 已完成 | 设置面板、颜色持久化、词条滚动开关、横屏锁定与恢复、准备和结束音效已实现。 |
| M6 | 自动化验证 | 已完成 | `npm test`、`npm run typecheck`、`npm run build:app` 已通过。 |
| M7 | 真机验收与 APK 输出 | 待执行 | 需要 Android 真机和 HBuilderX 打包环境完成新增计时音效回归与最终验收。 |

## 4. 已完成开发内容

### 4.1 工程与依赖

1. 已建立 `package.json`、`vite.config.ts`、`tsconfig.json`、`vitest.config.ts`。
2. 已锁定 DCloud、Vue、Vite、Babel runtime、core-js-pure 等关键兼容版本，避免依赖漂移导致构建失败。
3. 已新增 `.gitignore`，忽略 `node_modules/`、`dist/`、`unpackage/` 等产物目录。
4. 已将源码目录调整为 uni-app CLI 期望的 `src/` 结构。

### 4.2 全局视觉系统

1. `src/uni.scss` 仅保留可被页面注入的 SCSS token 和 mixin 引用。
2. `src/styles/tokens.scss` 统一维护颜色、间距、字号、圆角、阴影。
3. `src/styles/mixins.scss` 维护可复用 mixin。
4. `src/styles/global.scss` 维护全局公共 UI class，例如按钮、列表、输入框、图标按钮、卡片、徽标。
5. 页面只写页面布局和局部差异样式，未在每个页面重复实现通用组件样式。

### 4.3 类型、常量与工具

1. 已定义 `Category`、`WordItem`、`UserSettings`、游戏路由参数类型。
2. 已定义 `STORAGE_KEYS`、`STORAGE_VERSION`、`DEFAULT_SETTINGS`、`THEME_COLORS`。
3. 默认分类和默认词语已包含 `createdAt`、`updatedAt` 字段。
4. 已实现 `createId()`、显示宽度校验、空文本校验、Hex 色值校验。
5. 已实现 App-Plus 横屏锁定与竖屏恢复工具。

### 4.4 服务层

1. `src/services/storage.ts` 统一封装本地存储访问和 `initLocalData()`。
2. `src/services/category.ts` 实现分类查询、新增、删除、重复校验。
3. `src/services/word.ts` 实现词语查询、新增、删除、按分类删除、重复校验。
4. `src/services/settings.ts` 实现设置读取、保存、重置和非法色值兜底。
5. `src/services/game.ts` 实现开始游戏校验、猜词时长解析、剩余时间格式化、游戏词语获取、索引循环。
6. 页面和组件未直接访问 `uni.getStorageSync` 或 `uni.setStorageSync`。
7. `src/utils/sound.ts` 实现准备倒计时、游戏开始、最后 10 秒和游戏结束提示音。

### 4.5 公共组件

| 组件 | 状态 | 说明 |
| --- | --- | --- |
| `AppHeader` | 已完成 | 非原生导航标题场景下的页面标题、副标题和右侧操作区。 |
| `EmptyState` | 已完成 | 空状态展示。 |
| `ColorPicker` | 已完成 | 预设色块选择。 |
| `SettingsPanel` | 已完成 | 背景色、词条颜色保存；猜词模式下展示退出入口。 |

### 4.6 页面实现

| 页面 | 状态 | 说明 |
| --- | --- | --- |
| 首页 | 已完成 | 初始化本地数据、展示分组、选择分组、单选猜词时长、开始游戏、打开设置。 |
| 分类管理页 | 已完成 | 新增分类、删除分类、二次确认、进入词语管理。 |
| 词语管理页 | 已完成 | 按分类展示词语、新增词语、删除词语、异常参数处理。 |
| 倒计时页 | 已完成 | 5 秒倒计时、读秒音效、游戏开始音效、返回首页、卸载清理定时器。 |
| 猜词模式页 | 已完成 | 横屏锁定、顶部剩余时间、超大词条、跑马灯或静态展示、全页滑动切词、音量键切词、游戏结束提示和退出。 |

## 5. 验证记录

最近一次验证日期：2026-07-11。

| 命令 | 状态 | 结果 |
| --- | --- | --- |
| `npm test` | 通过 | 2 个测试文件，11 个测试用例全部通过。 |
| `npm run typecheck` | 通过 | TypeScript / Vue 类型检查通过。 |
| `npm run build:h5` | 待复核 | 新增计时音效功能后尚未重新执行。 |
| `npm run build:app` | 通过 | App 构建完成，产物位于 `dist/build/app`。 |

说明：

1. 构建过程中仍会出现 DCloud 或 Sass 依赖链自身的 deprecation warning，不影响当前构建产物生成。
2. `npm install` 后存在第三方依赖审计风险提示，当前未执行 `npm audit fix`，避免破坏 DCloud 版本兼容性。

## 6. 待完成事项

| 优先级 | 事项 | 状态 | 验收标准 |
| --- | --- | --- | --- |
| P0 | Android 真机运行验证 | 待执行 | App 可安装、可启动、核心流程可完成。 |
| P0 | 猜词模式横屏验证 | 待执行 | 进入猜词模式横屏展示，退出后恢复竖屏。 |
| P0 | 触摸滑动验证 | 待执行 | 左滑切词稳定，快速连续滑动不会跳过多个词。 |
| P0 | 猜词时长和音效回归 | 待执行 | 时长必选、顶部倒计时、最后 10 秒提示音和游戏结束音效正常。 |
| P0 | 本地存储真机验证 | 待执行 | 分类、词语、设置在杀进程和重启后仍保留。 |
| P0 | APK 打包输出 | 待执行 | 通过 HBuilderX 导入 `dist/build/app` 并输出可安装 APK。 |
| P1 | 多尺寸屏幕视觉检查 | 待执行 | 首页和管理页不挤压，猜词模式词条足够醒目。 |
| P1 | 依赖安全审计评估 | 待评估 | 明确哪些漏洞来自 DCloud 依赖链，避免盲目升级破坏构建。 |

## 7. 风险与备注

| 风险 | 当前状态 | 处理建议 |
| --- | --- | --- |
| H5 无法验证真实横屏锁定 | 仍存在 | 必须使用 Android 真机 App 调试验证。 |
| HBuilderX 打包环境未验证 | 仍存在 | 使用 `dist/build/app` 导入 HBuilderX 后完成 APK 输出。 |
| DCloud 依赖版本兼容性敏感 | 已处理基础兼容 | 保持 `package.json` 中 DCloud、Vue、Vite、Babel runtime、core-js-pure 精确版本，不随意升级。 |
| Sass legacy API 警告 | 不阻塞 | 当前为依赖链警告，后续等 DCloud 工具链升级后再处理。 |
| npm audit 漏洞提示 | 待评估 | 暂不执行自动修复，需先确认是否会影响 uni-app 构建链路。 |

## 8. 下一步建议

1. 使用 HBuilderX 导入 `dist/build/app`，执行 Android 真机运行。
2. 按 `docs/technical-development-document.md` 的真机重点验证清单完成手工测试。
3. 根据真机结果修复横屏、触摸、视觉、音效或存储问题。
4. 真机验收通过后输出 APK。
5. 每次完成一轮验证后，更新本文档的“验证记录”和“待完成事项”。
