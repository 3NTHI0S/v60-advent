# V60 Coffee Advent Calendar PWA (2026)

An installable, offline-capable Advent calendar with your 25 coffees, animated green V60 doors and saved progress.

## Features

- **Normal mode:** visit `https://YOUR-SITE/index.html` (or the root of your published site). Door `N` opens from local midnight on **N December 2026**, and earlier days remain available. Opened doors remain revealed after closing or refreshing the app.
- **Test mode:** visit `https://YOUR-SITE/index.html?test=1`. All 25 doors are unlocked; you can reshuffle the test assignments or close the test doors again. **No numbered test door ever has the same coffee as that numbered door in the real calendar.** Existing unsafe test assignments are replaced automatically. Test progress and coffee order are stored under a **different browser-storage key**, so they do not change your normal calendar.
- **Door animation:** on the first opening, the door swings to the left and a white tile with the green day number is revealed. The coffee name appears in a popup, not on the tile. Tapping an already opened door reopens the popup without replaying the animation.
- **Offline:** after an initial online visit to the hosted site, the service worker caches the entire app for offline use.
- **Backups:** export/import production or test progress (backups are mode-specific). Existing production progress from the previous standalone version is kept when it was saved under the same origin.

## Publish for free with GitHub Pages

1. Create a public GitHub repository (for example, `v60-advent`).
2. Upload **everything in this folder**, preserving the layout (including `icons/`), to the repository root and commit it. Upload the files themselves, not just the ZIP.
3. In **Settings → Pages**, choose **Deploy from a branch**. Select `main` and `/ (root)`, and save.
4. When GitHub Pages reports the site is published, open `https://YOUR-USERNAME.github.io/v60-advent/` in Chrome on Android. (For a repository using a different name, change `v60-advent` in the URL.)
5. Choose **Install app** or **Add to Home screen** from Chrome's menu (or use the **Install app** button when it appears). Launch the calendar from the icon on your home screen.
6. To test, open `https://YOUR-USERNAME.github.io/v60-advent/?test=1` in your browser. Remove `?test=1` to return to the locked calendar.

**Important:** the app needs an **HTTPS host** (or `localhost`) for service-worker/offline functionality and reliable installability. Opening `index.html` directly from your phone's Files app is not a PWA installation.

## Data / date behaviour

- Data is saved locally using `localStorage`. It doesn't automatically sync between devices or different site addresses; export/import a backup if needed.
- The date lock relies on your device clock. **Test mode is not access control:** anybody who knows the test URL can open doors, and coffee assignments are embedded client-side.
- The real calendar starts with its previous coffee order, but has a **Shuffle coffees** button until door 1 is opened. Opening door 1 fixes the order permanently within this calendar; normal shuffling is then disabled. Test mode can always reshuffle independently.
- Test mode never puts the real coffee for a particular day behind that same test door. It still uses the same 25 coffees, so test mode can reveal which coffees are in the collection. Test mode is not a security boundary: technically minded users can inspect the web app source or browser storage to see the real assignments.
- If you edit the app and redeploy it later, update the cache name in `sw.js` so existing installs update their cached files.
- If the app is opened without visiting online first after installation, it may not yet have all offline files cached.

## Files

- `index.html`: calendar markup
- `styles.css`: V60 artwork, layout and door animations
- `app.js`: coffee assignments, date checks, test mode, persistence, backup and install prompt
- `manifest.webmanifest`: PWA name, launch URL, colours and icons
- `sw.js`: offline asset cache
- `icons/`: home-screen icons
