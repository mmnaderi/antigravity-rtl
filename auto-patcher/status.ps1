$rootDir = $PSScriptRoot

Write-Host "=== Antigravity RTL Auto-Patcher Status ===" -ForegroundColor Cyan

# 1. Check registry startup
$reg = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run" -Name "AntigravityRTLAutoPatcher" -ErrorAction SilentlyContinue
if ($reg) {
    Write-Host "[OK] Windows Startup: Enabled (" $reg.AntigravityRTLAutoPatcher ")" -ForegroundColor Green
} else {
    Write-Host "[OFF] Windows Startup: Disabled" -ForegroundColor Yellow
}

# 2. Check running process
$pidFile = Join-Path $rootDir "auto-patcher.pid"
if (Test-Path $pidFile) {
    $pidNum = (Get-Content $pidFile -Raw).Trim()
    $proc = Get-Process -Id $pidNum -ErrorAction SilentlyContinue
    if ($proc) {
        $mem = [math]::Round($proc.WorkingSet64 / 1MB, 2)
        Write-Host "[OK] Background Watcher: Running (PID: $pidNum, RAM: $mem MB)" -ForegroundColor Green
    } else {
        Write-Host "[ERR] Background Watcher: Process $pidNum is not running (stale PID file)" -ForegroundColor Red
    }
} else {
    Write-Host "[OFF] Background Watcher: Not running" -ForegroundColor Yellow
}

# 3. Check app.asar patch status
$asarPath = "$env:LOCALAPPDATA\Programs\antigravity\resources\app.asar"
if (Test-Path $asarPath) {
    $isPatched = (node -e "const fs = require('fs'); const b = fs.readFileSync('$($asarPath -replace '\\','\\\\')'); console.log(b.includes(Buffer.from('/* ANTIGRAVITY RTL PATCH */')));").Trim() -eq 'true'

    if ($isPatched) {
        Write-Host "[OK] Antigravity app.asar: PATCHED (RTL is Active)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Antigravity app.asar: UNPATCHED (Fresh update detected)" -ForegroundColor Red
    }
} else {
    Write-Host "[WARN] Antigravity app.asar not found at $asarPath" -ForegroundColor DarkGray
}

# 4. Recent logs
$logFile = Join-Path $rootDir "auto-patcher.log"
if (Test-Path $logFile) {
    Write-Host "`n--- Recent Log Activity ---" -ForegroundColor Cyan
    Get-Content $logFile -Tail 10
}
