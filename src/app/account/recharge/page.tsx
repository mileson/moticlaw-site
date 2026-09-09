import type { Metadata } from "next";
import { headers } from "next/headers";
import { SitePointsPage } from "@/components/site-points-page";
import { detectLocale } from "@/lib/locale";
import { readSiteAuthSession } from "@/lib/site-auth";
import { readSitePointsInitialData } from "@/lib/site-billing-server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [rawSearchParams, requestHeaders] = await Promise.all([searchParams, headers()]);
  const locale = detectLocale(
    [firstString(rawSearchParams.lang), requestHeaders.get("accept-language")].filter(
      (value): value is string => typeof value === "string",
    ),
  );
  const title = locale === "zh" ? "积分充值 - MotiClaw" : "Points Recharge - MotiClaw";
  const description =
    locale === "zh"
      ? "查看当前积分余额，选择积分包并使用微信扫码完成充值。"
      : "Review your points balance, choose a points package, and complete recharge with WeChat.";
  const canonical = locale === "zh" ? "/zh/account/recharge" : "/account/recharge";
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-CN": "/zh/account/recharge",
        en: "/account/recharge",
        "x-default": "/account/recharge",
      },
    },
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function RechargePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [rawSearchParams, requestHeaders, viewerSession] = await Promise.all([
    searchParams,
    headers(),
    readSiteAuthSession(),
  ]);
  const requestedLanguage = firstString(rawSearchParams.lang);
  const locale = detectLocale(
    [requestedLanguage, requestHeaders.get("accept-language")].filter(
      (value): value is string => typeof value === "string",
    ),
  );
  const returnTo = withLang(locale, "/account/recharge");
  const loginHref = withLoginReturnUrl(locale, returnTo);
  const billingData = await readSitePointsInitialData(viewerSession);

  return (
    <SitePointsPage
      locale={locale}
      loginHref={loginHref}
      viewerSession={billingData.session}
      initialCatalog={billingData.catalog}
      initialAccount={billingData.account}
      initialLedgerEntries={billingData.ledgerEntries}
      initialOrders={billingData.orders}
      unavailable={billingData.unavailable}
    />
  );
}

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

function withLoginReturnUrl(locale: string, returnToPath: string) {
  const url = new URL("/login", "https://www.moticlaw.com");
  url.searchParams.set("lang", locale);
  url.searchParams.set("return_to", returnToPath);
  return `${url.pathname}${url.search}`;
}

function withLang(locale: string, path: string) {
  return locale === "zh" ? `/zh${path}` : path;
}
