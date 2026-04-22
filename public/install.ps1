param(
    [string]$ManifestUrl = $env:MOTICLAW_RELEASE_MANIFEST_URL,
    [string]$ManifestFile = $env:MOTICLAW_RELEASE_MANIFEST_FILE,
    [string]$ArchiveOverride = $env:MOTICLAW_RELEASE_ARCHIVE,
    [string]$InstallDir = $(if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_INSTALL_DIR)) {
        Join-Path ([Environment]::GetFolderPath("UserProfile")) ".moticlaw/current"
    } else {
        $env:MOTICLAW_INSTALL_DIR
    }),
    [string]$BinDir = $(if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_BIN_DIR)) {
        Join-Path ([Environment]::GetFolderPath("UserProfile")) ".local/bin"
    } else {
        $env:MOTICLAW_BIN_DIR
    }),
    [ValidateSet("auto", "detached", "none")]
    [string]$StartMode = $(if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_INSTALL_MODE)) { "auto" } else { $env:MOTICLAW_INSTALL_MODE }),
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$script:InstallStageTotal = 8
$script:InstallStageIndex = 0

function Write-Info([string]$Message) { Write-Host "[*] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host "[ok] $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "[warn] $Message" -ForegroundColor Yellow }
function Write-Fail([string]$Message) { throw $Message }
function Test-ProgressEnabled {
    $mode = if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_PROGRESS)) { "auto" } else { $env:MOTICLAW_PROGRESS.ToLowerInvariant() }
    if ($mode -eq "always") { return $true }
    if ($mode -eq "never") { return $false }
    return -not [Console]::IsOutputRedirected
}
function Show-Stage([string]$Message) {
    $script:InstallStageIndex += 1
    Write-Info "[$($script:InstallStageIndex)/$($script:InstallStageTotal)] $Message"
}
function Clear-ProgressLine([string]$Activity = "MotiClaw Installer") {
    if (Test-ProgressEnabled) {
        Write-Progress -Activity $Activity -Completed
    }
}

function Resolve-ManifestSource {
    if (-not [string]::IsNullOrWhiteSpace($ManifestFile) -and (Test-Path $ManifestFile)) {
        return (Resolve-Path $ManifestFile).Path
    }
    if (-not [string]::IsNullOrWhiteSpace($ManifestUrl)) {
        return $ManifestUrl
    }
    return "https://moticlaw.com/release-manifest.json"
}

function Fetch-ToFile([string]$SourceRef, [string]$TargetFile) {
    New-Item -ItemType Directory -Force -Path (Split-Path $TargetFile) | Out-Null
    if (Test-Path $SourceRef) {
        Copy-Item $SourceRef $TargetFile -Force
        return
    }
    $downloadPath = "$TargetFile.download"
    if (Test-Path $downloadPath) {
        Remove-Item $downloadPath -Force
    }

    $lastError = $null
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            Write-Info "Downloading: $SourceRef"
            if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
                $curlArgs = @(
                    "--fail",
                    "--location",
                    "--retry", "3",
                    "--retry-all-errors",
                    "--retry-delay", "2",
                    "--continue-at", "-",
                    "--ssl-no-revoke",
                    "--output", $downloadPath,
                    $SourceRef
                )
                & curl.exe @curlArgs
                if ($LASTEXITCODE -ne 0) {
                    throw "curl.exe exited with code $LASTEXITCODE"
                }
            } else {
                Invoke-WebRequest -Uri $SourceRef -OutFile $downloadPath -ErrorAction Stop
            }

            Move-Item $downloadPath $TargetFile -Force
            return
        } catch {
            $lastError = $_.Exception.Message
            if (($attempt -ge 3) -and (Test-Path $downloadPath)) {
                Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
            }
            if ($attempt -lt 3) {
                Write-Warn "Download failed, retrying ($attempt/3): $lastError"
                Start-Sleep -Seconds (2 * $attempt)
            }
        }
    }

    Write-Fail "Failed to download $SourceRef. Please check your network, or set MOTICLAW_RELEASE_ARCHIVE to a local file or mirror URL. Last error: $lastError"
}

function Get-Sha256([string]$FilePath) {
    return (Get-FileHash -Algorithm SHA256 -Path $FilePath).Hash.ToLowerInvariant()
}

function Get-PlatformKey {
    $arch = switch ($env:PROCESSOR_ARCHITECTURE.ToLowerInvariant()) {
        "amd64" { "x64" }
        "arm64" { "arm64" }
        default { "x64" }
    }
    return "windows-$arch"
}

