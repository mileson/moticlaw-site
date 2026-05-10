/*
## 核心功能
渲染官网首页，并在服务端预取最新 OSS 发布信息后交给首屏组件展示。
## 输入
读取请求头中的语言偏好，并通过 `src/lib/release-manifest.ts` 请求最新 OSS 发布清单。
## 输出
输出包含首屏语言和发布数据的 `MotiClawLanding` 页面。
## 定位
位于 App Router 首页路由，是官网唯一的页面入口。
## 依赖
依赖 `next/headers`、`src/lib/locale.ts`、`src/lib/release-manifest.ts` 和 `src/components/moticlaw-landing.tsx`。
## 维护规则
- 调整首页数据预取策略、语言检测或首屏注入字段时，必须同步更新本说明书。
- 若首页职责扩展到多路由或多页面入口，应同步更新 `docs/basic/app-flow.md`。
*/
import { headers } from "next/headers";
import { detectLocale } from "@/lib/locale";
import { fetchLatestReleaseManifest } from "@/lib/release-manifest";
import { MotiClawLanding } from "@/components/moticlaw-landing";

export default async function Home() {
  const requestHeaders = await headers();
  const locale = detectLocale(requestHeaders.get("accept-language"));
  const releaseManifest = await fetchLatestReleaseManifest();

  if (!releaseManifest) {
    throw new Error("Latest OSS release manifest is unavailable.");
  }

  return <MotiClawLanding initialLocale={locale} initialReleaseManifest={releaseManifest} />;
}
