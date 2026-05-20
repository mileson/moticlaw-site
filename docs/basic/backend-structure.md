# 后端架构设计

## 适用范围

本项目没有独立业务后端，所谓“后端”仅指官网内部的 Next.js Route Handler、服务端预取逻辑，以及它们和官方 OSS 发布源之间的数据转换约定。

## 服务边界

- `/api/releases/latest` 是官网唯一的发布数据后端入口。
- 该接口优先读取 OSS 公网 `latest.json`，并直接返回前端统一的 `ReleaseManifest`。
- 该接口不再回退到 GitHub 或本地静态数据；只要 OSS 最新 manifest 不可用，就直接返回错误状态。
- 首页 `src/app/page.tsx` 会在服务端调用同一份发布清单转换逻辑，把最新版本直接注入首屏 HTML。

## 数据流

- 官方数据源固定为 `https://moticlaw.oss-cn-hangzhou.aliyuncs.com/desktop/releases/latest.json`，其返回 `schema_version/product/version/release_date/display_version/artifacts[]` 等字段。
- `src/lib/release-manifest.ts` 负责把 OSS 的 `artifacts[]` 数组映射成官网内部的平台键，并在返回给官网前过滤掉当前未公开的平台渠道。
- 官网当前只保留 macOS 的 `dmg` 与 Windows 的 `setup.exe`；Windows portable 包和 Linux 安装包都会在转换后被过滤掉，不进入下载弹窗或 `/api/releases/latest` 响应。
- 首页服务端首屏和客户端下载弹窗都使用同一个统一模型，保证版本号、下载链接和平台推荐结果一致。

## CLI 接入面

- 官网没有独立业务 CLI；公开安装脚本只负责下载桌面端安装包，并默认读取官方 OSS 最新发布清单。
- 需要覆盖发布清单地址时，只能通过脚本支持的环境变量显式指定，不应在官网代码中写入临时下载源。

## API 接入面

- `GET /api/releases/latest` 返回前端统一发布模型，并只暴露当前公开下载平台。
- 接口失败时返回错误状态，前端不回退到 GitHub Release 或本地旧清单。

## 维护规则

- 每次服务边界、数据流、存储或外部依赖发生变化后，必须检查并更新本文件。
- Windows 官网下载只展示安装版 `.exe`，不展示 portable 包；Linux 渠道下架时不得继续通过官网 API 或 UI 暴露。
