# Tab Manager Extension

A modern browser extension to save, view, and manage your open tabs with a beautiful interface.

## Features
- Save all open tabs with one click
- View and copy saved URLs in a dedicated manager page
- Open multiple tabs from a list of URLs
- Clear saved tabs with confirmation
- Badge shows current open tab count
- Modern, minimal, dark-themed UI
- No tracking, no remote code, secure by design

## Browser Compatibility
- **Google Chrome** (and Chromium-based: Edge, Brave, Opera): Fully supported
- **Mozilla Firefox:** Supported with a small manifest change (see below)

## Installation (Development Mode)

### Chrome, Edge, Brave, Opera
1. Open `chrome://extensions` (or equivalent in your browser)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the extension folder (with `manifest.json`)

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the extension folder, but first:
    - Rename `manifest-firefox.json` to `manifest.json` (overwrite or backup the original)
4. Select any file in the folder to load the extension

## Publishing
- **Chrome Web Store / Edge Add-ons / Opera Add-ons:** Use the default `manifest.json` (Manifest V3, service_worker)
- **Firefox Add-ons (AMO):** Use `manifest-firefox.json` (rename to `manifest.json` before uploading)

## Project Structure
- `manifest.json` — Chrome/Chromium manifest (service worker)
- `manifest-firefox.json` — Firefox manifest (background script)
- `background.js` — Handles tab saving, badge, and messaging
- `popup.html` / `popup.js` — Popup UI for saving/opening tabs
- `tabmanager.html` / `tabmanager.js` — Full-page tab manager
- `logo.png` — Extension icon

## Security & Privacy
- No remote code, no analytics, no tracking
- Only stores tab URLs/titles locally (chrome.storage.local)
- No content scripts or host permissions
- Strong Content Security Policy

## License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0). See the LICENSE file for details. 