import { ArrowRight, DownloadSimple, Globe, Moon, Sun, Translate } from "@phosphor-icons/react/dist/ssr";
import { getActiveSeoNavigationId, getCanonicalPath, getSeoNavigation, withLocaleQuery } from "@/components/seo-resource-manifest";
import type { Locale } from "@/lib/locale";

const headerCopy = {
  en: {
    features: "Features",
    capabilities: "Capabilities",
    pricing: "Pricing",
    blog: "Blog",
    docs: "Docs",
    contact: "Contact",
    login: "Log in",
    download: "Download",
    theme: "Theme",
    language: "Language",
  },
  zh: {
    features: "产品特色",
    capabilities: "能力",
    pricing: "价格",
    blog: "博客",
    docs: "文档",
    contact: "联系",
    login: "登录",
    download: "下载安装",
    theme: "主题",
    language: "语言",
  },
} as const;

export function SiteHeaderStatic({
  locale,
  path,
  variant = "page",
}: {
  locale: Locale;
  path: string;
  variant?: "landing" | "page" | "seo";
}) {
  const copy = headerCopy[locale];
  const onLanding = variant === "landing";
  const onSeo = variant === "seo";
  const showChineseGuide = onLanding && locale === "en";
  const anchor = (hash: string) => (onLanding ? `#${hash}` : `${getCanonicalPath("/", locale)}#${hash}`);
  const activeSeoNavigationId = onSeo ? getActiveSeoNavigationId(path) : null;
  const navigationItems = onSeo
    ? getSeoNavigation(locale).map((item) => ({ ...item, active: item.id === activeSeoNavigationId }))
    : [
        { id: "features", label: copy.features, href: anchor("product-features"), active: false },
        { id: "capabilities", label: copy.capabilities, href: anchor("capabilities"), active: false },
        { id: "pricing", label: copy.pricing, href: withLocaleQuery("/pricing", locale), active: path === "/pricing" },
        { id: "blog", label: copy.blog, href: withLocaleQuery("/blog", locale), active: path.startsWith("/blog") },
        { id: "docs", label: copy.docs, href: withLocaleQuery("/docs", locale), active: path.startsWith("/docs") },
        { id: "contact", label: copy.contact, href: anchor("contact"), active: false },
      ];
  const downloadProps = onLanding
    ? { href: "#top", "data-open-download": "true" }
    : { href: withLocaleQuery("/", locale, { download: "1" }) };

  return (
    <div
      id="site-header-shell"
      className={`site-header-shell site-header-shell-static fixed inset-x-0 top-0 z-40${onLanding ? "" : " is-pinned"}`}
      data-variant={variant}
    >
      {showChineseGuide ? (
        <aside
          aria-label="中文版本提示"
          className="flex min-h-11 items-center justify-center gap-3 border-b border-[#eadfce] bg-[#fbf6ed] px-4 py-2 text-sm text-[#51483f] dark:border-white/10 dark:bg-[#1b1713] dark:text-[#ddd4ca]"
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-[#b85c38] text-[0.68rem] font-semibold text-white shadow-[0_3px_10px_rgba(184,92,56,0.22)]">中</span>
            <span>中文版本已准备好</span>
          </span>
          <a
            href={getCanonicalPath(path, "zh")}
            aria-label="切换到中文版网站"
            title="切换到中文版"
            className="inline-flex items-center gap-1 font-semibold text-[#9f4528] underline decoration-[#d7a08b] underline-offset-4 transition hover:text-[#77321f] dark:text-[#e9a88e] dark:hover:text-[#ffd1bf]"
          >
            切换到中文版
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </a>
        </aside>
      ) : null}
      <header className="site-header mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-10">
        <a href={onLanding ? "#top" : getCanonicalPath("/", locale)} className="site-header-brand flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg sm:h-[46px] sm:w-[46px]">
            <img src="/icon.svg?v=3" alt="" aria-hidden="true" fetchPriority="high" className="block h-full w-full object-contain" />
          </span>
          <div className="leading-tight">
            <p className="site-header-brand-title display text-[0.9rem] font-semibold tracking-[0.15em] text-[var(--accent-strong)] sm:text-[1.04rem] sm:tracking-[0.2em]">
              MotiClaw
            </p>
          </div>
        </a>

        <nav aria-label={locale === "zh" ? "主导航" : "Main navigation"} className="hidden items-center gap-7 text-sm text-[var(--muted)] md:flex lg:gap-9">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              className={`nav-link ${item.active ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center">
          <button
            type="button"
            id="theme-toggle"
            className="btn-base btn-secondary btn-icon header-icon-btn"
            title={copy.theme}
            aria-label={copy.theme}
          >
            <span className="theme-icon-sun" aria-hidden="true">
              <Sun size={16} weight="regular" />
            </span>
            <span className="theme-icon-moon" aria-hidden="true">
              <Moon size={16} weight="regular" />
            </span>
          </button>

          <button
            type="button"
            id="locale-toggle"
            className="btn-base btn-compact btn-icon header-icon-btn"
            title={copy.language}
            aria-haspopup="menu"
            aria-expanded="false"
          >
            <Translate size={22} weight="regular" aria-hidden="true" />
          </button>

          <a
            href={withLocaleQuery("/login", locale)}
            className="btn-base btn-secondary ml-2 hidden min-h-[2.75rem] items-center justify-center px-4 text-sm font-medium md:inline-flex"
          >
            {copy.login}
          </a>

          <a
            {...downloadProps}
            className={`header-desktop-cta btn-base btn-primary ml-2 justify-center ${onSeo ? "min-w-0 px-3 sm:min-w-[8rem]" : "min-w-[11.375rem]"}`}
          >
            <DownloadSimple size={16} weight="regular" aria-hidden="true" />
            {onSeo ? (locale === "zh" ? "下载" : "Download") : copy.download}
          </a>
        </div>
      </header>

      <div id="locale-menu-backdrop" className="lang-drawer-backdrop" hidden></div>
      <div id="locale-menu" className="lang-drawer-panel" role="menu" aria-label={copy.language} hidden>
        <a
          role="menuitem"
          className={`lang-drawer-option ${locale === "en" ? "lang-drawer-option-active" : ""}`}
          href={getCanonicalPath(path, "en")}
          data-locale-option="en"
        >
          <span className="flex items-center gap-2">
            <Globe size={16} weight="regular" aria-hidden="true" />
            <span>English</span>
          </span>
          {locale === "en" ? <span className="text-[var(--accent-strong)]">✓</span> : null}
        </a>
        <a
          role="menuitem"
          className={`lang-drawer-option ${locale === "zh" ? "lang-drawer-option-active" : ""}`}
          href={getCanonicalPath(path, "zh")}
          data-locale-option="zh"
        >
          <span className="flex items-center gap-2">
            <Globe size={16} weight="regular" aria-hidden="true" />
            <span>中文</span>
          </span>
          {locale === "zh" ? <span className="text-[var(--accent-strong)]">✓</span> : null}
        </a>
      </div>
    </div>
  );
}
