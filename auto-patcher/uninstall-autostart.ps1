$ErrorActionPreference = 'SilentlyContinue'
$rootDir = $PSScriptRoot

Write-Host "Uninstalling Antigravity RTL Auto-Patcher service..." -ForegroundColor Yellow

# Remove from Registry
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regName = "AntigravityRTLAutoPatcher"
Remove-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
Write-Host "Removed from Windows Startup registry." -ForegroundColor Green

# Stop running process
$pidFile = Join-Path $rootDir "auto-patcher.pid"
if (Test-Path $pidFile) {
    try {
        $oldPid = [int](Get-Content $pidFile -Raw).Trim()
        Stop-Process -Id $oldPid -Force
        Write-Host "Stopped background process (PID: $oldPid)." -ForegroundColor Green
    } catch {}
    Remove-Item $pidFile -Force
}

Write-Host "Antigravity RTL Auto-Patcher service has been disabled." -ForegroundColor Green
