import type { Locale } from "@/lib/locale";
import { withLocaleQuery } from "@/components/seo-resource-manifest";

type FooterLink = { label: string; href: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };

function footerColumns(locale: Locale): FooterColumn[] {
  const href = (path: string) => withLocaleQuery(path, locale);
  if (locale === "zh") {
    return [
      {
        title: "产品",
        links: [
          { label: "下载安装", href: href("/download") },
          { label: "产品能力", href: href("/capabilities") },
          { label: "互动产品预览", href: href("/ai-partner-console") },
          { label: "本地部署", href: href("/local-deployment") },
          { label: "Agent 管理工作台", href: href("/agent-management-workbench") },
          { label: "套餐价格", href: href("/pricing") },
        ],
      },
      {
        title: "解决方案",
        links: [
          { label: "全部解决方案", href: href("/solutions") },
          { label: "FDE 落地交付", href: href("/fde-ai-delivery") },
          { label: "AI 独立开发者", href: href("/ai-workbench-for-indie-developers") },
          { label: "OPC 内容运营", href: href("/opc-content-ops-system") },
          { label: "老板与超级个体", href: href("/ai-partner-for-founders") },
        ],
      },
      {
        title: "工作流",
        links: [
          { label: "全部工作流", href: href("/workflows") },
          { label: "FDE 本地交付路径", href: href("/fde-local-ai-delivery") },
          { label: "AI 内容日历", href: href("/opc-ai-content-calendar-workflow") },
          { label: "AI 决策工作流", href: href("/founder-ai-decision-workflow") },
          { label: "第一条 AI 伙伴工作流", href: href("/founder-ai-employee-first-workflow") },
        ],
      },
      {
        title: "资源",
        links: [
          { label: "全部资源", href: href("/resources") },
          { label: "博客", href: href("/blog") },
          { label: "产品文档", href: href("/docs") },
          { label: "快速开始", href: href("/docs/quickstart") },
          { label: "关于 MotiClaw · About", href: href("/about") },
          { label: "联系我们 · Contact", href: href("/contact") },
          { label: "隐私政策", href: href("/privacy") },
          { label: "服务条款", href: href("/terms-of-service") },
        ],
      },
    ];
  }

  return [
    {
      title: "Product",
      links: [
        { label: "Download", href: href("/download") },
        { label: "Capabilities", href: href("/capabilities") },
        { label: "Interactive product preview", href: href("/ai-partner-console") },
        { label: "Local deployment", href: href("/local-deployment") },
        { label: "Agent workbench", href: href("/agent-management-workbench") },
        { label: "Pricing", href: href("/pricing") },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "All solutions", href: href("/solutions") },
        { label: "FDE delivery", href: href("/fde-ai-delivery") },
        { label: "Indie AI developers", href: href("/ai-workbench-for-indie-developers") },
        { label: "OPC content operations", href: href("/opc-content-ops-system") },
        { label: "Founders & solo operators", href: href("/ai-partner-for-founders") },
      ],
    },
    {
      title: "Workflows",
      links: [
        { label: "All workflows", href: href("/workflows") },
        { label: "FDE local delivery path", href: href("/fde-local-ai-delivery") },
        { label: "AI content calendar", href: href("/opc-ai-content-calendar-workflow") },
        { label: "AI decision workflow", href: href("/founder-ai-decision-workflow") },
        { label: "First AI partner workflow", href: href("/founder-ai-employee-first-workflow") },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "All resources", href: href("/resources") },
        { label: "Blog", href: href("/blog") },
        { label: "Documentation", href: href("/docs") },
        { label: "Quickstart", href: href("/docs/quickstart") },
        { label: "About MotiClaw", href: href("/about") },
        { label: "Contact", href: href("/contact") },
        { label: "Privacy", href: href("/privacy") },
        { label: "Terms of service", href: href("/terms-of-service") },
      ],
    },
  ];
}

const taglines: Record<Locale, string> = {
  zh: "灵感、创作与发布，一站完成。数据默认留在你的设备上。",
  en: "Ideas, creation, and publishing in one place. Your data stays on your device.",
};

export function SiteFooter({ locale }: { locale: Locale }) {
  const columns = footerColumns(locale);

  return (
    <footer className="cv-auto site-seo-footer border-t border-[var(--line)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
          <div className="space-y-4">
            <a href={withLocaleQuery("/", locale)} className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
                <img src="/icon.svg?v=3" alt="" aria-hidden="true" loading="lazy" className="block h-full w-full object-contain" />
              </span>
              <span className="display text-[0.95rem] font-semibold tracking-[0.18em] text-[var(--accent-strong)]">MotiClaw</span>
            </a>
            <p className="max-w-xs text-sm leading-6 text-[var(--muted)]">{taglines[locale]}</p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="space-y-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{column.title}</p>
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-6 items-center font-medium text-[var(--foreground)] transition hover:text-[var(--accent-strong)]"
                      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-sm text-[var(--muted)] sm:flex-row">
          <p>© {new Date().getFullYear()} MotiClaw</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <span>{locale === "zh" ? "由" : "Built by"}</span>
              <a
                href="https://x.com/Mileson07"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent-strong)" }}
                className="font-medium transition-opacity hover:opacity-80"
              >
                超级峰
              </a>
              {locale === "zh" ? <span>打造</span> : null}
            </span>
            <span aria-hidden="true" className="text-[var(--line)]">
              ·
            </span>
            <span className="inline-flex items-center gap-2 text-[0.78rem]">
              <span>{locale === "zh" ? "创于" : "Created in"}</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--foreground)]">
                <span
                  aria-hidden="true"
                  className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#de2910] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                >
                  <span className="absolute left-[2px] top-[1px] text-[7px] leading-none text-[#ffde00]">★</span>
                </span>
                <span>{locale === "zh" ? "中国·北京" : "Beijing, China"}</span>
              </span>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
