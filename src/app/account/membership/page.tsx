import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteMembershipPage } from "@/components/site-membership-page";
import { detectLocale } from "@/lib/locale";
import { readSiteAuthSession } from "@/lib/site-auth";
import { readSiteMembershipInitialData } from "@/lib/site-billing-server";
import type { SiteBillingCatalog, SiteMembershipPlan } from "@/lib/site-billing";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const [rawSearchParams, requestHeaders] = await Promise.all([searchParams, headers()]);
  const locale = detectLocale(
    [firstString(rawSearchParams.lang), requestHeaders.get("accept-language")].filter((value): value is string => typeof value === "string"),
  );
  const title = locale === "zh" ? "套餐价格 - MotiClaw" : "Pricing & Plans - MotiClaw";
  const description = locale === "zh"
    ? "查看 MotiClaw Plus 和 Pro 月付、年付套餐：更高的托管模型限额、更多 AI 伙伴，支付后立即生效。"
    : "Compare MotiClaw Plus and Pro monthly and annual plans: higher hosted-model limits and more AI partners, active right after payment.";
  const canonical = locale === "zh" ? "/zh/account/membership" : "/account/membership";
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "zh-CN": "/zh/account/membership",
        en: "/account/membership",
        "x-default": "/account/membership",
      },
    },
    openGraph: { title, description, url: "/account/membership", siteName: "MotiClaw" },
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function MembershipPage({
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
    [requestedLanguage, requestHeaders.get("accept-language")].filter((value): value is string => typeof value === "string"),
  );
  const requestedView = resolveMembershipView(firstString(rawSearchParams.view));
  const billingData = await readSiteMembershipInitialData(viewerSession);
  const checkoutPlan = resolveCheckoutPlan(
    firstString(rawSearchParams.planId ?? rawSearchParams.plan_id),
    firstString(rawSearchParams.tier),
    billingData.catalog,
  );
  const activeView = checkoutPlan ? "plans" : requestedView;
  const loginHref = withLoginReturnUrl(locale, withMembershipView(locale, "/account/membership", activeView, checkoutPlan));

  return (
    <SiteMembershipPage
      locale={locale}
      basePath="/account/membership"
      activeView={activeView}
      initialCheckoutPlanId={checkoutPlan?.planId ?? null}
      loginHref={loginHref}
      viewerSession={billingData.session}
      initialCatalog={billingData.catalog}
      initialOrders={billingData.orders}
      initialMembershipStatus={billingData.membershipStatus}
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

function resolveMembershipView(value: string | undefined) {
  // The standalone benefits view is retired; any legacy `view=benefits` link falls back to plans.
  return value === "orders" ? value : "plans";
}

function resolveCheckoutPlan(planId: string | undefined, tier: string | undefined, catalog: SiteBillingCatalog): SiteMembershipPlan | null {
  const normalizedPlanId = planId?.trim() || "";
  const normalizedTier = tier?.trim().toLowerCase() || "";
  const planById = normalizedPlanId ? catalog.plans.find((plan) => plan.planId === normalizedPlanId) ?? null : null;
  const planByTier = normalizedTier ? catalog.plans.find((plan) => plan.tier.toLowerCase() === normalizedTier) ?? null : null;

  if (planById && normalizedTier && planById.tier.toLowerCase() !== normalizedTier) {
    return null;
  }
  return planById ?? planByTier;
}

function withMembershipView(locale: string, path: string, view: "plans" | "orders", checkoutPlan?: SiteMembershipPlan | null) {
  const url = new URL(path, "https://www.moticlaw.com");
  url.searchParams.set("lang", locale);
  url.searchParams.set("view", view);
  if (checkoutPlan) {
    url.searchParams.set("planId", checkoutPlan.planId);
    url.searchParams.set("tier", checkoutPlan.tier);
  }
  return `${url.pathname}${url.search}`;
}