function Read-ManifestArtifact([string]$ManifestPath, [string]$PlatformKey) {
    $manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
    $artifact = $manifest.artifacts.$PlatformKey
    if (-not $artifact) {
        Write-Fail "release manifest 未包含当前平台产物：$PlatformKey"
    }
    return @{
        version = $manifest.version
        channel = $manifest.channel
        archive = $artifact.archive
        checksum = $artifact.checksum
        build = if ($artifact.build) { $artifact.build } elseif ($manifest.build) { $manifest.build } else { $null }
    }
}

function Resolve-RefFromManifest([string]$ManifestSource, [string]$ManifestDir, [string]$Ref) {
    if ([string]::IsNullOrWhiteSpace($Ref)) {
        return $null
    }
    if ($Ref -match '^(https?|file)://') {
        return $Ref
    }
    if (Test-Path $Ref) {
        return (Resolve-Path $Ref).Path
    }
    if ($ManifestSource -match '^https?://') {
        $base = $ManifestSource.Substring(0, $ManifestSource.LastIndexOf('/'))
        return "$base/$Ref"
    }
    return Join-Path $ManifestDir $Ref
}

function Get-MetadataFieldFromFile([string]$MetadataPath, [string]$Key) {
    if (-not (Test-Path $MetadataPath)) {
        return $null
    }
    try {
        $payload = Get-Content $MetadataPath -Raw | ConvertFrom-Json
        return $payload.$Key
    } catch {
        return $null
    }
}

function Resolve-ExistingPath([string[]]$Candidates) {
    foreach ($candidate in $Candidates) {
        if (-not [string]::IsNullOrWhiteSpace($candidate) -and (Test-Path $candidate)) {
            return $candidate
        }
    }
    return $null
}

function Resolve-ArchiveFileName([string]$Ref, [string]$Fallback = "release-archive.bin") {
    if ([string]::IsNullOrWhiteSpace($Ref)) {
        return $Fallback
    }
    if ($Ref -match '^(https?|file)://') {
        try {
            $uri = [Uri]$Ref
            $name = [System.IO.Path]::GetFileName($uri.AbsolutePath)
            if (-not [string]::IsNullOrWhiteSpace($name)) {
                return $name
            }
        } catch {
        }
    }
    $leaf = Split-Path -Leaf $Ref
    if (-not [string]::IsNullOrWhiteSpace($leaf)) {
        return $leaf
    }
    return $Fallback
}

function Expand-ReleaseArchive([string]$ArchivePath, [string]$TargetDir, [string]$Activity = "解压安装包") {
    $lowerPath = $ArchivePath.ToLowerInvariant()
    if ($lowerPath.EndsWith(".zip")) {
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        $zip = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
        try {
            $entries = @($zip.Entries)
            $total = [Math]::Max($entries.Count, 1)
            $index = 0
            foreach ($entry in $entries) {
                $index += 1
                $destinationPath = Join-Path $TargetDir $entry.FullName
                if ([string]::IsNullOrEmpty($entry.Name)) {
                    New-Item -ItemType Directory -Force -Path $destinationPath | Out-Null
                } else {
                    $destinationDir = Split-Path -Parent $destinationPath
                    if (-not [string]::IsNullOrWhiteSpace($destinationDir)) {
                        New-Item -ItemType Directory -Force -Path $destinationDir | Out-Null
                    }
                    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destinationPath, $true)
                }
                if (Test-ProgressEnabled) {
                    $percent = [Math]::Min([int](($index * 100) / $total), 100)
                    Write-Progress -Activity $Activity -Status "$index / $total" -PercentComplete $percent
                }
            }
        } finally {
            $zip.Dispose()
            Clear-ProgressLine $Activity
        }
        return
    }

    $tarExe = Resolve-ExistingPath @(
        (Join-Path $env:SystemRoot "System32/tar.exe")
    )
    if (-not $tarExe) {
        $tarCommand = Get-Command tar.exe -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($tarCommand) {
            $tarExe = $tarCommand.Source
        }
    }
    if (-not $tarExe) {
        Write-Fail "Windows tar.exe not found. Set MOTICLAW_RELEASE_ARCHIVE to a .zip package or ensure tar.exe is available."
    }

    $listFlag = switch -Regex ($lowerPath) {
        '\.(tar\.gz|tgz)$' { 'tzf'; break }
        '\.(tar\.xz|txz)$' { 'tJf'; break }
        '\.tar$' { 'tf'; break }
        default { 'tzf' }
    }
    $extractFlag = switch -Regex ($lowerPath) {
        '\.(tar\.gz|tgz)$' { 'xvzf'; break }
        '\.(tar\.xz|txz)$' { 'xvJf'; break }
        '\.tar$' { 'xvf'; break }
        default { 'xvzf' }
    }

    $total = 0
    try {
        $total = @(& $tarExe "-$listFlag" $ArchivePath 2>$null).Count
    } catch {
        $total = 0
    }

    $index = 0
    & $tarExe "-$extractFlag" $ArchivePath -C $TargetDir 2>$null | ForEach-Object {
        $index += 1
        if ((Test-ProgressEnabled) -and $total -gt 0) {
            $percent = [Math]::Min([int](($index * 100) / $total), 100)
            Write-Progress -Activity $Activity -Status "$index / $total" -PercentComplete $percent
        }
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Archive extraction failed: $ArchivePath"
    }
    Clear-ProgressLine $Activity
}

