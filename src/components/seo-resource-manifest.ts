import runtimeData from "@/components/seo-runtime-data.json";
import type { SeoResourceKind } from "@/components/seo-resource-copy";
import type { Locale } from "@/lib/locale";

export type SeoPageType =
  | "conversion"
  | "product-detail"
  | "product-overview"
  | "solution-hub"
  | "workflow"
  | "playbook"
  | "comparison";

type LocalizedText = Record<Locale, string>;

export type SiteRouteManifest = {
  id: string;
  kind?: SeoResourceKind;
  path: string;
  marketPaths?: Partial<Record<Locale, string>>;
  locales: Locale[];
  pageType: string;
  cluster: string;
  parentHub: string | null;
  navTier: number;
  indexPolicy: "index" | "noindex";
  sitemap: boolean;
  monitor: boolean;
  ownerLane: "seo" | "blog" | "docs" | "manual";
  relatedIds?: string[];
  schemaTypes?: string[];
  layoutRecipe?: string;
  evidencePolicy?: string;
  visualProfile?: string;
  contentRegistry?: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
  lastModified: string;
};

export type SeoVisual = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  kind: "concept" | "screenshot";
  provenance?: {
    receipt: string;
    dataMode: "synthetic";
    scenarioId: string;
    fixtureVersion: string;
    fixtureSha256: string;
    productGitDirty: false;
    productGitSha: string;
    appVersion: string;
    capturedAt: string;
  };
};

type NavigationItem = {
  id: string;
  label: LocalizedText;
  routeId: string;
};

type VisualProfile = {
  assetId: string;
  kind: "concept" | "screenshot";
  src: string;
  width: number;
  height: number;
  alt: LocalizedText;
  caption: LocalizedText;
  receipt?: string;
};

type SiteContentManifest = {
  version: number;
  contractId: string;
  updatedAt: string;
  canonicalPolicy: {
    defaultLocale: Locale;
    defaultLocaleUrl: "path";
    alternateLocaleUrl: "subpath" | "query";
    queryParameter: string;
    marketPrefix: string;
  };
  navigation: NavigationItem[];
  visualProfiles: Record<string, VisualProfile>;
  routes: SiteRouteManifest[];
};

export const siteContentManifest = runtimeData.siteRoutes as SiteContentManifest;
export const siteContentRoutes = siteContentManifest.routes;

const productCaseReceipts = {
  ...runtimeData.receipts,
} as const;

const routeById = new Map(siteContentRoutes.map((route) => [route.id, route]));
const routeByPath = new Map(siteContentRoutes.map((route) => [route.path, route]));
const routeByMarketPath = new Map(
  siteContentRoutes.flatMap((route) =>
    Object.values(route.marketPaths ?? {}).map((marketPath) => [marketPath, route] as const),
  ),
);
const routeByKind = new Map(
  siteContentRoutes
    .filter((route): route is SiteRouteManifest & { kind: SeoResourceKind } => Boolean(route.kind))
    .map((route) => [route.kind, route]),
);

export function getSiteRouteById(id: string) {
  return routeById.get(id) ?? null;
}

export function getSiteRouteByPublicPath(path: string) {
  const pathname = new URL(path, "https://www.moticlaw.com").pathname;
  return resolveRouteMatch(pathname).route;
}

export function getSeoRouteByKind(kind: SeoResourceKind) {
  const route = routeByKind.get(kind);
  if (!route) throw new Error(`SEO route manifest is missing kind: ${kind}`);
  return route;
}

export function getSeoRelatedRoutes(kind: SeoResourceKind) {
  const route = getSeoRouteByKind(kind);
  return (route.relatedIds ?? [])
    .map((id) => routeById.get(id))
    .filter((item): item is SiteRouteManifest & { kind: SeoResourceKind } => Boolean(item?.kind));
}

export function getSeoNavigation(locale: Locale) {
  return siteContentManifest.navigation.map((item) => {
    const route = routeById.get(item.routeId);
    if (!route) throw new Error(`SEO navigation points to an unknown route: ${item.routeId}`);
    return {
      id: item.id,
      label: item.label[locale],
      path: route.path,
      href: withLocaleQuery(route.path, locale),
    };
  });
}

export function getActiveSeoNavigationId(path: string) {
  const route = siteContentRoutes.find((item) => item.path === path);
  if (!route) return null;
  if (["pricing"].includes(route.id)) return "pricing";
  if (["solutions"].includes(route.id) || route.pageType === "solution-hub") return "solutions";
  if (["workflows"].includes(route.id) || ["workflow", "playbook", "comparison"].includes(route.pageType)) return "workflows";
  if (["resources", "blog", "docs"].includes(route.id) || route.pageType === "content-index") return "resources";
  return ["home", "legal", "account"].includes(route.pageType) ? null : "product";
}

