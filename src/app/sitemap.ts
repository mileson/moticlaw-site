import type { MetadataRoute } from "next";
import { getCanonicalPath, getIndexableSiteRoutes, getLanguageAlternates } from "@/components/seo-resource-manifest";
import { blogPosts } from "@/lib/blog-posts";
import { docPages } from "@/lib/docs-content";

const siteUrl = "https://www.moticlaw.com";

function entries(path: string, lastModified: string, changeFrequency: "daily" | "weekly" | "monthly", priority: number) {
  const languageAlternates = Object.fromEntries(
    Object.entries(getLanguageAlternates(path)).map(([locale, target]) => [locale, new URL(target, siteUrl).toString()]),
  );

  return (["zh", "en"] as const).map((locale) => ({
    url: new URL(getCanonicalPath(path, locale), siteUrl).toString(),
    lastModified: new Date(lastModified),
    changeFrequency,
    priority,
    alternates: { languages: languageAlternates },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const blogUpdatedAt = latestUpdatedAt(blogPosts.map((post) => post.updatedAt));
  const docsUpdatedAt = latestUpdatedAt(docPages.map((doc) => doc.updatedAt));
  const staticEntries = getIndexableSiteRoutes().flatMap((route) =>
    entries(
      route.path,
      route.id === "blog" ? blogUpdatedAt : route.id === "docs" ? docsUpdatedAt : route.lastModified,
      route.changeFrequency,
      route.priority,
    ),
  );

  const blogEntries = blogPosts.flatMap((post) => entries(`/blog/${post.slug}`, post.updatedAt, "monthly", 0.7));

  const docEntries = docPages
    .filter((doc) => doc.slug !== "index")
    .flatMap((doc) => entries(`/docs/${doc.slug}`, doc.updatedAt, "monthly", 0.68));

  return [...staticEntries, ...blogEntries, ...docEntries];
}

function latestUpdatedAt(values: string[]) {
  return values.reduce((latest, value) => (value > latest ? value : latest), "1970-01-01");
}
