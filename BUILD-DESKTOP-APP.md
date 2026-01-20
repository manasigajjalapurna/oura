# Building Your Oura Health Dashboard Desktop App

Your app is now set up to run as a native desktop application! Here's how to build and use it.

## First Time Setup (On Your Local Machine)

1. **Install Electron Dependencies**
   ```bash
   npm install
   ```
   This will install Electron and all build tools. It might take a few minutes the first time.

2. **Make Sure Your Environment Variables Are Set**
   - Your `.env.local` file should have your API keys
   - OURA_API_TOKEN
   - ANTHROPIC_API_KEY

## Running the Desktop App

### Development Mode (Recommended while testing)
```bash
npm run electron:dev
```
This opens the app in a window with developer tools, so you can see any errors.

### Production Mode (Clean desktop app)
First, build the Next.js app:
```bash
npm run build
```

Then start Electron:
```bash
npm run electron:start
```

## Building a Standalone Desktop App

To create a **double-click application** you can use without running any commands:

### For Mac:
```bash
npm run electron:build
```
This creates a `.dmg` installer in the `dist/` folder. Double-click to install, then find "Oura Health Dashboard" in your Applications folder.

### For Windows:
```bash
npm run electron:build
```
This creates an `.exe` installer in the `dist/` folder.

### For Linux:
```bash
npm run electron:build
```
This creates an `.AppImage` file in the `dist/` folder.

## What You Get

✅ **Native Desktop App** - Opens like any other application
✅ **No Browser Needed** - Runs in its own window
✅ **All Data Local** - Your database stays on your machine
✅ **Auto-Start** - Just double-click the app icon
✅ **Background Ready** - Can minimize to tray if you want

## File Locations

- **App Files**: `dist/` folder (after building)
- **Database**: `oura-health.db` (stays in project folder)
- **Settings**: `.env.local` (your API keys)

## Tips

1. **First Build Takes Longer**: Electron needs to download platform binaries (~100MB)
2. **Database Persists**: Your data stays in `oura-health.db` even after rebuilding
3. **Auto-Updates**: You can add auto-update functionality later if you want
4. **Icon**: Replace `public/icon.png` with a custom icon (1024x1024 PNG)

## Updating Your App

When you make changes to the code:

1. Pull latest changes from git
2. Run `npm run electron:build` again
3. Install the new version

Your database and settings are preserved!

## Troubleshooting

**"App won't open"**: Make sure you ran `npm install` first
**"Can't connect to Oura"**: Check your `.env.local` has your API token
**"Database error"**: Run `npm run setup` to initialize the database

---

## Want to Share Your App?

You can give the installer (`.dmg`, `.exe`, or `.AppImage`) to others, but they'll need their own:
- Oura API token
- Anthropic API key

The app is configured to work completely offline once data is synced!
