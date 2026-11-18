# DHAKA CITY GANGSTAR — BUILD, REPAIR & BRANDING REPORT

## Project Summary
- **Game Title**: Dhaka City Gangstar (ঢাকা সিটি গ্যাংস্টার)
- **Application ID**: `com.dhakacitygangstar.game`
- **Version**: 1.0.0 (versionCode 1)
- **Platform Architecture**: Three.js WebGL 2 + Rapier 3D Physics (WASM) + Vite + Capacitor 7 + Kotlin Native Android Wrapper
- **Android Target**: Min SDK 31 (Android 12), Target SDK 36, Compile SDK 36 (Android 12, 12L, 13, 14, 15, 16)
- **Output Artifact**: `D:\Dhaka City\Dhaka-City-Gangstar-FIXED.apk` (31,547,471 bytes / ~30.1 MB)

---

## Part 1 — Root Cause Analysis & Crash Resolution

### Problem
The initial APK installed successfully, but upon opening, the application immediately crashed / closed without displaying the main game.

### Root Causes & Fixes
1. **Fatal Theme Mismatch in AppCompatActivity**:
   - `MainActivity` inherits from Capacitor's `BridgeActivity`, which extends `androidx.appcompat.app.AppCompatActivity`.
   - In `styles.xml`, the launcher theme had `parent="Theme.SplashScreen"`. In Android 12+, `Theme.SplashScreen` does not inherit from `Theme.AppCompat`. Because `installSplashScreen()` was omitted and no AppCompat fallback was set, `AppCompatActivity.onCreate()` threw `java.lang.IllegalStateException: You need to use a Theme.AppCompat theme (or descendant) with this activity.`, killing the application process instantly.
   - **Resolution**:
     - Configured `AppTheme.NoActionBarLaunch` in `styles.xml` to inherit directly from `AppTheme.NoActionBar` (descendant of `Theme.AppCompat.DayNight.NoActionBar`).
     - Added `setTheme(R.style.AppTheme_NoActionBar)` in `MainActivity.kt` before `super.onCreate()` to safely transition from splash screen to transparent window.

2. **Unsafe WindowInsetsController Call (NullPointerException Risk)**:
   - In `MainActivity.kt`, `hideSystemUI()` previously called `WindowCompat.getInsetsController(window, window.decorView).let { ... }` without a null-check. On devices where the decor view has not yet attached to the window manager during early lifecycle callbacks, this returned `null` and threw a `NullPointerException`.
   - **Resolution**: Refactored to null-safe `controller?.let` wrapped in a defensive `try { ... } catch (e: Exception)` block.

3. **Vite Absolute Asset Path Resolution in WebView**:
   - Vite previously emitted root `/assets/` URLs in `index.html`. In Android WebView sandboxes, relative `./assets/` paths are required to ensure local file and scheme loaders find bundled scripts, styles, and WASM binaries.
   - **Resolution**: Added `base: './'` to `vite.config.js`.

4. **Global JavaScript Error Boundary & Visual Loading Feedback**:
   - Added an integrated `#startup-loader` overlay in `index.html` displaying real-time engine startup progress (3D engine, shaders, Rapier physics, world meshes) with fallback error diagnostics if WebGL encounters issues on low-end mobile chipsets.

---

## Part 2 — Custom Application Icon & Android Launcher Branding

### Master Artwork & Specifications
- **Master Image**: `D:\Dhaka City\branding\dhaka-city-gangstar-icon-master.png` (1024x1024, 32-bit ARGB PNG)
- **Vector Source**: `D:\Dhaka City\branding\dhaka-city-gangstar-icon.svg` (SVG 1.1)
- **Visual Design**:
  - High-octane cinematic 3D visual featuring an exotic sports car speeding along Dhaka's elevated expressway and Hatirjheel cable-stayed bridge.
  - Night urban skyline with illuminated high-rises and golden streetlights.
  - Bangladesh-inspired emerald green road curbs and crimson red LED light trails.
  - Composition strictly centered inside the Android 66% adaptive icon safe zone, preventing any awkward cropping in round, squircle, pebble, or teardrop launcher masks.
  - Clean branding without text clutter for instant recognition at small icon sizes.

### Generated Android Icon Resources
All mipmap densities were programmatically generated with high-quality bicubic resampling:
- **`mipmap-mdpi`** (48x48 launcher & round, 108x108 adaptive foreground & monochrome)
- **`mipmap-hdpi`** (72x72 launcher & round, 162x162 adaptive foreground & monochrome)
- **`mipmap-xhdpi`** (96x96 launcher & round, 216x216 adaptive foreground & monochrome)
- **`mipmap-xxhdpi`** (144x144 launcher & round, 324x324 adaptive foreground & monochrome)
- **`mipmap-xxxhdpi`** (192x192 launcher & round, 432x432 adaptive foreground & monochrome)
- **Adaptive XML Definitions**:
  - `res/mipmap-anydpi-v26/ic_launcher.xml` (Foreground + Background `#090D16` + Monochrome)
  - `res/mipmap-anydpi-v26/ic_launcher_round.xml`
- **Branded Splash Screens**:
  - High-resolution 1280x720 cinematic branding written to `drawable/splash.png` and all `drawable-land-*` folders.

---

## Part 3 — Verification via Android SDK Tools (`aapt`)
Inspection of `Dhaka-City-Gangstar-FIXED.apk`:
- Package: `com.dhakacitygangstar.game`
- Min SDK: `31`
- Target SDK: `36`
- Compile SDK: `36`
- Application Label: `Dhaka City Gangstar`
- Application Icon: `res/mipmap-anydpi-v26/ic_launcher.xml`
- Launchable Activity: `com.dhakacitygangstar.game.MainActivity`
- Orientation: `sensorLandscape`

---

## Part 4 — Deliverables & Download Instructions
1. **Fixed APK Package**:
   - `D:\Dhaka City\Dhaka-City-Gangstar-FIXED.apk` (and `Dhaka-City-Gangstar.apk`)
2. **Branding Assets**:
   - `D:\Dhaka City\branding\dhaka-city-gangstar-icon-master.png`
   - `D:\Dhaka City\branding\dhaka-city-gangstar-icon.svg`
3. **Diagnostic Report**:
   - `D:\Dhaka City\ANDROID_STARTUP_CRASH_REPORT.md`
4. **Direct Mobile Browser Download**:
   - Web server running on `http://10.10.16.30:8080/download` (open from your phone connected to the same Wi-Fi).

