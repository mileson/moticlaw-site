/*
## 核心功能
声明 Next.js 生成的全局类型引用，确保 TypeScript 能识别应用路由和图片类型。
## 输入
由 Next.js 在开发和构建阶段生成的类型声明文件。
## 输出
为 TypeScript 编译器注入 Next.js 运行所需的全局类型。
## 定位
位于项目根目录，是 Next.js TypeScript 项目的标准环境声明文件。
## 依赖
依赖 Next.js 生成的 `next`、`next/image-types/global` 与 `.next/types/routes.d.ts`。
## 维护规则
- 除补充说明书外，不手动修改该文件的类型引用内容。
- 若 Next.js 升级导致引用结构变化，需同步更新本说明书。
*/
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
