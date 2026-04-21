"use client";

import {
  Bug,
  Check,
  ClipboardText,
  ChartLineUp,
  CopySimple,
  DownloadSimple,
  HardDrives,
  Globe,
  Kanban,
  Moon,
  RocketLaunch,
  Sun,
  Timer,
  Sparkle,
  UsersThree,
  Translate,
} from "@phosphor-icons/react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { Locale } from "@/lib/locale";

type ThemeMode = "light" | "dark" | "system";
type QuickStartTabKey = "one-liner" | "npm";
type QuickStartPlatform = "macos" | "windows";
type QuickStartManager = "npm" | "pnpm";

const themeStorageKey = "moticlaw-theme";
const localeStorageKey = "moticlaw-locale";
const localeMenuOffset = 4;

const copy = {
  en: {
    nav: { start: "Quick Start", features: "Product Features", capabilities: "Capabilities", footer: "Contact" },
    headerBadge: "Built for local deployment, agent workspaces, and operator teams",
    heroTitle: "One place for agents.",
    heroBody: "An advanced multi-agent platform for building high-performing agent teams fast.",
    heroTag: "Supports OpenClaw · Hermes Agent",
    heroPlatformLabel: "Supported",
    primaryCta: "Quick start",
    secondaryCta: "See capabilities",
    statsSectionTitle: "Product Features",
    stats: [
      { title: "Local-first", body: "Runs on your device. Privacy stays yours.", icon: HardDrives },
      { title: "Team setup", body: "Build teams. Configure agents with ease.", icon: UsersThree },
      { title: "Brandable", body: "A clean shell for the public-facing story.", icon: Sparkle },
    ],
    heroVideo: {
      title: "Control plane overview",
    },
    quickStart: {
      eyebrow: "Quick Start",
      panelTitle: "Quick Start",
      title: "Two ways to start the site.",
      body: "A fast one-liner or the standard npm path. Keep it simple, keep it local.",
      tabs: [
        {
          key: "one-liner",
          label: "One-liner",
          kicker: "Fastest path",
          title: "Install and launch in one line.",
          body: "Best when you just want the site running locally without thinking about the install flow.",
          commands: ["curl -fsSL https://moticlaw.com/install.sh | bash"],
        },
        {
          key: "npm",
          label: "npm",
          kicker: "Standard path",
          title: "Use npm if that's your default.",
          body: "Keeps the flow familiar for anyone used to the npm toolchain.",
          commands: ["npm install -g moticlaw", "moticlaw status"],
        },
      ],
    },
    capabilities: {
      eyebrow: "Capabilities",
      title: "Same discipline as the reference site, but with MotiClaw's own operator language.",
      body: "The goal is to make the product understandable in one scroll: what it is, how to launch it, what it replaces, and why it deserves a dedicated homepage.",
      cards: [
        {
          title: "Agent workspace",
          body: "A grid of working agents with onboarding, identity, and runtime context in one place.",
          icon: Kanban,
        },
        {
          title: "Task board",
          body: "Create, assign, submit, and review work without leaving the console.",
          icon: ClipboardText,
        },
        {
          title: "Training loop",
          body: "Run onboarding, gate checks, and completion workflows as a repeatable system.",
          icon: Timer,
        },
        {
          title: "Ranked progress",
          body: "Track contribution, output, and confidence with a leaderboard built for operators.",
          icon: ChartLineUp,
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      links: [
        {
          title: "GitHub",
          body: "View the source",
          href: "https://github.com/mileson/moticlaw",
          kind: "github",
        },
        {
          title: "Issues",
          body: "Report feedback",
          href: "https://github.com/mileson/moticlaw/issues",
          kind: "issues",
        },
        {
          title: "Releases",
          body: "Track updates",
          href: "https://github.com/mileson/moticlaw/releases",
          kind: "releases",
        },
      ],
    },
    footer: "Designed for MotiClaw local ops, onboarding flows, and public-facing clarity.",
    footerNote: "One scroll. One story. One control plane.",
    controls: { language: "Language", theme: "Theme", light: "Light", dark: "Dark", switchTo: "Switch to" },
    copied: "Copied",
  },
  zh: {
    nav: { start: "快速开始", features: "产品特色", capabilities: "能力", footer: "联系" },
    headerBadge: "面向本地部署、Agent 工区和运营团队",
    heroTitle: "Agent 管理，\n一个平台就够。",
    heroBody: "先进的多 Agent 管理平台，让你即刻拥有高效 Agent 团队。",
    heroTag: "支持 OpenClaw · Hermes Agent",
    heroPlatformLabel: "支持",
    primaryCta: "快速开始",
    secondaryCta: "查看能力",
    statsSectionTitle: "产品特色",
    stats: [
      { title: "本地优先", body: "只运行在自己的设备上，我们尊重你的隐私。", icon: HardDrives },
      { title: "搭建多Agent团队", body: "一键组建多Agent团队，轻松配置Agent。", icon: UsersThree },
      { title: "可品牌化", body: "给对外故事留出干净的展示壳。", icon: Sparkle },
    ],
    heroVideo: {
      title: "控制面概览",
    },
    quickStart: {
      eyebrow: "快速开始",
      panelTitle: "快速开始",
      title: "两种启动方式。",
      body: "保留最常见的两条路径：一行启动，或者用 npm 标准启动。",
      tabs: [
        {
          key: "one-liner",
          label: "一键安装",
          kicker: "最快路径",
          title: "一键安装即可安装并启动。",
          body: "适合想最快把站点跑起来的时候，不需要额外思考安装顺序。",
          commands: ["curl -fsSL https://moticlaw.com/install.sh | bash"],
        },
        {
          key: "npm",
          label: "npm",
          kicker: "标准路径",
          title: "如果你习惯 npm，就用 npm。",
          body: "让本地启动流程保持熟悉，适合日常开发和切换环境。",
          commands: ["npm install -g moticlaw", "moticlaw status"],
        },
      ],
    },
    capabilities: {
      eyebrow: "能力",
      title: "控制面概览",
      body: "把本地部署、入职和对外表达收束到一个界面里。",
      cards: [
        {
          title: "Agent 工区",
          body: "把入职、身份和运行上下文放进同一视图。",
          icon: Kanban,
        },
        {
          title: "任务看板",
          body: "创建、分派、提交和复核都不需要离开控制台。",
          icon: ClipboardText,
        },
        {
          title: "训练闭环",
          body: "把 onboarding、门禁检查和完成流程做成可重复的系统。",
          icon: Timer,
        },
        {
          title: "进度排行",
          body: "用排行榜跟踪贡献、产出和信心。",
          icon: ChartLineUp,
        },
      ],
    },
    contact: {
      eyebrow: "联系",
      links: [
        {
          title: "GitHub",
          body: "查看源码",
          href: "https://github.com/mileson/moticlaw",
          kind: "github",
        },
        {
          title: "问题反馈",
          body: "提交 issue",
          href: "https://github.com/mileson/moticlaw/issues",
          kind: "issues",
        },
        {
          title: "版本发布",
          body: "查看更新",
          href: "https://github.com/mileson/moticlaw/releases",
          kind: "releases",
        },
      ],
    },
    footer: "MotiClaw.",
    footerNote: "",
    controls: { language: "语言", theme: "主题", light: "浅色", dark: "深色", switchTo: "切换为" },
    copied: "已复制",
  },
} as const;

function getSystemTheme(): Exclude<ThemeMode, "system"> {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getResolvedTheme(theme: ThemeMode): Exclude<ThemeMode, "system"> {
  return theme === "system" ? getSystemTheme() : theme;
}

function setThemeClass(theme: ThemeMode) {
  if (typeof document === "undefined") return;

  const resolved = getResolvedTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

function applyTheme(theme: ThemeMode) {
  setThemeClass(theme);
}

function BrandIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg sm:h-[46px] sm:w-[46px]">
      <img src="/icon.svg?v=3" alt="" aria-hidden="true" className="block h-full w-full object-contain" />
    </span>
  );
}

function ThemeIcon({ theme }: { theme: Exclude<ThemeMode, "system"> }) {
  return theme === "dark" ? <Moon size={16} weight="regular" aria-hidden="true" /> : <Sun size={16} weight="regular" aria-hidden="true" />;
}

export function MotiClawLanding({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [quickStartTab, setQuickStartTab] = useState<QuickStartTabKey>("one-liner");
  const [quickStartPlatform, setQuickStartPlatform] = useState<QuickStartPlatform>("macos");
  const [quickStartManager, setQuickStartManager] = useState<QuickStartManager>("pnpm");
  const [copyHintVisible, setCopyHintVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [heroVideoLoaded, setHeroVideoLoaded] = useState(false);
  const readyRef = useRef(false);
  const initialLocaleRef = useRef(initialLocale);
  const headerRef = useRef<HTMLElement | null>(null);
  const localeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);
  const [localeMenuRect, setLocaleMenuRect] = useState<{ top: number; right: number } | null>(null);
  const [backdropTop, setBackdropTop] = useState(88);
  const [headerPinned, setHeaderPinned] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const content = copy[locale];
  const activeQuickStartTab = content.quickStart.tabs.find((tab) => tab.key === quickStartTab) ?? content.quickStart.tabs[0];
  const quickStartCommands =
    quickStartTab === "one-liner"
      ? quickStartPlatform === "windows"
        ? [
            "Invoke-WebRequest https://moticlaw.com/install.ps1 -OutFile $env:TEMP\\moticlaw-install.ps1",
            "powershell -ExecutionPolicy Bypass -File $env:TEMP\\moticlaw-install.ps1",
          ]
        : ["curl -fsSL https://moticlaw.com/install.sh | bash"]
      : quickStartManager === "npm"
        ? ["npm install -g moticlaw", "moticlaw status"]
        : ["pnpm add -g moticlaw", "moticlaw status"];
  const quickStartNote = quickStartTab === "one-liner" ? (quickStartPlatform === "macos" ? "macOS & Linux" : "Windows") : quickStartManager;
  const resolvedTheme = isMounted ? getResolvedTheme(theme) : "light";
  const themeLabel = useMemo(() => {
    return resolvedTheme === "dark" ? content.controls.dark : content.controls.light;
  }, [content.controls.dark, content.controls.light, resolvedTheme]);

  const closeLocaleMenu = () => setLocaleMenuOpen(false);
  const updateLocaleMenuRect = () => {
    const button = localeButtonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setLocaleMenuRect({
      top: rect.bottom + localeMenuOffset,
      right: Math.max(16, window.innerWidth - rect.right),
    });
  };

  const updateBackdropTop = () => {
    const header = headerRef.current;
    if (!header) return;

    const rect = header.getBoundingClientRect();
    setBackdropTop(Math.round(rect.bottom + localeMenuOffset));
  };

  const openLocaleMenu = () => {
    updateBackdropTop();
    updateLocaleMenuRect();
    setLocaleMenuOpen(true);
  };

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const currentResolved = getResolvedTheme(theme);
    const nextTheme: Exclude<ThemeMode, "system"> = currentResolved === "dark" ? "light" : "dark";
    const disableFancyTransition = window.innerWidth < 768;

    if (
      typeof document === "undefined" ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      disableFancyTransition
    ) {
      applyTheme(nextTheme);
      setTheme(nextTheme);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    requestAnimationFrame(() => {
      const transition = document.startViewTransition(() => {
        flushSync(() => {
          applyTheme(nextTheme);
          setTheme(nextTheme);
        });
      });

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 420,
              easing: "ease-out",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});
    });
  };

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(localeStorageKey);
    const browserLocale = window.navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
    const nextLocale = storedLocale === "zh" || storedLocale === "en" ? storedLocale : browserLocale;
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    if (nextLocale !== initialLocaleRef.current) {
      queueMicrotask(() => setLocale(nextLocale));
    }

    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      queueMicrotask(() => setTheme(storedTheme));
    }

    readyRef.current = true;
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!readyRef.current) return;
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  useEffect(() => {
    if (!readyRef.current) return;

    window.localStorage.setItem(themeStorageKey, theme);
    setThemeClass(theme);

    if (theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setThemeClass("system");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    if (!localeMenuOpen) return;

    const onResize = () => updateLocaleMenuRect();
    const onLayout = () => {
      updateBackdropTop();
      updateLocaleMenuRect();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLocaleMenu();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("resize", onResize);
    window.addEventListener("resize", onLayout);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", onResize);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [localeMenuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const updateCompactViewport = () => setIsCompactViewport(media.matches);
    updateCompactViewport();
    media.addEventListener("change", updateCompactViewport);
    return () => media.removeEventListener("change", updateCompactViewport);
  }, []);

  useEffect(() => {
    const onScroll = () => setHeaderPinned(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleQuickStartTabChange = (tab: QuickStartTabKey) => {
    setQuickStartTab(tab);
    if (tab === "npm") {
      setQuickStartManager("npm");
    }
  };

  const renderContactIcon = (kind: "github" | "issues" | "releases") => {
    if (kind === "github") {
      return (
        <img
          src={resolvedTheme === "dark" ? "/brand/github-invertocat-white.svg" : "/brand/github-invertocat-black.svg"}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      );
    }

    if (kind === "issues") {
      return <Bug size={28} weight="regular" aria-hidden="true" />;
    }

    return <DownloadSimple size={28} weight="regular" aria-hidden="true" />;
  };

  return (
    <main className="site-shell relative overflow-x-hidden">
      <div
        className={`site-header-shell fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow,backdrop-filter,border-color] duration-300 ${
          headerPinned || isCompactViewport
            ? "border-b border-[var(--line)] bg-[var(--surface-strong)]/70 shadow-[0_6px_18px_rgba(0,0,0,0.04)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent shadow-none backdrop-blur-0"
        }`}
      >
        <header
          ref={headerRef}
          className="site-header mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-8 lg:px-10"
        >
          <a href="#top" className="site-header-brand flex items-center gap-3">
            <BrandIcon />
            <div className="leading-tight">
              <p className="site-header-brand-title display text-[0.9rem] font-semibold tracking-[0.15em] text-[var(--accent-strong)] sm:text-[1.04rem] sm:tracking-[0.2em]">
                MotiClaw
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-10 text-sm text-[var(--muted)] md:flex lg:gap-12">
            <a className="nav-link text-[var(--muted)]" href="#quick-start">
              {content.nav.start}
            </a>
            <a className="nav-link text-[var(--muted)]" href="#product-features">
              {content.nav.features}
            </a>
            <a className="nav-link text-[var(--muted)]" href="#capabilities">
              {content.nav.capabilities}
            </a>
            <a className="nav-link text-[var(--muted)]" href="#footer">
              {content.nav.footer}
            </a>
          </nav>

          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-base btn-secondary btn-icon header-icon-btn"
              title={`${content.controls.theme}: ${themeLabel}`}
            >
              <ThemeIcon theme={resolvedTheme} />
            </button>

            <button
              type="button"
              ref={localeButtonRef}
              onClick={() => {
                if (localeMenuOpen) {
                  closeLocaleMenu();
                  return;
                }
                openLocaleMenu();
              }}
              className="btn-base btn-compact btn-icon header-icon-btn"
              title={`${content.controls.switchTo} ${locale === "zh" ? "English" : "中文"}`}
              aria-haspopup="menu"
              aria-expanded={localeMenuOpen}
            >
              <Translate size={22} weight="regular" aria-hidden="true" />
            </button>

            <a
              href="#quick-start"
              className="header-desktop-cta btn-base btn-primary ml-2 min-w-[11.375rem] justify-center"
            >
              <RocketLaunch size={16} weight="regular" aria-hidden="true" />
              {content.primaryCta}
            </a>
          </div>
        </header>
      </div>

      <div className="site-page-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pt-[4.75rem] pb-8 sm:px-8 sm:pt-16 lg:px-10">
        {localeMenuOpen && localeMenuRect && typeof document !== "undefined"
          ? createPortal(
              <>
                <button
                  type="button"
                  className="lang-drawer-top-catcher"
                  aria-label="Close language menu"
                  onClick={closeLocaleMenu}
                  style={{ height: `${backdropTop}px` }}
                />
                <button
                  type="button"
                  className="lang-drawer-backdrop"
                  aria-label="Close language menu"
                  onClick={closeLocaleMenu}
                  style={{ top: `${backdropTop}px` }}
                />
                <div
                  className="lang-drawer-panel"
                  style={{
                    top: `${localeMenuRect.top}px`,
                    right: `${localeMenuRect.right}px`,
                  }}
                  role="menu"
                  aria-label={content.controls.language}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={`lang-drawer-option ${locale === "en" ? "lang-drawer-option-active" : ""}`}
                    onClick={() => {
                      setLocale("en");
                      closeLocaleMenu();
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={16} weight="regular" aria-hidden="true" />
                      <span>English</span>
                    </span>
                    {locale === "en" ? <Check size={16} weight="bold" className="text-[var(--accent-strong)]" aria-hidden="true" /> : null}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={`lang-drawer-option ${locale === "zh" ? "lang-drawer-option-active" : ""}`}
                    onClick={() => {
                      setLocale("zh");
                      closeLocaleMenu();
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={16} weight="regular" aria-hidden="true" />
                      <span>中文</span>
                    </span>
                    {locale === "zh" ? <Check size={16} weight="bold" className="text-[var(--accent-strong)]" aria-hidden="true" /> : null}
                  </button>
                </div>
              </>,
              document.body,
            )
          : null}

        <section id="top" className="hero-section grid flex-1 gap-8 pb-10 pt-4 sm:gap-12 sm:pb-16 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pb-24 lg:pt-16">
          <div className="hero-copy fade-up space-y-6 lg:pl-8 xl:pl-12" style={{ animationDelay: "60ms" }}>
            <div className="space-y-5">
              <h1 className="hero-title display max-w-4xl whitespace-pre-line text-[clamp(2.6rem,11vw,4rem)] leading-[1.02] font-semibold text-[var(--foreground)] sm:leading-[1.04] sm:text-6xl lg:text-7xl">
                {content.heroTitle}
              </h1>
              <p className="hero-subtitle max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-xl sm:leading-8">{content.heroBody}</p>
              <div className="hero-actions flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-start sm:gap-5">
                <div className="hero-platform-strip inline-flex items-center gap-2 rounded-full py-2">
                  <span className="hero-platform-strip-label text-[0.8rem] font-medium tracking-[0.08em]">{content.heroPlatformLabel}</span>
                  <a
                    href="https://openclaw.ai/"
                    target="_blank"
                    rel="noreferrer"
                    className="hero-platform-pill"
                    title="OpenClaw"
                    aria-label="OpenClaw"
                  >
                    <img src="/brand/openclaw.svg" alt="" aria-hidden="true" className="hero-platform-icon" />
                  </a>
                  <a
                    href="https://hermes-agent.nousresearch.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="hero-platform-pill"
                    title="Hermes Agent"
                    aria-label="Hermes Agent"
                  >
                    <img src="/brand/hermes-agent.png" alt="" aria-hidden="true" className="hero-platform-icon hero-platform-icon-rounded" />
                  </a>
                </div>
                <a
                  href="#quick-start"
                  className="hero-primary-cta btn-base btn-primary shrink-0 min-w-[11.375rem] justify-center px-7 py-4"
                >
                  <RocketLaunch size={16} weight="regular" aria-hidden="true" />
                  {content.primaryCta}
                </a>
              </div>
            </div>

          </div>

          <div className="fade-up relative" style={{ animationDelay: "180ms" }}>
            <div className="hero-video-frame hero-video-motion ml-auto overflow-hidden rounded-[1.5rem]">
              <div className="hero-video-stage">
                <div
                  aria-hidden="true"
                  className={`hero-video-placeholder${heroVideoLoaded ? " hero-video-placeholder-hidden" : ""}`}
                />
                <video
                  className="hero-video"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={content.heroVideo.title}
                  onLoadedData={() => setHeroVideoLoaded(true)}
                  onCanPlay={() => setHeroVideoLoaded(true)}
                >
                  <source src="/videos/hero-right.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </section>

        <div className="content-stream">
          <section id="quick-start" className="fade-up scroll-mt-24 pb-14" style={{ animationDelay: "220ms" }}>
          <p className="quickstart-section-eyebrow mb-7 text-center">{content.quickStart.eyebrow}</p>
          <div className="quickstart-shell">
            <article className="quickstart-window">
              <div className="quickstart-window-bar">
                <div className="quickstart-window-left">
                  <div className="quickstart-window-dots" aria-hidden="true">
                    <span className="quickstart-window-dot quickstart-window-dot-red" />
                    <span className="quickstart-window-dot quickstart-window-dot-yellow" />
                    <span className="quickstart-window-dot quickstart-window-dot-green" />
                  </div>

                  <div className="quickstart-tabs" role="tablist" aria-label={content.quickStart.eyebrow}>
                    {content.quickStart.tabs.map((tab) => {
                      const active = tab.key === quickStartTab;

                      return (
                        <button
                          key={tab.key}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`quickstart-tab ${active ? "quickstart-tab-active" : ""}`}
                          onClick={() => handleQuickStartTabChange(tab.key)}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="quickstart-window-right">
                  {quickStartTab === "one-liner" ? (
                    <div className="quickstart-tabs quickstart-tabs-compact" role="tablist" aria-label="Platform">
                      {[
                        { key: "macos", label: "macOS & Linux" },
                        { key: "windows", label: "Windows" },
                      ].map((item) => {
                        const active = item.key === quickStartPlatform;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`quickstart-tab ${active ? "quickstart-tab-active" : ""}`}
                            onClick={() => setQuickStartPlatform(item.key as QuickStartPlatform)}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="quickstart-tabs quickstart-tabs-compact" role="tablist" aria-label="Package manager">
                      {[
                        { key: "npm", label: "npm" },
                        { key: "pnpm", label: "pnpm" },
                      ].map((item) => {
                        const active = item.key === quickStartManager;

                        return (
                          <button
                            key={item.key}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`quickstart-tab ${active ? "quickstart-tab-active" : ""}`}
                            onClick={() => setQuickStartManager(item.key as QuickStartManager)}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

              <div className="quickstart-window-body">
                <div className="quickstart-command-shell">
                  <div className="quickstart-command-list" aria-label={activeQuickStartTab.label}>
                    <p className="quickstart-command-note"># {quickStartNote}</p>
                    <div className="quickstart-command-row">
                      <div className="quickstart-command-lines">
                        {quickStartCommands.map((command) => (
                          <div key={command} className="quickstart-command-line">
                            <span className="quickstart-command-prompt">$</span>
                            <span className="quickstart-command-text">{command}</span>
                          </div>
                        ))}
                      </div>

                      <div className="quickstart-copy-wrap">
                        <button
                          type="button"
                          className="quickstart-copy-button"
                          aria-label="Copy command"
                          title="Copy"
                          onClick={() => {
                            void navigator.clipboard.writeText(quickStartCommands.join("\n"));
                            setCopyHintVisible(true);
                            window.setTimeout(() => setCopyHintVisible(false), 1200);
                          }}
                        >
                          <CopySimple size={16} weight="regular" aria-hidden="true" />
                        </button>
                        {copyHintVisible ? <span className="quickstart-copy-hint text-white">{content.copied}</span> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="product-features" className="fade-up scroll-mt-24 pb-14" style={{ animationDelay: "260ms" }}>
          <p className="section-eyebrow-lg mb-7 text-center">{content.statsSectionTitle}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {content.stats.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-[var(--accent-strong)] leading-none">
                  <item.icon size={27} weight="regular" className="block" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

          <section id="capabilities" className="fade-up scroll-mt-24 py-16" style={{ animationDelay: "280ms" }}>
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4">
              <p className="section-eyebrow-lg">{content.capabilities.eyebrow}</p>
              <h2 className="display text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">{content.capabilities.title}</h2>
              <p className="max-w-xl text-base leading-7 text-[var(--muted)]">{content.capabilities.body}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {content.capabilities.cards.map((item) => (
                <article key={item.title} className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl text-[var(--accent-strong)] leading-none">
                    <item.icon size={27} weight="regular" className="block" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="footer" className="fade-up scroll-mt-24 py-16" style={{ animationDelay: "340ms" }}>
          <p className="section-eyebrow-lg mb-7 text-center">{content.contact.eyebrow}</p>
          <div className="contact-grid mx-auto grid max-w-[50rem] gap-3 justify-items-center md:grid-cols-2 lg:grid-cols-3">
            {content.contact.links.map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="contact-link-card group relative grid aspect-square w-full max-w-[11.4rem] place-items-center overflow-hidden rounded-[1.35rem] border border-[rgba(22,29,44,0.08)] bg-[rgba(255,255,255,0.72)] px-3 py-3 text-center shadow-[0_10px_28px_rgba(23,20,17,0.07)] backdrop-blur-[10px] transition duration-200 hover:-translate-y-1 hover:border-[rgba(228,145,92,0.3)] hover:shadow-[0_16px_36px_rgba(23,20,17,0.11)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18%_30%,rgba(23,20,17,0.08)_0_1.5px,transparent_3px),radial-gradient(circle_at_74%_22%,rgba(228,145,92,0.12)_0_1.5px,transparent_3px),radial-gradient(circle_at_82%_68%,rgba(23,20,17,0.06)_0_1px,transparent_2px),radial-gradient(circle_at_22%_80%,rgba(228,145,92,0.1)_0_1px,transparent_2px)] dark:opacity-35 dark:[background-image:radial-gradient(circle_at_18%_30%,rgba(255,255,255,0.12)_0_1.5px,transparent_3px),radial-gradient(circle_at_74%_22%,rgba(255,179,109,0.1)_0_1.5px,transparent_3px),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.08)_0_1px,transparent_2px),radial-gradient(circle_at_22%_80%,rgba(255,179,109,0.08)_0_1px,transparent_2px)]"
                />
                <span className="relative flex h-full w-full flex-col items-center justify-center">
                  <span
                    className={`grid h-[2.35rem] w-[2.35rem] place-items-center rounded-full ${item.kind === "github" ? "bg-[rgba(239,123,67,0.14)] text-[var(--accent-strong)] dark:bg-[rgba(255,179,109,0.12)] dark:text-[var(--accent-strong)]" : "bg-[rgba(239,123,67,0.1)] text-[var(--accent-strong)] dark:bg-[rgba(255,179,109,0.1)] dark:text-[var(--accent-strong)]"}`}
                  >
                    <span className={item.kind === "github" ? "h-[1.35rem] w-[1.35rem]" : ""}>
                      {renderContactIcon(item.kind)}
                    </span>
                  </span>
                  <span className="mt-2 block text-[1rem] font-semibold tracking-[-0.04em] text-[var(--foreground)] md:text-[1.05rem]">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[0.78rem] leading-[1.35] text-[var(--muted)] md:text-[0.82rem]">
                    {item.body}
                  </span>
                </span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex justify-center text-sm text-[var(--muted)]">
            <p>
              Build by{" "}
              <a
                href="https://x.com/Mileson07"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-strong)" }}
                className="font-medium transition-opacity hover:opacity-80"
              >
                超级峰
              </a>
            </p>
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
