export type Locale = "en" | "zh";

export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return "en";
  return acceptLanguage.toLowerCase().includes("zh") ? "zh" : "en";
}

export function localeToHtmlLang(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en";
}