function Sync-Tree([string]$SourceDir, [string]$TargetDir) {
    New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
    if (Test-Path $TargetDir) {
        Get-ChildItem $TargetDir -Force | Where-Object { $_.Name -notin @('data', 'logs', 'run', 'env') } | Remove-Item -Recurse -Force
    }
    Get-ChildItem $SourceDir -Force | Where-Object { $_.Name -notin @('data', 'logs', 'run') } | ForEach-Object {
        Copy-Item $_.FullName (Join-Path $TargetDir $_.Name) -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path (Join-Path $TargetDir "data") | Out-Null
    $presetSource = Join-Path $SourceDir "data/preset_agent_marketplace"
    if (Test-Path $presetSource) {
        $presetTarget = Join-Path $TargetDir "data/preset_agent_marketplace"
        if (Test-Path $presetTarget) { Remove-Item $presetTarget -Recurse -Force }
        Copy-Item $presetSource $presetTarget -Recurse -Force
    }
}

function Ensure-EnvFile([string]$Root) {
    $envDir = Join-Path $Root "env"
    $envExample = Join-Path $envDir ".env.example"
    $envFile = Join-Path $envDir ".env"
    New-Item -ItemType Directory -Force -Path $envDir | Out-Null
    if (-not (Test-Path $envFile)) {
        Copy-Item $envExample $envFile
    }
    return $envFile
}

function Upsert-Env([string]$File, [string]$Key, [string]$Value) {
    $lines = @()
    if (Test-Path $File) {
        $lines = Get-Content $File
    }
    $prefix = "$Key="
    $updated = $false
    $newLines = foreach ($line in $lines) {
        if ($line.StartsWith($prefix)) {
            $updated = $true
            "$Key=$Value"
        } else {
            $line
        }
    }
    if (-not $updated) {
        $newLines += "$Key=$Value"
    }
    Set-Content -Path $File -Value $newLines -Encoding UTF8
}

function Install-CliWrapper([string]$Root) {
    New-Item -ItemType Directory -Force -Path $BinDir | Out-Null
    $wrapperPath = Join-Path $BinDir "moticlaw.ps1"
    @"
`$envFile = '$Root/env/.env'
if (Test-Path `$envFile) {
  Get-Content `$envFile | Where-Object { $_ -match '=' } | ForEach-Object {
    `$name, `$value = $_ -split '=', 2
    Set-Item -Path "Env:`$name" -Value `$value
  }
}
`$cliCandidates = @(
  '$Root/bin/moticlawctl.exe',
  '$Root/bin/moticlawctl',
  '$Root/bin/moticlawctl.ps1',
  '$Root/bin/moticlawctl.dist/moticlawctl.exe',
  '$Root/bin/moticlawctl.dist/moticlawctl'
)
`$cli = `$cliCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not `$cli) { throw 'Native CLI not found.' }
& `$cli @args
"@ | Set-Content -Path $wrapperPath -Encoding UTF8
}

function Get-ReleaseBuildValue([string]$Root, [string]$Key) {
    $releaseBuildPath = Join-Path $Root "web/release-build.json"
    if (-not (Test-Path $releaseBuildPath)) {
        return $null
    }
    try {
        $payload = Get-Content $releaseBuildPath -Raw | ConvertFrom-Json
        return $payload.$Key
    } catch {
        return $null
    }
}

function Resolve-NodeArchiveName([string]$Version) {
    $arch = switch ($env:PROCESSOR_ARCHITECTURE.ToLowerInvariant()) {
        "amd64" { "x64" }
        "arm64" { "arm64" }
        default { "x64" }
    }
    return "node-$Version-win-$arch.zip"
}

function Ensure-NodeRuntime([string]$Root, [string]$TempDir) {
    $bundledNode = Resolve-ExistingPath @(
        (Join-Path $Root "web/node/bin/node.exe"),
        (Join-Path $Root "web/node/node.exe"),
        (Join-Path $Root "web/node/bin/node"),
        (Join-Path $Root "web/node/node")
    )
    if ($bundledNode) {
        return
    }

    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $nodeCommand) {
        $nodeCommand = Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1
    }
    if ($nodeCommand) {
        return
    }

    $runtimeVersion = if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_RUNTIME_NODE_VERSION)) {
        $env:MOTICLAW_RUNTIME_NODE_VERSION
    } else {
        Get-ReleaseBuildValue $Root "runtime_node_version"
    }
    if ([string]::IsNullOrWhiteSpace($runtimeVersion)) {
        $runtimeVersion = "v22.17.0"
    }
    $runtimeBaseUrl = if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_RUNTIME_NODE_BASE_URL)) {
        $env:MOTICLAW_RUNTIME_NODE_BASE_URL
    } else {
        Get-ReleaseBuildValue $Root "runtime_node_base_url"
    }
    if ([string]::IsNullOrWhiteSpace($runtimeBaseUrl)) {
        $runtimeBaseUrl = "https://nodejs.org/dist"
    }

    $archiveName = Resolve-NodeArchiveName $runtimeVersion
    $archiveUrl = "$($runtimeBaseUrl.TrimEnd('/'))/$runtimeVersion/$archiveName"
    $archivePath = Join-Path $TempDir $archiveName
    Write-Info "未检测到系统 Node，正在下载官方运行时：$archiveName"
    Fetch-ToFile $archiveUrl $archivePath

    $extractTemp = Join-Path $TempDir "node-runtime"
    if (Test-Path $extractTemp) { Remove-Item $extractTemp -Recurse -Force }
    New-Item -ItemType Directory -Force -Path $extractTemp | Out-Null
    Expand-ReleaseArchive $archivePath $extractTemp "解压 Node 运行时"

    $extractedRoot = Get-ChildItem $extractTemp -Directory | Select-Object -First 1
    if (-not $extractedRoot) {
        Write-Fail "Node 运行时解压失败：$archiveName"
    }

    $nodeRoot = Join-Path $Root "web/node"
    if (Test-Path $nodeRoot) { Remove-Item $nodeRoot -Recurse -Force }
    Move-Item $extractedRoot.FullName $nodeRoot

    $installedNode = Resolve-ExistingPath @(
        (Join-Path $nodeRoot "node.exe"),
        (Join-Path $nodeRoot "bin/node.exe"),
        (Join-Path $nodeRoot "node"),
        (Join-Path $nodeRoot "bin/node")
    )
    if (-not $installedNode) {
        Write-Fail "Node 运行时安装失败：未找到 node 可执行文件。"
    }
    Write-Ok "已安装内置 Node 运行时：$(& $installedNode --version)"
}

function Resolve-StartMode {
    if ($StartMode -ne "auto") {
        return $StartMode
    }
    return "detached"
}

function Start-Detached([string]$Root, [string]$EnvFile) {
    $envPairs = @{}
    Get-Content $EnvFile | Where-Object { $_ -match '=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        $envPairs[$name] = $value
    }
    $logsDir = Join-Path $Root "logs"
    $runDir = Join-Path $Root "run"
    New-Item -ItemType Directory -Force -Path $logsDir, $runDir | Out-Null

    $apiExe = Resolve-ExistingPath @(
        (Join-Path $Root "bin/moticlawd.exe"),
        (Join-Path $Root "bin/moticlawd"),
        (Join-Path $Root "bin/moticlawd.dist/moticlawd.exe"),
        (Join-Path $Root "bin/moticlawd.dist/moticlawd")
    )
    $nodeExe = Resolve-ExistingPath @(
        (Join-Path $Root "web/node/bin/node.exe"),
        (Join-Path $Root "web/node/node.exe"),
        (Join-Path $Root "web/node/bin/node"),
        (Join-Path $Root "web/node/node")
    )
    if (-not $nodeExe) {
        $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $nodeCommand) {
            $nodeCommand = Get-Command node -ErrorAction SilentlyContinue | Select-Object -First 1
        }
        if ($nodeCommand) {
            $nodeExe = $nodeCommand.Source
        }
    }
    $serverJs = Join-Path $Root "web/standalone/server.js"

    if (-not $apiExe) { Write-Fail "API binary not found inside release package." }
    if (-not (Test-Path $serverJs)) { Write-Fail "Web server entry not found: $serverJs" }
    if (-not $nodeExe) { Write-Fail "Node runtime not found in release package or PATH." }

    $apiProc = Start-Process -FilePath $apiExe -ArgumentList @("--host", $envPairs["MOTICLAW_API_HOST"], "--port", $envPairs["MOTICLAW_API_PORT"]) -WorkingDirectory $Root -RedirectStandardOutput (Join-Path $logsDir "install-api-stdout.log") -RedirectStandardError (Join-Path $logsDir "install-api-stderr.log") -WindowStyle Hidden -PassThru
    $webProc = Start-Process -FilePath $nodeExe -ArgumentList @($serverJs) -WorkingDirectory (Join-Path $Root "web/standalone") -RedirectStandardOutput (Join-Path $logsDir "install-web-stdout.log") -RedirectStandardError (Join-Path $logsDir "install-web-stderr.log") -WindowStyle Hidden -PassThru
    Set-Content (Join-Path $runDir "api.pid") $apiProc.Id
    Set-Content (Join-Path $runDir "web.pid") $webProc.Id
}

function Wait-Http([string]$Url, [int]$TimeoutSec = 90, [string]$Activity = "等待服务启动") {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            Clear-ProgressLine $Activity
            return
        } catch {
            if (Test-ProgressEnabled) {
                $elapsed = [int]($TimeoutSec - ($deadline - (Get-Date)).TotalSeconds)
                if ($elapsed -lt 0) { $elapsed = 0 }
                $percent = [Math]::Min([int](($elapsed * 100) / [Math]::Max($TimeoutSec, 1)), 100)
                Write-Progress -Activity $Activity -Status "$elapsed / $TimeoutSec 秒" -PercentComplete $percent
            }
            Start-Sleep -Seconds 1
        }
    }
    Clear-ProgressLine $Activity
    Write-Fail "服务未在预期时间内启动：$Url"
}

$platformKey = Get-PlatformKey
$manifestSource = Resolve-ManifestSource
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("moticlaw-install-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
try {
    $manifestPath = Join-Path $tempDir "release-manifest.json"
    Show-Stage "读取发布清单"
    Fetch-ToFile $manifestSource $manifestPath
    $manifestDir = Split-Path -Parent $manifestPath
    $manifestInfo = Read-ManifestArtifact $manifestPath $platformKey
    $buildInfo = $manifestInfo.build
    if (-not [string]::IsNullOrWhiteSpace($ArchiveOverride)) {
        $archiveRef = $ArchiveOverride
    } elseif ($manifestInfo.archive.url) {
        $archiveRef = $manifestInfo.archive.url
    } elseif ($manifestInfo.archive.relative_path) {
        $archiveRef = $manifestInfo.archive.relative_path
    } else {
        $archiveRef = $manifestInfo.archive.filename
    }
    $archiveRef = Resolve-RefFromManifest $manifestSource $manifestDir $archiveRef
    if (-not $archiveRef) { Write-Fail "release manifest 缺少 archive 信息。" }

    Write-Info "MotiClaw Native Installer"
    Write-Info "Manifest: $manifestSource"
    Write-Info "Version: $($manifestInfo.version)"
    Write-Info "Channel: $($manifestInfo.channel)"
    Write-Info "Platform: $platformKey"
    Write-Info "Install root: $InstallDir"
    if ($buildInfo) {
        if (-not [string]::IsNullOrWhiteSpace($buildInfo.git_sha)) { Write-Info "Build SHA: $($buildInfo.git_sha)" }
        if (-not [string]::IsNullOrWhiteSpace($buildInfo.git_branch)) { Write-Info "Build branch: $($buildInfo.git_branch)" }
        if (-not [string]::IsNullOrWhiteSpace($buildInfo.build_time)) { Write-Info "Build time: $($buildInfo.build_time)" }
    }

    if ($DryRun) {
        Write-Warn "dry-run 模式，仅打印动作"
        return
    }

    $archiveFileName = if ($manifestInfo.archive.filename) { $manifestInfo.archive.filename } else { Resolve-ArchiveFileName $archiveRef }
    $archivePath = Join-Path $tempDir $archiveFileName
    Show-Stage "下载安装包"
    Fetch-ToFile $archiveRef $archivePath
    if ($manifestInfo.archive.sha256) {
        if ((Get-Sha256 $archivePath) -ne $manifestInfo.archive.sha256.ToLowerInvariant()) {
            Write-Fail "archive checksum 校验失败。"
        }
    }

    $extractDir = Join-Path $tempDir "extracted"
    New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    Show-Stage "解压安装包"
    Expand-ReleaseArchive $archivePath $extractDir "解压安装包"
    Show-Stage "同步安装文件"
    Sync-Tree $extractDir $InstallDir
    Show-Stage "检查 Node 运行环境"
    Ensure-NodeRuntime $InstallDir $tempDir

    Show-Stage "写入本地配置"
    $envFile = Ensure-EnvFile $InstallDir
    Upsert-Env $envFile "MOTICLAW_HOME" $InstallDir
    if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_API_HOST)) { Upsert-Env $envFile "MOTICLAW_API_HOST" $env:MOTICLAW_API_HOST }
    if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_API_PORT)) { Upsert-Env $envFile "MOTICLAW_API_PORT" $env:MOTICLAW_API_PORT }
    if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_WEB_HOST)) { Upsert-Env $envFile "MOTICLAW_WEB_HOST" $env:MOTICLAW_WEB_HOST }
    if (-not [string]::IsNullOrWhiteSpace($env:MOTICLAW_WEB_PORT)) { Upsert-Env $envFile "MOTICLAW_WEB_PORT" $env:MOTICLAW_WEB_PORT }
    $effectiveApiHost = if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_API_HOST)) { "127.0.0.1" } else { $env:MOTICLAW_API_HOST }
    $effectiveApiPort = if ([string]::IsNullOrWhiteSpace($env:MOTICLAW_API_PORT)) { "8088" } else { $env:MOTICLAW_API_PORT }
    Upsert-Env $envFile "OPENCLAW_API_BASE" "http://$effectiveApiHost`:$effectiveApiPort"
    Upsert-Env $envFile "OPENCLAW_PROXY_BASE" "http://$effectiveApiHost`:$effectiveApiPort"
    Install-CliWrapper $InstallDir

    Show-Stage "启动本地服务"
    if ((Resolve-StartMode) -eq "detached") {
        Start-Detached $InstallDir $envFile
    }

    $envPairs = @{}
    Get-Content $envFile | Where-Object { $_ -match '=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        $envPairs[$name] = $value
    }
    Show-Stage "等待服务就绪"
    Wait-Http "http://$($envPairs['MOTICLAW_API_HOST'])`:$($envPairs['MOTICLAW_API_PORT'])/healthz" 90 "等待后端启动"
    Wait-Http "http://$($envPairs['MOTICLAW_WEB_HOST'])`:$($envPairs['MOTICLAW_WEB_PORT'])/login" 90 "等待前端启动"

    $installedBuildSha = Get-MetadataFieldFromFile (Join-Path $InstallDir "release-metadata.json") "git_sha"
    $installedBuildTime = Get-MetadataFieldFromFile (Join-Path $InstallDir "release-metadata.json") "build_time"
    $installedBuildBranch = Get-MetadataFieldFromFile (Join-Path $InstallDir "release-metadata.json") "git_branch"
    $installedPlatform = Get-MetadataFieldFromFile (Join-Path $InstallDir "release-metadata.json") "platform"

    Write-Ok "安装完成"
    Write-Host ""
    if (-not [string]::IsNullOrWhiteSpace($installedBuildSha)) { Write-Host "已安装构建：$installedBuildSha" }
    if (-not [string]::IsNullOrWhiteSpace($installedBuildBranch)) { Write-Host "构建分支：$installedBuildBranch" }
    if (-not [string]::IsNullOrWhiteSpace($installedBuildTime)) { Write-Host "构建时间：$installedBuildTime" }
    if (-not [string]::IsNullOrWhiteSpace($installedPlatform)) { Write-Host "构建平台：$installedPlatform" }
    Write-Host ""
    Write-Host "后续命令："
    Write-Host "  moticlaw.ps1 status"
    Write-Host "  moticlaw.ps1 open"
    Write-Host "  moticlaw.ps1 version"
} finally {
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
}
