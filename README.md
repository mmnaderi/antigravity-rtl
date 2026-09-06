# Antigravity Smart RTL & UI Patcher

A smart and beautiful RTL (Right-to-Left) patch for the **[Antigravity](https://github.com/google/antigravity)** application and **Antigravity IDE** (VS Code Edition).

This CLI tool automatically injects a sophisticated RTL engine into Antigravity, adding support for Persian (Farsi), Arabic, Hebrew, and other RTL languages, along with a sleek UI to configure fonts and settings on the fly.

https://github.com/user-attachments/assets/f2e8722d-3aeb-47d3-a37e-c33b6a89676e

## Features

- **Supports Both Antigravity & Antigravity IDE**: Smart auto-detection or interactive selection for both standalone Antigravity and the VS Code-based Antigravity IDE.
- **Monaco Editor Isolation**: In Antigravity IDE, your code editor and terminal stay strictly LTR with monospaced precision, while all AI chats, agent views, and markdown get smart RTL!
- **Smart Auto-Direction**: Automatically detects if a paragraph is RTL or LTR and aligns it perfectly.
- **Force RTL Mode**: Want everything aligned to the right? Just toggle the switch.
- **Custom Typography**: Define different fonts for your RTL text, English text, and Code blocks!
- **Line Height & Font Size Control**: Precise sliders to adjust line height and font size for better readability.
- **Persian Keyboard Fix**: Maps `Shift + 2` to type `@` instead of `٬` on Persian keyboards.
- **Beautiful Settings Panel**: A floating, non-intrusive UI widget at the bottom right corner (placed neatly above the VS Code status bar in IDE).
- **Vazirmatn Built-in**: Comes with the beautiful Vazirmatn variable font by default.

## Installation

You don't need to download any files. Just run the following command in your terminal:

### macOS
Before running the patcher, make sure [Node.js](https://nodejs.org) is installed:
```bash
brew install node # If using Homebrew
sudo npx antigravity-rtl
```
> **macOS Users:** If you get a "Permission Denied" error even with sudo, ensure your terminal (e.g. Terminal, iTerm2, VS Code) has **App Management** permissions enabled in `System Settings > Privacy & Security > App Management`.

### Linux
```bash
sudo apt install nodejs npm # Skip this line if Node.js is already installed.
sudo npx antigravity-rtl
```
*(If your Antigravity IDE is in a user folder such as `~/Downloads`, you do not even need `sudo`! Just run `npx antigravity-rtl --ide`)*

### Windows
Open **PowerShell** as **Administrator** (Right-click -> Run as Administrator), then run:
```powershell
winget install OpenJS.NodeJS.LTS # Skip this line if Node.js is already installed.
npx antigravity-rtl
```

### CLI Options & Flags

| Command | Description |
| :--- | :--- |
| `npx antigravity-rtl` | Interactive mode (auto-detects or prompts you to choose IDE vs App) |
| `npx antigravity-rtl --ide` | Directly patch Antigravity IDE |
| `npx antigravity-rtl --app` | Directly patch Antigravity Standalone App |
| `npx antigravity-rtl --restore` | Revert to original unpatched state |
| `npx antigravity-rtl --path "/path/to/app"` | Specify a custom installation directory |

> [!WARNING]
> **App Updates:** Updating Antigravity or Antigravity IDE overwrites application files, removing the RTL patch. Simply run the patch command again after each update to re-apply.

## Restoring to Original (Uninstall)

If you ever want to revert Antigravity or Antigravity IDE back to its original state (before the patch), simply run:

```bash
sudo npx antigravity-rtl --restore
```
*(Or specify `--ide --restore` to restore Antigravity IDE directly)*

## How it works

1. **Detection**: Locates your Antigravity app (`app.asar`) or Antigravity IDE (`resources/app`).
2. **Safe Backup**: Creates backups (`.bak` / `.rtl-bak`) of original files before making any modifications.
3. **Smart Injection**:
   - For **Antigravity App**: Injects the Smart RTL Engine into core logic (`utils.js`) and repacks `app.asar`.
   - For **Antigravity IDE**: Injects an isolated hook (`antigravity-rtl-main.js`) into `out/main.js` that covers all workbench and agent windows, while protecting Monaco code editor and terminal from RTL layout shifts.
4. **Offline Font**: Embeds the beautiful Vazirmatn Variable font locally.

## Roadmap

- [x] Right-to-Left (RTL) support for **Antigravity IDE**.
- [x] Custom typography, line-height & font size settings.
- [x] Persian `@` sign keyboard fix.

## Contributing

Feel free to open issues or submit pull requests. Let's make Antigravity accessible and beautiful for everyone!

---

<div dir="rtl">

# اصلاح‌کنندهٔ هوشمند راست‌به‌چپ در Antigravity و Antigravity IDE

یک پچِ هوشمند و زیبا برای پشتیبانی کامل از زبان‌های راست‌به‌چپ (RTL) در هر دو نرم‌افزار **Antigravity** (نسخه مستقل) و **Antigravity IDE** (محیط توسعه مبتنی بر VS Code).

این ابزارِ خط فرمان (CLI) به صورت کاملاً خودکار یک موتور پیشرفتهٔ RTL را به برنامه تزریق می‌کند تا از زبان‌های فارسی، عربی و عبری به بهترین شکل پشتیبانی شود. همچنین یک پنل تنظیماتِ شناور (UI) برای تغییر زندهٔ فونت‌ها، فاصلهٔ خطوط و سایز قلم در اختیار شما قرار می‌دهد.

## امکانات

- **پشتیبانی دوگانه (Antigravity و Antigravity IDE)**: شناسایی خودکار یا منوی تعاملی برای انتخاب بین نسخه مستقل و Antigravity IDE.
- **ایزولاسیون ویرایشگر کد در IDE**: در Antigravity IDE، محیط کدنویسی (Monaco Editor) و ترمینال برنامه کاملاً چپ‌چین (LTR) و دست‌نخورده باقی می‌مانند، در حالی که بخش چت هوش مصنوعی، توضیحات ایجنت و متون فارسی راست‌چین می‌شوند!
- **راست‌چین هوشمند (Smart Auto-Direction)**: سیستم به طور خودکار تشخیص می‌دهد که پاراگراف شما با حرف انگلیسی شروع شده یا فارسی، و چیدمان را بر همان اساس تنظیم می‌کند.
- **حالت راست‌چینِ اجباری (Force RTL Mode)**: دوست دارید همه چیز (حتی پیام‌های انگلیسی) کاملاً در سمت راست قرار بگیرند؟ فقط کافیست سوئیچ را روشن کنید!
- **تنظیماتِ پیشرفتهِ فونت**: می‌توانید برای متون فارسی، متون انگلیسی و کدهای برنامه‌نویسیِ داخل چت، فونت‌های کاملاً جداگانه‌ای تعریف کنید.
- **کنترل فاصلهٔ خطوط (Line Height) و اندازه قلم (Font Size)**: با استفاده از اسلایدرها می‌توانید فاصلهٔ خطوط و سایز فونت را برای خوانایی هرچه بهتر تنظیم کنید.
- **حل مشکل کیبورد فارسی**: این ابزار کلید ترکیبی `Shift + 2` روی کیبورد فارسی را اصلاح می‌کند تا به جای «٬» علامت `@` تایپ شود.
- **پنل تنظیمات زیبا**: تمام این تنظیمات در یک ویجتِ کوچک، مدرن و شناور در پایینِ صفحه (بالای نوار وضعیت در IDE) قرار گرفته‌اند.
- **فونت وزیرمتن توکار**: فونت زیبای Vazirmatn Variable به صورت پیش‌فرض در این ابزار گنجانده شده است.

## آموزش نصب

بدون نیاز به دانلود دستی هیچ فایلی، فقط کافیست دستور زیر را در ترمینال سیستم خود اجرا کنید:

### در مک (macOS)
قبل از اجرای پچر، مطمئن شوید [Node.js](https://nodejs.org) روی سیستم شما نصب است:
```bash
brew install node # در صورت استفاده از Homebrew
sudo npx antigravity-rtl
```
> **کاربران مک (macOS):** اگر با وجود استفاده از sudo باز هم خطای Permission Denied دریافت کردید، باید به ترمینال خود (مثل Terminal، iTerm2 یا VS Code) دسترسی **App Management** بدهید (`System Settings > Privacy & Security > App Management`).

### در لینوکس
```bash
sudo apt install nodejs npm # اگر Node.js از قبل نصب است، این خط را رد کنید.
sudo npx antigravity-rtl
```
*(اگر Antigravity IDE شما در پوشه‌های کاربری مانند `~/Downloads` قرار دارد، حتی نیازی به `sudo` هم ندارید و دستور `npx antigravity-rtl --ide` به تنهایی کافیست!)*

### در ویندوز
برنامهٔ **PowerShell** را در حالت **Administrator** (راست‌کلیک -> Run as Administrator) باز کنید و دستور زیر را بنویسید:
```powershell
winget install OpenJS.NodeJS.LTS # اگر Node.js از قبل نصب است، این خط را رد کنید.
npx antigravity-rtl
```

### گزینه‌ها و فلگ‌های خط فرمان

| دستور | توضیحات |
| :--- | :--- |
| `npx antigravity-rtl` | حالت تعاملی (تشخیص خودکار یا انتخاب بین نسخه IDE و اپلیکیشن) |
| `npx antigravity-rtl --ide` | پچ مستقیم Antigravity IDE |
| `npx antigravity-rtl --app` | پچ مستقیم نسخه مستقل Antigravity |
| `npx antigravity-rtl --restore` | بازگردانی کامل به حالت اولیه (قبل از پچ) |
| `npx antigravity-rtl --path "/path/to/app"` | مشخص کردن مسیر دلخواه نصب برنامه |

> [!WARNING]
> **به‌روزرسانی برنامه:** از آنجا که آپدیت کردنِ برنامه کدهای آن را بازنویسی می‌کند، پچِ اعمال‌شده بازنشانی خواهد شد و لازم است پس از هر بار آپدیت، دستور نصب را مجدداً اجرا کنید.

## بازگردانی به حالت اولیه (Uninstall)

اگر زمانی خواستید برنامه را به حالت کارخانه (قبل از نصب این پچ) برگردانید، فقط کافیست دستور زیر را اجرا کنید:

```bash
sudo npx antigravity-rtl --restore
```
*(یا برای بازگردانی مستقیم IDE از `npx antigravity-rtl --ide --restore` استفاده کنید)*

## این ابزار چگونه کار می‌کند؟

1. **شناسایی خودکار**: محل نصب Antigravity (`app.asar`) یا Antigravity IDE (`resources/app`) را پیدا می‌کند.
2. **پشتیبان‌گیری امن**: قبل از هر تغییری از فایل‌های اصلی نسخهٔ پشتیبان (`.bak` یا `.rtl-bak`) تهیه می‌کند.
3. **تزریق هوشمند**:
   - برای **نسخه مستقل**: موتور RTL به فایل هسته (`utils.js`) تزریق شده و `app.asar` مجدداً بسته‌بندی می‌شود.
   - برای **Antigravity IDE**: یک هوک مجزا و ایمن (`antigravity-rtl-main.js`) در پروسهٔ اصلی الکترون (`out/main.js`) بارگذاری می‌شود که بدون دستکاری در کدهای حجیم VS Code، چت‌ها و پنجره‌های ایجنت را پچ کرده و ویرایشگر کد (Monaco) و ترمینال را در حالت LTR حفظ می‌کند.
4. **فونت آفلاین**: فونت متغیر وزیرمتن را برای استفاده آفلاین در برنامه قرار می‌دهد.

## مشارکت در توسعه

با کمال میل از نظرات، گزارشِ باگ‌ها و Pull Request های شما استقبال می‌شود. 

</div>
