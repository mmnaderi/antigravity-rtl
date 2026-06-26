# Antigravity Smart RTL

A smart and beautiful RTL (Right-to-Left) patch for the [Antigravity](https://github.com/google/antigravity) application.

This CLI tool automatically injects a sophisticated RTL engine into Antigravity, adding support for Persian (Farsi), Arabic, Hebrew, and other RTL languages, along with a sleek UI to configure fonts and settings on the fly.

https://github.com/user-attachments/assets/f2e8722d-3aeb-47d3-a37e-c33b6a89676e

## Features

- **Smart Auto-Direction**: Automatically detects if a paragraph is RTL or LTR and aligns it perfectly.
- **Force RTL Mode**: Want everything aligned to the right? Just toggle the switch.
- **Custom Typography**: Define different fonts for your RTL text, English text, and Code blocks!
- **Line Height Control**: A precise slider to adjust the line height for better readability.
- **Persian Keyboard Fix**: Maps `Shift + 2` to type `@` instead of `٬` on Persian keyboards.
- **Beautiful Settings Panel**: A floating, non-intrusive UI widget at the bottom right corner.
- **Vazirmatn Built-in**: Comes with the beautiful Vazirmatn variable font by default.

## Installation

You don't need to download any files. Just run the following command in your terminal:

### macOS / Linux
Because the tool needs to modify the Antigravity application files, you must run it with `sudo`:
```bash
sudo npx antigravity-rtl
```
> **macOS Users:** If you get a "Permission Denied" error even with sudo, ensure your terminal (e.g. Terminal, iTerm2, VS Code) has **App Management** permissions enabled in `System Settings > Privacy & Security > App Management`.


### Windows
Open **PowerShell** or **Command Prompt** as **Administrator** (Right-click -> Run as Administrator), then run:
```bash
npx antigravity-rtl
```

> **Note:** You must have [Node.js](https://nodejs.org) installed on your system to run this command.

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

# پروژه Antigravity Smart RTL

یک پچِ هوشمند و زیبا برای پشتیبانی از زبان‌های راست‌به‌چپ (RTL) در نرم‌افزار [Antigravity](https://github.com/google/antigravity).

این ابزارِ خط فرمان (CLI) به صورت کاملاً خودکار یک موتور پیشرفتهٔ RTL را به هستهٔ برنامهٔ آنتی‌گرویتی تزریق می‌کند تا از زبان‌های فارسی، عربی و عبری به بهترین شکل پشتیبانی شود. همچنین یک پنل تنظیماتِ (UI) برای تغییر زندهٔ فونت‌ها در اختیار شما قرار می‌دهد.

## امکانات

- **راست‌چین هوشمند (Smart Auto-Direction)**: سیستم به طور خودکار تشخیص می‌دهد که پاراگراف شما با حرف انگلیسی شروع شده یا فارسی، و چیدمان را بر همان اساس تنظیم می‌کند.
- **حالت راست‌چینِ اجباری (Force RTL Mode)**: دوست دارید همه چیز (حتی پیام‌های انگلیسی) کاملاً در سمت راست قرار بگیرند؟ فقط کافیست سوئیچ را روشن کنید!
- **تنظیماتِ پیشرفتهِ فونت**: می‌توانید برای متون فارسی، متون انگلیسی و کدهای برنامه‌نویسیِ داخل چت، فونت‌های کاملاً جداگانه‌ای تعریف کنید.
- **کنترل فاصلهٔ خطوط (Line Height)**: با استفاده از اسلایدر می‌توانید فاصلهٔ خطوط را برای خوانایی بهتر متن تنظیم کنید.
- **حل مشکل کیبورد فارسی**: این ابزار کلید ترکیبی `Shift + 2` روی کیبورد فارسی را اصلاح می‌کند تا به جای «٬» علامت `@` تایپ شود.
- **پنل تنظیمات زیبا**: تمام این تنظیمات در یک ویجتِ کوچک، مدرن و شناور در پایینِ صفحه قرار گرفته‌اند.
- **فونت وزیرمتن**: فونت زیبای Vazirmatn Variable به صورت پیش‌فرض در این افزونه گنجانده شده است.

## آموزش نصب

بدون نیاز به دانلود هیچ فایلی، فقط کافیست دستور زیر را در ترمینال سیستم خود اجرا کنید:

### در مک (macOS) و لینوکس
از آنجایی که این ابزار قرار است فایل‌های سیستمی آنتی‌گرویتی را ویرایش کند، باید حتماً دسترسی `sudo` داشته باشد:
```bash
sudo npx antigravity-rtl
```
> **کاربران مک (macOS):** اگر با وجود استفاده از sudo باز هم خطای Permission Denied دریافت کردید، باید به ترمینال خود (مثل Terminal، iTerm2 یا VS Code) دسترسی **App Management** بدهید. برای این کار به مسیر `System Settings > Privacy & Security > App Management` بروید و دسترسی ترمینال خود را فعال کنید.


### در ویندوز
برنامهٔ **PowerShell** یا **Command Prompt** را در حالت **Administrator** (راست‌کلیک -> Run as Administrator) باز کنید و دستور زیر را بنویسید:
```bash
npx antigravity-rtl
```

> **نکته:** برای اجرای این دستور باید حتماً [Node.js](https://nodejs.org) روی سیستم شما نصب باشد.

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
