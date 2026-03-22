# Koalala Chauffeur Mobile

Cross-platform wrapper app for the Koalala Chauffeur web project, based on Capacitor.

## Project structure

- `web/`: bundled web files used by the mobile app
- `android/`: Android native project
- `ios/`: iOS native project
- `scripts/sync-web.cjs`: syncs latest web files from `../order-frontend/dist`

## Prerequisites

- Node.js 20+
- Android Studio (Android build/signing)
- Xcode on macOS (iOS build/signing)

## Common commands

```bash
npm install
npm run sync:cap
```

Windows one-click alternatives:

- `sync_cap.cmd`
- `open_android.cmd`

## Android build flow

1. Sync web files and Capacitor:

```bash
npm run sync:cap
```

2. Open Android Studio:

```bash
npm run open:android
```

3. Build in Android Studio:
- test package: debug APK
- production package: signed AAB/APK

## iOS build flow

iOS build requires macOS + Xcode.

1. Sync:

```bash
npm run sync:cap
```

2. Open Xcode:

```bash
npm run open:ios
```

3. Configure signing, archive, and publish via Organizer.

## Daily update workflow

Whenever `../order-frontend/dist` changes:

```bash
npm run sync:cap
```

Then rebuild in Android Studio or Xcode.

## Cloud iOS build (Codemagic)

Use `codemagic.yaml` at the project root.

- Workflow: `ios_testflight`
- Output: IPA artifact + TestFlight upload
- Required env group in Codemagic: `app_store_credentials`

Detailed checklist: `TESTFLIGHT_SETUP_CN.md`
