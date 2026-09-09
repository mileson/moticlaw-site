import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteTokenDanceRechargePage } from "@/components/site-tokendance-recharge-page";
import { detectLocale } from "@/lib/locale";
import { readSiteAuthSession } from "@/lib/site-auth";
import { readSiteTokenDanceRechargeInitialData } from "@/lib/site-tokendance-recharge-server";

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
  return {
    title: locale === "zh" ? "TokenDance 额度充值 - MotiClaw" : "TokenDance Credit Recharge - MotiClaw",
    description: locale === "zh"
      ? "查看 TokenDance 可用额度、到账额度和最近充值记录。"
      : "Review available TokenDance credits, arriving credits, and recent recharge orders.",
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function TokenDanceRechargePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [rawSearchParams, requestHeaders, viewerSession] = await Promise.all([
    searchParams,
    headers(),
    readSiteAuthSession(),
  ]);
  const locale = detectLocale(
    [firstString(rawSearchParams.lang), requestHeaders.get("accept-language")].filter(
      (value): value is string => typeof value === "string",
    ),
  );
  const returnTo = withLang(locale, "/account/tokendance/recharge");
  const billingData = await readSiteTokenDanceRechargeInitialData(viewerSession);

  return (
    <SiteTokenDanceRechargePage
      locale={locale}
      loginHref={withLoginReturnUrl(locale, returnTo)}
      viewerSession={billingData.session}
      initialAccount={billingData.account}
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
  return `${path}?lang=${locale}`;
}
