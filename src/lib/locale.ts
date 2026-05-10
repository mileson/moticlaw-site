/*
## 核心功能
提供官网的最小语言识别与 HTML `lang` 映射逻辑。
## 输入
接收浏览器或请求头传入的 `Accept-Language` 字符串以及内部 Locale 值。
## 输出
输出官网当前支持的 `en` 或 `zh` 语言标识和对应 HTML 语言代码。
## 定位
位于 `src/lib`，作为首页和根布局共享的轻量国际化工具模块。
## 依赖
仅依赖 TypeScript 运行时，不依赖第三方 i18n 框架。
## 维护规则
- 新增支持语言或调整语言判定逻辑时，必须同步更新本说明书。
- 若未来引入完整 i18n 方案，应同步更新 `docs/basic/frontend-guidelines.md`。
*/
export type Locale = "en" | "zh";

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return "en";
  return acceptLanguage.toLowerCase().includes("zh") ? "zh" : "en";
}

export function localeToHtmlLang(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en";
}
