# Antigravity Smart RTL

A smart and beautiful RTL (Right-to-Left) patch for the [Antigravity](https://github.com/google/antigravity) application.

This CLI tool automatically injects a sophisticated RTL engine into Antigravity, adding support for Persian (Farsi), Arabic, Hebrew, and other RTL languages, along with a sleek UI to configure fonts and settings on the fly.

## Demo

<video src="https://github.com/mmnaderi/antigravity-rtl/raw/main/demo.mp4" controls="controls" style="max-width: 100%;">
  Your browser does not support the video tag.
</video>

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

### Windows
Open **PowerShell** or **Command Prompt** as **Administrator** (Right-click -> Run as Administrator), then run:
```bash
npx antigravity-rtl
```

> **Note:** You must have [Node.js](https://nodejs.org) installed on your system to run this command.

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

## Contributing

Feel free to open issues or submit pull requests. Let's make Antigravity accessible and beautiful for everyone!
