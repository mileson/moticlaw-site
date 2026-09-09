import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
type RequestLocale = "en" | "zh";
const chinesePrefix = "/zh";
const legacyEnglishPrefix = "/en";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === legacyEnglishPrefix || request.nextUrl.pathname.startsWith(`${legacyEnglishPrefix}/`)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = stripLocalePrefix(request.nextUrl.pathname, legacyEnglishPrefix);
    redirectUrl.searchParams.delete("lang");
    return NextResponse.redirect(redirectUrl, 308);
  }

  const locale = resolveRequestLocale(request);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-moticlaw-locale", locale);
  requestHeaders.set("accept-language", locale === "zh" ? "zh-CN" : "en");

  if (locale === "zh" && (request.nextUrl.pathname === chinesePrefix || request.nextUrl.pathname.startsWith(`${chinesePrefix}/`))) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.protocol = "http:";
    rewriteUrl.pathname = stripLocalePrefix(request.nextUrl.pathname, chinesePrefix);
    rewriteUrl.searchParams.set("lang", "zh");
    return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|webmanifest)$).*)"],
};

function resolveRequestLocale(request: NextRequest): RequestLocale {
  if (request.nextUrl.pathname === chinesePrefix || request.nextUrl.pathname.startsWith(`${chinesePrefix}/`)) return "zh";
  const explicitLocale = request.nextUrl.searchParams.get("lang");
  if (explicitLocale === "en" || explicitLocale === "zh") return explicitLocale;
  return "en";
}

function stripLocalePrefix(pathname: string, prefix: string) {
  const stripped = pathname.slice(prefix.length);
  return stripped || "/";
}
