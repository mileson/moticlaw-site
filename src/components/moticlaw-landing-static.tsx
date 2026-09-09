import {
  CaretDown,
  ChartBar,
  CursorClick,
  DownloadSimple,
  HardDrives,
  Info,
  Kanban,
  LinuxLogo,
  MagnifyingGlass,
  Package,
  Pulse,
  ArrowRight,
  ShieldCheck,
  Sliders,
  UsersThree,
  WindowsLogo,
  Wrench,
  X,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import Image from "next/image";
import type { Locale } from "@/lib/locale";
import type { PlatformGroup, PlatformKey, ReleaseArchive, ReleaseManifest } from "@/lib/release-manifest";
import { SiteFaqSection } from "@/components/site-faq-section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderStatic } from "@/components/site-header-static";
import { withLocaleQuery } from "@/components/seo-resource-manifest";

const feishuGroupQrUrl = "/contact/feishu-group-qr-20260619.png";
const storyAvatarUrls = {
  creator: "https://cdn.moticlaw.com/site/stories/avatars/avatar-creator-384-c59934fe.webp",
  owner: "https://cdn.moticlaw.com/site/stories/avatars/avatar-owner-384-1bacaeaa.webp",
  opc: "https://cdn.moticlaw.com/site/stories/avatars/avatar-opc-384-0ed6dd35.webp",
} as const;

const platformGroups: PlatformGroup[] = ["macos", "windows"];
const platformOptions: Array<{ key: PlatformKey; group: PlatformGroup }> = [
  { key: "darwin-arm64", group: "macos" },
  { key: "darwin-x64", group: "macos" },
  { key: "windows-x64", group: "windows" },
];

type StatItem = { title: string; body: string; icon: Icon; imageUrl: string; accent: string };
type CapabilityItem = { title: string; body: string; icon: Icon };

const copy = {
  en: {
    heroTitle: "Ideas, creation, and publishing.\nOne workspace.",
    heroBody: "Stay focused on ideas and expression while AI handles most of the content-production work. Your material and drafts stay together on your device.",
    heroPlatformLabel: "Supported",
    footerLinksLabel: "Keep exploring",
    seoGuides: {
      eyebrow: "Next step",
      title: "Start with the question you already have.",
      body: "If you are deciding whether MotiClaw fits your work, start from the path closest to your situation: install it, check local deployment, compare capabilities, or read the page for your role.",
    },
    primaryCta: "Download",
    consoleCta: "Try console",
    statsSectionTitle: "Product Features",
    stats: [
      { title: "Local-first workspace", body: "Your AI partners, files, and daily work stay on your own device by default.", icon: HardDrives, imageUrl: "/landing/product-features/local-workspace.webp", accent: "Local" },
      { title: "AI partners, ready to go", body: "Pick a role, connect a channel, and let the AI partner start handling real work.", icon: Package, imageUrl: "/landing/product-features/partner-ready.webp", accent: "Partner" },
      { title: "Low-friction management", body: "Search, filter, patrol, configure, and review activity without learning technical operations.", icon: CursorClick, imageUrl: "/landing/product-features/patrol-console.webp", accent: "Control" },
    ] as StatItem[],
    heroVideo: {
      title: "Control plane overview",
      promoButton: "Watch",
      promoTitle: "MotiClaw Promo",
    },
    capabilities: {
      eyebrow: "Capabilities",
      body: "From installation to daily operations, from AI partner onboarding to full lifecycle management — one interface to get it all done.",
      cards: [
        { title: "AI partner workspace", body: "Onboarding, identity, runtime status, channel access — manage the full AI partner lifecycle in one view.", icon: Kanban },
        { title: "One-click ops", body: "Install, repair, restart, update — one click, done. No commands to remember.", icon: Wrench },
        { title: "Flexible config", body: "AI models, gateway, system parameters — a visual config panel that keeps every setting clear and in control.", icon: Sliders },
        { title: "Data insights", body: "Token usage, call frequency, cost trends — multi-dimensional data at a glance.", icon: ChartBar },
      ] as CapabilityItem[],
    },
    stories: {
      eyebrow: "User Stories",
      title: "The work is not the hard part. The scatter is.",
      body: "When chats, docs, screenshots, and promises pile up across tools, the first hour disappears into reconnecting the dots. MotiClaw pulls them back together and turns them into a clear next step",
      changeLabel: "Change",
      beforeLabel: "Before",
      afterLabel: "After",
      shiftAria: "Before and after",
      cards: [
        {
          name: "Ethan Lin",
          persona: "Solo creator",
          role: "Independent consultant for content and strategy",
          quote: "I was not blocked by writing. I was blocked by having to gather everything before I could even begin",
          body: "Before work starts, Ethan drops interview notes, saved links, WeChat ideas, and screenshots into MotiClaw. The material gets grouped first, useful angles surface next, and today's first step is already lined up. He still decides what to say; he just does not spend half an hour hunting for files and old messages",
          before: "Ideas, source material, and drafts lived across WeChat, browser tabs, docs, and photos",
          after: "The raw material is gathered first, then the writing angles and first task appear",
          impact: "Open the laptop and get straight to work",
          visual: "creator",
          avatar: storyAvatarUrls.creator,
        },
        {
          name: "Shuxing Chen",
          persona: "Founder",
          role: "Owner of a small consulting team",
          quote: "The hard part was not having more clients. It was that every next step lived in my head",
          body: "Shuxing spends the day replying to clients, checking delivery, and adjusting quotes. Before, meeting notes, promises, and delivery dates were split between WeChat, Feishu, and spreadsheets. Now one meeting note is enough to surface the next action, the reminder, and the key changes. He still makes the call; he no longer has to be the backup memory for everything",
          before: "Next steps hid in chat threads, notes, and spreadsheets",
          after: "Each client has a current action, a reminder, and the key context in one place",
          impact: "Client follow-up stops leaking through the cracks",
          visual: "owner",
          avatar: storyAvatarUrls.owner,
        },
        {
          name: "Mia Zhou",
          persona: "AI indie developer",
          role: "Solo builder shipping an AI product",
          quote: "The hardest part was not coding. It was that release day made everything feel urgent at once",
          body: "Mia writes code, answers users, updates docs, and ships releases herself. Before launch, user group messages, bug reports, screenshots, release notes, and loose todos all crashed together. Now MotiClaw groups repeated issues, lists what must be checked before shipping, and turns the common questions into draft docs. She still decides what ships; she just is not dragged around by a dozen open tabs",
          before: "Feedback, bugs, release notes, and todos were mixed together",
          after: "Support, docs, and launch prep each get their own first pass",
          impact: "Release day feels under control",
          visual: "opc",
          avatar: storyAvatarUrls.opc,
        },
      ],
    },
    contact: {
      eyebrow: "Contact",
      modalTitle: "Join the MotiClaw Feishu group",
      modalBody: "Scan in Feishu to join the group chat.",
      modalHint: "This QR code is permanent and valid for new members.",
      imageAlt: "MotiClaw Feishu group QR code",
      linkTitle: "Feishu group",
      linkBody: "Open QR code",
    },
    download: {
      title: "Download MotiClaw",
      released: "Released on",
      detected: "Detected device",
      detectingDevice: "Detecting your device",
      recommended: "Recommended download",
      recommendedPendingTitle: "Choose your installer",
      recommendedPendingNote: "We are still detecting your device. You can also choose from the platform list below.",
      comingSoon: "Coming soon",
      otherPlatforms: "Other platforms",
      githubRelease: "Open release manifest",
      close: "Close download dialog",
      size: "Size",
      groups: { macos: "macOS", windows: "Windows", linux: "Linux" },
      platforms: {
        "darwin-arm64": "macOS Apple Silicon",
        "darwin-x64": "macOS (Intel)",
        "windows-x64": "Windows x64 (ARM64 compatible)",
        "linux-deb-x64": "Linux .deb (x64)",
        "linux-deb-arm64": "Linux .deb (ARM64)",
        "linux-appimage-x64": "Linux AppImage (x64)",
        "linux-appimage-arm64": "Linux AppImage (ARM64)",
        "linux-rpm-x64": "Linux .rpm (x64)",
      } as Record<string, string>,
      unknownDevice: "Unknown",
      installNotes: {
        mac: "On first launch, allow the app in System Settings -> Privacy & Security if macOS asks.",
        win: "This download is the installer .exe. Run it and follow the setup steps.",
      },
    },
  },
  zh: {
    heroTitle: "灵感、创作与发布，\n一站完成",
    heroBody: "专注创意与表达，让 AI 帮你完成大部分内容创作执行。素材、草稿与成品留在同一个本地工作空间。",
    heroPlatformLabel: "支持",
    footerLinksLabel: "继续浏览",
    seoGuides: {
      eyebrow: "下一步怎么选",
      title: "从你正在判断的问题开始",
      body: "如果你还在判断 MotiClaw 是否适合自己，先选最接近当前处境的一条路径：下载安装、本地部署、产品能力，或面向你角色的使用方式。",
    },
    primaryCta: "下载安装",
    consoleCta: "体验管理台",
    statsSectionTitle: "产品特色",
    stats: [
      { title: "素材集中在本地", body: "灵感、参考资料与创作文件默认留在自己的设备上。", icon: HardDrives, imageUrl: "/landing/product-features/local-workspace.webp", accent: "素材" },
      { title: "AI 接手创作执行", body: "从整理、起草到改写，让 AI 完成耗时的内容生产步骤。", icon: Package, imageUrl: "/landing/product-features/partner-ready.webp", accent: "创作" },
      { title: "发布流程更顺手", body: "在同一个工作空间检查内容、整理版本并继续完成发布。", icon: CursorClick, imageUrl: "/landing/product-features/patrol-console.webp", accent: "发布" },
    ] as StatItem[],
    heroVideo: {
      title: "控制面概览",
      promoButton: "观看",
      promoTitle: "MotiClaw 宣传片",
    },
    capabilities: {
      eyebrow: "能力",
      body: "从第一条灵感到可以发布的成品，把内容创作中最耗时的执行步骤交给 AI。",
      cards: [
        { title: "灵感与素材库", body: "把零散想法、文档和参考资料放进一个可继续创作的工作空间。", icon: Kanban },
        { title: "内容起草与改写", body: "让 AI 根据你的材料完成提纲、初稿、润色和多版本适配。", icon: Wrench },
        { title: "创作流程编排", body: "把重复的内容生产步骤整理成可复用流程，减少来回切换。", icon: Sliders },
        { title: "发布前检查", body: "集中核对内容、素材和版本，确认无误后继续完成发布。", icon: ChartBar },
      ] as CapabilityItem[],
    },
    stories: {
      eyebrow: "用户故事",
      title: "一个人干活，最怕不是忙，是东西太散",
      body: "微信、飞书、文档、截图、待办全堆在一起时，真正耗时间的往往不是做事，而是先把信息找齐。MotiClaw 先帮你收拢，再把今天该做的下一步排出来",
      changeLabel: "变化",
      beforeLabel: "之前",
      afterLabel: "之后",
      shiftAria: "使用前后变化",
      cards: [
        {
          name: "林亦辰",
          persona: "超级个体",
          role: "做内容和咨询的自由顾问",
          quote: "我不是不会写，是每次开工前都得先把材料找齐",
          body: "林亦辰平时把访谈录音、收藏网页、微信里记下的灵感和截图都放进 MotiClaw。开工前，资料先被归到一起，可写的方向先被列出来，今天先动哪一步也会排好。他还是自己定观点，但不用再花半小时翻聊天和找文件",
          before: "灵感、资料和草稿散在微信、浏览器、文档和相册里",
          after: "素材先收齐，再给出可写方向和今天第一步",
          impact: "打开电脑就能开工",
          visual: "creator",
          avatar: storyAvatarUrls.creator,
        },
        {
          name: "陈书行",
          persona: "老板",
          role: "做服务生意的小团队老板",
          quote: "最怕的不是客户多，是每个人的下一步都要靠我记",
          body: "陈书行每天要回客户、盯交付、改报价。以前会后结论、答应客户的事和交付时间散在微信、飞书和表格里，最后都压到他脑子里。现在纪要一放进去，下一步、提醒和关键变动会先整理出来。他负责拍板，不用再靠记忆兜底",
          before: "下一步藏在聊天记录、纪要和表格里",
          after: "每个客户都有当前动作、提醒和关键信息",
          impact: "客户跟进不再漏",
          visual: "owner",
          avatar: storyAvatarUrls.owner,
        },
        {
          name: "周以宁",
          persona: "AI 独立开发者",
          role: "一个人做产品的 AI 独立开发者",
          quote: "我最怕的不是写代码，是发版前所有事一起找上来",
          body: "周以宁一个人写代码、回用户、改文档、发版本。每次准备上线，群消息、bug 反馈、截图、更新说明和待办都挤在一起。现在她把这些放进 MotiClaw，重复问题会先归类，发版前要确认的项会先列出来，能写成帮助文档的内容也会先起草。她还是一个人做决定，但不会再被一堆标签页拖着跑",
          before: "反馈、bug、更新说明和待办混在一起",
          after: "支持、文档和发版准备先各自排好",
          impact: "发版前心里有数",
          visual: "opc",
          avatar: storyAvatarUrls.opc,
        },
      ],
    },
    contact: {
      eyebrow: "联系",
      modalTitle: "加入 MotiClaw 内测共创群",
      modalBody: "请使用飞书扫码加入话题群。",
      modalHint: "该二维码永久有效，扫码即可加入话题群。",
      imageAlt: "MotiClaw 飞书入群二维码",
      linkTitle: "飞书群",
      linkBody: "点击查看二维码",
    },
    download: {
      title: "下载 MotiClaw",
      released: "发布于",
      detected: "检测到你的设备",
      detectingDevice: "正在检测你的设备",
      recommended: "推荐下载",
      recommendedPendingTitle: "选择适合你的安装包",
      recommendedPendingNote: "我们正在识别你的设备。你也可以直接从下方平台列表里选择安装包。",
      comingSoon: "敬请期待",
      otherPlatforms: "其它平台",
      githubRelease: "查看发布清单",
      close: "关闭下载弹窗",
      size: "大小",
      groups: { macos: "macOS", windows: "Windows", linux: "Linux" },
      platforms: {
        "darwin-arm64": "macOS Apple Silicon",
        "darwin-x64": "macOS (Intel)",
        "windows-x64": "Windows x64 (兼容 ARM64)",
        "linux-deb-x64": "Linux .deb (x64)",
        "linux-deb-arm64": "Linux .deb (ARM64)",
        "linux-appimage-x64": "Linux AppImage (x64)",
        "linux-appimage-arm64": "Linux AppImage (ARM64)",
        "linux-rpm-x64": "Linux .rpm (x64)",
      } as Record<string, string>,
      unknownDevice: "未知设备",
      installNotes: {
        mac: "首次启动时，如系统提示，请前往“系统设置”→“隐私与安全性”允许打开应用。",
        win: "下载的是安装版 .exe，运行后按向导完成安装即可。",
      },
    },
  },
} as const;

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

function getDisplayVersion(manifest: ReleaseManifest) {
  return manifest.display_version || `v${manifest.version}`;
}

function isVisibleArtifact(key: PlatformKey, archive: ReleaseArchive | undefined) {
  if (!archive?.url) return false;
  if (key === "windows-x64") {
    return archive.filename?.toLowerCase().endsWith("-setup.exe") ?? false;
  }
  return true;
}

function PlatformIcon({ group, size = 20 }: { group: PlatformGroup | "package"; size?: number }) {
  if (group === "macos") return <AppleOutlineIcon size={size} />;
  if (group === "windows") return <WindowsLogo size={size} weight="regular" aria-hidden="true" />;
  if (group === "linux") return <LinuxLogo size={size} weight="regular" aria-hidden="true" />;
  return <Package size={size} weight="regular" aria-hidden="true" />;
}

function AppleOutlineIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 224 256" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
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

type SeoGuideLink = { title: string; body: string; href: string };

type ConsoleChannel = "feishu" | "wechat" | "none";
type ConsoleStatusKind = "working" | "idle" | "offline" | "crashed";

type ConsolePreviewPartner = {
  name: string;
  role: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  videoUrl: string;
  statusKind: ConsoleStatusKind;
  status: string;
  timeLabel: string;
  channels: ConsoleChannel[];
  tokens: string;
  skills: string;
  tasks: string;
  primaryAction: string;
  primaryChannel: ConsoleChannel;
};

type ConsoleSkillItem = {
  label: string;
  description: string;
  coverUrl: string;
  tone: "blue" | "green" | "amber" | "slate";
};

type ConsolePreviewContent = {
  eyebrow: string;
  title: string;
  body: string;
  windowTitle: string;
  search: string;
  manage: string;
  patrol: string;
  channelsLabel: string;
  filters: Array<{ id: ConsoleStatusKind | "all"; label: string; count: string }>;
  partners: ConsolePreviewPartner[];
  skillLabel: string;
  taskLabel: string;
  configLabel: string;
  moticlawLabel: string;
  modalCloseLabel: string;
  chatPlaceholder: string;
  chatSendLabel: string;
};

type ConsoleTaskItem = {
  title: string;
  description: string;
  enabled: boolean;
  frequency: string;
  delivery: string;
  lastRun: string;
  nextRun: string;
};

type ConsoleActivityItem = {
  category: "conversation" | "tool" | "system" | "scheduled" | "skill";
  label: string;
  title: string;
  body: string;
  reply?: string;
  time: string;
  ageHours: number;
  channel: string;
  source: "feishu" | "wechat" | "moticlaw";
};

function homeConsoleAnchor(locale: Locale) {
  return `/?lang=${locale}#ai-partner-console-preview`;
}

function buildConsolePreview(locale: Locale): ConsolePreviewContent {
  const asset = (name: string) => `/landing/ai-partner-cards/${name}`;
  if (locale === "zh") {
    return {
      eyebrow: "AI 伙伴管理台",
      title: "像管理真实团队一样管理 AI 伙伴",
      body: "首页直接露出一组可感知的产品卡片：每个 AI 伙伴的工作状态、渠道、技能、任务和消耗都能一眼扫到。",
      windowTitle: "MotiClaw / AI 伙伴",
      search: "搜索 AI 伙伴名称、职责或渠道",
      manage: "管理",
      patrol: "巡查",
      channelsLabel: "渠道",
      filters: [
        { id: "all", label: "全部", count: "8" },
        { id: "working", label: "工作中", count: "5" },
        { id: "idle", label: "空闲", count: "1" },
        { id: "offline", label: "离线", count: "1" },
        { id: "crashed", label: "异常", count: "1" },
      ],
      partners: [
        {
          name: "文档助手",
          role: "文档整理与生成",
          description: "帮你整理和生成 Word、PPT、Excel、PDF，并把材料归档到任务里。",
          avatarUrl: asset("avatar-koala.webp"),
          coverUrl: asset("koala-idle.webp"),
          videoUrl: asset("video/koala-idle.mp4"),
          statusKind: "idle",
          status: "空闲",
          timeLabel: "18小时前",
          channels: ["feishu"],
          tokens: "暂无消耗",
          skills: "6",
          tasks: "2",
          primaryAction: "飞书对话",
          primaryChannel: "feishu",
        },
        {
          name: "微信公众助手",
          role: "公众号内容助理",
          description: "准备公众号选题、草稿和封面，帮你把发布前的材料收齐。",
          avatarUrl: asset("avatar-owl.webp"),
          coverUrl: asset("owl-working.webp"),
          videoUrl: asset("video/owl-working.mp4"),
          statusKind: "working",
          status: "工作中",
          timeLabel: "刚刚",
          channels: ["wechat"],
          tokens: "暂无消耗",
          skills: "1",
          tasks: "1",
          primaryAction: "微信对话",
          primaryChannel: "wechat",
        },
        {
          name: "经营参谋",
          role: "老板经营助手",
          description: "陪一个公司老板看经营全局，把目标、任务、复盘和提醒收拢。",
          avatarUrl: asset("avatar-rabbit.webp"),
          coverUrl: asset("rabbit-working.webp"),
          videoUrl: asset("video/rabbit-working.mp4"),
          statusKind: "working",
          status: "工作中",
          timeLabel: "3天前",
          channels: ["feishu", "wechat"],
          tokens: "69.2K tokens",
          skills: "12",
          tasks: "3",
          primaryAction: "微信对话",
          primaryChannel: "wechat",
        },
        {
          name: "增长负责人",
          role: "增长与转化",
          description: "负责获客、SEO、广告、私域转化和线索质量，持续跟进增长任务。",
          avatarUrl: asset("avatar-dog.webp"),
          coverUrl: asset("dog-working.webp"),
          videoUrl: asset("video/dog-working.mp4"),
          statusKind: "working",
          status: "工作中",
          timeLabel: "18分钟前",
          channels: ["feishu", "wechat"],
          tokens: "70K tokens",
          skills: "11",
          tasks: "3",
          primaryAction: "飞书对话",
          primaryChannel: "feishu",
        },
        {
          name: "内容主编",
          role: "内容交付负责人",
          description: "把老板的观点、交付经验和行业观察变成公众号内容与发布排期。",
          avatarUrl: asset("avatar-rabbit.webp"),
          coverUrl: asset("rabbit-offline.webp"),
          videoUrl: asset("video/rabbit-offline.mp4"),
          statusKind: "offline",
          status: "离线",
          timeLabel: "3天前",
          channels: ["wechat"],
          tokens: "70.9K tokens",
          skills: "11",
          tasks: "3",
          primaryAction: "微信对话",
          primaryChannel: "wechat",
        },
        {
          name: "产品经理",
          role: "需求与路线图",
          description: "把用户反馈、老板想法和竞品观察沉淀成需求池与行动计划。",
          avatarUrl: asset("avatar-fox.webp"),
          coverUrl: asset("fox-crashed.webp"),
          videoUrl: asset("video/fox-crashed.mp4"),
          statusKind: "crashed",
          status: "异常",
          timeLabel: "12分钟前",
          channels: ["feishu"],
          tokens: "71.7K tokens",
          skills: "4",
          tasks: "2",
          primaryAction: "飞书对话",
          primaryChannel: "feishu",
        },
        {
          name: "研发交付负责人",
          role: "交付与验收",
          description: "负责把产品任务变成可交付的软件变更，盯住前后依赖和验收节奏。",
          avatarUrl: asset("avatar-penguin.webp"),
          coverUrl: asset("penguin-working.webp"),
          videoUrl: asset("video/penguin-working.mp4"),
          statusKind: "working",
          status: "工作中",
          timeLabel: "3天前",
          channels: ["feishu"],
          tokens: "72.5K tokens",
          skills: "11",
          tasks: "2",
          primaryAction: "飞书对话",
          primaryChannel: "feishu",
        },
        {
          name: "运营自动化负责人",
          role: "流程与知识库",
          description: "负责飞书、任务、知识库和自动化流程，把重复运营动作稳定跑起来。",
          avatarUrl: asset("avatar-penguin.webp"),
          coverUrl: asset("penguin-working.webp"),
          videoUrl: asset("video/penguin-working.mp4"),
          statusKind: "working",
          status: "工作中",
          timeLabel: "3天前",
          channels: ["feishu", "wechat"],
          tokens: "74.2K tokens",
          skills: "13",
          tasks: "2",
          primaryAction: "飞书对话",
          primaryChannel: "feishu",
        },
      ],
      skillLabel: "技能",
      taskLabel: "任务",
      configLabel: "配置",
      moticlawLabel: "MotiClaw",
      modalCloseLabel: "关闭 AI 伙伴窗口",
      chatPlaceholder: "输入一句想让这位 AI 伙伴处理的事",
      chatSendLabel: "发送",
    };
  }

  return {
    eyebrow: "AI partner console",
    title: "Manage AI partners like a real team",
    body: "The homepage previews real product cards: each AI partner shows status, channels, skills, tasks, usage, and recent activity at a glance.",
    windowTitle: "MotiClaw / AI partners",
    search: "Search AI partner name, role, or channel",
    manage: "Console",
    patrol: "Patrol",
    channelsLabel: "Channels",
    filters: [
      { id: "all", label: "All", count: "8" },
      { id: "working", label: "Working", count: "5" },
      { id: "idle", label: "Idle", count: "1" },
      { id: "offline", label: "Offline", count: "1" },
      { id: "crashed", label: "Issue", count: "1" },
    ],
    partners: [
      {
        name: "Docs Assistant 2",
        role: "Document assistant",
        description: "Organizes Word, PPT, Excel, and PDF materials, then keeps them attached to active work.",
        avatarUrl: asset("avatar-koala.webp"),
        coverUrl: asset("koala-idle.webp"),
        videoUrl: asset("video/koala-idle.mp4"),
        statusKind: "idle",
        status: "Idle",
        timeLabel: "18h ago",
        channels: ["feishu"],
        tokens: "No usage",
        skills: "6",
        tasks: "2",
        primaryAction: "Feishu chat",
        primaryChannel: "feishu",
      },
      {
        name: "WeChat Publisher",
        role: "Official account helper",
        description: "Prepares topics, drafts, and covers so publishing materials are ready before review.",
        avatarUrl: asset("avatar-owl.webp"),
        coverUrl: asset("owl-working.webp"),
        videoUrl: asset("video/owl-working.mp4"),
        statusKind: "working",
        status: "Working",
        timeLabel: "just now",
        channels: ["wechat"],
        tokens: "No usage",
        skills: "1",
        tasks: "1",
        primaryAction: "WeChat chat",
        primaryChannel: "wechat",
      },
      {
        name: "Business Advisor",
        role: "Founder operations",
        description: "Helps the company lead track goals, tasks, reviews, reminders, and decision follow-ups.",
        avatarUrl: asset("avatar-rabbit.webp"),
        coverUrl: asset("rabbit-working.webp"),
        videoUrl: asset("video/rabbit-working.mp4"),
        statusKind: "working",
        status: "Working",
        timeLabel: "3d ago",
        channels: ["feishu", "wechat"],
        tokens: "69.2K tokens",
        skills: "12",
        tasks: "3",
        primaryAction: "WeChat chat",
        primaryChannel: "wechat",
      },
      {
        name: "Growth Lead",
        role: "Growth and conversion",
        description: "Owns acquisition, SEO, ads, private traffic conversion, and lead quality follow-up.",
        avatarUrl: asset("avatar-dog.webp"),
        coverUrl: asset("dog-working.webp"),
        videoUrl: asset("video/dog-working.mp4"),
        statusKind: "working",
        status: "Working",
        timeLabel: "18m ago",
        channels: ["feishu", "wechat"],
        tokens: "70K tokens",
        skills: "11",
        tasks: "3",
        primaryAction: "Feishu chat",
        primaryChannel: "feishu",
      },
      {
        name: "Content Editor",
        role: "Content delivery",
        description: "Turns founder notes, delivery lessons, and market observations into publishable content.",
        avatarUrl: asset("avatar-rabbit.webp"),
        coverUrl: asset("rabbit-offline.webp"),
        videoUrl: asset("video/rabbit-offline.mp4"),
        statusKind: "offline",
        status: "Offline",
        timeLabel: "3d ago",
        channels: ["wechat"],
        tokens: "70.9K tokens",
        skills: "11",
        tasks: "3",
        primaryAction: "WeChat chat",
        primaryChannel: "wechat",
      },
      {
        name: "Product Manager",
        role: "Roadmap and feedback",
        description: "Turns feedback, founder ideas, and market notes into a clear requirement backlog.",
        avatarUrl: asset("avatar-fox.webp"),
        coverUrl: asset("fox-crashed.webp"),
        videoUrl: asset("video/fox-crashed.mp4"),
        statusKind: "crashed",
        status: "Issue",
        timeLabel: "12m ago",
        channels: ["feishu"],
        tokens: "71.7K tokens",
        skills: "4",
        tasks: "2",
        primaryAction: "Feishu chat",
        primaryChannel: "feishu",
      },
      {
        name: "Delivery Lead",
        role: "Build and acceptance",
        description: "Turns product tasks into shippable changes and keeps dependencies visible.",
        avatarUrl: asset("avatar-penguin.webp"),
        coverUrl: asset("penguin-working.webp"),
        videoUrl: asset("video/penguin-working.mp4"),
        statusKind: "working",
        status: "Working",
        timeLabel: "3d ago",
        channels: ["feishu"],
        tokens: "72.5K tokens",
        skills: "11",
        tasks: "2",
        primaryAction: "Feishu chat",
        primaryChannel: "feishu",
      },
      {
        name: "Ops Automation Lead",
        role: "Workflow and knowledge",
        description: "Keeps Feishu, tasks, knowledge, and recurring operations flowing reliably.",
        avatarUrl: asset("avatar-penguin.webp"),
        coverUrl: asset("penguin-working.webp"),
        videoUrl: asset("video/penguin-working.mp4"),
        statusKind: "working",
        status: "Working",
        timeLabel: "3d ago",
        channels: ["feishu", "wechat"],
        tokens: "74.2K tokens",
        skills: "13",
        tasks: "2",
        primaryAction: "Feishu chat",
        primaryChannel: "feishu",
      },
    ],
    skillLabel: "Skills",
    taskLabel: "Tasks",
    configLabel: "Configure",
    moticlawLabel: "MotiClaw",
    modalCloseLabel: "Close AI partner window",
    chatPlaceholder: "Type something for this AI partner",
    chatSendLabel: "Send",
  };
}

function consoleChannelLabel(channel: ConsoleChannel, locale: Locale) {
  if (channel === "feishu") return locale === "zh" ? "飞书" : "Feishu";
  if (channel === "wechat") return locale === "zh" ? "微信" : "WeChat";
  return locale === "zh" ? "未接入渠道" : "No channel";
}

function consoleChannelIcon(channel: ConsoleChannel) {
  if (channel === "feishu") return "/landing/ai-partner-cards/feishu.png";
  if (channel === "wechat") return "/landing/ai-partner-cards/wechat.svg";
  return null;
}

function consoleSkill(label: string, description: string, coverUrl: string, tone: ConsoleSkillItem["tone"]): ConsoleSkillItem {
  return { label, description, coverUrl, tone };
}

function consolePartnerSkills(partner: ConsolePreviewPartner, locale: Locale): ConsoleSkillItem[] {
  const isZh = locale === "zh";
  const skillAsset = (name: string) => `/landing/ai-partner-cards/skills/${name}`;
  const skillCover = {
    context: skillAsset("context-engineering-pack.jpg"),
    gstack: skillAsset("gstack-skill-pack.jpg"),
    lark: skillAsset("lark-cli-skills-pack.jpg"),
    planning: skillAsset("planning-with-files.jpg"),
    prompt: skillAsset("prompt-master.jpg"),
    superpowers: skillAsset("superpowers-zh.jpg"),
    understand: skillAsset("understand-anything.jpg"),
  };
  if (partner.name.includes("文档") || partner.name.includes("Docs")) {
    return isZh
      ? [
          consoleSkill("飞书全家桶", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.lark, "blue"),
          consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "green"),
          consoleSkill("万物理解套件", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.understand, "slate"),
          consoleSkill("提示词大师", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.prompt, "amber"),
        ]
      : [
          consoleSkill("Feishu workspace suite", "Mounted in this AI partner workspace.", skillCover.lark, "blue"),
          consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "green"),
          consoleSkill("Understand anything", "Mounted in this AI partner workspace.", skillCover.understand, "slate"),
          consoleSkill("Prompt master", "Mounted in this AI partner workspace.", skillCover.prompt, "amber"),
        ];
  }
  if (partner.name.includes("经营") || partner.name.includes("Business")) {
    return isZh
      ? [
          consoleSkill("一人公司的 AI 研发团队", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.gstack, "blue"),
          consoleSkill("超能力工作流（中文版）", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.superpowers, "green"),
          consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "amber"),
          consoleSkill("提示词大师", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.prompt, "slate"),
          consoleSkill("上下文工程实验室", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.context, "blue"),
          consoleSkill("飞书全家桶", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.lark, "green"),
        ]
      : [
          consoleSkill("One-person AI R&D team", "Mounted in this AI partner workspace.", skillCover.gstack, "blue"),
          consoleSkill("Superpower workflow", "Mounted in this AI partner workspace.", skillCover.superpowers, "green"),
          consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "amber"),
          consoleSkill("Prompt master", "Mounted in this AI partner workspace.", skillCover.prompt, "slate"),
          consoleSkill("Context engineering lab", "Mounted in this AI partner workspace.", skillCover.context, "blue"),
          consoleSkill("Feishu workspace suite", "Mounted in this AI partner workspace.", skillCover.lark, "green"),
        ];
  }
  if (partner.name.includes("增长") || partner.name.includes("Growth")) {
    return isZh
      ? [
          consoleSkill("超能力工作流（中文版）", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.superpowers, "green"),
          consoleSkill("提示词大师", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.prompt, "blue"),
          consoleSkill("一人公司的 AI 研发团队", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.gstack, "amber"),
          consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "slate"),
        ]
      : [
          consoleSkill("Superpower workflow", "Mounted in this AI partner workspace.", skillCover.superpowers, "green"),
          consoleSkill("Prompt master", "Mounted in this AI partner workspace.", skillCover.prompt, "blue"),
          consoleSkill("One-person AI R&D team", "Mounted in this AI partner workspace.", skillCover.gstack, "amber"),
          consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "slate"),
        ];
  }
  if (partner.name.includes("运营") || partner.name.includes("Ops")) {
    return isZh
      ? [
          consoleSkill("飞书全家桶", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.lark, "blue"),
          consoleSkill("飞书待办分派", "当前 AI 伙伴工作区下已挂载的技能。", skillAsset("feishu-task-assignment.jpg"), "green"),
          consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "slate"),
          consoleSkill("万物理解套件", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.understand, "amber"),
        ]
      : [
          consoleSkill("Feishu workspace suite", "Mounted in this AI partner workspace.", skillCover.lark, "blue"),
          consoleSkill("Feishu task assignment", "Mounted in this AI partner workspace.", skillAsset("feishu-task-assignment.jpg"), "green"),
          consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "slate"),
          consoleSkill("Understand anything", "Mounted in this AI partner workspace.", skillCover.understand, "amber"),
        ];
  }
  if (partner.name.includes("研发") || partner.name.includes("Delivery")) {
    return isZh
      ? [
          consoleSkill("一人公司的 AI 研发团队", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.gstack, "blue"),
          consoleSkill("上下文工程实验室", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.context, "green"),
          consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "slate"),
          consoleSkill("超能力工作流（中文版）", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.superpowers, "amber"),
        ]
      : [
          consoleSkill("One-person AI R&D team", "Mounted in this AI partner workspace.", skillCover.gstack, "blue"),
          consoleSkill("Context engineering lab", "Mounted in this AI partner workspace.", skillCover.context, "green"),
          consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "slate"),
          consoleSkill("Superpower workflow", "Mounted in this AI partner workspace.", skillCover.superpowers, "amber"),
        ];
  }
  return isZh
    ? [
        consoleSkill("文件化任务规划", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.planning, "blue"),
        consoleSkill("万物理解套件", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.understand, "slate"),
        consoleSkill("提示词大师", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.prompt, "amber"),
        consoleSkill("超能力工作流（中文版）", "当前 AI 伙伴工作区下已挂载的技能。", skillCover.superpowers, "green"),
      ]
    : [
        consoleSkill("File-based task planning", "Mounted in this AI partner workspace.", skillCover.planning, "blue"),
        consoleSkill("Understand anything", "Mounted in this AI partner workspace.", skillCover.understand, "slate"),
        consoleSkill("Prompt master", "Mounted in this AI partner workspace.", skillCover.prompt, "amber"),
        consoleSkill("Superpower workflow", "Mounted in this AI partner workspace.", skillCover.superpowers, "green"),
      ];
}

