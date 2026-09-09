export type SeoSearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function resolveSeoLocale(searchParams: SeoSearchParams) {
  const rawSearchParams = await searchParams;
  const requestedLanguage = firstString(rawSearchParams.lang);
  return requestedLanguage === "zh" ? "zh" : "en";
}

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}
