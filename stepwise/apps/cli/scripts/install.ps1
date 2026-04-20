# StepWise CLI Windows Native Installer
# Usage: iwr https://stepwise.run/install.ps1 -useb | iex

Write-Host "  🚀 Installing StepWise CLI..." -ForegroundColor Cyan

$OS = "win"
$ARCH = "x64" # Extend if tracking ARM Windows explicitly

$BinaryName = "stepwise-${OS}-${ARCH}.exe"
$DownloadUrl = "https://github.com/your-org/stepwise/releases/latest/download/$BinaryName"
$InstallDir = "$env:USERPROFILE\AppData\Local\StepWise"

Write-Host "  ↓ Downloading StepWise for Windows..." -ForegroundColor Gray

# Ensure directory exists
if (-Not (Test-Path -Path $InstallDir)) {
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

$DestPath = Join-Path $InstallDir "stepwise.exe"

# Download File
Invoke-WebRequest -Uri $DownloadUrl -OutFile $DestPath

# Map to PATH via User Environment Variable permanently
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($UserPath -notlike "*$InstallDir*") {
    $NewPath = "$UserPath;$InstallDir"
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
    Write-Host "  📦 Appended StepWise to `%PATH%` seamlessly!" -ForegroundColor DarkGray
}

Write-Host "`n  ✅ Installation Complete!" -ForegroundColor Green
Write-Host "  Try running: stepwise login`n" -ForegroundColor White
