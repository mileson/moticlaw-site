# moticlaw-site_components 文件夹说明书

## 核心功能

存放官网页面的复合视图组件，并承载首页交互与下载体验。

## 输入

接收路由层注入的语言、发布清单和浏览器运行时状态。

## 输出

输出官网首屏、下载弹窗、内容区块和用户交互反馈。

## 定位

位于 `src/components`，负责页面级 React 组件的展示与交互编排。

## 依赖

依赖 React、样式类名约定、`src/lib/locale.ts` 和 `src/lib/release-manifest.ts`。

## 维护规则

- 新增首页子组件、拆分交互模块或调整职责边界后，必须同步更新本说明书。
- 修改下载流程或用户可见文案时，需同步更新 `docs/basic/app-flow.md` 与相关文档。
