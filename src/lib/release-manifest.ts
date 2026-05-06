export type PlatformKey =
  | "darwin-arm64"
  | "darwin-x64"
  | "windows-x64"
  | "windows-arm64"
  | "linux-deb-x64"
  | "linux-deb-arm64"
  | "linux-appimage-x64"
  | "linux-appimage-arm64"
  | "linux-rpm-x64";

export type PlatformGroup = "macos" | "windows" | "linux";

export type ReleaseArtifact = {
  archive?: {
    filename?: string;
    url?: string;
    sha256?: string;
    size_bytes?: number;
    content_type?: string;
  };
};

export type ReleaseManifest = {
  version: string;
  channel?: string;
  generated_at?: string;
  release_url?: string;
  artifacts: Partial<Record<PlatformKey, ReleaseArtifact>>;
};

export type GitHubReleaseAsset = {
  name: string;
  browser_download_url?: string;
  size?: number;
  digest?: string;
  content_type?: string;
};

export type GitHubRelease = {
  tag_name?: string;
  name?: string;
  html_url?: string;
  published_at?: string;
  assets?: GitHubReleaseAsset[];
};

export const githubLatestReleaseUrl = "https://github.com/mileson/moticlaw/releases/latest";
export const githubLatestReleaseApiUrl = "https://api.github.com/repos/mileson/moticlaw/releases/latest";

export const fallbackReleaseManifest: ReleaseManifest = {
  version: "2026.5.7",
  channel: "release",
  generated_at: "2026-04-22T07:33:48Z",
  release_url: "https://github.com/mileson/moticlaw/releases/tag/v2026.5.7",
  artifacts: {
    "darwin-arm64": {
      archive: {
        filename: "MotiClaw-v0.1.0-macos-arm64.dmg",
        url: "https://github.com/mileson/moticlaw/releases/download/v2026.5.7/MotiClaw-v0.1.0-macos-arm64.dmg",
        sha256: "ba67c1815a93fb8da469eafc43d62a1605cddfe8d9adc29e91c9c0a73f74106f",
        size_bytes: 217108029,
        content_type: "application/x-apple-diskimage",
      },
    },
    "darwin-x64": {
      archive: {
        filename: "MotiClaw-v0.1.0-macos-x64.dmg",
        url: "https://github.com/mileson/moticlaw/releases/download/v2026.5.7/MotiClaw-v0.1.0-macos-x64.dmg",
        sha256: "1ac63ff50a35589f2268193937c22b224853a35574fed3dfcd927504c778dec0",
        size_bytes: 224173566,
        content_type: "application/x-apple-diskimage",
      },
    },
  },
};

function normalizeSha(value: string | undefined) {
  return value?.replace(/^sha256:/i, "");
}

function normalizeVersion(value: string | undefined) {
  return normalizeDateVersion(value) || fallbackReleaseManifest.version;
}

function normalizeDateVersion(value: string | undefined) {
  const text = (value || "").replace(/^v/i, "");
  const match = text.match(/(?:^|[^\d])(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:[^\d]|$)/);
  if (!match) return "";
  return `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}`;
}

function platformKeyForAssetName(name: string): PlatformKey | null {
  const normalized = name.toLowerCase();
  const isMac = normalized.includes("mac") || normalized.includes("darwin");
  const isWindows = normalized.includes("windows") || normalized.includes("win32") || normalized.includes("win-");
  const isLinux = normalized.includes("linux");
  const isArm = normalized.includes("arm64") || normalized.includes("aarch64");
  const isX64 = normalized.includes("x64") || normalized.includes("x86_64") || normalized.includes("amd64") || normalized.includes("intel");

  if (isMac && isArm) return "darwin-arm64";
  if (isMac && isX64) return "darwin-x64";
  if (isWindows && isArm) return "windows-arm64";
  if (isWindows) return "windows-x64";
  if (isLinux && normalized.endsWith(".deb") && isArm) return "linux-deb-arm64";
  if (isLinux && normalized.endsWith(".deb")) return "linux-deb-x64";
  if (isLinux && normalized.includes("appimage") && isArm) return "linux-appimage-arm64";
  if (isLinux && normalized.includes("appimage")) return "linux-appimage-x64";
  if (isLinux && normalized.endsWith(".rpm")) return "linux-rpm-x64";

  return null;
}

function assetPriority(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.endsWith(".dmg")) return 0;
  if (normalized.endsWith(".zip")) return 1;
  if (normalized.endsWith(".appimage")) return 2;
  if (normalized.endsWith(".deb")) return 3;
  if (normalized.endsWith(".rpm")) return 4;
  return 5;
}

export function transformGitHubRelease(release: GitHubRelease): ReleaseManifest {
  const artifacts: ReleaseManifest["artifacts"] = {};
  const sortedAssets = [...(release.assets ?? [])].sort((left, right) => assetPriority(left.name) - assetPriority(right.name));

  for (const asset of sortedAssets) {
    const key = platformKeyForAssetName(asset.name);
    const url = asset.browser_download_url;
    if (!key || !url || artifacts[key]?.archive) continue;

    artifacts[key] = {
      archive: {
        filename: asset.name,
        url,
        sha256: normalizeSha(asset.digest),
        size_bytes: asset.size,
        content_type: asset.content_type,
      },
    };
  }

  return {
    version: normalizeVersion(release.tag_name ?? release.name),
    generated_at: release.published_at,
    release_url: release.html_url ?? githubLatestReleaseUrl,
    artifacts,
  };
}