function consoleScheduleTask(title: string, description: string, frequency: string, delivery: string, lastRun: string, nextRun: string, enabled = true): ConsoleTaskItem {
  return { title, description, frequency, delivery, lastRun, nextRun, enabled };
}

function consolePartnerTasks(partner: ConsolePreviewPartner, locale: Locale): ConsoleTaskItem[] {
  const isZh = locale === "zh";
  if (!isZh) {
    return [
      consoleScheduleTask("Daily operating check", "Summarize progress, blockers, and the next action for this AI partner.", "Every day 09:00", "Feishu workspace", "6/15 01:57", "6/16 09:00"),
      consoleScheduleTask("Weekly review", "Collect important changes and prepare a lightweight weekly recap.", "Every Monday 09:00", "Feishu group", "6/14 23:21", "6/16 09:00"),
    ];
  }
  const deliveryByChannel = partner.channels.includes("feishu") && partner.channels.includes("wechat")
    ? "飞书 + 微信"
    : partner.channels.includes("wechat")
      ? "微信"
      : partner.channels.includes("feishu")
        ? "飞书"
        : "待接入渠道";
  const deliveryGroup = partner.channels.includes("wechat") ? `${deliveryByChannel} · ${partner.role}群` : `${deliveryByChannel} · AI 伙伴协作群`;
  switch (partner.name) {
    case "文档助手":
      return [
        consoleScheduleTask("每日资料归档", "把当天新增的文档、表格和演示稿整理成可检索清单。", "工作日 18:30", deliveryGroup, "6/15 18:32", "6/16 18:30"),
        consoleScheduleTask("周五材料复盘", "汇总本周交付材料和待补附件，提醒负责人确认。", "每周五 17:00", deliveryGroup, "6/12 17:08", "6/19 17:00"),
      ];
    case "微信公众助手":
      return [
        consoleScheduleTask("公众号选题池巡检", "检查草稿、封面和待发布材料是否齐全。", "每天 10:00", "微信 · 公众号发布群", "6/14 10:02", "6/16 10:00"),
      ];
    case "经营参谋":
      return [
        consoleScheduleTask("跨员工任务分派", "把老板输入的零散想法拆给增长、产品、内容、研发和运营员工。", "工作日 18:30", "飞书 · AI 员工协作群", "6/15 01:57", "6/16 09:00"),
        consoleScheduleTask("每日经营看板", "每天早上汇总客户线索、交付风险、内容排期和需要老板拍板的事项。", "每天 08:00", "飞书 + 微信 · 经营复盘群 + 老板微信", "6/14 20:45", "6/16 08:00"),
        consoleScheduleTask("周一经营复盘", "每周一把上周收入、线索、交付和团队协同整理成复盘。", "每周一 09:00", "飞书 · 经营复盘群", "6/14 23:21", "6/16 09:00"),
      ];
    case "增长负责人":
      return [
        consoleScheduleTask("线索质量巡查", "检查新增线索、来源质量和需要二次触达的人群。", "每天 09:30", deliveryGroup, "6/15 09:31", "6/16 09:30"),
        consoleScheduleTask("私域转化提醒", "提醒需要跟进的私域用户和广告落地页异常。", "工作日 16:00", deliveryGroup, "6/13 16:05", "6/16 16:00"),
        consoleScheduleTask("增长周报", "汇总 SEO、广告、内容和转化质量。", "每周五 18:00", deliveryGroup, "6/13 18:12", "6/20 18:00"),
      ];
    case "内容主编":
      return [
        consoleScheduleTask("每日选题整理", "把老板观点和交付案例整理成候选选题。", "每天 09:00", deliveryGroup, "6/15 09:04", "6/16 09:00"),
        consoleScheduleTask("发布前检查", "检查标题、封面、摘要和素材是否齐全。", "工作日 17:30", deliveryGroup, "6/14 17:42", "6/16 17:30"),
        consoleScheduleTask("周末内容复盘", "整理一周内容表现和下周排期建议。", "每周日 20:00", deliveryGroup, "6/14 20:11", "6/21 20:00"),
      ];
    case "产品经理":
      return [
        consoleScheduleTask("需求池晨检", "把用户反馈、老板想法和竞品观察归并成今日候选。", "工作日 09:20", deliveryGroup, "6/18 09:23", "6/19 09:20"),
        consoleScheduleTask("路线图同步", "等待补充验收背景后再同步本周优先级、延后事项和风险。", "每周一 10:00", deliveryGroup, "6/18 11:18", "待确认", false),
      ];
    case "Product Manager":
      return [
        consoleScheduleTask("Backlog morning check", "Group feedback, founder notes, and market observations into today's candidates.", "Weekdays 09:20", deliveryGroup, "Jun 18 09:23", "Jun 19 09:20"),
        consoleScheduleTask("Roadmap sync", "Paused until acceptance context is confirmed, then sync priority, deferrals, and risk.", "Mondays 10:00", deliveryGroup, "Jun 18 11:18", "Needs confirmation", false),
      ];
    case "研发交付负责人":
      return [
        consoleScheduleTask("交付风险巡检", "检查前后依赖、待验收变更和需要补充背景的任务。", "工作日 10:30", deliveryGroup, "6/15 10:33", "6/16 10:30"),
        consoleScheduleTask("验收清单汇总", "把当天完成项、待验证项和阻塞点整理给团队。", "工作日 18:00", deliveryGroup, "6/15 18:04", "6/16 18:00"),
      ];
    case "运营自动化负责人":
      return [
        consoleScheduleTask("自动化流程巡检", "检查飞书、任务、知识库和自动化流程是否稳定运行。", "每天 08:30", deliveryGroup, "6/15 08:31", "6/16 08:30"),
        consoleScheduleTask("知识库更新提醒", "提醒需要沉淀的流程、FAQ 和复盘材料。", "工作日 19:00", deliveryGroup, "6/15 19:03", "6/16 19:00"),
      ];
    default:
      return [
        consoleScheduleTask("每日工作巡查", `检查 ${partner.name} 的待办、渠道和需要确认的事项。`, "每天 09:00", deliveryGroup, "6/15 09:00", "6/16 09:00"),
      ];
  }
}

