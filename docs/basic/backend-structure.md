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
- `src/lib/release-manifest.ts` 负责把 OSS 的 `artifacts[]` 数组映射成官网内部的 `darwin-arm64`、`windows-x64`、`linux-deb-x64` 等平台键。
- 官网只保留 macOS 的 `dmg`、Windows 的 `setup.exe` 和 Linux 的 `AppImage/.deb/.rpm`；Windows portable 包会在转换后被过滤掉，不进入下载弹窗。
- 首页服务端首屏和客户端下载弹窗都使用同一个统一模型，保证版本号、下载链接和平台推荐结果一致。

## 维护规则

- 每次服务边界、数据流、存储或外部依赖发生变化后，必须检查并更新本文件。
- Windows 官网下载只展示安装版 `.exe`，不展示 portable 包。
