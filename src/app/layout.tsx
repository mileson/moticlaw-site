/*
## 核心功能
定义官网全局根布局、字体资源、站点元信息和主题初始化脚本。
## 输入
接收服务器请求头中的语言信息以及所有页面子树内容。
## 输出
输出带全局字体变量、主题初始化脚本和 HTML 语言属性的站点骨架。
## 定位
位于 App Router 根层，负责整个官网页面共享的基础布局能力。
## 依赖
依赖 `next/headers`、`next/script`、Google Fonts 和 `src/lib/locale.ts`。
## 维护规则
- 调整全局字体、SEO 元信息、语言初始化或主题脚本时，必须同步更新本说明书。
- 影响全站根布局职责时，需同步更新 `docs/basic/frontend-guidelines.md`。
*/
import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Fraunces, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { detectLocale, localeToHtmlLang } from "@/lib/locale";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MotiClaw - Personal AI Control Plane",
  description: "MotiClaw 官网：个人 AI 控制台与 Agent 工作区。",
  metadataBase: new URL("https://moticlaw.site"),
  icons: {
    icon: [{ url: "/icon.svg?v=3", type: "image/svg+xml" }],
    shortcut: "/icon.svg?v=3",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = detectLocale(requestHeaders.get("accept-language"));

  return (
    <html
      lang={localeToHtmlLang(locale)}
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="moticlaw-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const stored = localStorage.getItem("moticlaw-theme");
                  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const resolved = stored === "light" || stored === "dark" ? stored : (systemDark ? "dark" : "light");
                  const root = document.documentElement;
                  root.classList.toggle("dark", resolved === "dark");
                  root.dataset.theme = resolved;
                  root.style.colorScheme = resolved;
                } catch (error) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
