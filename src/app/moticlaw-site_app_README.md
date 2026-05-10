# moticlaw-site_app 文件夹说明书

## 核心功能

承载 App Router 根布局、首页路由和全站共享样式资源。

## 输入

接收请求头语言信息、首页发布数据和全站静态资源引用。

## 输出

输出官网根 HTML 骨架、首页页面和全站样式。

## 定位

位于 `src/app`，是 Next.js App Router 的主路由入口目录。

## 依赖

依赖 Next.js App Router、`src/components` 首页组件和 `src/lib` 工具模块。

## 维护规则

- 新增路由、根布局能力或全站样式入口后，必须同步更新本说明书。
- 影响页面结构和请求流转时，需同步更新 `docs/basic/app-flow.md`。
