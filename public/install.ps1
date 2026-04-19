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
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Info([string]$Message) { Write-Host "[*] $Message" -ForegroundColor Cyan }
function Write-Ok([string]$Message) { Write-Host "[ok] $Message" -ForegroundColor Green }
function Write-Warn([string]$Message) { Write-Host "[warn] $Message" -ForegroundColor Yellow }
function Write-Fail([string]$Message) { throw $Message }

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
    Invoke-WebRequest -Uri $SourceRef -OutFile $TargetFile
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
  '$Root/bin/moticlawctl'
)
`$cli = `$cliCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not `$cli) { throw 'Native CLI not found.' }
& `$cli @args
"@ | Set-Content -Path $wrapperPath -Encoding UTF8
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

    $apiExe = if (Test-Path (Join-Path $Root "bin/moticlawd.exe")) { Join-Path $Root "bin/moticlawd.exe" } else { Join-Path $Root "bin/moticlawd" }
    $nodeExe = if (Test-Path (Join-Path $Root "web/node/node.exe")) { Join-Path $Root "web/node/node.exe" } else { Join-Path $Root "web/node/bin/node" }
    $serverJs = Join-Path $Root "web/standalone/server.js"

    if (-not (Test-Path $apiExe)) { Write-Fail "API 二进制不存在：$apiExe" }
    if (-not (Test-Path $nodeExe)) { Write-Fail "Node 运行时不存在：$nodeExe" }

    $apiProc = Start-Process -FilePath $apiExe -ArgumentList @("--host", $envPairs["MOTICLAW_API_HOST"], "--port", $envPairs["MOTICLAW_API_PORT"]) -WorkingDirectory $Root -RedirectStandardOutput (Join-Path $logsDir "install-api.log") -RedirectStandardError (Join-Path $logsDir "install-api.log") -WindowStyle Hidden -PassThru
    $webProc = Start-Process -FilePath $nodeExe -ArgumentList @($serverJs) -WorkingDirectory (Join-Path $Root "web/standalone") -RedirectStandardOutput (Join-Path $logsDir "install-web.log") -RedirectStandardError (Join-Path $logsDir "install-web.log") -WindowStyle Hidden -PassThru
    Set-Content (Join-Path $runDir "api.pid") $apiProc.Id
    Set-Content (Join-Path $runDir "web.pid") $webProc.Id
}

function Wait-Http([string]$Url, [int]$TimeoutSec = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSec)
    while ((Get-Date) -lt $deadline) {
        try {
            Invoke-WebRequest -Uri $Url -UseBasicParsing | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 1
        }
    }
    Write-Fail "服务未在预期时间内启动：$Url"
}

$platformKey = Get-PlatformKey
$manifestSource = Resolve-ManifestSource
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("moticlaw-install-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
try {
    $manifestPath = Join-Path $tempDir "release-manifest.json"
    Fetch-ToFile $manifestSource $manifestPath
    $manifestDir = Split-Path -Parent $manifestPath
    $manifestInfo = Read-ManifestArtifact $manifestPath $platformKey
    $archiveRef = if (-not [string]::IsNullOrWhiteSpace($ArchiveOverride)) { $ArchiveOverride } else { $manifestInfo.archive.url ?? $manifestInfo.archive.relative_path ?? $manifestInfo.archive.filename }
    $archiveRef = Resolve-RefFromManifest $manifestSource $manifestDir $archiveRef
    if (-not $archiveRef) { Write-Fail "release manifest 缺少 archive 信息。" }

    Write-Info "MotiClaw Native Installer"
    Write-Info "Manifest: $manifestSource"
    Write-Info "Version: $($manifestInfo.version)"
    Write-Info "Channel: $($manifestInfo.channel)"
    Write-Info "Platform: $platformKey"
    Write-Info "Install root: $InstallDir"

    if ($DryRun) {
        Write-Warn "dry-run 模式，仅打印动作"
        return
    }

    $archivePath = Join-Path $tempDir "release.tar.gz"
    Fetch-ToFile $archiveRef $archivePath
    if ($manifestInfo.archive.sha256) {
        if ((Get-Sha256 $archivePath) -ne $manifestInfo.archive.sha256.ToLowerInvariant()) {
            Write-Fail "archive checksum 校验失败。"
        }
    }

    $extractDir = Join-Path $tempDir "extracted"
    New-Item -ItemType Directory -Force -Path $extractDir | Out-Null
    tar -xzf $archivePath -C $extractDir
    Sync-Tree $extractDir $InstallDir

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

    if ((Resolve-StartMode) -eq "detached") {
        Start-Detached $InstallDir $envFile
    }

    $envPairs = @{}
    Get-Content $envFile | Where-Object { $_ -match '=' } | ForEach-Object {
        $name, $value = $_ -split '=', 2
        $envPairs[$name] = $value
    }
    Wait-Http "http://$($envPairs['MOTICLAW_API_HOST'])`:$($envPairs['MOTICLAW_API_PORT'])/healthz"
    Wait-Http "http://$($envPairs['MOTICLAW_WEB_HOST'])`:$($envPairs['MOTICLAW_WEB_PORT'])/login"

    Write-Ok "安装完成"
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
