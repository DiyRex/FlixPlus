# FlixPlus - Quick Start Guide

## 🚀 Install in 3 Steps

### Step 1: Open Chrome Extensions
```
Type in Chrome address bar: chrome://extensions/
```

### Step 2: Enable Developer Mode
- Toggle "Developer mode" switch (top-right corner)

### Step 3: Load Extension
- Click "Load unpacked"
- Navigate to: `/Users/devin/Projects/FlixPlus/extension`
- Click "Select"

## ✅ Verify Installation

You should see:
- ✓ "FlixPlus - Netflix Quality Enhancer" in extension list
- ✓ FlixPlus icon in Chrome toolbar
- ✓ Status: Enabled

## 🎬 First Use

1. **Go to Netflix**: https://www.netflix.com
2. **Click FlixPlus icon** in toolbar
3. **Recommended settings**:
   - ✅ Maximum Bitrate: ON
   - ✅ Enhanced Audio: ON
   - ✅ All Audio Tracks: ON
   - ✅ SUP Subtitles: ON
   - ✅ Disable Household Check: ON
4. **Start watching** any video
5. **Press `Ctrl+Alt+Shift+F`** to see quality info

## 🔍 Verify It's Working

### Quick Check (5 seconds)
1. Play any Netflix video
2. Press `Ctrl+Alt+Shift+F`
3. See the status overlay showing:
   - Video resolution (should be 1080p or higher)
   - Video bitrate (should be 5+ Mbps)
   - Audio codec and bitrate

### Console Check
1. Press `F12` to open DevTools
2. Go to "Console" tab
3. Look for these messages:
   ```
   [FlixPlus UHD] Initialized successfully
   [FlixPlus] Initialized successfully
   [FlixPlus Overlay] Ready!
   ```

## 🎯 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+Shift+F` | Toggle quality overlay |
| `Ctrl+Alt+Shift+D` | Show Netflix debug info |
| `Ctrl+Alt+Shift+B` | Show stream selector |

## 🔧 Settings Explained

### Video Quality
- **Maximum Bitrate**: Forces highest available quality ⭐ Recommended
- **Force UHD/4K**: Enable 4K on any screen (needs Premium plan)
- **Always Use HDR**: Force HDR/Dolby Vision (needs HDR display)

### Audio
- **Enhanced Audio**: Enable DD+/Atmos ⭐ Recommended
- **All Audio Tracks**: Show all available audio options ⭐ Recommended

### Other
- **SUP Subtitles**: Better subtitle format ⭐ Recommended
- **Disable Household Check**: Bypass verification (optional)

## 🛡️ Security

✅ **Only runs on netflix.com**
✅ **No data collection**
✅ **No external requests**
✅ **All files local**

## ❗ Important Notes

- **Refresh Netflix** after changing settings
- **Netflix Premium** required for 4K content
- **25+ Mbps internet** recommended for 4K
- May violate Netflix Terms of Service

## 🐛 Troubleshooting

### Extension not working?
1. Refresh Netflix page
2. Check you're on netflix.com (not other sites)
3. Reload extension: `chrome://extensions/` → reload icon

### Low quality?
1. Check Netflix plan (4K needs Premium)
2. Check internet speed (25+ Mbps for 4K)
3. Refresh page after changing settings

### Can't find extension icon?
- Click puzzle piece icon in Chrome
- Find FlixPlus and click pin icon

## 📚 More Help

- Read [README.md](README.md) for complete documentation
- Read [INSTALLATION.md](INSTALLATION.md) for detailed setup
- Read [SUMMARY.md](SUMMARY.md) for technical details

## 🎉 Enjoy!

Your Netflix should now stream in maximum quality!

Press `Ctrl+Alt+Shift+F` anytime to see real-time quality information.
