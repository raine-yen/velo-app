# Velo Debug And Quality Gate

This app uses Windows for static checks, web checks, and Android emulator checks. Apple HealthKit must be validated on a physical iPhone through an EAS development build.

## Static Checks

Run these from the app directory:

```powershell
npm run quality
```

This runs:

- `npm run doctor`
- `npm run lint:health`
- `npm run typecheck`

## Web On Windows

```powershell
npm run dev:web
```

Expected result: the app boots in the browser and native-only health features show a graceful unavailable state.

## Android On Windows

First check local tooling:

```powershell
npm run check:android-tools
```

When `adb`, `emulator`, and `java` are available on `PATH`, run:

```powershell
npm run dev:android
```

Expected result: Velo opens in the Android emulator. Apple Health remains unavailable on Android by design.

## iOS HealthKit On iPhone

Do not run EAS packaging from OneDrive. The active source copy is:

```text
C:\Users\UX5406AA_SKU1\Documents\Velo-build\velo-app
```

Run static checks there, commit the fixed source, and push it before starting an iOS build:

```powershell
npm run quality
git status --short
```

Preferred build path: trigger the `development` iOS build from Expo/EAS after GitHub has the current commit. This avoids Windows local temp cleanup failures during EAS packaging.

Fallback local CLI build from the active source copy:

```powershell
npm run build:ios:dev
```

When asked about provisioning, reuse the existing profile unless installing on a different physical iPhone.

Install the development build on the iPhone, then start Metro from the same app copy:

```powershell
npm run dev:ios-client
```

Open Velo in the development build, grant Apple Health permissions, and verify workouts plus daily health snapshot data import. If data is unavailable, the app should show a specific diagnostic message instead of a generic iOS-only message.

## Platform Limits

- iOS Simulator is out of scope on Windows because it requires macOS and Xcode.
- Web and Android validate app stability and fallbacks, not HealthKit itself.
- The physical iPhone development build is the HealthKit source of truth.
