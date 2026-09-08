import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { SiteAuthPage } from "@/components/site-auth-page";
import { detectLocale } from "@/lib/locale";
import {
  normalizeClientRedirectUri,
  normalizeReturnToPath,
  readSiteAuthSession,
  resolveTurnstileWidgetConfig,
  unauthenticatedSession,
  type SiteAuthPageMode,
} from "@/lib/site-auth";

const supportedAuthPages = new Set<SiteAuthPageMode>(["login", "register", "forgot-password", "reset-password"]);
const localWebsiteHostnames = new Set(["127.0.0.1", "localhost", "::1"]);
const productionWebsiteDesktopClientRedirectUri = "moticlaw://auth/complete";
const developmentWebsiteDesktopClientRedirectUri = "moticlaw-dev://auth/complete";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ authPage: string }>;
}): Promise<Metadata> {
  const { authPage } = await params;
  const pageMode = normalizeAuthPageMode(authPage);
  const canonical = pageMode && pageMode !== "register" ? `/${pageMode}` : "/login";
  return {
    alternates: { canonical },
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default async function AuthPage({
  params,
  searchParams,
}: {
  params: Promise<{ authPage: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { authPage } = await params;
  const earlyPageMode = normalizeAuthPageMode(authPage);
  const [rawSearchParams, requestHeaders, viewerSession] = await Promise.all([
    searchParams,
    headers(),
    earlyPageMode === "login" ? readSiteAuthSession() : Promise.resolve(unauthenticatedSession()),
  ]);

  if (authPage === "auth") {
    const legacyMode = normalizeAuthPageMode(firstString(rawSearchParams.mode));
    if (legacyMode) redirect(legacyAuthRedirectPath(legacyMode === "register" ? "login" : legacyMode, rawSearchParams));
    notFound();
  }

  const pageMode = earlyPageMode;
  if (!pageMode) notFound();
  if (pageMode === "register") redirect(legacyAuthRedirectPath("login", rawSearchParams));

  const requestedLanguage = firstString(rawSearchParams.lang);
  const locale = detectLocale(
    [requestedLanguage, requestHeaders.get("accept-language")].filter((value): value is string => typeof value === "string"),
  );
  const initialResetToken = pageMode === "reset-password" ? firstString(rawSearchParams.token) ?? null : null;
  const clientRedirectUri = normalizeClientRedirectUri(firstString(rawSearchParams.client_redirect_uri));
  const fallbackRedirectUri = normalizeClientRedirectUri(firstString(rawSearchParams.fallback_redirect_uri));
  const returnToPath = normalizeReturnToPath(firstString(rawSearchParams.return_to));
  const requestedProvider = firstString(rawSearchParams.provider) === "watcha" ? "watcha" : null;
  const oauthErrorCode = firstString(rawSearchParams.oauth_error) ?? null;
  if (pageMode === "login" && requestedProvider === "watcha" && !oauthErrorCode && !viewerSession.authenticated) {
    redirect(watchaOAuthRedirectPath(rawSearchParams));
  }
  const websiteDesktopClientRedirectUri = resolveWebsiteDesktopClientRedirectUri(requestHeaders);
  const turnstileConfig = resolveTurnstileWidgetConfig({
    countryCode: requestHeaders.get("cf-ipcountry"),
  });

  return (
    <SiteAuthPage
      mode={pageMode}
      locale={locale}
      turnstileSiteKey={turnstileConfig.siteKey}
      turnstileRegion={turnstileConfig.region}
      viewerSession={viewerSession}
      initialResetToken={initialResetToken}
      clientRedirectUri={clientRedirectUri}
      fallbackRedirectUri={fallbackRedirectUri}
      returnToPath={returnToPath}
      requestedProvider={requestedProvider}
      oauthErrorCode={oauthErrorCode}
      websiteDesktopClientRedirectUri={websiteDesktopClientRedirectUri}
    />
  );
}

function firstString(value: string | string[] | undefined) {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : undefined;
}

function normalizeAuthPageMode(value: string | undefined): SiteAuthPageMode | null {
  return value && supportedAuthPages.has(value as SiteAuthPageMode) ? (value as SiteAuthPageMode) : null;
}

function legacyAuthRedirectPath(mode: SiteAuthPageMode, searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "mode") continue;
    appendQueryString(query, key, firstString(value));
  }
  const suffix = query.toString();
  return `/${mode}${suffix ? `?${suffix}` : ""}`;
}

function watchaOAuthRedirectPath(searchParams: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  appendQueryString(query, "lang", firstString(searchParams.lang));
  appendQueryString(query, "client_redirect_uri", firstString(searchParams.client_redirect_uri));
  appendQueryString(query, "fallback_redirect_uri", firstString(searchParams.fallback_redirect_uri));
  appendQueryString(query, "return_to", firstString(searchParams.return_to));
  const suffix = query.toString();
  return `/api/auth/oauth-watcha${suffix ? `?${suffix}` : ""}`;
}

function appendQueryString(query: URLSearchParams, key: string, value: string | undefined) {
  if (value?.trim()) query.set(key, value);
}

function resolveWebsiteDesktopClientRedirectUri(requestHeaders: Headers) {
  const forwardedHost = firstString(requestHeaders.get("x-forwarded-host")?.split(",").map((item) => item.trim()).filter(Boolean));
  const host = forwardedHost || requestHeaders.get("host") || "";
  const hostname = host.split(":")[0]?.trim().toLowerCase();
  return localWebsiteHostnames.has(hostname) ? developmentWebsiteDesktopClientRedirectUri : productionWebsiteDesktopClientRedirectUri;
}
