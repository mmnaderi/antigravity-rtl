# Antigravity RTL Auto-Patcher (Windows Background Service)

A lightweight background watcher for Windows that keeps the **Antigravity RTL** patch continuously active across official Antigravity updates.

## Features

- **Live Directory Watcher**: Uses `fs.watch` on the Antigravity `resources` directory to detect updates to `app.asar`.
- **Automatic Re-Patching**: Immediately re-applies the RTL patch when Antigravity is updated by Google.
- **Silent Background Execution**: Runs minimized in the background via `start-silent.vbs` without terminal popup windows.
- **Windows Startup Integration**: Registered under `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.
- **Auto Self-Update**: Periodically checks npm for newer versions of `antigravity-rtl` and updates itself seamlessly.

## Quick Start

### 1. Install & Start Service
```powershell
powershell -ExecutionPolicy Bypass -File ./auto-patcher/install-autostart.ps1
```
*(or via npm: `npm run autostart`)*

### 2. Check Service Status
```powershell
powershell -ExecutionPolicy Bypass -File ./auto-patcher/status.ps1
```
*(or via npm: `npm run autostart:status`)*

### 3. Uninstall / Stop Service
```powershell
powershell -ExecutionPolicy Bypass -File ./auto-patcher/uninstall-autostart.ps1
```
*(or via npm: `npm run autostart:uninstall`)*
