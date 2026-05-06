"use client";

import {
  Bug,
  CaretDown,
  ChartBar,
  Check,
  CopySimple,
  CursorClick,
  DownloadSimple,
  HardDrives,
  Globe,
  Info,
  Kanban,
  LinuxLogo,
  Moon,
  Package,
  ShieldCheck,
  Sliders,
  Sun,
  Translate,
  WindowsLogo,
  Wrench,
  X,
} from "@phosphor-icons/react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import type { Locale } from "@/lib/locale";
import {
  fallbackReleaseManifest,
  githubLatestReleaseUrl,
  type PlatformGroup,
  type PlatformKey,
  type ReleaseArtifact,
  type ReleaseManifest,
} from "@/lib/release-manifest";

type ThemeMode = "light" | "dark" | "system";
type DetectedOs = "mac" | "win" | "linux" | "unknown";
type DetectedArch = "arm64" | "x64" | "unknown";
type ReleaseDownloadExtension = "dmg" | "exe" | "appimage" | "deb" | "rpm";
type DetectedPlatform = {
  os: DetectedOs;
  arch: DetectedArch;
};
type UserAgentDataLike = {
  platform?: string;
  getHighEntropyValues?: (hints: Array<"architecture" | "bitness">) => Promise<{
    architecture?: string;
    bitness?: string;
  }>;
};
type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: UserAgentDataLike;
};
/*
 * Hidden while the public desktop release is macOS Apple Silicon-only.
 * Restore these together with the tab UI once all platform packages are ready.
 *
 * type QuickStartTabKey = "one-liner" | "npm";
 * type QuickStartPlatform = "macos" | "windows";
 * type QuickStartManager = "npm" | "pnpm";
 */

const themeStorageKey = "moticlaw-theme";
const localeStorageKey = "moticlaw-locale";
const localeMenuOffset = 4;

const platformGroups: PlatformGroup[] = ["macos", "windows", "linux"];
const platformOptions: Array<{ key: PlatformKey; group: PlatformGroup }> = [
  { key: "darwin-x64", group: "macos" },
  { key: "windows-x64", group: "windows" },
  { key: "windows-arm64", group: "windows" },
  { key: "linux-deb-x64", group: "linux" },
  { key: "linux-deb-arm64", group: "linux" },
  { key: "linux-appimage-x64", group: "linux" },
  { key: "linux-appimage-arm64", group: "linux" },
  { key: "linux-rpm-x64", group: "linux" },
];
const recommendedPlatformOptions: Array<{ key: PlatformKey; group: PlatformGroup }> = [
  { key: "darwin-arm64", group: "macos" },
  ...platformOptions,
];
const pendingPlatformGroups = new Set<PlatformGroup>(["windows", "linux"]);
const downloadablePlatformOptions = recommendedPlatformOptions.filter((option) => !pendingPlatformGroups.has(option.group));
const fallbackPlatformKey: PlatformKey = "darwin-arm64";
const defaultDetectedPlatform: DetectedPlatform = { os: "mac", arch: "arm64" };