function consoleActivity(
  category: ConsoleActivityItem["category"],
  label: string,
  title: string,
  body: string,
  time: string,
  ageHours: number,
  channel: string,
  source: ConsoleActivityItem["source"],
  reply?: string,
): ConsoleActivityItem {
  return { category, label, title, body, time, ageHours, channel, source, reply };
}

function consolePartnerActivities(partner: ConsolePreviewPartner, locale: Locale): ConsoleActivityItem[] {
  const isZh = locale === "zh";
  if (!isZh) {
    return [
      consoleActivity("conversation", "Feishu · Chat", "Sort today's priorities", "Help me sort today's most important follow-up items.", "Jun 18 19:44", 3, "Feishu", "feishu", `${partner.name} has sorted the next steps and highlighted the item that needs confirmation.`),
      consoleActivity("tool", "Tool", "Material check", "Checked the current workspace materials.", "Jun 18 19:42", 3.1, "MotiClaw", "moticlaw"),
      consoleActivity("skill", "Skill invocation", "File-based planning", "Used the mounted planning skill to split the work into follow-up items.", "Jun 18 19:33", 3.3, "MotiClaw", "moticlaw"),
      consoleActivity("scheduled", "Automation", "Daily check completed", "The scheduled daily review has been delivered to the current workspace.", "Jun 18 09:00", 14, "Feishu", "feishu"),
      consoleActivity("system", "System", "Workspace materials updated", "New materials were attached to this AI partner's working area.", "Jun 17 18:20", 29, "MotiClaw", "moticlaw"),
    ];
  }
  const baseChannel = partner.primaryChannel === "wechat" ? "微信" : "飞书";
  const baseSource = partner.primaryChannel === "wechat" ? "wechat" : "feishu";
  const fallback = [
    consoleActivity("conversation", `${baseChannel} · 对话`, "整理今日优先级", `请把${partner.role}今天最重要的事项排出来。`, "6月18日 19:44", 3, baseChannel, baseSource, `已按${partner.role}整理完成，优先处理需要确认和会影响交付节奏的事项。`),
    consoleActivity("tool", "工具", "材料检查", "检查当前工作区材料。", "6月18日 19:42", 3.1, "MotiClaw", "moticlaw"),
    consoleActivity("skill", "技能调用", "文件化任务规划", "把目标拆成下一步、负责人和提醒时间。", "6月18日 19:33", 3.3, "MotiClaw", "moticlaw"),
    consoleActivity("scheduled", "定时任务", "例行巡查完成", "已把今天需要跟进的事项整理到当前工作区。", "6月18日 09:00", 14, baseChannel, baseSource),
    consoleActivity("system", "系统", "工作区同步", "更新 AI 伙伴的任务、渠道和材料索引。", "6月17日 18:20", 29, "MotiClaw", "moticlaw"),
  ];
  switch (partner.name) {
    case "文档助手":
      return [
        consoleActivity("tool", "工具", "技能检查", "检查文档助手已挂载技能。", "6月18日 19:44", 2.8, "MotiClaw", "moticlaw"),
        consoleActivity("conversation", "飞书 · 对话", "生成儿童绘本 PPT", "我要一个绘本 I am a bunny 的 PPT，适合 7~10 岁小朋友教学用，生成 PPTX 后把文件发给我。", "6月18日 19:44", 2.9, "飞书", "feishu", "PPTX 制作成功，文件 200KB，内容完整。已把版本概览和文件位置整理给你。"),
        consoleActivity("skill", "技能调用", "飞书全家桶", "读取飞书文档、表格和任务附件，合并到交付材料包。", "6月18日 19:33", 3.1, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "每日资料归档", "把当天新增文档、表格和演示稿整理成可检索清单。", "6月18日 18:30", 4, "飞书", "feishu"),
        consoleActivity("system", "系统", "材料索引更新", "新增 6 份材料，已同步到文档助手工作区。", "6月17日 21:16", 26, "MotiClaw", "moticlaw"),
      ];
    case "微信公众助手":
      return [
        consoleActivity("conversation", "微信 · 对话", "整理公众号发布材料", "把客户案例拆成一篇更适合公众号的选题，并提醒我缺哪些素材。", "6月18日 16:20", 6, "微信", "wechat", "已列出标题方向、封面缺口和发布前检查项，建议先补客户结果截图。"),
        consoleActivity("tool", "工具", "封面素材检查", "检查草稿、封面和摘要是否齐全。", "6月18日 16:18", 6.1, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "提示词大师", "把长案例压缩成公众号开头和摘要。", "6月18日 15:42", 6.7, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "公众号选题池巡检", "检查待发布材料，提醒缺少封面的草稿。", "6月18日 10:00", 12, "微信", "wechat"),
        consoleActivity("system", "系统", "微信对话可用", "微信公众助手会优先把发布提醒投递到微信。", "6月17日 20:12", 27, "MotiClaw", "moticlaw"),
      ];
    case "经营参谋":
      return [
        consoleActivity("conversation", "微信 · 对话", "拆分今日优先级", "把今天最重要的三件事排出来，并标出需要谁跟进。", "6月18日 19:44", 1.2, "微信", "wechat", "已按收入影响、交付风险和需要老板拍板三个维度排序，建议先处理客户确认。"),
        consoleActivity("tool", "工具", "经营看板读取", "读取线索、交付、内容排期和团队协同状态。", "6月18日 19:40", 1.3, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "文件化任务规划", "把老板的零散想法拆给增长、产品、内容、研发和运营员工。", "6月18日 19:33", 1.5, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "每日经营看板", "已向经营复盘群同步今日摘要。", "6月18日 08:00", 13, "飞书", "feishu"),
        consoleActivity("system", "系统", "经营复盘群同步", "经营参谋已把复盘摘要同步给飞书和老板微信。", "6月17日 23:21", 22, "MotiClaw", "moticlaw"),
      ];
    case "增长负责人":
      return [
        consoleActivity("conversation", "微信 · 对话", "整理增长战情室", "请把「本周增长战情室」里的有效线索、下一步触达和成交风险整理出来。", "6月15日 16:46", 74, "微信", "wechat", "已按线索热度、成交动作和下次触达时间整理完毕，优先推进已有明确预算和时间表的客户。"),
        consoleActivity("conversation", "微信 · 对话", "客户入场工作台复盘", "请把「客户入场工作台」里的有效线索、下一步触达和成交风险整理出来。", "6月15日 16:10", 75, "微信", "wechat", "已整理完毕，建议优先处理已经表达预算的客户。"),
        consoleActivity("tool", "工具", "线索热度巡查", "读取新增线索、来源质量和需要二次触达的人群。", "6月15日 15:58", 75.2, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "超能力工作流", "把线索分层、私域动作和广告落地页问题拆成任务。", "6月15日 15:42", 75.5, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "增长周报", "汇总 SEO、广告、内容和转化质量。", "6月14日 18:00", 98, "飞书", "feishu"),
      ];
    case "内容主编":
      return [
        consoleActivity("conversation", "微信 · 对话", "整理本周选题", "把老板观点、交付复盘和行业观察合并成 6 个候选标题。", "6月18日 17:36", 5, "微信", "wechat", "已整理 6 个标题，并标出最适合今天发布的 2 个。"),
        consoleActivity("tool", "工具", "素材完整性检查", "检查标题、封面、摘要和截图素材。", "6月18日 17:30", 5.1, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "提示词大师", "把长复盘压缩成公众号开头、标题和摘要。", "6月18日 17:12", 5.4, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "发布前检查", "标题、摘要和配图素材已进入待确认状态。", "6月18日 17:00", 6, "微信", "wechat"),
        consoleActivity("system", "系统", "内容排期同步", "下周内容排期已同步到内容工作区。", "6月17日 20:00", 28, "MotiClaw", "moticlaw"),
      ];
    case "产品经理":
      return [
        consoleActivity("system", "系统", "路线图同步异常", "验收背景缺少确认，路线图同步已暂停，等待负责人补充范围和验收口径。", "6月18日 11:28", 0.2, "MotiClaw", "moticlaw"),
        consoleActivity("conversation", "飞书 · 对话", "补充验收背景", "把今天归并出来的候选需求先标出阻塞项，并告诉我需要谁确认。", "6月18日 11:24", 0.3, "飞书", "feishu", "已标出 1 个阻塞项：官网管理台演示范围还缺最终验收口径。建议先让负责人确认卡片、活动记录和弹窗边界。"),
        consoleActivity("tool", "工具", "需求池读取", "读取最近反馈、截图标注和老板补充说明时，发现一条需求缺少验收背景。", "6月18日 11:22", 0.4, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "文件化任务规划", "已把需求拆成范围、验收口径和下一步，其中 1 项标记为等待确认。", "6月18日 11:18", 0.5, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "路线图同步暂停", "定时同步没有继续投递，等待验收背景补齐后恢复。", "6月18日 11:18", 0.5, "飞书", "feishu"),
      ];
    case "Product Manager":
      return [
        consoleActivity("system", "System", "Roadmap sync issue", "Acceptance context is missing, so roadmap sync is paused until scope and acceptance criteria are confirmed.", "Jun 18 11:28", 0.2, "MotiClaw", "moticlaw"),
        consoleActivity("conversation", "Feishu · Chat", "Confirm acceptance context", "Mark the blocked requirement from today's candidates and tell me who needs to confirm it.", "Jun 18 11:24", 0.3, "Feishu", "feishu", "One blocker is marked: the homepage console demo still needs final acceptance criteria for cards, activity history, and modals."),
        consoleActivity("tool", "Tool", "Backlog read", "Recent feedback, screenshot notes, and founder context were checked; one requirement is missing acceptance background.", "Jun 18 11:22", 0.4, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "Skill invocation", "File-based planning", "The requirement was split into scope, acceptance criteria, and next steps. One item is waiting for confirmation.", "Jun 18 11:18", 0.5, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "Automation", "Roadmap sync paused", "Scheduled delivery did not continue and will resume after acceptance context is complete.", "Jun 18 11:18", 0.5, "Feishu", "feishu"),
      ];
    case "研发交付负责人":
      return [
        consoleActivity("conversation", "飞书 · 对话", "检查验收清单", "先把会影响演示的交互补齐，其他的放到下一轮。", "6月18日 18:08", 4.5, "飞书", "feishu", "已识别 2 个高风险交互：活动弹窗和定时任务弹窗，需要补截图验证。"),
        consoleActivity("tool", "工具", "构建验证", "读取前端构建和样式变更状态。", "6月18日 18:02", 4.6, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "上下文工程实验室", "把截图反馈和客户端实现对齐成修改清单。", "6月18日 17:55", 4.8, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "验收清单汇总", "整理当天完成项、待验证项和阻塞点。", "6月18日 17:30", 5.2, "飞书", "feishu"),
        consoleActivity("system", "系统", "交付风险更新", "当前有 1 个任务等待产品经理确认背景。", "6月17日 19:18", 30, "MotiClaw", "moticlaw"),
      ];
    case "运营自动化负责人":
      return [
        consoleActivity("conversation", "飞书 · 对话", "调整提醒频率", "今天提醒只保留关键事项，不要打扰太多。", "6月18日 09:22", 13, "飞书", "feishu", "已改为只提醒阻塞、待确认和今天到期事项。"),
        consoleActivity("tool", "工具", "自动化流程巡查", "检查飞书、任务、知识库和自动化流程是否稳定运行。", "6月18日 08:31", 14, "MotiClaw", "moticlaw"),
        consoleActivity("skill", "技能调用", "飞书待办分派", "把流程巡查结果拆成可执行待办。", "6月18日 08:28", 14.1, "MotiClaw", "moticlaw"),
        consoleActivity("scheduled", "定时任务", "自动化流程巡检", "飞书提醒、知识库同步和任务投递均已完成晨检。", "6月18日 08:30", 14, "飞书", "feishu"),
        consoleActivity("system", "系统", "知识库更新提醒", "有 3 条复盘内容建议沉淀到工作区。", "6月17日 19:03", 29, "MotiClaw", "moticlaw"),
      ];
    default:
      return fallback;
  }
}

