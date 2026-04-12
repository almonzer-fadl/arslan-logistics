# Arslan Logistics - Electron Desktop App Setup

## ✅ What's Been Set Up

### Structure Created:
```
arslan-logistics/
├── electron/
│   ├── main.js       # Electron main process
│   └── preload.js    # Preload script for security
├── package.json      # Updated with Electron scripts
└── ELECTRON_SETUP.md # This file
```

### Package.json Updated:
- ✅ Added `electron` and `electron-builder` to devDependencies
- ✅ Added scripts:
  - `npm run electron:dev` - Run in development (requires Next.js dev server running)
  - `npm run electron:build:mac` - Build macOS app (.dmg)
  - `npm run electron:build:win` - Build Windows app (.exe)
  - `npm run electron:build:linux` - Build Linux app (.deb, AppImage)
  - `npm run electron:build:all` - Build for all platforms

---

## 🚀 How to Use

### Development (Right Now):

1. **Install Electron dependencies:**
   ```bash
   cd ~/Documents/Programming/arslan-logistics
   npm install
   ```

2. **Run Next.js dev server (Terminal 1):**
   ```bash
   npm run dev
   ```

3. **Run Electron app (Terminal 2):**
   ```bash
   npm run electron:dev
   ```

The Electron window will open and load your Next.js app.

---

### Building Desktop Apps:

**For macOS:**
```bash
npm run electron:build:mac
```
Output: `dist/Arslan Logistics.dmg`

**For Windows** (can build from Mac with wine):
```bash
npm run electron:build:win
```
Output: `dist/Arslan Logistics Setup.exe`

**For Linux:**
```bash
npm run electron:build:linux
```
Output: `dist/Arslan Logistics.AppImage` and `.deb`

**For ALL platforms:**
```bash
npm run electron:build:all
```

---

## 🌐 Web vs Desktop Modes

The app automatically detects if it's running in Electron:

```javascript
if (typeof window !== 'undefined' && window.electron?.isElectron) {
  // Running in Electron - use <webview> tags
} else {
  // Running in browser - use popup windows
}
```

### Current Portal View Behavior:
- **Web (browser):** Uses `PortalPopupView` (popup windows grid)
- **Desktop (Electron):** Will use `<webview>` tags for true browser-in-browser (TODO)

---

## 📋 TODO: Implement Webview-Based Split View

Create `src/components/carriers/PortalWebviewSplitView.tsx`:
- Similar to `PortalSplitView` but uses `<webview>` instead of `<iframe>`
- Detects Electron environment and auto-switches
- Full browser context with isolated sessions

---

## 🔒 Security & Best Practices

### Current Setup:
- ✅ `nodeIntegration: false` (secure)
- ✅ `contextIsolation: true` (secure)
- ✅ `webviewTag: true` (enables webview)
- ✅ Preload script for safe API exposure

### Webview Security:
```html
<webview 
  src="https://carrier.com" 
  partition="persist:carrier1"  <!-- Isolated session -->
  allowpopups="on"
/>
```

Each carrier portal gets its own isolated session.

---

## 📦 Distribution

### macOS:
- **File:** `.dmg` installer
- **Code signing:** Optional (recommended for release)
- **Notarization:** Required for Gatekeeper (production)

### Windows:
- **File:** `.exe` installer (NSIS)
- **Code signing:** Optional (recommended to avoid SmartScreen warnings)

### Linux:
- **AppImage:** Universal, no install required
- **.deb:** For Debian/Ubuntu
- **.rpm:** For Fedora/RHEL (add to config if needed)

---

## 🎨 App Icons

Place icons in `public/` directory:
- `public/icon.icns` - macOS (512x512, .icns format)
- `public/icon.ico` - Windows (256x256, .ico format)
- `public/icon.png` - Linux (512x512, .png format)

Generate icons: https://www.electron.build/icons

---

## 📚 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Test development mode (`npm run electron:dev`)
3. ⏳ Create `PortalWebviewSplitView` component
4. ⏳ Update carriers page to detect Electron and use webview version
5. ⏳ Test building for your platform
6. ⏳ Generate app icons
7. ⏳ Build and distribute!

---

## 🔗 Resources

- Electron Docs: https://www.electronjs.org/docs
- electron-builder: https://www.electron.build
- Webview Tag: https://www.electronjs.org/docs/latest/api/webview-tag

---

**Status:** ✅ Electron scaffold complete, ready for `npm install` and testing!
