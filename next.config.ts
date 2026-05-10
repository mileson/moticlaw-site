/*
## 核心功能
承载官网项目的 Next.js 根级运行配置。
## 输入
读取 Next.js 构建、开发和部署流程中的配置项。
## 输出
向 Next.js 导出当前站点的统一配置对象。
## 定位
位于项目根目录，是 Vercel 和本地 `next` 命令共用的配置入口。
## 依赖
依赖 Next.js 提供的 `NextConfig` 类型定义。
## 维护规则
- 新增运行时配置、实验特性或资源白名单时，必须同步更新本说明书。
- 保持配置与 Vercel 部署行为一致，避免仅在本地生效的分叉设置。
*/
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
