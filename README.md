# FlixPlus - Netflix Quality Enhancer

A Chrome extension that unlocks maximum video quality, HDR, and advanced audio features on Netflix.

## Features

### Video Quality
- **Maximum Bitrate**: Force highest available video and audio bitrate
- **Force UHD/4K**: Enable 4K playback on any screen resolution (requires Widevine L1)
- **HDR Support**: Force HDR/Dolby Vision when available
- **Codec Optimization**: Automatic selection of best video codec (HEVC/VP9/AV1)

### Audio Enhancements
- **Enhanced Audio**: Enable Dolby Digital Plus & HE-AAC 5.1
- **All Audio Tracks**: Show all available audio tracks and subtitles
- **Subtitle Options**: Choose between SUP and IMSC subtitle formats

### Other Features
- **Household Check Bypass**: Disable Netflix household verification
- **Real-time Status Overlay**: View current video quality, bitrate, and codec information
- **Debug Tools**: Built-in player info and stream selector

## Security Features

**IMPORTANT**: This extension is **RESTRICTED** to netflix.com only and includes multiple security layers to protect against the obfuscated playercore file.

### Multi-Layer Security Protection:

1. **Domain Restriction** (netflix.com only)
   - ✅ Manifest-level permissions
   - ✅ Runtime verification in every script
   - ✅ Cannot run on any other website

2. **Network Request Monitoring**
   - ✅ Whitelist-based filtering (only Netflix domains allowed)
   - ✅ Monitors fetch(), XMLHttpRequest, WebSocket
   - ✅ Blocks unauthorized external requests
   - ✅ Logs suspicious activity

3. **File Integrity Verification**
   - ✅ SHA-256 hash verification of cadmium-playercore.js
   - ✅ Alerts if file has been modified
   - ✅ Continuous integrity monitoring
   - ✅ Displayed in extension popup

4. **Content Security Policy**
   - ✅ No inline scripts allowed
   - ✅ No eval() of remote code
   - ✅ Only extension files can execute

5. **Code Injection Prevention**
   - ✅ Monitors eval() usage
   - ✅ Tracks Function() constructor
   - ✅ Detects suspicious code patterns

6. **Data Protection**
   - ✅ LocalStorage access monitoring
   - ✅ Cookie modification tracking
   - ✅ IFrame creation blocking
   - ✅ Prevents data exfiltration

### Security Status Display:

Check the extension popup to see real-time security status:
- **Network Protection**: Active/Blocked requests
- **File Integrity**: Verified/Failed
- **Suspicious Activity**: Count of blocked attempts

**See [SECURITY.md](SECURITY.md) for complete security documentation.**

## Installation

### Method 1: Load Unpacked Extension (Development)

1. **Open Chrome Extensions page**:
   - Navigate to `chrome://extensions/`
   - Or click Menu (⋮) → Extensions → Manage Extensions

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the extension**:
   - Click "Load unpacked"
   - Navigate to `/Users/devin/Projects/FlixPlus/extension`
   - Click "Select"

4. **Verify installation**:
   - You should see "FlixPlus - Netflix Quality Enhancer" in your extensions list
   - The extension icon should appear in your Chrome toolbar

### Method 2: Package as CRX (Recommended for Personal Use)

1. **Package the extension**:
   ```bash
   cd /Users/devin/Projects/FlixPlus
   # Chrome will create a .crx file
   ```
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Extension root directory: Select the `extension` folder
   - Click "Pack Extension"

2. **Install the packaged extension**:
   - Drag and drop the `.crx` file to `chrome://extensions/`

## Usage

### Basic Usage

1. **Install the extension** (see above)
2. **Navigate to Netflix**: Go to https://www.netflix.com
3. **Extension auto-activates**: FlixPlus starts working automatically
4. **Configure settings**: Click the FlixPlus icon in Chrome toolbar

### Settings Configuration

Click the FlixPlus extension icon to access settings:

#### Video Quality Settings
- ✅ **Maximum Bitrate** (Recommended: ON) - Forces highest available quality
- ✅ **Force UHD/4K** (Use if you have 4K content) - Enables 4K on any screen
- ⬜ **Always Use HDR** (Use if you have HDR display) - Forces HDR/DV playback

#### Audio Settings
- ✅ **Enhanced Audio** (Recommended: ON) - Enables DD+/Atmos
- ✅ **All Audio Tracks** (Recommended: ON) - Shows all available audio options

#### Other Features
- ✅ **SUP Subtitles** (Recommended: ON) - Better subtitle format
- ✅ **Disable Household Check** (Optional) - Bypass household verification

### Viewing Quality Information

**Press `Ctrl+Alt+Shift+F`** while watching Netflix to toggle the status overlay.

