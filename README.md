# SafeWatch Family website

A separate, responsive website to introduce SafeWatch Family and explain installation on iPhone and Android. It matches the app’s Nature Glass design: a people-free garden background, mint glass surfaces, emerald accents, soft shadows, and the existing SafeWatch watch icon.

## Run locally

Requires Node.js 20 or newer. There are no packages to install.

On Windows, double-click **`start-preview.cmd`**, keep its window open, and visit the printed local URL. Alternatively, run:

```sh
npm run dev
```

Open **http://127.0.0.1:5185/**. To choose another port in PowerShell:

```powershell
$env:PORT = '5186'
npm run dev
```

You can also open `index.html` directly to read the page. Use the local server for JavaScript modules and the full interactive experience.

## What is included

- Responsive desktop, tablet, and phone layouts.
- Interactive phone preview with Home, Location, Health, Alerts, and Profile views.
- Two sample senior profiles with separate sample alert states.
- Demo SOS preview and reset; no real message or incident is sent.
- Health, location, safety, account-linking, and watch-access explanations.
- iPhone/Android installation tabs, a working app QR code, a QR download, and a copy-link control.
- Mobile navigation, keyboard tab navigation, expandable FAQs, focus states, and reduced-motion support.
- A tiny Node preview server and static deployment build.

### Interactive edition

The redesigned page adds a guided tour using the same functioning phone preview, morning/evening website appearances, gentle pointer tilt, and an active section/reading-progress indicator.

The feature exhibit lets visitors simulate a watch update, compare recent/older/unavailable readings, move a sample watch across a safe-zone boundary, zoom the illustrative map, switch between current and last-known location examples, and follow a sample SOS through review and response. These are local demonstrations; they do not connect to a watch or create real incidents.

Both installation guides now have clickable steps and a matching phone illustration. Completing that walkthrough does not install anything: visitors still open the real family app and use their phone’s browser. The FAQ has a searchable, keyboard-accessible filter.

The preview uses **sample data only**. It has no backend connection, patient data, analytics, login form, or alert-sending capability. The existing family and admin applications are separate from this folder.

## Application link and installation

All app-opening links and the QR code point to:

https://safe-watch-family-app-family-app.vercel.app/

The family app is a web app. The showcase intentionally does not attempt to install itself or trigger another origin’s install prompt. Visitors open the real family app in Safari or Chrome, then add that app to their phone.

The installation copy follows the official guides, checked October 30, 2026. Browser menu wording varies by version:

- Apple: https://support.apple.com/guide/iphone/iphea86e5236/ios
- Google: https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en

No App Store, Google Play, APK, offline monitoring, or background push-notification availability is claimed.

## Validate and build

```sh
npm run check
npm run build
```

Upload the contents of **`dist/`** to any static website host. For a Vercel project, select this folder as the root, choose **Other** as the framework, use `npm run build`, and set the output directory to `dist`. This folder has not been published automatically.

The check script verifies source syntax, local asset paths, unique IDs, internal navigation, preview/guide targets, pulse-rate wording, and reduced-motion support. It does not replace checking the finished page in a browser.

The static build and local HTTP loading checks passed. Visual inspection at desktop/mobile sizes and browser interaction checks were unavailable because local browser controls were disabled in Work settings.

## Customize

- **`index.html`**: content, app URL, feature descriptions, demo markup, and install guides.
- **`styles.css`**: colors, responsive layouts, glass effects, and motion preferences.
- **`app.js`**: local-only interactions and synthetic preview values.
- **`experience.css`**: the interactive edition’s visual layers, evening appearance, responsive exhibit, and guided tour.
- **`experience.js`**: guided tour, map controls, sample reading/alert demonstrations, install illustrations, appearance, and FAQ search.
- **`experience-model.js`**: sample fixtures and pure state/geometry helpers, with no browser or backend dependencies.
- **`assets/garden.webp`**: existing people-free app garden artwork.
- **`assets/app-icon.svg`**: existing SafeWatch watch logo.
- **`assets/map-preview.svg`**: original schematic demo map; not a real tracking map.
- **`assets/install-qr.svg`**: QR encoding the real family app URL, with a four-module quiet zone.
- **`assets/family-home.png`**: reference screenshot from the updated family app. The interactive website preview is recreated in HTML/CSS rather than presenting a static screenshot as an interactive app.

If the production app URL changes, update its occurrences in `index.html` and regenerate the QR code to match. The JavaScript copy control reads the first app link, so it follows the HTML URL automatically.

Outfit is loaded from Google Fonts, with a system-font fallback. All core page assets are stored locally. No production JavaScript dependencies are needed.