export function getIndexableSiteRoutes() {
  return siteContentRoutes.filter((route) => route.indexPolicy === "index" && route.sitemap);
}

export function getMonitoredSiteRoutes() {
  return siteContentRoutes.filter((route) => route.indexPolicy === "index" && route.monitor);
}

export function getBreadcrumbRoutes(kind: SeoResourceKind) {
  const result: SiteRouteManifest[] = [];
  const visited = new Set<string>();
  let current: SiteRouteManifest = getSeoRouteByKind(kind);
  while (current.parentHub && !visited.has(current.parentHub)) {
    visited.add(current.parentHub);
    const parent = routeById.get(current.parentHub);
    if (!parent) break;
    result.unshift(parent);
    current = parent;
  }
  return result;
}

export function getManifestVisual(kind: SeoResourceKind, locale: Locale): SeoVisual {
  const route = getSeoRouteByKind(kind);
  const profileId = route.visualProfile;
  const profile = profileId ? siteContentManifest.visualProfiles[profileId] : null;
  if (!profile) throw new Error(`SEO route ${route.id} is missing a visual profile.`);

  const base = {
    src: profile.src,
    alt: profile.alt[locale],
    caption: profile.caption[locale],
    width: profile.width,
    height: profile.height,
    kind: profile.kind,
  } as const;

  if (profile.kind !== "screenshot" || !profile.receipt) return base;

  const productCaseReceipt = productCaseReceipts[profile.receipt as keyof typeof productCaseReceipts];
  if (!productCaseReceipt) throw new Error(`SEO visual profile ${profileId} points to an unknown receipt: ${profile.receipt}`);

  return {
    ...base,
    provenance: {
      receipt: profile.receipt,
      dataMode: "synthetic",
      scenarioId: productCaseReceipt.scenarioId,
      fixtureVersion: productCaseReceipt.fixture.version,
      fixtureSha256: productCaseReceipt.fixture.sha256,
      productGitDirty: false,
      productGitSha: productCaseReceipt.product.gitSha,
      appVersion: productCaseReceipt.product.appVersion,
      capturedAt: productCaseReceipt.capture.capturedAt,
    },
  };
}

export function getCanonicalPath(path: string, locale: Locale) {
  const url = new URL(path, "https://www.moticlaw.com");
  const match = resolveRouteMatch(url.pathname);
  const policy = siteContentManifest.canonicalPolicy;
  const defaultLocale = policy.defaultLocale;
  const basePath = match.route?.path ?? match.normalizedPath;
  const suffix = match.suffix;
  const explicitMarketPath = match.route?.marketPaths?.[locale];
  const localizedBase = explicitMarketPath ?? (
    locale === defaultLocale
      ? basePath
      : prefixMarketPath(basePath, policy.marketPrefix)
  );
  url.pathname = `${localizedBase === "/" ? "" : localizedBase}${suffix}` || "/";
  url.searchParams.delete(policy.queryParameter);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getLanguageAlternates(path: string) {
  return {
    "zh-CN": getCanonicalPath(path, "zh"),
    en: getCanonicalPath(path, "en"),
    "x-default": getCanonicalPath(path, siteContentManifest.canonicalPolicy.defaultLocale),
  };
}

export function withLocaleQuery(path: string, locale: Locale, extraParams?: Record<string, string>) {
  const url = new URL(getCanonicalPath(path, locale), "https://www.moticlaw.com");
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

export function toAbsoluteSiteUrl(path: string) {
  return new URL(path, "https://www.moticlaw.com").toString();
}

function resolveRouteMatch(pathname: string) {
  const prefix = siteContentManifest.canonicalPolicy.marketPrefix;
  const normalizedPath = pathname === prefix
    ? "/"
    : pathname.startsWith(`${prefix}/`)
      ? pathname.slice(prefix.length)
      : pathname;
  const exactRoute = routeByPath.get(normalizedPath) ?? routeByMarketPath.get(pathname);
  if (exactRoute) return { route: exactRoute, normalizedPath, suffix: "" };

  const parentRoute = [...siteContentRoutes]
    .filter((route) => route.path !== "/" && normalizedPath.startsWith(`${route.path}/`))
    .sort((left, right) => right.path.length - left.path.length)[0] ?? null;
  return {
    route: parentRoute,
    normalizedPath,
    suffix: parentRoute ? normalizedPath.slice(parentRoute.path.length) : "",
  };
}

function prefixMarketPath(pathname: string, prefix: string) {
  return pathname === "/" ? prefix : `${prefix}${pathname}`;
}
