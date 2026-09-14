<div align="center">

# 🌌 Antigravity Smart RTL & UI Suite

**A high-performance RTL engine & modular theme customizer for the [Antigravity](https://github.com/google/antigravity) desktop app.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-lightgrey.svg)](https://github.com/google/antigravity)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/mmnaderi/antigravity-rtl/pulls)

<p>
  <a href="#-visual-tour">Visual Tour</a> •
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-restoring-to-original-uninstall">Uninstall</a> •
  <a href="#-راهنمای-فارسی-persian-guide">راهنمای فارسی</a>
</p>

<br>

<img src="assets/showcase-split.png" alt="Antigravity UI Dual Theme Showcase" width="100%">

</div>

---

## 🌟 Visual Tour

<div align="center">
<table>
  <tr>
    <td align="center" width="46%" valign="top">
      <h4>🎛️ Dual-Theme UI Studio</h4>
      <p><sub>Independent Dark (Glow) & Light (3D Shadow) modes with smooth tab physics</sub></p>
      <img src="assets/tab-switch.gif" width="270" alt="Tab Switch Preview">
    </td>
    <td align="center" width="54%" valign="top">
      <h4>📍 Activity Bar Docking & Compact Mode</h4>
      <p><sub>Docked above Settings with fluid mouse dragging down to 140px</sub></p>
      <br>
      <img src="assets/sidebar-placement.png" width="250" alt="Sidebar Placement">
      <br><br>
      <div align="left">
        <ul>
          <li><b>Zero Clutter:</b> Docked inside the sidebar, no floating button obstruction</li>
          <li><b>Fluid 140px Dragging:</b> Natural mouse resize (140px–600px) breaking the 256px limit</li>
          <li><b>Anti-Clipping:</b> Left-pinned text alignment keeps labels fully readable</li>
          <li><b>Click-to-Toggle:</b> Opens on click; cleanly dismisses with <code>Esc</code> or outside click</li>
        </ul>
      </div>
    </td>
  </tr>
</table>
</div>

---

## ✨ Features

### 🎨 Dual-Theme UI & Styling Engine
- **Independent Theme Tabs**: Customize user message bubbles separately for **Dark Mode** (with vibrant Neon Glow) and **Light Mode** (with elevated 3D shadow).
- **Zero-Inversion Contrast (WCAG AAA)**: Text and labels stay crystal clear across all themes without washed-out labels or inverted colors.
- **Granular Visual Controls**: Custom background color, text color, border width, border color, and shadow intensity presets (`None`, `Soft`, `Medium`, `Glow`).
- **Synchronized Chat Input**: Automatically harmonizes the active prompt input box border with your personalized bubble styling.
- **Decoupled Architecture**: Custom UI styling stays 100% active even when the RTL engine is toggled off.

### 📐 Ergonomic Sidebar & Compact Mode (140px)
- **Activity Sidebar Docking**: Integrates seamlessly right above the Settings gear icon, keeping the chat canvas clean.
- **Fluid Mouse Resizing**: Removes rigid CSS locks, restoring natural, unrestricted mouse dragging across the full 140px–600px range.
- **Compact Sidebar (140px)**: Allows resizing down to 140px with left-pinned CSS rules that prevent text clipping.
- **Click-to-Toggle**: Opens only on click and dismisses smoothly on outside click or the `Esc` key.

### 📝 Smart Typography & RTL Engine
- **Intelligent Auto-Direction**: Dynamically detects paragraph language, right-aligning Persian/Arabic while keeping English and code blocks LTR.
- **Force RTL Mode**: Option to align all content to the right when full RTL layout is preferred.
- **Built-in Vazirmatn Font**: Ships with the modern, high-legibility Vazirmatn Variable font out of the box.
- **Independent Font Families**: Configure separate fonts for RTL text, Latin text, and code blocks.
- **Typography Sliders**: Fine-tune line height and font size with live responsive sliders.
- **Persian Keyboard Optimization**: Automatically maps `Shift + 2` to type `@` instead of `٬` on Persian keyboard layouts.
- **Zero White-Screen Startup Guard**: Runs inside an isolated IIFE with safe lifecycle hooks to prevent Electron startup race conditions.

---

## 🚀 Installation

You don't need to clone any repositories or download files manually. Run the command for your operating system:

### macOS
Ensure [Node.js](https://nodejs.org) is installed (e.g. via Homebrew: `brew install node`). Run with `sudo` to allow patching application files:
```bash
sudo npx antigravity-rtl
```
> **macOS Users:** If you encounter a "Permission Denied" error even with `sudo`, ensure your terminal app (Terminal, iTerm2, VS Code) has **App Management** permission in `System Settings > Privacy & Security > App Management`.

### Linux
Run with `sudo` to allow patching application files:
```bash
sudo apt install nodejs npm # Skip if Node.js is already installed
sudo npx antigravity-rtl
```

### Windows
Open **PowerShell** as **Administrator** (Right-click -> Run as Administrator), then run:
```powershell
winget install OpenJS.NodeJS.LTS # Skip if Node.js is already installed
npx antigravity-rtl
```

> [!WARNING]
> **Antigravity Updates:** Because updating Antigravity overwrites internal application files, the patch will be reset upon each app update. Simply re-run `npx antigravity-rtl` to re-apply the patch.

---

## 🔄 Restoring to Original (Uninstall)

To revert Antigravity to its pristine factory state at any time, run the command with the `--restore` flag:

```bash
sudo npx antigravity-rtl --restore
```
*(On Windows, run without `sudo` in an Administrator PowerShell window)*

---

## 🛠️ How It Works

1. **Locates Installation**: Detects your Antigravity installation path across macOS, Linux, and Windows.
2. **Safe Backup**: Creates an untouched safety backup of the original `app.asar` archive.
3. **Core Injection**: Safely injects the modular RTL & UI engine into client logic.
4. **Repacks & Seals**: Repackages the application so changes take effect immediately upon launch.

---

<div dir="rtl">

# 🇮🇷 راهنمای فارسی (Persian Guide)

<div align="center">

## اصلاح‌کنندهٔ هوشمند راست‌به‌چپ و شخصی‌ساز پیشرفتهٔ ظاهر Antigravity

**پشتیبانی بی‌نقص از زبان‌های راست‌به‌چپ (فارسی، عربی، عبری) و شخصی‌سازی ارگونومیک رابط کاربری در نرم‌افزار [Antigravity](https://github.com/google/antigravity)**

<br>

<img src="assets/showcase-split.png" alt="نمای تم دارک و لایت پچ آنتی‌گرویتی" width="100%">

</div>

---

### 🌟 تور بصری امکانات

<div align="center">
<table>
  <tr>
    <td align="center" width="46%" valign="top">
      <h4>🎛️ استودیو شخصی‌سازی پیام‌ها (Dual UI)</h4>
      <p><sub>تنظیم مستقل تم تیره و روشن با انیمیشن‌های نرم و فیزیکی</sub></p>
      <img src="assets/tab-switch.gif" width="270" alt="سوییچ بین تب‌ها">
    </td>
    <td align="center" width="54%" valign="top">
      <h4>📍 جای‌گیری در نوار کناری (سایدبار) و حالت فشرده</h4>
      <p><sub>یکپارچه بالای دکمه تنظیمات • درگ کاملاً روان و سایدبار فشرده ۱۴۰px</sub></p>
      <br>
      <img src="assets/sidebar-placement.png" width="250" alt="جای‌گیری در سایدبار">
      <br><br>
      <div align="right">
        <ul>
          <li><b>میز کار خلوت:</b> ادغام مستقیم در سایدبار بدون مزاحمت آیکون‌های شناور</li>
          <li><b>سایدبار فشرده (140px):</b> درگ آزاد موس و عبور از محدودیت ۲۵۶ پیکسلی</li>
          <li><b>بدون برش متون:</b> تراز پین‌شده به چپ برای حفظ خوانایی کامل متن‌ها</li>
          <li><b>باز شدن با کلیک:</b> بدون هاور ناخواسته؛ بسته شدن با Esc یا کلیک بیرون</li>
        </ul>
      </div>
    </td>
  </tr>
</table>
</div>

---

### 🌟 قابلیت‌های کلیدی

#### ۱. استودیو شخصی‌سازی پیام‌ها (Dual Dark/Light UI)
- **دو تب کاملاً مستقل برای دارک‌مود و لایت‌مود**: تنظیم مجزای استایل پیام‌های کاربر در تم تیره (با افکت درخشش نئونی / Neon Glow) و تم روشن (با سایه برجسته سه‌بعدی / Elevated 3D Shadow) متناسب با نور محیط.
- **کنتراست استاندارد WCAG AAA**: تضمین خوانایی ۱۰۰٪ متون و لیبل‌ها در هر دو تم بدون هیچ‌گونه وارونگی ناخواسته یا محو شدن متن‌ها.
- **کنترل کامل المان‌های بصری**: شخصی‌سازی رنگ پس‌زمینه، رنگ متن، رنگ و ضخامت کادر (Border) و شدت سایه (`None`، `Soft`، `Medium`، `Glow`).
- **همگام‌سازی کادر ورودی چت**: هماهنگی خودکار استایل و بوردر کادر ورودی پیام‌ها (Chat Input Box) با حباب پیام کاربر.
- **استقلال کامل از موتور RTL**: استایل‌های ظاهری در تگ اختصاصی تفکیک شده و حتی در صورت خاموش کردن موتور RTL کاملاً فعال و دست‌نخورده باقی می‌مانند.

#### ۲. یکپارچگی ارگونومیک با سایدبار و حالت فشرده (Compact 140px)
- **جای‌گیری شیک در سایدبار بالای Settings**: دکمه تنظیمات مستقیماً در سایدبار اصلی و در بالای آیکون Settings قرار می‌گیرد تا میز کار همیشه خلوت بماند (همراه با قابلیت بازگشت به آیکون شناور).
- **درگ کاملاً روان و طبیعی موس**: حذف محدودیت‌های صلب CSS و احیای کامل درگ آزاد موس بین ۱۴۰ تا ۶۰۰ پیکسل.
- **سایدبار فشرده (Compact 140px)**: امکان کوچک کردن سایدبار تا ۱۴۰ پیکسل (فراتر از محدودیت پیش‌فرض ۲۵۶ پیکسلی نرم‌افزار) همراه با تراز پین‌شده به چپ جهت رفع کامل باگ بریده شدن متون.
- **باز شدن با کلیک (Click-to-Toggle)**: حذف باز شدن‌های ناخواسته هنگام عبور موس؛ پنل صرفاً با کلیک باز شده و با کلیک بیرون یا کلید `Esc` بسته می‌شود.

#### ۳. موتور هوشمند RTL و تایپوگرافی
- **راست‌چین خودکار پاراگراف‌ها (Smart Auto-Direction)**: تشخیص هوشمند زبان هر پاراگراف؛ متون فارسی راست‌چین و تکه‌های کد یا انگلیسی چپ‌چین و تراز باقی می‌مانند.
- **حالت راست‌چین اجباری (Force RTL)**: هدایت کلیه پیام‌ها به سمت راست تنها با فشردن یک کلید.
- **فونت وزیرمتن توکار**: گنجانده شدن فونت استاندارد و زیبای Vazirmatn Variable برای بالاترین سطح خوانایی.
- **تفکیک فونت‌ها**: امکان تعیین فونت اختصاصی و جداگانه برای متون فارسی، انگلیسی و بلاک‌های کد.
- **اسلایدرهای دقیق تایپوگرافی**: تنظیم فاصله خطوط (Line Height) و اندازه قلم (Font Size) پیام‌های چت به صورت زنده.
- **حل مشکل کیبورد فارسی**: نگاشت خودکار کلید ترکیبی `Shift + 2` برای تایپ کاراکتر `@` به جای «٬» در چیدمان فارسی.
- **محافظ ضد صفحه سفید استارت‌آپ**: اجرای ایزوله و امن در قالب IIFE با لودینگ منعطف در چرخه حیات کلاینت.

---

### 💻 آموزش نصب و استفاده

بدون نیاز به دانلود فایل یا کلون کردن مخزن، دستور متناسب با سیستم‌عامل خود را در ترمینال اجرا کنید:

#### در مک (macOS)
مطمئن شوید [Node.js](https://nodejs.org) روی سیستم نصب است (مثلاً با دستور `brew install node`). سپس دستور زیر را با `sudo` اجرا نمایید:
```bash
sudo npx antigravity-rtl
```
> **کاربران مک:** در صورت مواجهه با خطای عدم دسترسی حتی با وجود `sudo`، دسترسی **App Management** را در مسیر `System Settings > Privacy & Security > App Management` برای نرم‌افزار ترمینال خود فعال کنید.

#### در لینوکس
```bash
sudo apt install nodejs npm # در صورت نصب بودن نود جی‌اس این خط را رد کنید
sudo npx antigravity-rtl
```

#### در ویندوز
برنامه **PowerShell** را در حالت **Administrator** (راست‌کلیک -> Run as Administrator) باز کرده و دستور زیر را اجرا کنید:
```powershell
winget install OpenJS.NodeJS.LTS # در صورت نصب بودن نود جی‌اس این خط را رد کنید
npx antigravity-rtl
```

> [!WARNING]
> **به‌روزرسانی نرم‌افزار:** از آنجا که آپدیت‌های Antigravity فایل‌های داخلی برنامه را بازنویسی می‌کنند، پچ با هر بار آپدیت نرم‌افزار ریست می‌شود. پس از هر آپدیت کافیست دستور `npx antigravity-rtl` را مجدداً اجرا کنید.

---

### 🔄 بازگردانی به حالت اولیه کارخانه (Uninstall)

برای برگرداندن Antigravity به وضعیت دست‌نخورده قبل از پچ، از فلگ `--restore` استفاده کنید:

```bash
sudo npx antigravity-rtl --restore
```
*(در ویندوز دستور فوق را بدون `sudo` در ترمینال ادمین اجرا کنید)*

---

### 🤝 مشارکت در توسعه (Contributing)

با کمال میل از نظرات، پیشنهادات، گزارش باگ‌ها و ارسال Pull Request استقبال می‌شود.

</div>
