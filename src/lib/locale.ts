export type Locale = "en" | "zh";

export const defaultLocale: Locale = "en";

export function detectLocale(languagePreference: string | readonly string[] | null | undefined): Locale {
  const languageEntries = Array.isArray(languagePreference) ? languagePreference : [languagePreference];

  for (const entry of languageEntries) {
    if (!entry) continue;

    for (const candidate of entry.split(",")) {
      const normalized = normalizeLocaleCandidate(candidate);
      if (normalized) return normalized;
    }
  }

  return defaultLocale;
}

export function localeToHtmlLang(locale: Locale) {
  return locale === "zh" ? "zh-CN" : "en";
}

function normalizeLocaleCandidate(candidate: string): Locale | null {
  const normalized = candidate.trim().toLowerCase().split(";")[0];

  if (normalized === "zh" || normalized.startsWith("zh-")) return "zh";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";

  return null;
}
