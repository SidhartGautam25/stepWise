# StepWise CLI Windows Native Installer
# Usage: iwr https://stepwise.run/install.ps1 -useb | iex

$ErrorActionPreference = "Stop"

Write-Host "Installing StepWise CLI..." -ForegroundColor Cyan

$OS = "win"
$ARCH = if ([System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture -eq "Arm64") {
    "arm64"
} else {
    "x64"
}

if ($ARCH -ne "x64") {
    throw "Unsupported Windows architecture: $ARCH"
}

$BinaryName = "stepwise-${OS}-${ARCH}.exe"
$DownloadUrl = "https://github.com/your-org/stepwise/releases/latest/download/$BinaryName"
$InstallDir = Join-Path $env:LOCALAPPDATA "StepWise"
$DestPath = Join-Path $InstallDir "stepwise.exe"
$TempPath = Join-Path $InstallDir "stepwise.exe.tmp"

Write-Host "Downloading $BinaryName..." -ForegroundColor Gray

if (-not (Test-Path -Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

if (Test-Path -Path $TempPath) {
    Remove-Item -Path $TempPath -Force
}

Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempPath

if (Test-Path -Path $DestPath) {
    Remove-Item -Path $DestPath -Force
}

Move-Item -Path $TempPath -Destination $DestPath -Force

$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$PathParts = @()
if ($UserPath) {
    $PathParts = $UserPath.Split(";") | Where-Object { $_ }
}

$AlreadyOnPath = $PathParts | Where-Object { $_.Trim().ToLowerInvariant() -eq $InstallDir.ToLowerInvariant() }
if (-not $AlreadyOnPath) {
    $NewPath = if ($UserPath) { "$UserPath;$InstallDir" } else { $InstallDir }
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
    Write-Host "Added StepWise to your user PATH." -ForegroundColor DarkGray
}

if (($env:Path -split ";") -notcontains $InstallDir) {
    $env:Path = "$InstallDir;$env:Path"
}

Write-Host ""
Write-Host "Installation complete." -ForegroundColor Green
Write-Host "Run: stepwise login" -ForegroundColor White
