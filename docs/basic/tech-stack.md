# 项目技术栈

## 运行环境

- Node.js 运行 Next.js 16 应用，包管理器固定为 `pnpm@10`。
- React 19 与 TypeScript 5 作为页面交互和类型系统基础。
- 站点默认部署在 Vercel，本地开发通过 `pnpm dev`，生产预览通过 `pnpm build && pnpm start`。

## 核心依赖

- Next.js App Router 承载官网页面与 `/api/releases/latest` Route Handler。
- React 19 负责首页下载弹窗、平台识别和主题/语言交互。
- `@phosphor-icons/react` 提供首页和下载弹窗使用的图标资源。
- 阿里云 OSS 是桌面安装包公网下载源，官网默认读取 `https://moticlaw.oss-cn-hangzhou.aliyuncs.com/desktop/releases/latest.json`。
- GitHub Releases 只作为桌面版本归档源；官网、安装脚本和下载弹窗都不再依赖 GitHub 资产或旧 OSS 域名。

## 工具链

- Tailwind CSS v4 通过 `@tailwindcss/postcss` 接入全局样式构建。
- `pnpm lint`：执行 ESLint 与 Next.js 官方规则检查。
- `pnpm build`：执行 Next.js 生产构建并验证 App Router、类型和服务端渲染链路。
- `openprd standards . --verify`、`openprd run . --verify`、`openprd doctor .`：执行项目文档和 Agent 集成门禁校验。

## 维护规则

- 每次新增、移除或升级核心依赖、运行时和工具链后，必须检查并更新本文件。
- 修改桌面发布仓库、OSS 路径、release tag 规范或下载文件命名时，必须同步更新 `src/lib/release-manifest.ts`、`public/release-manifest.json`、`public/latest.json`、`public/checksums.txt` 和本文件。
