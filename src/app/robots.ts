import type { MetadataRoute } from "next";

const siteUrl = "https://www.moticlaw.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/account/membership$", "/account/recharge$", "/account/tokendance/recharge$"],
      disallow: ["/api/", "/login", "/register", "/forgot-password", "/reset-password", "/account/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