const copy = {
  en: {
    nav: { start: "Install", features: "Product Features", capabilities: "Capabilities", footer: "Contact" },
    headerBadge: "Built for local deployment, agent workspaces, and operator teams",
    heroTitle: "Install MotiClaw locally.\nRun your agent team now.",
    heroBody: "Download the local-first agent control plane, set it up on your own device, and start managing OpenClaw and Hermes Agent workspaces without a long setup path.",
    heroTag: "Supports OpenClaw · Hermes Agent",
    heroPlatformLabel: "Supported",
    primaryCta: "Download",
    secondaryCta: "See capabilities",
    releaseBadge: "Latest macOS installer available",
    statsSectionTitle: "Product Features",
    stats: [
      { title: "Local-first", body: "Your data and agents run on your own device — no third-party servers involved.", icon: HardDrives },
      { title: "Agents, ready to go", body: "Hundreds of pre-configured agents built in. Claim one and it's working — no setup from scratch.", icon: Package },
      { title: "Zero learning curve", body: "No technical background needed. A few clicks to install, configure, and maintain.", icon: CursorClick },
    ],
    heroVideo: {
      title: "Control plane overview",
    },
    quickStart: {
      eyebrow: "Quick Start",
      panelTitle: "Quick Start",
      title: "macOS Apple Silicon installer.",
      body: "The download points to the latest GitHub Release. Use the button for the installer, or run the command to save the package locally.",
      assetLabel: "macOS Apple Silicon",
      commandNote: "Latest macOS package",
      commands: ["curl -L -o MotiClaw.dmg https://github.com/mileson/moticlaw/releases/latest"],
      /*
       * Hidden until the remaining release packages are rebuilt:
       *
       * tabs: [
       *   {
       *     key: "one-liner",
       *     label: "One-liner",
       *     kicker: "Fastest path",
       *     title: "Install and launch in one line.",
       *     body: "Best when you just want the site running locally without thinking about the install flow.",
       *     commands: ["curl -fsSL https://moticlaw.com/install.sh | bash"],
       *   },
       *   {
       *     key: "npm",
       *     label: "npm",
       *     kicker: "Standard path",
       *     title: "Use npm if that's your default.",
       *     body: "Keeps the flow familiar for anyone used to the npm toolchain.",
       *     commands: ["npm install -g moticlaw", "moticlaw status"],
       *   },
       * ],
       */
    },
    capabilities: {
      eyebrow: "Capabilities",
      title: "",
      body: "From installation to daily operations, from agent onboarding to full lifecycle management — one interface to get it all done.",
      cards: [
        {
          title: "Agent workspace",
          body: "Onboarding, identity, runtime status, channel access — manage the full agent lifecycle in one view.",
          icon: Kanban,
        },
        {
          title: "One-click ops",
          body: "Install, repair, restart, update — one click, done. No commands to remember.",
          icon: Wrench,
        },
        {
          title: "Flexible config",
          body: "AI models, gateway, system parameters — a visual config panel that keeps every setting clear and in control.",
          icon: Sliders,
        },
        {
          title: "Data insights",
          body: "Token usage, call frequency, cost trends — multi-dimensional data at a glance.",
          icon: ChartBar,
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
    download: {
      title: "Download MotiClaw",
      released: "Released on",
      detected: "Detected device",
      recommended: "Recommended download",
      installNote: "On first launch, go to System Settings -> Privacy & Security and allow the app to open.",
      unavailable: "Coming soon",
      otherPlatforms: "Other platforms",
      githubRelease: "View GitHub Release",
      copyCommand: "Copy command",
      close: "Close download dialog",
      size: "Size",
      groups: { macos: "macOS", windows: "Windows", linux: "Linux" },
      platforms: {
        "darwin-arm64": "macOS Apple Silicon",
        "darwin-x64": "macOS (Intel)",
        "windows-x64": "Windows (x64)",
        "windows-arm64": "Windows (ARM64)",
        "linux-deb-x64": "Linux .deb (x64)",
        "linux-deb-arm64": "Linux .deb (ARM64)",
        "linux-appimage-x64": "Linux AppImage (x64)",
        "linux-appimage-arm64": "Linux AppImage (ARM64)",
        "linux-rpm-x64": "Linux .rpm (x64)",
      },
      unknownDevice: "Unknown",
    },
  },
  zh: {
    nav: { start: "安装", features: "产品特色", capabilities: "能力", footer: "联系" },
    headerBadge: "面向本地部署、Agent 工区和运营团队",
    heroTitle: "本地安装 MotiClaw，\n即刻运行 Agent 团队。",
    heroBody: "下载本地优先的 Agent 控制面，安装到自己的设备上，就能开始管理 OpenClaw 和 Hermes Agent 工区。",
    heroTag: "支持 OpenClaw · Hermes Agent",
    heroPlatformLabel: "支持",
    primaryCta: "下载安装",
    secondaryCta: "查看能力",
    releaseBadge: "最新版 macOS 安装包已开放",
    statsSectionTitle: "产品特色",
    stats: [
      { title: "本地优先", body: "数据和 Agent 都运行在你自己的设备上，不经过任何第三方服务器。", icon: HardDrives },
      { title: "Agent 开箱即用", body: "内置上百个预配置 Agent，一键领取就能上岗，不用从零搭建。", icon: Package },
      { title: "零门槛管理", body: "不需要技术背景，点几下就能完成安装、配置和日常运维。", icon: CursorClick },
    ],
    heroVideo: {
      title: "控制面概览",
    },
    quickStart: {
      eyebrow: "快速开始",
      panelTitle: "快速开始",
      title: "macOS Apple Silicon 安装包。",
      body: "下载入口会指向 GitHub Release 的最新版本。你可以点击按钮下载安装包，也可以用命令保存到本地。",
      assetLabel: "macOS Apple Silicon",
      commandNote: "最新 macOS 安装包",
      commands: ["curl -L -o MotiClaw.dmg https://github.com/mileson/moticlaw/releases/latest"],
      /*
       * 其他平台补齐前先隐藏：
       *
       * tabs: [
       *   {
       *     key: "one-liner",
       *     label: "一键安装",
       *     kicker: "最快路径",
       *     title: "一键安装即可安装并启动。",
       *     body: "适合想最快把站点跑起来的时候，不需要额外思考安装顺序。",
       *     commands: ["curl -fsSL https://moticlaw.com/install.sh | bash"],
       *   },
       *   {
       *     key: "npm",
       *     label: "npm",
       *     kicker: "标准路径",
       *     title: "如果你习惯 npm，就用 npm。",
       *     body: "让本地启动流程保持熟悉，适合日常开发和切换环境。",
       *     commands: ["npm install -g moticlaw", "moticlaw status"],
       *   },
       * ],
       */
    },
    capabilities: {
      eyebrow: "能力",
      title: "",
      body: "从安装部署到日常运维，从 Agent 入职到全周期管理，一个界面全搞定。",
      cards: [
        {
          title: "Agent 工区",
          body: "入职、身份、运行状态、渠道接入——一个视图管理 Agent 的全生命周期。",
          icon: Kanban,
        },
        {
          title: "一键管理",
          body: "安装、修复、重启、更新，点一下就完成，不用记任何命令。",
          icon: Wrench,
        },
        {
          title: "灵活配置",
          body: "AI 模型、网关、系统参数，可视化配置面板让每项设置都清晰可控。",
          icon: Sliders,
        },
        {
          title: "数据可视分析",
          body: "Token 消耗、调用频次、成本趋势，多维度数据一目了然。",
          icon: ChartBar,
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
    download: {
      title: "下载 MotiClaw",
      released: "发布于",
      detected: "检测到你的设备",
      recommended: "推荐下载",
      installNote: "首次启动时，请前往“系统设置”→“隐私与安全性”，允许打开应用。",
      unavailable: "即将开放",
      otherPlatforms: "其它平台",
      githubRelease: "查看 GitHub Release",
      copyCommand: "复制命令",
      close: "关闭下载弹窗",
      size: "大小",
      groups: { macos: "macOS", windows: "Windows", linux: "Linux" },
      platforms: {
        "darwin-arm64": "macOS Apple Silicon",
        "darwin-x64": "macOS (Intel)",
        "windows-x64": "Windows (x64)",
        "windows-arm64": "Windows (ARM64)",
        "linux-deb-x64": "Linux .deb (x64)",
        "linux-deb-arm64": "Linux .deb (ARM64)",
        "linux-appimage-x64": "Linux AppImage (x64)",
        "linux-appimage-arm64": "Linux AppImage (ARM64)",
        "linux-rpm-x64": "Linux .rpm (x64)",
      },
      unknownDevice: "未知设备",
    },
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

function formatReleaseDate(value: string | undefined, locale: Locale) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatBytes(value: number | undefined) {
  if (!value) return "";
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

async function fetchReleaseManifest(signal: AbortSignal): Promise<ReleaseManifest> {
  const response = await fetch("/api/releases/latest", {
    cache: "no-store",
    signal,
  });

  if (response.ok) {
    const manifest = (await response.json()) as ReleaseManifest;
    if (Object.keys(manifest.artifacts).length > 0) return manifest;
  }

  return fallbackReleaseManifest;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function detectOperatingSystem(userAgent: string, platform: string, userAgentDataPlatform: string): DetectedOs {
  const combinedPlatform = `${userAgentDataPlatform} ${platform}`.toLowerCase();

  if (userAgent.includes("mac") || combinedPlatform.includes("mac")) return "mac";
  if (userAgent.includes("win") || combinedPlatform.includes("win")) return "win";
  if (userAgent.includes("linux") || combinedPlatform.includes("linux")) return "linux";
  return "unknown";
}

function normalizeArchitecture(architecture: string | undefined, bitness: string | undefined): DetectedArch {
  const arch = (architecture ?? "").toLowerCase();
  const bits = (bitness ?? "").toLowerCase();

  if (arch === "arm") return bits === "32" ? "unknown" : "arm64";
  if (arch === "x86") return bits === "32" ? "unknown" : "x64";
  if (arch === "arm64" || arch === "aarch64") return "arm64";
  if (arch === "x64" || arch === "x86_64" || arch === "amd64") return "x64";
  return "unknown";
}

function detectArchitectureFromUserAgent(userAgent: string, platform: string): DetectedArch {
  const combined = `${userAgent} ${platform}`.toLowerCase();

  if (/(^|[\s_/-])(arm64|aarch64|armv8)([\s_/-]|$)|\barm\b/.test(combined)) return "arm64";
  if (/\b(x86_64|amd64|x64|wow64|win64)\b/.test(combined) || combined.includes("intel")) return "x64";
  return "unknown";
}

function detectMacArchitectureFromWebGl(): DetectedArch {
  if (typeof document === "undefined") return "unknown";

  try {
    const canvas = document.createElement("canvas");
    const context = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    const isWebGlContext = typeof WebGLRenderingContext === "undefined" || context instanceof WebGLRenderingContext;
    if (!context || !isWebGlContext) return "unknown";

    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "unknown";

    const renderer = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    if (typeof renderer !== "string") return "unknown";

    const normalizedRenderer = renderer.toLowerCase();
    if (normalizedRenderer.includes("apple")) return "arm64";
    if (normalizedRenderer.includes("intel") || normalizedRenderer.includes("amd") || normalizedRenderer.includes("radeon")) return "x64";
  } catch {
    return "unknown";
  }

  return "unknown";
}

async function detectPlatform(): Promise<DetectedPlatform> {
  if (typeof window === "undefined") return defaultDetectedPlatform;

  const navigatorWithUaData = window.navigator as NavigatorWithUserAgentData;
  const userAgent = navigatorWithUaData.userAgent.toLowerCase();
  const platform = (navigatorWithUaData.platform || "").toLowerCase();
  const userAgentDataPlatform = (navigatorWithUaData.userAgentData?.platform || "").toLowerCase();
  const os = detectOperatingSystem(userAgent, platform, userAgentDataPlatform);

  if (os === "unknown") return { os, arch: "unknown" };

  let arch: DetectedArch = "unknown";
  if (typeof navigatorWithUaData.userAgentData?.getHighEntropyValues === "function") {
    try {
      const values = await navigatorWithUaData.userAgentData.getHighEntropyValues(["architecture", "bitness"]);
      arch = normalizeArchitecture(values.architecture, values.bitness);
    } catch {
      arch = "unknown";
    }
  }

  if (arch === "unknown" && os === "mac") {
    arch = detectMacArchitectureFromWebGl();
  }

  if (arch === "unknown") {
    arch = detectArchitectureFromUserAgent(userAgent, platform);
  }

  return { os, arch };
}

function downloadExtensionsForOs(os: DetectedOs): ReleaseDownloadExtension[] {
  if (os === "mac") return ["dmg"];
  if (os === "win") return ["exe"];
  if (os === "linux") return ["appimage", "deb", "rpm"];
  return [];
}

function groupForDetectedOs(os: DetectedOs): PlatformGroup | null {
  if (os === "mac") return "macos";
  if (os === "win") return "windows";
  if (os === "linux") return "linux";
  return null;
}

function architectureFallbacks(arch: DetectedArch): Array<Exclude<DetectedArch, "unknown">> {
  if (arch === "unknown") return ["x64", "arm64"];
  return arch === "x64" ? ["x64", "arm64"] : ["arm64", "x64"];
}

function platformKeyForDetectedDownload(os: DetectedOs, arch: Exclude<DetectedArch, "unknown">, extension: ReleaseDownloadExtension): PlatformKey | null {
  if (os === "mac" && extension === "dmg") return arch === "arm64" ? "darwin-arm64" : "darwin-x64";
  if (os === "win" && extension === "exe") return arch === "arm64" ? "windows-arm64" : "windows-x64";
  if (os === "linux" && extension === "deb") return arch === "arm64" ? "linux-deb-arm64" : "linux-deb-x64";
  if (os === "linux" && extension === "appimage") return arch === "arm64" ? "linux-appimage-arm64" : "linux-appimage-x64";
  if (os === "linux" && extension === "rpm" && arch === "x64") return "linux-rpm-x64";
  return null;
}

function candidateDownloadsForDetectedPlatform(detectedPlatform: DetectedPlatform) {
  const candidates: Array<{ key: PlatformKey; extension: ReleaseDownloadExtension }> = [];

  for (const extension of downloadExtensionsForOs(detectedPlatform.os)) {
    for (const arch of architectureFallbacks(detectedPlatform.arch)) {
      const key = platformKeyForDetectedDownload(detectedPlatform.os, arch, extension);
      if (key) candidates.push({ key, extension });
    }
  }

  return candidates;
}

function archiveExtension(archive: ReleaseArtifact["archive"] | undefined): ReleaseDownloadExtension | null {
  const filename = archive?.filename?.toLowerCase() ?? "";

  if (filename.endsWith(".dmg")) return "dmg";
  if (filename.endsWith(".exe")) return "exe";
  if (filename.includes("appimage")) return "appimage";
  if (filename.endsWith(".deb")) return "deb";
  if (filename.endsWith(".rpm")) return "rpm";
  return null;
}

function getDetectedPlatformLabel(detectedPlatform: DetectedPlatform, downloadCopy: (typeof copy)[Locale]["download"]) {
  const group = groupForDetectedOs(detectedPlatform.os);
  if (!group) return downloadCopy.unknownDevice;
  if (detectedPlatform.arch === "unknown") return downloadCopy.groups[group];

  const firstCandidate = candidateDownloadsForDetectedPlatform(detectedPlatform)[0];
  if (firstCandidate && firstCandidate.key in downloadCopy.platforms) {
    return downloadCopy.platforms[firstCandidate.key];
  }

  return detectedPlatform.arch === "arm64" ? `${downloadCopy.groups[group]} (ARM64)` : `${downloadCopy.groups[group]} (x64)`;
}

function getAvailablePlatformKey(manifest: ReleaseManifest, detectedPlatform: DetectedPlatform) {
  const downloadableKeys = new Set(downloadablePlatformOptions.map((option) => option.key));

  for (const candidate of candidateDownloadsForDetectedPlatform(detectedPlatform)) {
    const archive = manifest.artifacts[candidate.key]?.archive;
    if (downloadableKeys.has(candidate.key) && archive?.url && archiveExtension(archive) === candidate.extension) {
      return candidate.key;
    }
  }

  const detectedGroup = groupForDetectedOs(detectedPlatform.os);
  if (detectedGroup) {
    const extensions = downloadExtensionsForOs(detectedPlatform.os);

    for (const extension of extensions) {
      const fallbackOption = downloadablePlatformOptions.find((option) => {
        const archive = manifest.artifacts[option.key]?.archive;
        return option.group === detectedGroup && archive?.url && archiveExtension(archive) === extension;
      });

      if (fallbackOption) return fallbackOption.key;
    }
  }

  return downloadablePlatformOptions.find((option) => manifest.artifacts[option.key]?.archive?.url)?.key ?? fallbackPlatformKey;
}

function BrandIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg sm:h-[46px] sm:w-[46px]">
      <img src="/icon.svg?v=3" alt="" aria-hidden="true" className="block h-full w-full object-contain" />
    </span>
  );
}

function AppleOutlineIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 224 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M159.7 28c-4.7 13.6-15.5 25.9-28.1 31.7-7.1 3.3-14.4 4.7-21.4 4.1 2.7-14.1 11.8-27.4 24.2-35.1C141.9 24 151.4 21.2 159.7 28Z"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M197.9 94.5c-15.1 8.4-23.7 21.9-23 36.7.8 17.2 11.9 31.1 29.1 38.5-3.8 12.9-10.4 25.5-18.7 35.9-10.6 13.2-20 22.4-32.5 22.4-7 0-12.5-2.1-18.1-4.3-6-2.3-12.1-4.7-20.5-4.7-8.7 0-15.3 2.5-21.7 4.9-5.9 2.2-11.5 4.1-18 4.1-11.8 0-21.8-10-32.7-24.6C25.3 181.2 16 148.2 23.6 119.7c6.1-22.8 22.9-37.8 43.1-38.1 8.2-.1 15.5 2.7 21.7 5.1 5.6 2.2 10.4 4.1 14.7 4.1 3.8 0 8.8-1.9 14.7-4.1 7.5-2.8 16.7-6.2 27.6-5.6 18.9.9 35.5 10.4 52.5 13.4Z"
        stroke="currentColor"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Exclude<ThemeMode, "system"> }) {
  return theme === "dark" ? <Moon size={16} weight="regular" aria-hidden="true" /> : <Sun size={16} weight="regular" aria-hidden="true" />;
}

export function MotiClawLanding({ initialLocale }: { initialLocale: Locale }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<ThemeMode>("system");
  /*
   * Hidden while only the macOS Apple Silicon package is available:
   *
   * const [quickStartTab, setQuickStartTab] = useState<QuickStartTabKey>("one-liner");
   * const [quickStartPlatform, setQuickStartPlatform] = useState<QuickStartPlatform>("macos");
   * const [quickStartManager, setQuickStartManager] = useState<QuickStartManager>("pnpm");
   */
  const [copyHintVisible, setCopyHintVisible] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [otherPlatformsOpen, setOtherPlatformsOpen] = useState(true);
  const [platformGroupOpen, setPlatformGroupOpen] = useState<Record<PlatformGroup, boolean>>({
    macos: true,
    windows: false,
    linux: false,
  });
  const [releaseManifest, setReleaseManifest] = useState<ReleaseManifest>(fallbackReleaseManifest);
  const [detectedPlatform, setDetectedPlatform] = useState<DetectedPlatform>(defaultDetectedPlatform);
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
  const quickStartCommands = content.quickStart.commands;
  const quickStartNote = content.quickStart.commandNote;
  const detectedPlatformLabel = getDetectedPlatformLabel(detectedPlatform, content.download);
  const recommendedPlatformKey = getAvailablePlatformKey(releaseManifest, detectedPlatform);
  const recommendedArtifact = releaseManifest.artifacts[recommendedPlatformKey]?.archive;
  const recommendedPlatformLabel = content.download.platforms[recommendedPlatformKey];
  const recommendedPlatformGroup = recommendedPlatformOptions.find((option) => option.key === recommendedPlatformKey)?.group ?? "macos";
  const releaseDate = formatReleaseDate(releaseManifest.generated_at, locale);
  const releaseUrl = releaseManifest.release_url ?? githubLatestReleaseUrl;
  const releaseBadgeText =
    locale === "zh"
      ? `v${releaseManifest.version} · ${recommendedPlatformLabel} 已开放`
      : `v${releaseManifest.version} · ${recommendedPlatformLabel} available`;
  const quickStartDisplayCommands = recommendedArtifact?.url
    ? [`curl -L -o ${recommendedArtifact.filename ?? "MotiClaw.dmg"} ${recommendedArtifact.url}`]
    : quickStartCommands;
  const quickStartNoteText = `v${releaseManifest.version} · ${quickStartNote}`;
  /*
   * Restore with the multi-entry quick start tabs:
   *
   * const activeQuickStartTab = content.quickStart.tabs.find((tab) => tab.key === quickStartTab) ?? content.quickStart.tabs[0];
   * const quickStartCommands =
   *   quickStartTab === "one-liner"
   *     ? quickStartPlatform === "windows"
   *       ? ['powershell -c "irm https://moticlaw.com/install.ps1 | iex"']
   *       : ["curl -fsSL https://moticlaw.com/install.sh | bash"]
   *     : quickStartManager === "npm"
   *       ? ["npm install -g moticlaw", "moticlaw status"]
   *       : ["pnpm add -g moticlaw", "moticlaw status"];
   * const quickStartNote = quickStartTab === "one-liner" ? (quickStartPlatform === "macos" ? "macOS & Linux" : "Windows") : quickStartManager;
   */
  const resolvedTheme = isMounted ? getResolvedTheme(theme) : "light";
  const themeLabel = useMemo(() => {
    return resolvedTheme === "dark" ? content.controls.dark : content.controls.light;
  }, [content.controls.dark, content.controls.light, resolvedTheme]);

  const closeLocaleMenu = () => setLocaleMenuOpen(false);
  const openDownloadModal = () => {
    closeLocaleMenu();
    setDownloadModalOpen(true);
  };
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
    let active = true;

    detectPlatform().then((platform) => {
      if (active) setDetectedPlatform(platform);
    });

    return () => {
      active = false;
    };
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

  useEffect(() => {
    const controller = new AbortController();

    fetchReleaseManifest(controller.signal)
      .then((manifest) => setReleaseManifest(manifest))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setReleaseManifest(fallbackReleaseManifest);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!downloadModalOpen) return;

    const controller = new AbortController();

    fetchReleaseManifest(controller.signal)
      .then((manifest) => setReleaseManifest(manifest))
      .catch((error: unknown) => {
        if (!isAbortError(error)) setReleaseManifest(fallbackReleaseManifest);
      });

    return () => controller.abort();
  }, [downloadModalOpen]);

  useEffect(() => {
    if (!downloadModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDownloadModalOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [downloadModalOpen]);

  /*
   * Restore with the package-manager tab:
   *
   * const handleQuickStartTabChange = (tab: QuickStartTabKey) => {
   *   setQuickStartTab(tab);
   *   if (tab === "npm") {
   *     setQuickStartManager("npm");
   *   }
   * };
   */

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

  const renderPlatformIcon = (group: PlatformGroup, size = 20) => {
    if (group === "macos") return <AppleOutlineIcon size={size} />;
    if (group === "windows") return <WindowsLogo size={size} weight="regular" aria-hidden="true" />;
    return <LinuxLogo size={size} weight="regular" aria-hidden="true" />;
  };

  const togglePlatformGroup = (group: PlatformGroup) => {
    setPlatformGroupOpen((current) => ({ ...current, [group]: !current[group] }));
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

            <button
              type="button"
              onClick={openDownloadModal}
              className="header-desktop-cta btn-base btn-primary ml-2 min-w-[11.375rem] justify-center"
            >
              <DownloadSimple size={16} weight="regular" aria-hidden="true" />
              {content.primaryCta}
            </button>
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

        {downloadModalOpen && typeof document !== "undefined"
          ? createPortal(
              <div
                className="download-modal-backdrop"
                role="presentation"
                onClick={() => setDownloadModalOpen(false)}
              >
                <section
                  className="download-modal"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="download-modal-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="button"
                    className="download-modal-close"
                    aria-label={content.download.close}
                    title={content.download.close}
                    onClick={() => setDownloadModalOpen(false)}
                  >
                    <X size={18} weight="bold" aria-hidden="true" />
                  </button>

                  <div className="download-modal-header">
                    <p className="download-modal-eyebrow">{content.download.recommended}</p>
                    <h2 id="download-modal-title" className="download-modal-title">
                      {content.download.title} <span>v{releaseManifest.version}</span>
                    </h2>
                    {releaseDate ? (
                      <p className="download-modal-subtitle">
                        {content.download.released} {releaseDate}
                      </p>
                    ) : null}
                  </div>

                  <div className="download-detected-row">
                    <ShieldCheck size={18} weight="regular" aria-hidden="true" />
                    <span>{content.download.detected}:</span>
                    <strong>{detectedPlatformLabel}</strong>
                  </div>

                  <a
                    href={recommendedArtifact?.url ?? releaseUrl}
                    className="download-recommended-card"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="download-package-icon">
                      {renderPlatformIcon(recommendedPlatformGroup, 26)}
                    </span>
                    <span className="download-package-content">
                      <span className="download-package-title">{recommendedPlatformLabel}</span>
                      <span className="download-package-file">{recommendedArtifact?.filename ?? "GitHub Release"}</span>
                      <span className="download-package-meta">
                        {formatBytes(recommendedArtifact?.size_bytes) ? `${content.download.size} ${formatBytes(recommendedArtifact?.size_bytes)}` : content.download.githubRelease}
                      </span>
                    </span>
                    <span className="download-package-action" aria-hidden="true">
                      <DownloadSimple size={21} weight="bold" />
                    </span>
                    <span className="download-package-note">
                      <Info size={15} weight="regular" aria-hidden="true" />
                      <span>{content.download.installNote}</span>
                    </span>
                  </a>

                  <div className="download-platform-section">
                    <button
                      type="button"
                      className="download-platform-toggle"
                      aria-expanded={otherPlatformsOpen}
                      onClick={() => setOtherPlatformsOpen((open) => !open)}
                    >
                      <span>{content.download.otherPlatforms}</span>
                      <CaretDown
                        size={16}
                        weight="bold"
                        aria-hidden="true"
                        className={otherPlatformsOpen ? "download-platform-caret-open" : ""}
                      />
                    </button>

                    {otherPlatformsOpen ? (
                      <div className="download-platform-groups">
                        {platformGroups.map((group) => {
                          const groupOptions = platformOptions.filter((option) => option.group === group);
                          const groupPending = pendingPlatformGroups.has(group);
                          const groupExpanded = platformGroupOpen[group];

                          return (
                            <div key={group} className="download-platform-group">
                              {groupPending ? (
                                <div className="download-platform-group-title download-platform-group-title-static">
                                  <span className="download-platform-group-name">
                                    {renderPlatformIcon(group, 16)}
                                    {content.download.groups[group]}
                                  </span>
                                  <span className="download-platform-group-meta">
                                    <span className="download-platform-status">{content.download.unavailable}</span>
                                  </span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className="download-platform-group-title"
                                  aria-expanded={groupExpanded}
                                  onClick={() => togglePlatformGroup(group)}
                                >
                                  <span className="download-platform-group-name">
                                    {renderPlatformIcon(group, 16)}
                                    {content.download.groups[group]}
                                  </span>
                                  <span className="download-platform-group-meta">
                                    <CaretDown
                                      size={14}
                                      weight="bold"
                                      aria-hidden="true"
                                      className={groupExpanded ? "download-platform-caret-open" : ""}
                                    />
                                  </span>
                                </button>
                              )}

                              {!groupPending && groupExpanded ? (
                                <div className="download-platform-list">
                                  {groupOptions.map((option) => {
                                    const artifact = releaseManifest.artifacts[option.key]?.archive;
                                    const available = Boolean(artifact?.url);

                                    return available ? (
                                      <a
                                        key={option.key}
                                        href={artifact?.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="download-platform-row download-platform-row-available"
                                      >
                                        <span>{content.download.platforms[option.key]}</span>
                                        <DownloadSimple size={15} weight="bold" aria-hidden="true" />
                                      </a>
                                    ) : (
                                      <span key={option.key} className="download-platform-row download-platform-row-disabled">
                                        <span>{content.download.platforms[option.key]}</span>
                                        <span>{content.download.unavailable}</span>
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </section>
              </div>,
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
              <div className="hero-release-badge">
                <DownloadSimple size={15} weight="bold" aria-hidden="true" />
                <span>{releaseBadgeText}</span>
              </div>
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
                <button
                  type="button"
                  onClick={openDownloadModal}
                  className="hero-primary-cta btn-base btn-primary shrink-0 min-w-[11.375rem] justify-center px-7 py-4"
                >
                  <DownloadSimple size={16} weight="regular" aria-hidden="true" />
                  {content.primaryCta}
                </button>
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

                  <div className="quickstart-tabs" aria-label={content.quickStart.eyebrow}>
                    <span className="quickstart-tab quickstart-tab-active">
                      {content.quickStart.assetLabel}
                    </span>
                  </div>
                  {/*
                    Hidden until all platform packages are available again:

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
                  */}
                </div>

                <div className="quickstart-window-right" />
                {/*
                  Hidden until Windows/Linux/npm publishing is restored:

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
                */}
              </div>

              <div className="quickstart-window-body">
                <div className="quickstart-command-shell">
                  <div className="quickstart-command-list" aria-label={content.quickStart.assetLabel}>
                    {/*
                      Restore aria-label={activeQuickStartTab.label} when activeQuickStartTab comes back.
                    */}
                    <p className="quickstart-command-note"># {quickStartNoteText}</p>
                    <div className="quickstart-command-row">
                      <div className="quickstart-command-lines">
                        {quickStartDisplayCommands.map((command) => (
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
                            void navigator.clipboard.writeText(quickStartDisplayCommands.join("\n"));
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
          <p className="section-eyebrow-lg mb-3 text-center">{content.capabilities.eyebrow}</p>
          {content.capabilities.title ? <h2 className="display mb-3 text-center text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">{content.capabilities.title}</h2> : null}
          <p className="mx-auto mb-7 max-w-2xl text-center text-base leading-7 text-[var(--muted)]">{content.capabilities.body}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {content.capabilities.cards.map((item) => (
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
