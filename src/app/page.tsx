import type { Metadata } from "next";
import { buildSeoHomeMetadata, SeoResourceHome } from "@/components/seo-resource-home";
import type { Locale } from "@/lib/locale";

type HomeSearchParams = Promise<{ lang?: string }>;

function resolveHomeLocale(langParam: string | undefined): Locale {
  return langParam === "zh" ? "zh" : "en";
}

export async function generateMetadata({ searchParams }: { searchParams: HomeSearchParams }): Promise<Metadata> {
  const { lang } = await searchParams;
  return buildSeoHomeMetadata(resolveHomeLocale(lang));
}

export default async function Home({ searchParams }: { searchParams: HomeSearchParams }) {
  const { lang } = await searchParams;
  return <SeoResourceHome locale={resolveHomeLocale(lang)} />;
}
