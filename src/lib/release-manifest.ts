/*
## 核心功能
定义官网消费的发布清单类型，并把官方 OSS `latest.json` 转成前端统一的发布模型。
## 输入
接收阿里云 OSS 最新发布清单 JSON，以及官网内部的平台键映射规则。
## 输出
输出供首页和 `/api/releases/latest` 共用的 `ReleaseManifest` 数据结构。
## 定位
位于 `src/lib`，是官网发布数据获取、转换和平台筛选的核心模块。
## 依赖
依赖浏览器/Node `fetch`、TypeScript 类型系统，以及官方 OSS 发布对象格式。
## 维护规则
- OSS manifest 结构、平台键映射或官网展示策略变化时，必须同步更新本说明书。
- 任何新增平台或变种都要先在这里完成映射，再进入页面展示层。
*/
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

export type ReleaseArchive = {
  id: string;
  platform: PlatformGroup;
  arch: "arm64" | "x64";
  variant: "dmg" | "setup" | "portable" | "deb" | "appimage" | "rpm";
  display_name?: string;
  filename: string;
  relative_path: string;
  url: string;
  sha256?: string;
  size_bytes?: number;
  content_type?: string;
  recommended_for?: string[];
};

export type ReleaseManifest = {
  version: string;
  channel?: string;
  release_date?: string;
  generated_at?: string;
  release_url?: string;
  display_version?: string;
  release_name?: string;
  artifacts: Partial<Record<PlatformKey, { archive: ReleaseArchive }>>;
};

type OssReleaseArtifact = ReleaseArchive;

type OssLatestReleaseManifest = {
  version?: string;
  channel?: string;
  release_date?: string;
  generated_at?: string;
  release_url?: string;
  display_version?: string;
  release_name?: string;
  artifacts?: OssReleaseArtifact[];
};

export const ossLatestReleaseManifestUrl = "https://moticlaw.oss-cn-hangzhou.aliyuncs.com/desktop/releases/latest.json";

const platformKeyMap = new Map<string, PlatformKey>([
  ["macos-arm64-dmg", "darwin-arm64"],
  ["macos-x64-dmg", "darwin-x64"],
  ["windows-x64-setup", "windows-x64"],
  ["windows-arm64-setup", "windows-arm64"],
  ["linux-x64-deb", "linux-deb-x64"],
  ["linux-arm64-deb", "linux-deb-arm64"],
  ["linux-x64-appimage", "linux-appimage-x64"],
  ["linux-arm64-appimage", "linux-appimage-arm64"],
  ["linux-x64-rpm", "linux-rpm-x64"],
]);

const semanticVersionPattern = /(?:^|[^\d])v?(\d+\.\d+\.\d+)(?:[^\d]|$)/i;

export function normalizeVersion(value: string | undefined) {
  const match = (value || "").match(semanticVersionPattern);
  return match?.[1] ?? "";
}

export function platformKeyForArtifact(artifact: OssReleaseArtifact): PlatformKey | null {
  return platformKeyMap.get(`${artifact.platform}-${artifact.arch}-${artifact.variant}`) ?? null;
}

export function transformOssLatestRelease(payload: OssLatestReleaseManifest): ReleaseManifest | null {
  const version = normalizeVersion(payload.version);
  const sourceArtifacts = Array.isArray(payload.artifacts) ? payload.artifacts : [];
  const artifacts: ReleaseManifest["artifacts"] = {};

  for (const artifact of sourceArtifacts) {
    const key = platformKeyForArtifact(artifact);
    if (!key) continue;
    artifacts[key] = { archive: artifact };
  }

  if (!version || Object.keys(artifacts).length === 0) {
    return null;
  }

  return {
    version,
    channel: payload.channel || "release",
    release_date: payload.release_date,
    generated_at: payload.generated_at,
    release_url: payload.release_url,
    display_version: payload.display_version,
    release_name: payload.release_name,
    artifacts,
  };
}

export async function fetchLatestReleaseManifest(url = ossLatestReleaseManifestUrl): Promise<ReleaseManifest | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const payload = (await response.json()) as OssLatestReleaseManifest;
    return transformOssLatestRelease(payload);
  } catch {
    return null;
  }
}
