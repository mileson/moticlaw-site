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