The overlay shows:
- Current video resolution (e.g., 3840x2160 4K UHD)
- Video bitrate (e.g., 15-25 Mbps)
- Video codec (HEVC/VP9/AV1/H.264)
- Audio bitrate and codec
- DRM system in use (Widevine/PlayReady)
- HDR status

### Debug Tools

From the extension popup:
- **Show Player Info**: Opens Netflix's built-in player debug info (`Ctrl+Alt+Shift+D`)
- **Stream Selector**: Opens Netflix's stream quality selector (`Ctrl+Alt+Shift+B`)

## How It Works

### Netflix Plus Core
- Intercepts Netflix's playercore loading
- Replaces with modified version that unlocks quality restrictions
- Spoofs browser capabilities to enable higher quality streams
- Forces best available video and audio bitrate selection

### Netflix UHD
- Spoofs screen resolution to 8K (7680x4320)
- Hooks into DRM systems (Widevine/PlayReady)
- Reports all video formats as smooth and power-efficient
- Bypasses hardware limitation checks

### Status Overlay
- Monitors video element properties in real-time
- Accesses Netflix's internal player API when available
- Provides visual feedback on quality improvements

## Verifying It's Working

### Method 1: Use the Status Overlay
1. Start playing any Netflix video
2. Press `Ctrl+Alt+Shift+F` to show the overlay
3. Check the resolution - should show 1080p or higher
4. Check bitrate - should show higher values (8-25 Mbps for HD/4K)

### Method 2: Use Netflix Debug Info
1. While playing, press `Ctrl+Alt+Shift+Shift+D` (or click "Show Player Info" in extension)
2. Look for:
   - Playing bitrate (should be highest available)
   - Resolution (1920x1080 or 3840x2160)
   - Audio codec (should show DD+ or Atmos if available)

### Method 3: Visual Inspection
- Video should look noticeably sharper
- Check for HDR badge on compatible content
- Audio should sound richer with surround sound content

## Troubleshooting

### Extension not working?
1. **Refresh Netflix page** after installing
2. **Check you're on Netflix**: Extension only works on netflix.com
3. **Clear browser cache**: Settings → Privacy → Clear browsing data
4. **Reload extension**: `chrome://extensions/` → Click reload icon

### Still seeing low quality?
1. **Check your Netflix plan**: 4K requires Premium plan
2. **Check your internet speed**: Need 25+ Mbps for 4K
3. **Verify Widevine L1**: Some PCs don't support hardware DRM for 4K
4. **Try different content**: Not all titles available in 4K/HDR

### Playback issues?
1. **Disable some features**: Try turning off "Force UHD" if having buffering
2. **Check console**: Open DevTools (F12) and look for FlixPlus logs
3. **Reset settings**: Turn all settings off, then enable one at a time

## Requirements

### Minimum Requirements
- Google Chrome 88+ or Chromium-based browser
- Netflix account (any plan works, but Premium for 4K)
- Stable internet connection (5+ Mbps)

### Recommended for Best Results
- Netflix Premium plan (for 4K content)
- 25+ Mbps internet connection
- Display that supports 1080p or higher
- Widevine L1 DRM support (for 4K)
- HDR-capable display (for HDR/Dolby Vision)

## Limitations

- **4K playback**: Requires Widevine L1 hardware DRM (not available on all systems)
- **Content availability**: Quality depends on what Netflix offers for each title
- **Network speed**: Higher quality requires faster internet
- **Browser limitations**: Some features may not work on all Chromium browsers

## Important Notes

⚠️ **Terms of Service**: Using this extension may violate Netflix's Terms of Service. Use at your own risk.

⚠️ **Personal Use Only**: This extension is for personal use only. Do not redistribute or commercialize.

⚠️ **No Guarantees**: Video quality depends on many factors including your plan, internet speed, and device capabilities.

✅ **Privacy**: This extension does not collect, transmit, or store any personal data. All settings are stored locally in Chrome.

✅ **Open Source**: All code is available for review. No obfuscation or hidden functionality (except the modified Netflix playercore which is pre-obfuscated by Netflix).

## Credits

Based on userscripts:
- Netflix Plus by TGSAN
- Netflix UHD by TGSAN

Modified and packaged as a Chrome extension with:
- Modern UI
- Enhanced security (netflix.com restriction)
- Local file loading (no external dependencies)
- Real-time quality monitoring

## License

For educational and personal use only. Not affiliated with or endorsed by Netflix.

## Changelog

### v1.0.0 (Initial Release)
- Combined Netflix Plus and Netflix UHD functionality
- Modern popup UI with toggle switches
- Real-time status overlay
- Restricted to netflix.com only
- Local playercore loading (no external requests)
- Chrome storage for settings
- Debug tools integration
