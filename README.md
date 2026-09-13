# Antigravity Smart RTL & UI Patcher

A smart and beautiful RTL (Right-to-Left) patch for the [Antigravity](https://github.com/google/antigravity) application.

This CLI tool automatically injects a sophisticated RTL engine into Antigravity, adding support for Persian (Farsi), Arabic, Hebrew, and other RTL languages, along with a sleek UI to configure fonts and settings on the fly.

https://github.com/user-attachments/assets/f2e8722d-3aeb-47d3-a37e-c33b6a89676e

## Features

- **Smart Auto-Direction**: Automatically detects if a paragraph is RTL or LTR and aligns it perfectly.
- **Force RTL Mode**: Want everything aligned to the right? Just toggle the switch.
- **Sidebar Menu Integration**: Neatly places the settings button inside the sidebar above Settings, or switch to floating mode.
- **Click-to-Toggle Panel**: Opens smoothly on click and closes on outside click or Esc key (no unwanted hover popups).
- **Custom Sidebar Width**: Real-time slider to adjust the Antigravity sidebar width from 140px to 420px with a one-click reset button.
- **User Message Customizer**: Full control over user prompt styling with dedicated tabs for **Dark Mode** and **Light Mode** — independently customize background color, text color, border color, border width, and shadow (None, Soft, Medium, Glow), with toggle on/off and reset to gentle defaults.
- **Custom Typography**: Define different fonts for your RTL text, English text, and Code blocks!
- **Line Height & Font Size Control**: Precise sliders to adjust line height and font size for optimal readability.
- **Persian Keyboard Fix**: Maps `Shift + 2` to type `@` instead of `٬` on Persian keyboards.
- **Vazirmatn Built-in**: Comes with the beautiful Vazirmatn variable font by default.

## Installation

You don't need to download any files. Just run the following command in your terminal:

### macOS
Before running the patcher, make sure [Node.js](https://nodejs.org) is installed. You can install it from the official website, or if you already use Homebrew:
```bash
brew install node
```
Because the tool needs to modify the Antigravity application files, you must run it with `sudo`:
```bash
sudo npx antigravity-rtl
```
> **macOS Users:** If you get a "Permission Denied" error even with sudo, ensure your terminal (e.g. Terminal, iTerm2, VS Code) has **App Management** permissions enabled in `System Settings > Privacy & Security > App Management`.

### Linux
Because the tool needs to modify the Antigravity application files, you must run it with `sudo`:
```bash
sudo apt install nodejs npm # Skip this line if Node.js is already installed.
sudo npx antigravity-rtl
```

### Windows
Open **PowerShell** as **Administrator** (Right-click -> Run as Administrator), then run:
```powershell
winget install OpenJS.NodeJS.LTS # Skip this line if Node.js is already installed.
npx antigravity-rtl
```

> [!WARNING]
> **App Updates:** Since updating the Antigravity application overwrites its internal files, the RTL patch will be removed. You will need to run the installation command again after each update to re-apply the patch.

## Restoring to Original (Uninstall)

If you ever want to revert Antigravity back to its original state (before the patch), simply run the command with the `--restore` flag:

```bash
sudo npx antigravity-rtl --restore
```
*(On Windows, run without `sudo` in an Administrator terminal)*

## How it works

This CLI tool:
1. Locates your Antigravity installation.
2. Creates a safe backup of the original `app.asar` file.
3. Extracts the application and safely injects the Smart RTL Engine into the core logic (`utils.js`).
4. Repacks the application so you can start using it immediately.

## Future Plans (Roadmap)

- Add Right-to-Left (RTL) support for **Antigravity IDE**.

## Contributing

Feel free to open issues or submit pull requests. Let's make Antigravity accessible and beautiful for everyone!

---

<div dir="rtl">

# اصلاح‌کنندهٔ هوشمند راست‌به‌چپ در Antigravity

یک پچِ هوشمند و زیبا برای پشتیبانی از زبان‌های راست‌به‌چپ (RTL) در نرم‌افزار [Antigravity](https://github.com/google/antigravity).

این ابزارِ خط فرمان (CLI) به صورت کاملاً خودکار یک موتور پیشرفتهٔ RTL را به هستهٔ برنامهٔ آنتی‌گرویتی تزریق می‌کند تا از زبان‌های فارسی، عربی و عبری به بهترین شکل پشتیبانی شود. همچنین یک پنل تنظیماتِ (UI) برای تغییر زندهٔ فونت‌ها در اختیار شما قرار می‌دهد.

## امکانات

- **راست‌چین هوشمند (Smart Auto-Direction)**: سیستم به طور خودکار تشخیص می‌دهد که پاراگراف شما با حرف انگلیسی شروع شده یا فارسی، و چیدمان را بر همان اساس تنظیم می‌کند.
- **حالت راست‌چینِ اجباری (Force RTL Mode)**: دوست دارید همه چیز (حتی پیام‌های انگلیسی) کاملاً در سمت راست قرار بگیرند؟ فقط کافیست سوئیچ را روشن کنید!
- **یکپارچگی با سایدبار (Sidebar Integration)**: دکمه تنظیمات مستقیماً در منوی سایدبار بالای بخش Settings قرار می‌گیرد (با امکان سوئیچ به آیکون شناور).
- **باز شدن با کلیک (Click-to-Toggle)**: پنل فقط با کلیک باز می‌شود و با کلیک در بیرون صفحه یا کلید Esc بسته می‌شود (حذف مزاحمت‌های حالت هاور).
- **تنظیم دلخواه عرض سایدبار**: اسلایدر زنده برای تنظیم عرض سایدبار برنامه از ۱۴۰ تا ۴۲۰ پیکسل همراه با دکمه ریست به پیش‌فرض.
- **سفارشی‌سازی تفکیک‌شده برای دارک‌مود و لایت‌مود**: دارای دو تب مجزا برای حالت تیره (Dark Mode) و حالت روشن (Light Mode) تا رنگ پس‌زمینه، رنگ متن، کادر دور، ضخامت کادر و سایه در هر دو تم بدون تداخل و متناسب با نور محیط تنظیم شوند، همراه با کلید خاموش/روشن و بازگشت به پیش‌فرض ملایم.
- **تنظیماتِ پیشرفتهِ فونت**: می‌توانید برای متون فارسی، متون انگلیسی و کدهای برنامه‌نویسیِ داخل چت، فونت‌های کاملاً جداگانه‌ای تعریف کنید.
- **کنترل فاصله خطوط و اندازه قلم**: اسلایدرهای دقیق برای تنظیم ارتفاع خطوط (Line Height) و اندازه قلم (Font Size) متون چت.
- **حل مشکل کیبورد فارسی**: این ابزار کلید ترکیبی `Shift + 2` روی کیبورد فارسی را اصلاح می‌کند تا به جای «٬» علامت `@` تایپ شود.
- **فونت وزیرمتن**: فونت زیبای Vazirmatn Variable به صورت پیش‌فرض در این افزونه گنجانده شده است.

## آموزش نصب

بدون نیاز به دانلود هیچ فایلی، فقط کافیست دستور زیر را در ترمینال سیستم خود اجرا کنید:

### در مک (macOS)
قبل از اجرای پچر، مطمئن شوید [Node.js](https://nodejs.org) روی سیستم شما نصب است. می‌توانید آن را از سایت رسمی Node.js نصب کنید، یا اگر از Homebrew استفاده می‌کنید:
```bash
brew install node
```
از آنجایی که این ابزار قرار است فایل‌های سیستمی آنتی‌گرویتی را ویرایش کند، باید حتماً دسترسی `sudo` داشته باشد:
```bash
sudo npx antigravity-rtl
```
> **کاربران مک (macOS):** اگر با وجود استفاده از sudo باز هم خطای Permission Denied دریافت کردید، باید به ترمینال خود (مثل Terminal، iTerm2 یا VS Code) دسترسی **App Management** بدهید. برای این کار به مسیر `System Settings > Privacy & Security > App Management` بروید و دسترسی ترمینال خود را فعال کنید.

### در لینوکس
از آنجایی که این ابزار قرار است فایل‌های سیستمی آنتی‌گرویتی را ویرایش کند، باید حتماً دسترسی `sudo` داشته باشد:
```bash
sudo apt install nodejs npm # اگر Node.js از قبل نصب است، این خط را رد کنید.
sudo npx antigravity-rtl
```

### در ویندوز
برنامهٔ **PowerShell** را در حالت **Administrator** (راست‌کلیک -> Run as Administrator) باز کنید و دستور زیر را بنویسید:
```powershell
winget install OpenJS.NodeJS.LTS # اگر Node.js از قبل نصب است، این خط را رد کنید.
npx antigravity-rtl
```

> [!WARNING]
> **به‌روزرسانی برنامه:** از آنجا که آپدیت کردنِ برنامهٔ آنتی‌گرویتی کدهای آن را بازنویسی می‌کند، پچِ اعمال‌شده از بین خواهد رفت و لازم است پس از هر بار آپدیت، دستور نصب را مجدداً اجرا کنید.

## بازگردانی به حالت اولیه (Uninstall)

اگر زمانی خواستید آنتی‌گرویتی را به حالتِ کارخانه (قبل از نصب این پچ) برگردانید، فقط کافیست دستور بالا را با فلگ `--restore` اجرا کنید:

```bash
sudo npx antigravity-rtl --restore
```
*(کاربران ویندوز این دستور را بدون `sudo` و در یک ترمینال ادمین اجرا کنند)*

## این ابزار چگونه کار می‌کند؟

1. ابزار به صورت خودکار محل نصب آنتی‌گرویتی را روی سیستم شما پیدا می‌کند.
2. یک نسخهٔ پشتیبانِ امن از فایل اوریجینالِ `app.asar` تهیه می‌کند.
3. فایل را استخراج کرده و کدهای موتورِ RTL را به ایمن‌ترین شکل ممکن به هستهٔ برنامه تزریق می‌کند.
4. در نهایت برنامه را مجدداً بسته‌بندی می‌کند تا بتوانید بلافاصله از آن لذت ببرید.

## کارهای آینده (Roadmap)

- اضافه کردن قابلیت حل مشکل راست‌به‌چپ برای **Antigravity IDE**.

## مشارکت در توسعه

با کمال میل از نظرات، گزارشِ باگ‌ها و Pull Request های شما استقبال می‌شود. 

</div>
