import {
  fallbackReleaseManifest,
  githubLatestReleaseApiUrl,
  transformGitHubRelease,
  type GitHubRelease,
} from "@/lib/release-manifest";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const responseHeaders = {
  "Cache-Control": "no-store",
};

export async function GET() {
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(githubLatestReleaseApiUrl, {
      cache: "no-store",
      headers,
    });

    if (response.ok) {
      const release = (await response.json()) as GitHubRelease;
      const manifest = transformGitHubRelease(release);

      if (Object.keys(manifest.artifacts).length > 0) {
        return Response.json(manifest, { headers: responseHeaders });
      }
    }
  } catch {
    // Keep downloads usable when GitHub is temporarily unavailable or rate-limited.
  }

  return Response.json(fallbackReleaseManifest, { headers: responseHeaders });
}
