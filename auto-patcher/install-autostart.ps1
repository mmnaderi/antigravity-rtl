$ErrorActionPreference = 'Stop'
$rootDir = $PSScriptRoot

Write-Host "Installing Antigravity RTL Auto-Patcher service..." -ForegroundColor Cyan

# Stop any existing instance
$pidFile = Join-Path $rootDir "auto-patcher.pid"
if (Test-Path $pidFile) {
    try {
        $oldPid = [int](Get-Content $pidFile -Raw).Trim()
        Stop-Process -Id $oldPid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped previous auto-patcher process (PID: $oldPid)." -ForegroundColor Gray
    } catch {}
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

# Register in Windows Startup (HKCU Run key)
$regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
$regName = "AntigravityRTLAutoPatcher"
$vbsPath = Join-Path $rootDir "start-silent.vbs"
$cmdValue = "wscript.exe `"$vbsPath`""

Set-ItemProperty -Path $regPath -Name $regName -Value $cmdValue
Write-Host "Registered in Windows Startup: $regName -> $cmdValue" -ForegroundColor Green

# Start the background service detached from any job object
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = $cmdValue } | Out-Null
Start-Sleep -Seconds 3

if (Test-Path $pidFile) {
    $newPid = (Get-Content $pidFile -Raw).Trim()
    Write-Host "Antigravity RTL Auto-Patcher is running in background (PID: $newPid)!" -ForegroundColor Green
} else {
    Write-Host "Auto-patcher started." -ForegroundColor Green
}
