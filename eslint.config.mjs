/*
## 核心功能
定义官网项目的 ESLint 规则集合，并启用 Next.js 官方推荐的核心规则。
## 输入
读取项目源码、Next.js 默认规则集和 TypeScript 规则集。
## 输出
向 `eslint` CLI 暴露统一的 lint 配置。
## 定位
位于项目根目录，负责整个官网仓库的静态代码校验入口。
## 依赖
依赖 `eslint/config`、`eslint-config-next/core-web-vitals` 和 `eslint-config-next/typescript`。
## 维护规则
- 新增 lint 规则、忽略目录或框架约束时，必须同步更新本说明书。
- 若项目引入新的源码目录或生成目录，应同步评估是否需要加入忽略列表。
*/
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