function consoleConfigItems(partner: ConsolePreviewPartner, locale: Locale) {
  const primaryChannel = partner.primaryChannel === "none" ? partner.channels[0] : partner.primaryChannel;
  const channelLabel = consoleChannelLabel(primaryChannel ?? "none", locale);
  if (locale === "zh") {
    return [
      `默认渠道：${channelLabel}`,
      `工作范围：${partner.role}`,
      "回复风格：先给结论，再列下一步",
      "例行巡查：工作日每 2 小时检查一次",
    ];
  }
  return [
    `Default channel: ${channelLabel}`,
    `Work scope: ${partner.role}`,
    "Reply style: answer first, then next steps",
    "Routine patrol: every 2 hours on workdays",
  ];
}

function consolePartnerPayload(partner: ConsolePreviewPartner, locale: Locale) {
  return {
    name: partner.name,
    role: partner.role,
    status: partner.status,
    channel: consoleChannelLabel(partner.primaryChannel, locale),
    avatarUrl: partner.avatarUrl,
    skills: consolePartnerSkills(partner, locale),
    tasks: consolePartnerTasks(partner, locale),
    activities: consolePartnerActivities(partner, locale),
    configItems: consoleConfigItems(partner, locale),
  };
}

function ConsolePartnerCard({
  partner,
  content,
  locale,
  mobile = false,
}: {
  partner: ConsolePreviewPartner;
  content: ConsolePreviewContent;
  locale: Locale;
  mobile?: boolean;
}) {
  const primaryIcon = consoleChannelIcon(partner.primaryChannel);
  const isConnectAction = partner.primaryChannel === "none";
  const actionTone = isConnectAction
    ? "bg-[#f7d99b] text-[#6f4305] shadow-[0_12px_24px_-18px_rgba(180,83,9,0.42)] dark:bg-[#9a6a28] dark:text-[#fff2cf]"
    : "bg-[#4171d1] text-white shadow-[0_12px_28px_-16px_rgba(65,113,209,0.62)] dark:bg-[#5b86e5] dark:text-white";
  const modalData = consolePartnerPayload(partner, locale);
  const { skills, tasks } = modalData;

  return (
    <article
      data-console-partner-card
      data-console-partner-status={partner.statusKind}
      data-console-partner-search={`${partner.name} ${partner.role} ${partner.description} ${partner.channels.map((channel) => consoleChannelLabel(channel, locale)).join(" ")}`.toLowerCase()}
      className={`min-w-0 overflow-hidden rounded-[1.125rem] border border-[#bfd3f5] bg-white shadow-[0_16px_38px_rgba(15,23,42,0.08)] transition-transform duration-150 ease-out hover:-translate-y-0.5 dark:border-[#2f3a4d] dark:bg-[#151a24] dark:shadow-[0_18px_42px_rgba(0,0,0,0.28)] ${
        mobile ? "mx-auto max-w-[23.25rem]" : ""
      }`}
    >
      <button
        type="button"
        className="relative block aspect-[16/9] w-full cursor-pointer overflow-hidden border-b border-[#e7edf5] bg-[#eef3fa] text-left dark:border-[#263143] dark:bg-[#0f1520]"
        data-console-action="activity"
        aria-label={
          locale === "zh"
            ? `${partner.status} ${partner.timeLabel}，查看${partner.name}的最近活动`
            : `${partner.status} ${partner.timeLabel}. View ${partner.name} recent activity`
        }
        data-partner-key={partner.name}
      >
        <Image src={partner.coverUrl} alt="" fill sizes={mobile ? "340px" : "(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"} className="console-scene-poster object-cover" />
        <video
          className="console-scene-video"
          data-console-scene-video
          data-scene-video-src={partner.videoUrl}
          poster={partner.coverUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/28" aria-hidden="true" />
        <span
          className={`absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-bold shadow-[0_7px_18px_rgba(15,23,42,0.18)] ${
            partner.statusKind === "working"
              ? "border-[#bbf7d0] bg-[#ecfdf5]/95 text-[#047857] dark:border-[#22c55e]/60 dark:bg-[#052e1a]/95 dark:text-[#86efac]"
              : partner.statusKind === "idle"
                ? "border-[#bae6fd] bg-[#f0f9ff]/95 text-[#0369a1] dark:border-[#38bdf8]/55 dark:bg-[#082f49]/95 dark:text-[#7dd3fc]"
                : partner.statusKind === "crashed"
                  ? "border-[#fecdd3] bg-[#fff1f2]/95 text-[#be123c] dark:border-[#fb7185]/55 dark:bg-[#3f111a]/95 dark:text-[#fecdd3]"
                  : "border-[#333333] bg-[#333333]/95 text-white dark:border-white/20 dark:bg-[#1f2937]/95 dark:text-[#e5e7eb]"
          }`}
        >
          <i className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {partner.status}
        </span>
        <span className="absolute bottom-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-3 text-xs font-bold text-[#334155] shadow-[0_8px_18px_rgba(15,23,42,0.12)] dark:border-white/15 dark:bg-[#111827]/88 dark:text-[#e5edf7]">
          <Pulse size={14} aria-hidden="true" />
          {partner.timeLabel}
        </span>
      </button>

      <div className="console-patrol-body" data-console-patrol-body>
        <div className="console-patrol-title-row">
          <Image src={partner.avatarUrl} alt="" width={30} height={30} className="console-patrol-avatar" />
          <div>
            <h3>{partner.name}</h3>
            <p>{partner.description}</p>
          </div>
        </div>
        <div className="console-patrol-divider" aria-hidden="true" />
        <div className="console-patrol-meta">
          <span className="console-patrol-usage">
            <HardDrives size={14} aria-hidden="true" />
            {partner.tokens}
          </span>
          <button
            type="button"
            className="console-patrol-channel"
            data-console-action={isConnectAction ? "config" : "chat"}
            aria-label={partner.primaryAction}
            title={partner.primaryAction}
            data-partner-key={partner.name}
          >
            {primaryIcon ? <Image src={primaryIcon} alt="" width={17} height={17} /> : <Wrench size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="console-manage-body grid min-h-[17.75rem] gap-3 p-3" data-console-manage-body>
        <div className="flex min-h-[3.25rem] items-center gap-3">
          <Image src={partner.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl border border-[#e2e8f0] bg-white object-cover shadow-[0_8px_18px_rgba(15,23,42,0.08)] dark:border-[#334155] dark:bg-[#111827]" />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="truncate text-sm font-bold text-[#1f2937] dark:text-[#eef4fb]">{partner.name}</h3>
              <Image src="/landing/ai-partner-cards/moticlaw-mark.svg" alt="" width={16} height={16} className="h-4 w-4 shrink-0 rounded-[0.35rem]" />
            </div>
            <p className="mt-1 line-clamp-1 text-[0.72rem] leading-4 text-[#64748b] dark:text-[#9ca9ba]">{partner.description}</p>
          </div>
        </div>

        <div className="flex min-h-8 flex-wrap items-center gap-2" aria-label={content.channelsLabel}>
          {partner.channels.map((channel, index) => {
            const icon = consoleChannelIcon(channel);
            return (
              <span
                key={`${partner.name}-${channel}-${index}`}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-bold ${
                  channel === "wechat"
                    ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#15803d] dark:border-[#14532d] dark:bg-[#052e1a] dark:text-[#86efac]"
                    : channel === "feishu"
                      ? "border-[#c7dbff] bg-[#f4f8ff] text-[#1d4ed8] dark:border-[#1d4ed8]/50 dark:bg-[#172554] dark:text-[#bfdbfe]"
                      : "border-[#d7e0ea] bg-[#f8fafc] text-[#64748b] dark:border-[#475569] dark:bg-[#111827] dark:text-[#cbd5e1]"
                }`}
              >
                {icon ? <Image src={icon} alt="" width={16} height={16} className="h-4 w-4 object-contain" /> : null}
                <span>{consoleChannelLabel(channel, locale)}</span>
              </span>
            );
          })}
        </div>

        <div className="flex min-h-10 items-center justify-between gap-3 border-t border-[#edf2f7] pt-3 text-sm font-bold text-[#17212b] dark:border-[#263143] dark:text-[#eef4fb]">
          <span className="inline-flex min-w-0 items-center gap-2">
            <Image src="/landing/ai-partner-cards/moticlaw-mark.svg" alt="" width={16} height={16} className="h-4 w-4 shrink-0" />
            <span className="truncate">{content.moticlawLabel}</span>
          </span>
          <span className="shrink-0">{partner.tokens}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-left text-[#64748b] transition hover:border-[#b8c8dd] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93b4f7] dark:border-[#2f3a4d] dark:bg-[#0f1520] dark:text-[#9ca9ba] dark:hover:border-[#4b5d75] dark:hover:bg-[#172033]"
            data-console-action="skills"
            data-partner-key={partner.name}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Wrench size={15} aria-hidden="true" />
              <span className="truncate text-xs font-bold">{content.skillLabel}</span>
            </span>
            <strong className="text-lg leading-none text-[#111827] dark:text-[#f8fafc]">{skills.length}</strong>
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-between gap-2 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-left text-[#64748b] transition hover:border-[#b8c8dd] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93b4f7] dark:border-[#2f3a4d] dark:bg-[#0f1520] dark:text-[#9ca9ba] dark:hover:border-[#4b5d75] dark:hover:bg-[#172033]"
            data-console-action="tasks"
            data-partner-key={partner.name}
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Pulse size={15} aria-hidden="true" />
              <span className="truncate text-xs font-bold">{content.taskLabel}</span>
            </span>
            <strong className="text-lg leading-none text-[#111827] dark:text-[#f8fafc]">{tasks.length}</strong>
          </button>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_5.25rem] gap-2 pt-1">
          <button
            type="button"
            className={`inline-flex h-12 min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl px-3 text-sm font-bold ${actionTone}`}
            data-console-action={isConnectAction ? "config" : "chat"}
            data-partner-key={partner.name}
          >
            {primaryIcon ? (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/85 dark:bg-white/92">
                <Image src={primaryIcon} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
              </span>
            ) : null}
            <span className="truncate">{partner.primaryAction}</span>
          </button>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#dce5ef] bg-white px-3 text-sm font-bold text-[#334155] shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition hover:border-[#b8c8dd] hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93b4f7] dark:border-[#2f3a4d] dark:bg-[#111827] dark:text-[#dbe6f3] dark:hover:border-[#4b5d75] dark:hover:bg-[#172033]"
            data-console-action="config"
            data-partner-key={partner.name}
          >
            {content.configLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

function buildSeoGuideLinks(locale: Locale): SeoGuideLink[] {
  if (locale === "zh") {
    return [
      { title: "下载安装", body: "确认系统支持、公开安装包和下载后第一步。", href: withLocaleQuery("/download", locale) },
      { title: "本地部署", body: "判断本地优先、数据边界和日常维护是否适合你。", href: withLocaleQuery("/local-deployment", locale) },
      { title: "产品能力", body: "快速看清 AI 伙伴工区、一键管理、配置和数据分析。", href: withLocaleQuery("/capabilities", locale) },
      { title: "AI 伙伴管理台", body: "直接在首页查看筛选、搜索、巡查和任务时间线。", href: homeConsoleAnchor(locale) },
      { title: "Agent 管理工作台", body: "面向 Agent 入职、状态查看、配置运维和持续管理。", href: withLocaleQuery("/agent-management-workbench", locale) },
      { title: "FDE 落地交付", body: "面向 AI 咨询、客户部署和可复制交付场景。", href: withLocaleQuery("/fde-ai-delivery", locale) },
      { title: "FDE 本地交付路径", body: "面向客户需求、部署配置、数据边界和后续维护。", href: withLocaleQuery("/fde-local-ai-delivery", locale) },
      { title: "FDE 交接清单", body: "面向配置说明、日常巡检、维护责任和客户反馈。", href: withLocaleQuery("/fde-client-handoff-playbook", locale) },
      { title: "AI 独立开发者", body: "面向 Agent 产品、客户演示、配置运维和长期维护。", href: withLocaleQuery("/ai-workbench-for-indie-developers", locale) },
      { title: "Agent 工作方式", body: "面向 Agent 管理、服务配置、客户演示和交付维护。", href: withLocaleQuery("/indie-agent-workbench", locale) },
      { title: "Demo 到维护", body: "面向 Agent Demo、客户试用、反馈追踪和长期维护。", href: withLocaleQuery("/indie-agent-demo-to-maintenance", locale) },
      { title: "OPC 运营工作流", body: "面向内容选题、素材整理、发布检查和线索跟进。", href: withLocaleQuery("/opc-content-ops-system", locale) },
      { title: "AI 内容日历", body: "面向选题来源、素材池、发布检查、线索回流和复盘节奏。", href: withLocaleQuery("/opc-ai-content-calendar-workflow", locale) },
      { title: "AI 伙伴还是招人", body: "先判断工作类型，再选择 AI 伙伴、外包或正式员工。", href: withLocaleQuery("/ai-employee-vs-hiring-assistant", locale) },
      { title: "AI 决策工作流", body: "面向老板反复出现的经营判断、选项整理和风险提醒。", href: withLocaleQuery("/founder-ai-decision-workflow", locale) },
      { title: "第一条 AI 伙伴工作流", body: "面向老板先选择可交给 AI 的重复事务。", href: withLocaleQuery("/founder-ai-employee-first-workflow", locale) },
      { title: "老板与超级个体", body: "面向事务收拢、AI 助手团队和持续推进工作。", href: withLocaleQuery("/ai-partner-for-founders", locale) },
    ];
  }
  return [
    { title: "Download", body: "Check platform support, public installers, and the first step after download.", href: withLocaleQuery("/download", locale) },
    { title: "Local deployment", body: "Decide whether local-first operation, data boundaries, and maintenance fit your work.", href: withLocaleQuery("/local-deployment", locale) },
      { title: "Capabilities", body: "See the AI partner workspace, one-click operations, configuration, and data insights.", href: withLocaleQuery("/capabilities", locale) },
    { title: "AI partner console", body: "See filtering, search, patrol, and task timelines directly on the homepage.", href: homeConsoleAnchor(locale) },
    { title: "Agent workbench", body: "For agent onboarding, status, configuration, operations, and ongoing management.", href: withLocaleQuery("/agent-management-workbench", locale) },
    { title: "FDE delivery", body: "For AI consulting, client deployment, and repeatable delivery workflows.", href: withLocaleQuery("/fde-ai-delivery", locale) },
    { title: "FDE local delivery path", body: "For client scope, deployment, data boundaries, and maintenance handoff.", href: withLocaleQuery("/fde-local-ai-delivery", locale) },
    { title: "FDE handoff checklist", body: "For configuration notes, health checks, maintenance ownership, and client feedback.", href: withLocaleQuery("/fde-client-handoff-playbook", locale) },
    { title: "Indie developers", body: "For agent products, demos, configuration, operations, and ongoing maintenance.", href: withLocaleQuery("/ai-workbench-for-indie-developers", locale) },
    { title: "Agent workflow", body: "For agent management, service configuration, client demos, and delivery maintenance.", href: withLocaleQuery("/indie-agent-workbench", locale) },
    { title: "Demo to maintenance", body: "For agent demos, client trials, feedback tracking, and long-term maintenance.", href: withLocaleQuery("/indie-agent-demo-to-maintenance", locale) },
    { title: "OPC workflows", body: "For topic planning, asset organization, publishing checks, and lead follow-up.", href: withLocaleQuery("/opc-content-ops-system", locale) },
    { title: "AI content calendar", body: "For topic sources, asset pools, publishing checks, lead feedback, and recap rhythm.", href: withLocaleQuery("/opc-ai-content-calendar-workflow", locale) },
    { title: "AI partner or hiring", body: "Classify the work before choosing an AI partner, a contractor, or an employee.", href: withLocaleQuery("/ai-employee-vs-hiring-assistant", locale) },
    { title: "AI decision workflow", body: "For repeated founder decisions, option preparation, and risk reminders.", href: withLocaleQuery("/founder-ai-decision-workflow", locale) },
    { title: "First AI partner workflow", body: "For choosing the first repeated founder workflow to hand to AI.", href: withLocaleQuery("/founder-ai-employee-first-workflow", locale) },
    { title: "Founders", body: "For gathering scattered work, managing AI assistants, and keeping execution moving.", href: withLocaleQuery("/ai-partner-for-founders", locale) },
  ];
}

function buildAudiencePaths(locale: Locale, links: SeoGuideLink[]) {
  const byPath = (prefix: string) => links.find((item) => item.href.startsWith(prefix));
  const compact = (...items: Array<SeoGuideLink | undefined>) => items.filter((item): item is SeoGuideLink => Boolean(item));

  if (locale === "zh") {
    return [
      {
        title: "FDE 与 AI 落地交付者",
        body: "先判断客户场景，再把可维护的本地 AI 伙伴工作台交付出去。",
        primary: byPath("/fde-client-handoff-playbook"),
        related: compact(byPath("/fde-local-ai-delivery"), byPath("/fde-ai-delivery"), byPath("/agent-management-workbench"), byPath("/local-deployment")),
      },
      {
        title: "AI 独立开发者",
        body: "把产品演示、Agent 管理、配置运维和客户支持放进一条更稳的工作路径。",
        primary: byPath("/indie-agent-demo-to-maintenance"),
        related: compact(byPath("/indie-agent-workbench"), byPath("/capabilities"), byPath("/download")),
      },
      {
        title: "OPC / 运营负责人",
        body: "把选题、素材、发布检查和线索跟进沉淀成可复用的 AI 内容运营系统。",
        primary: byPath("/opc-ai-content-calendar-workflow"),
        related: compact(byPath("/opc-content-ops-system"), byPath("/capabilities"), byPath("/blog")),
      },
      {
        title: "老板与超级个体",
        body: "从事务收拢开始，让 AI 助手团队持续推进跟进、提醒和重复工作。",
        primary: byPath("/ai-employee-vs-hiring-assistant"),
        related: compact(byPath("/founder-ai-decision-workflow"), byPath("/founder-ai-employee-first-workflow"), byPath("/ai-partner-for-founders"), byPath("/capabilities")),
      },
    ];
  }
  return [
    {
      title: "FDEs and AI delivery builders",
      body: "Start from the client scenario, then hand over a local AI partner workbench that can be maintained.",
      primary: byPath("/fde-client-handoff-playbook"),
      related: compact(byPath("/fde-local-ai-delivery"), byPath("/fde-ai-delivery"), byPath("/agent-management-workbench"), byPath("/local-deployment")),
    },
    {
      title: "AI indie developers",
      body: "Keep product demos, agent management, configuration, operations, and customer support on a steadier path.",
      primary: byPath("/indie-agent-demo-to-maintenance"),
      related: compact(byPath("/indie-agent-workbench"), byPath("/capabilities"), byPath("/download")),
    },
    {
      title: "OPC and operations leads",
      body: "Turn topics, assets, publishing checks, and lead follow-up into a repeatable AI content operations system.",
      primary: byPath("/opc-ai-content-calendar-workflow"),
      related: compact(byPath("/opc-content-ops-system"), byPath("/capabilities"), byPath("/blog")),
    },
    {
      title: "Founders and solo operators",
      body: "Begin by gathering scattered work, then keep reminders, follow-up, and repeated tasks moving through AI assistants.",
      primary: byPath("/ai-employee-vs-hiring-assistant"),
      related: compact(byPath("/founder-ai-decision-workflow"), byPath("/founder-ai-employee-first-workflow"), byPath("/ai-partner-for-founders"), byPath("/capabilities")),
    },
  ];
}

export function MotiClawLandingStatic({
  locale,
  releaseManifest,
}: {
  locale: Locale;
  releaseManifest: ReleaseManifest;
}) {
  const content = copy[locale];
  const consolePreview = buildConsolePreview(locale);
  const seoGuideLinks = buildSeoGuideLinks(locale);
  const audiencePathLinks = buildAudiencePaths(locale, seoGuideLinks);
  const releaseDate = formatReleaseDate(releaseManifest.release_date || releaseManifest.generated_at, locale);
  const displayVersion = getDisplayVersion(releaseManifest);

  const landingData = {
    locale,
    partners: Object.fromEntries(
      consolePreview.partners.map((partner) => [partner.name, consolePartnerPayload(partner, locale)]),
    ),
    artifacts: Object.fromEntries(
      Object.entries(releaseManifest.artifacts).map(([key, value]) => [
        key,
        value?.archive
          ? { url: value.archive.url ?? "", filename: value.archive.filename ?? "", sizeBytes: value.archive.size_bytes ?? 0 }
          : null,
      ]),
    ),
    strings: {
      detectingDevice: content.download.detectingDevice,
      unknownDevice: content.download.unknownDevice,
      recommendedPendingTitle: content.download.recommendedPendingTitle,
      recommendedPendingNote: content.download.recommendedPendingNote,
      comingSoon: content.download.comingSoon,
      size: content.download.size,
      githubRelease: content.download.githubRelease,
      groups: content.download.groups,
      platforms: content.download.platforms,
      installNotes: content.download.installNotes,
    },
  };

  return (
    <main className="site-shell content-workspace-home relative overflow-x-hidden">
      <SiteHeaderStatic locale={locale} path="/" variant="landing" />

      <div className={`site-page-shell mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 sm:px-8 lg:px-10 ${locale === "en" ? "pt-[7.5rem] sm:pt-[7rem]" : "pt-[4.75rem] sm:pt-16"}`}>
        <section
          id="top"
          className="hero-section hero-client-stage flex flex-1 items-center justify-center pb-10 pt-4 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-10"
          style={locale === "en" ? { minHeight: "min(780px, calc(100vh - 7rem))" } : undefined}
        >
          <div className="hero-device-composition rise-in" style={{ animationDelay: "60ms" }}>
            <h1
              lang={locale === "zh" ? "zh-CN" : "en"}
              className="hero-device-title display font-semibold text-[var(--foreground)]"
            >
              {content.heroTitle.replace(/\s*\n\s*/g, locale === "zh" ? "" : " ")}
            </h1>

            <div className="hero-laptop-stage">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/landing/moticlaw-macbook-white-screen-v4-768.avif 768w, /landing/moticlaw-macbook-white-screen-v4-1152.avif 1152w, /landing/moticlaw-macbook-white-screen-v4-1536.avif 1536w"
                  sizes="(max-width: 640px) calc(100vw + 1.5rem), 62rem"
                />
                <source
                  type="image/webp"
                  srcSet="/landing/moticlaw-macbook-white-screen-v4-768.webp 768w, /landing/moticlaw-macbook-white-screen-v4-1152.webp 1152w, /landing/moticlaw-macbook-white-screen-v4-1536.webp 1536w"
                  sizes="(max-width: 640px) calc(100vw + 1.5rem), 62rem"
                />
                <img
                  src="/landing/moticlaw-macbook-white-screen-v4.png"
                  alt={locale === "zh" ? "打开 MotiClaw 内容创作工作台的 MacBook" : "A MacBook displaying the MotiClaw content workspace"}
                  className="hero-laptop-device"
                  width={1536}
                  height={1024}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
              <div className="hero-laptop-screen">
                <div className="hero-brand-lockup">
                  <picture>
                    <source
                      type="image/webp"
                      srcSet="/brand/moticlaw-eye-look-v1-96.webp 96w, /brand/moticlaw-eye-look-v1-192.webp 192w"
                      sizes="(max-width: 640px) 36px, 84px"
                    />
                    <img
                      src="/brand/moticlaw-eye-look.gif"
                      alt=""
                      width={512}
                      height={512}
                      className="hero-motion-logo"
                      aria-hidden="true"
                    />
                  </picture>
                  <span>MotiClaw</span>
                </div>
                <p className="hero-product-label">
                  {locale === "zh" ? "本地内容创作 AI 工作台" : "Local AI content creation workspace"}
                </p>
                <button
                  type="button"
                  data-open-download
                  data-analytics-event="download_open"
                  data-analytics-label="hero"
                  className="hero-client-cta"
                >
                  <span>{content.primaryCta}</span>
                  <ArrowRight className="hero-client-cta-arrow" size={16} weight="regular" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="content-stream">
          <section id="about" className="cv-auto fade-up scroll-mt-24 py-12 text-center sm:py-16" style={{ animationDelay: "210ms" }} aria-labelledby="moticlaw-definition-title">
            <h2 id="moticlaw-definition-title" className="mx-auto max-w-3xl text-3xl font-semibold tracking-[-0.05em] text-[var(--foreground)] sm:text-4xl">
              {locale === "zh" ? "MotiClaw 是什么？" : "What is MotiClaw?"}
            </h2>
            <div itemScope itemType="https://schema.org/Answer" data-answer-first="true">
              <p itemProp="text" className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
                {locale === "zh"
                  ? "MotiClaw 是一款本地内容创作 AI 工作台：把灵感、素材、创作与发布收进同一个工作空间，让 AI 完成整理、起草、改写和发布准备，工作数据默认留在你的设备上。"
                  : "MotiClaw is a local AI content creation workspace that brings ideas, source material, creation, and publishing together while AI handles organization, drafting, rewriting, and publishing preparation. Work data stays on your device by default."}
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-xs leading-6 text-[var(--muted)] sm:text-sm">
                {locale === "zh" ? (
                  <>
                    隐私设计参考 <a className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--foreground)]" href="https://www.nist.gov/privacy-framework/frequently-asked-questions" target="_blank" rel="noreferrer">美国国家标准与技术研究院（NIST）</a> 对隐私框架的说明：<q cite="https://www.nist.gov/privacy-framework/frequently-asked-questions">identify and manage privacy risk</q>。
                  </>
                ) : (
                  <>
                    Privacy design reference: the <a className="underline decoration-[var(--line)] underline-offset-4 hover:text-[var(--foreground)]" href="https://www.nist.gov/privacy-framework/frequently-asked-questions" target="_blank" rel="noreferrer">U.S. National Institute of Standards and Technology (NIST)</a> describes its framework as helping organizations <q cite="https://www.nist.gov/privacy-framework/frequently-asked-questions">identify and manage privacy risk</q>.
                  </>
                )}
              </p>
            </div>
          </section>

          <section id="ai-partner-console-preview" className="cv-auto fade-up scroll-mt-24 pb-0 pt-0" style={{ animationDelay: "240ms" }}>
            <h2 className="sr-only">
              {locale === "zh" ? "在一个工作台管理内容创作伙伴" : "Manage content creation partners in one workspace"}
            </h2>
            <div className="overflow-visible rounded-[1rem] shadow-[0_26px_70px_rgba(23,33,43,0.16)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.42)]">
              <div className="overflow-hidden rounded-[1rem] border border-[#d2dbe8] bg-[#f7f9fc] text-[#17212b] dark:border-[#2f3a4d] dark:bg-[#0f1520] dark:text-[#eef4fb]">
                <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#dce4eb] bg-white px-4 py-3 dark:border-[#263143] dark:bg-[#151a24]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex shrink-0 gap-1.5" aria-hidden="true">
                      <span className="h-3 w-3 rounded-full bg-[#ff6b5f]" />
                      <span className="h-3 w-3 rounded-full bg-[#f7c948]" />
                      <span className="h-3 w-3 rounded-full bg-[#2cc46f]" />
                    </span>
                    <p className="truncate text-sm font-semibold text-[#17212b] dark:text-[#eef4fb]">{consolePreview.windowTitle}</p>
                  </div>
                  <div className="hidden rounded-full border border-[#dce4eb] bg-[#f7f9fb] p-1 dark:border-[#2f3a4d] dark:bg-[#0f1520] sm:flex">
                    <button
                      type="button"
                      className="console-mode-button inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition"
                      data-console-mode-toggle="manage"
                      data-active="true"
                      aria-pressed="true"
                    >
                      <Sliders size={14} weight="regular" aria-hidden="true" />
                      {consolePreview.manage}
                    </button>
                    <button
                      type="button"
                      className="console-mode-button inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition"
                      data-console-mode-toggle="patrol"
                      data-active="false"
                      aria-pressed="false"
                    >
                      <Pulse size={14} weight="regular" aria-hidden="true" />
                      {consolePreview.patrol}
                    </button>
                  </div>
                </div>

                <div
                  className="hidden border-b border-[#dce4eb] bg-[#fbfcfd] px-4 py-3 md:block dark:border-[#263143] dark:bg-[#111827]"
                  data-console-controls
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-0.5 md:flex">
                      {consolePreview.filters.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="console-filter-button inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-bold transition"
                          data-console-filter={item.id}
                          aria-pressed={item.id === "all" ? "true" : "false"}
                        >
                          {item.id === "all" ? null : <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
                          {item.label}
                          <span className="text-current opacity-70">{item.count}</span>
                        </button>
                      ))}
                    </div>
                    <label className="relative hidden w-[28rem] max-w-[38vw] shrink-0 lg:block">
                      <span className="sr-only">{consolePreview.search}</span>
                      <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7b8793] dark:text-[#8ea0b5]" size={17} aria-hidden="true" />
                      <input
                        placeholder={consolePreview.search}
                        className="h-full min-h-11 w-full rounded-lg border border-[#d8e1e8] bg-white pl-9 pr-3 text-sm text-[#17212b] outline-none placeholder:text-[#94a3b8] dark:border-[#2f3a4d] dark:bg-[#151a24] dark:text-[#eef4fb] dark:placeholder:text-[#748195]"
                        data-console-search
                      />
                    </label>
                  </div>
                </div>

                <div className="bg-[#f7f9fc] p-3 sm:p-4 dark:bg-[#0f1520]">
                  <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-4" data-console-grid>
                    {consolePreview.partners.map((partner) => (
                      <ConsolePartnerCard key={partner.name} partner={partner} content={consolePreview} locale={locale} />
                    ))}
                  </div>

                  <div className="md:hidden">
                    <ConsolePartnerCard
                      partner={consolePreview.partners.find((partner) => partner.statusKind === "working") ?? consolePreview.partners[0]}
                      content={consolePreview}
                      locale={locale}
                      mobile
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="product-features" className="fade-up scroll-mt-24 pt-12 pb-14 sm:pt-14 lg:pt-16" style={{ animationDelay: "260ms" }}>
            <div className="product-feature-shell">
              <p className="product-feature-eyebrow">{content.statsSectionTitle}</p>
              <h2 className="product-feature-title">
                {locale === "zh" ? "把创作从零散步骤，变成一条连续路径" : "Turn scattered creation steps into one continuous path"}
              </h2>
              <p className="product-feature-body">
                {locale === "zh"
                  ? "收集灵感与素材，交给 AI 完成整理、起草和改写，再在同一个工作空间准备发布。你保留观点与判断，把执行交给 AI。"
                  : "Collect ideas and source material, let AI organize, draft, and adapt them, then prepare to publish from the same workspace."}
              </p>
              <div className="product-feature-grid">
              {content.stats.map((item) => (
                <article key={item.title} className="product-feature-card">
                  <div className="product-feature-media">
                    <Image src={item.imageUrl} alt="" fill sizes="(min-width: 1024px) 28vw, 100vw" className="object-cover" />
                    <item.icon size={28} weight="regular" aria-hidden="true" />
                  </div>
                  <div className="product-feature-copy">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </section>

          <section id="user-stories" className="cv-auto fade-up scroll-mt-24 py-16" style={{ animationDelay: "280ms" }}>
            <p className="section-eyebrow-lg mb-3 text-center">{content.stories.eyebrow}</p>
            <h2 className="mx-auto mb-3 max-w-3xl text-center text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              {content.stories.title}
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-base leading-7 text-[var(--muted)]">{content.stories.body}</p>
            <div className="story-grid grid gap-4 lg:grid-cols-3">
              {content.stories.cards.map((story) => (
                <article key={story.name} className="story-card">
                  <div className={`story-card-media story-visual-${story.visual}`}>
                    <div className="story-profile">
                      <div className="story-avatar" style={{ backgroundImage: `url(${story.avatar})` }} aria-hidden="true" />
                      <div className="story-person">
                        <p className="story-persona">{story.persona}</p>
                        <h3>{story.name}</h3>
                        <p>{story.role}</p>
                      </div>
                    </div>
                    <div className="story-impact">
                      <span>{content.stories.changeLabel}</span>
                      <strong>{story.impact}</strong>
                    </div>
                  </div>
                  <div className="story-card-copy">
                    <blockquote>
                      <span>{story.quote}</span>
                    </blockquote>
                    <p>{story.body}</p>
                    <div className="story-shift" aria-label={content.stories.shiftAria}>
                      <p>
                        <span>{content.stories.beforeLabel}</span>
                        <strong>{story.before}</strong>
                      </p>
                      <p>
                        <span>{content.stories.afterLabel}</span>
                        <strong>{story.after}</strong>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="capabilities" className="cv-auto fade-up scroll-mt-24 py-16" style={{ animationDelay: "300ms" }}>
            <p className="section-eyebrow-lg mb-3 text-center">{content.capabilities.eyebrow}</p>
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

          <section id="seo-guides" className="cv-auto fade-up scroll-mt-24 py-16" style={{ animationDelay: "320ms" }}>
            <p className="section-eyebrow-lg mb-3 text-center">{content.seoGuides.eyebrow}</p>
            <h2 className="mx-auto mb-3 max-w-3xl text-center text-3xl font-semibold text-[var(--foreground)] sm:text-4xl">
              {content.seoGuides.title}
            </h2>
            <p className="mx-auto mb-8 max-w-3xl text-center text-base leading-7 text-[var(--muted)]">{content.seoGuides.body}</p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {seoGuideLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="group block rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_28px_rgba(23,20,17,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(0,0,0,0.32)] hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,0,0,0.35)]"
                >
                  <h3 className="text-[1.08rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">{item.title}</h3>
                  <p className="mt-2 min-h-[3rem] text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--accent-strong)] transition group-hover:opacity-85">
                    {locale === "zh" ? "适合我，继续看" : "See if this fits"}
                  </span>
                </a>
              ))}
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {audiencePathLinks.map((item) => (
                <article key={item.title} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_10px_24px_rgba(23,20,17,0.045)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.body}</p>
                  <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm">
                    {item.primary ? (
                      <a href={item.primary.href} className="font-semibold text-[var(--accent-strong)] transition hover:opacity-80">
                        {item.primary.title}
                      </a>
                    ) : null}
                    {item.related.map((link) => (
                      <a key={link.href} href={link.href} className="font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
                        {link.title}
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <SiteFaqSection locale={locale} />

          <section id="contact" className="cv-auto fade-up scroll-mt-24 py-16" style={{ animationDelay: "340ms" }}>
            <p className="section-eyebrow-lg mb-7 text-center">{content.contact.eyebrow}</p>
            <div className="contact-grid mx-auto flex max-w-[34rem] flex-col flex-wrap items-center justify-center gap-4 sm:flex-row sm:gap-8 lg:gap-10">
              <button
                type="button"
                aria-haspopup="dialog"
                data-open-contact
                className="contact-link-card group relative grid aspect-square w-[11.4rem] max-w-full cursor-pointer place-items-center overflow-hidden rounded-[1.35rem] border border-[rgba(22,29,44,0.08)] bg-[rgba(255,255,255,0.72)] px-3 py-3 text-center shadow-[0_10px_28px_rgba(23,20,17,0.07)] backdrop-blur-[10px] transition duration-200 hover:-translate-y-1 hover:border-[rgba(0,0,0,0.3)] hover:shadow-[0_16px_36px_rgba(23,20,17,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,0,0,0.35)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(circle_at_18%_30%,rgba(23,20,17,0.08)_0_1.5px,transparent_3px),radial-gradient(circle_at_74%_22%,rgba(0,0,0,0.12)_0_1.5px,transparent_3px),radial-gradient(circle_at_82%_68%,rgba(23,20,17,0.06)_0_1px,transparent_2px),radial-gradient(circle_at_22%_80%,rgba(0,0,0,0.1)_0_1px,transparent_2px)] dark:opacity-35 dark:[background-image:radial-gradient(circle_at_18%_30%,rgba(255,255,255,0.12)_0_1.5px,transparent_3px),radial-gradient(circle_at_74%_22%,rgba(255,255,255,0.1)_0_1.5px,transparent_3px),radial-gradient(circle_at_82%_68%,rgba(255,255,255,0.08)_0_1px,transparent_2px),radial-gradient(circle_at_22%_80%,rgba(255,255,255,0.08)_0_1px,transparent_2px)]"
                />
                <span className="relative flex h-full w-full flex-col items-center justify-center">
                  <span className="grid h-[2.35rem] w-[2.35rem] place-items-center rounded-full bg-[rgba(0,0,0,0.1)] text-[var(--accent-strong)] dark:bg-[rgba(255,255,255,0.1)] dark:text-[var(--accent-strong)]">
                    <UsersThree size={28} weight="regular" aria-hidden="true" />
                  </span>
                  <span className="mt-2 block text-[1rem] font-semibold tracking-[-0.04em] text-[var(--foreground)] md:text-[1.05rem]">
                    {content.contact.linkTitle}
                  </span>
                  <span className="mt-1 block text-[0.78rem] leading-[1.35] text-[var(--muted)] md:text-[0.82rem]">
                    {content.contact.linkBody}
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-7 flex justify-center">
              <nav aria-label={content.footerLinksLabel} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{content.footerLinksLabel}</span>
                {seoGuideLinks.map((item, index) => (
                  <span key={item.title} className="inline-flex items-center gap-3">
                    {index > 0 ? <span aria-hidden="true" className="text-[var(--line)]">/</span> : null}
                    <a href={item.href} className="font-medium text-[var(--foreground)] transition hover:text-[var(--accent-strong)]">
                      {item.title}
                    </a>
                  </span>
                ))}
              </nav>
            </div>
          </section>
        </div>
      </div>

      <SiteFooter locale={locale} />

      {/* Download modal (hidden until landing.js opens it) */}
      <div id="download-modal" className="download-modal-backdrop landing-modal" role="presentation" hidden>
        <section className="download-modal" role="dialog" aria-modal="true" aria-labelledby="download-modal-title">
          <button type="button" className="download-modal-close" data-close-modal aria-label={content.download.close} title={content.download.close}>
            <X size={18} weight="bold" aria-hidden="true" />
          </button>

          <div className="download-modal-header">
            <p className="download-modal-eyebrow">{content.download.recommended}</p>
            <h2 id="download-modal-title" className="download-modal-title">
              {content.download.title} <span>{displayVersion}</span>
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
            <strong id="download-detected-label">{content.download.detectingDevice}</strong>
          </div>

          <a id="download-recommended-card" className="download-recommended-card download-recommended-card-unavailable" href={releaseManifest.release_url ?? "#"} target="_blank" rel="noreferrer">
            <span className="download-package-icon" id="download-recommended-icon">
              <Package size={26} weight="regular" aria-hidden="true" />
            </span>
            <span className="download-package-content">
              <span className="download-package-title" id="download-recommended-title">{content.download.recommendedPendingTitle}</span>
              <span className="download-package-file" id="download-recommended-file">{content.download.recommendedPendingNote}</span>
              <span className="download-package-meta" id="download-recommended-meta"></span>
            </span>
            <span className="download-package-action" id="download-recommended-action" aria-hidden="true" hidden>
              <DownloadSimple size={21} weight="bold" />
            </span>
            <span className="download-package-note" id="download-recommended-note" hidden>
              <Info size={15} weight="regular" aria-hidden="true" />
              <span id="download-recommended-note-text"></span>
            </span>
          </a>

          <div className="download-platform-section">
            <button type="button" id="download-platform-toggle" className="download-platform-toggle" aria-expanded="false">
              <span>{content.download.otherPlatforms}</span>
              <CaretDown size={16} weight="bold" aria-hidden="true" id="download-platform-caret" />
            </button>

            <div className="download-platform-groups" id="download-platform-groups" hidden>
              {platformGroups.map((group) => {
                const groupOptions = platformOptions.filter((option) => option.group === group);
                const availableInGroup = groupOptions.some((option) => isVisibleArtifact(option.key, releaseManifest.artifacts[option.key]?.archive));

                return (
                  <div key={group} className="download-platform-group">
                    <div className="download-platform-group-title download-platform-group-title-static">
                      <span className="download-platform-group-name">
                        <PlatformIcon group={group} size={16} />
                        {content.download.groups[group]}
                      </span>
                    </div>

                    <div className="download-platform-list">
                      {groupOptions.map((option) => {
                        const artifact = releaseManifest.artifacts[option.key]?.archive;
                        const available = availableInGroup && isVisibleArtifact(option.key, artifact);

                        return available ? (
                          <a key={option.key} href={artifact?.url} target="_blank" rel="noreferrer" className="download-platform-row download-platform-row-available">
                            <span>{content.download.platforms[option.key]}</span>
                            <DownloadSimple size={15} weight="bold" aria-hidden="true" />
                          </a>
                        ) : (
                          <span key={option.key} className="download-platform-row download-platform-row-disabled">
                            <span>{content.download.platforms[option.key]}</span>
                            <span className="download-platform-row-status">{content.download.comingSoon}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Promo video modal */}
      <div id="promo-video-modal" className="promo-video-backdrop landing-modal" role="presentation" hidden>
        <section className="promo-video-modal" role="dialog" aria-modal="true" aria-label={content.heroVideo.promoTitle}>
          <button type="button" className="promo-video-close" data-close-modal aria-label={content.download.close} title={content.download.close}>
            <X size={20} weight="bold" aria-hidden="true" />
          </button>

          <div className="promo-video-container">
            <video
              id="promo-video-player"
              className="promo-video-player"
              controls
              preload="none"
              data-src="https://moticlaw.oss-cn-hangzhou.aliyuncs.com/site/videos/hero-promo.mp4"
              aria-label={content.heroVideo.promoTitle}
            ></video>
          </div>
        </section>
      </div>

      {/* Contact QR modal */}
      <div
        id="contact-qr-modal"
        className="landing-modal fixed inset-0 z-[82] grid place-items-center bg-[rgba(0,0,0,0.32)] px-4 py-4 backdrop-blur-[10px] dark:bg-[rgba(0,0,0,0.7)]"
        role="presentation"
        hidden
      >
        <section
          className="relative flex max-h-[88vh] flex-col gap-3 overflow-y-auto rounded-[1rem] border border-[rgba(0,0,0,0.14)] bg-white p-3 text-[#111111] shadow-[0_20px_64px_rgba(0,0,0,0.2)] dark:border-[rgba(255,255,255,0.1)] dark:bg-[#090a0d] dark:text-[#f7f7fb] sm:p-4"
          style={{ width: "min(25.5rem, calc(100vw - 2rem))" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-qr-modal-title"
        >
          <button
            type="button"
            className="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,0,0,0.14)] bg-[rgba(255,255,255,0.76)] text-[#111111] transition hover:border-[rgba(0,0,0,0.35)] hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(0,0,0,0.24)] dark:border-[rgba(255,255,255,0.1)] dark:bg-[rgba(255,255,255,0.05)] dark:text-[#f7f7fb]"
            data-close-modal
            aria-label={content.download.close}
            title={content.download.close}
          >
            <X size={16} weight="bold" aria-hidden="true" />
          </button>

          <div className="space-y-1.5 pr-9">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">{content.contact.eyebrow}</p>
            <h2 id="contact-qr-modal-title" className="text-base font-semibold">{content.contact.modalTitle}</h2>
            <p className="text-xs leading-5 text-[rgba(88,80,73,0.82)] dark:text-[rgba(183,187,199,0.82)]">{content.contact.modalBody}</p>
          </div>

          <div className="overflow-hidden rounded-[0.85rem] border border-[rgba(74,55,39,0.08)] bg-white dark:border-[rgba(255,255,255,0.08)] dark:bg-white">
            <img src={feishuGroupQrUrl} alt={content.contact.imageAlt} loading="lazy" className="block h-auto max-h-[58vh] w-full object-contain" />
          </div>

          <p className="text-[0.68rem] leading-4 text-[rgba(88,80,73,0.76)] dark:text-[rgba(183,187,199,0.72)]">{content.contact.modalHint}</p>
        </section>
      </div>

      {/* AI partner demo modal */}
      <div id="partner-console-modal" className="partner-console-backdrop landing-modal" role="presentation" hidden>
        <section className="partner-console-modal" role="dialog" aria-modal="true" aria-labelledby="partner-console-modal-title">
          <button type="button" className="partner-console-close" data-close-modal aria-label={consolePreview.modalCloseLabel} title={consolePreview.modalCloseLabel}>
            <X size={18} weight="bold" aria-hidden="true" />
          </button>

          <div className="partner-console-header">
            <h2 id="partner-console-modal-title" className="partner-console-title"></h2>
            <p id="partner-console-modal-subtitle" className="partner-console-subtitle"></p>
          </div>

          <div id="partner-console-list-panel" className="partner-console-panel">
            <div id="partner-console-list" className="partner-console-list"></div>
          </div>

          <div id="partner-console-chat-panel" className="partner-console-chat" hidden>
            <div id="partner-console-chat-log" className="partner-console-chat-log" aria-live="polite"></div>
            <form id="partner-console-chat-form" className="partner-console-chat-form">
              <label className="sr-only" htmlFor="partner-console-chat-input">{consolePreview.chatPlaceholder}</label>
              <input id="partner-console-chat-input" name="message" autoComplete="off" placeholder={consolePreview.chatPlaceholder} />
              <button type="submit">{consolePreview.chatSendLabel}</button>
            </form>
          </div>
        </section>
      </div>

      <script
        type="application/json"
        id="landing-data"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingData).replace(/</g, "\\u003c") }}
      />
      <script src="/landing.js" defer></script>
    </main>
  );
}
