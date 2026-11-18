# DHAKA CITY GANGSTAR — ANDROID STARTUP CRASH DIAGNOSIS REPORT

## Executive Summary
When the initial APK was installed and launched on an Android 12+ device, the application immediately crashed / closed on startup. A systematic code and lifecycle audit revealed two fatal exceptions and two web-runtime failure vectors.

---

## 1. Root Cause 1: Theme Mismatch Fatal Exception in AppCompatActivity
- **Location**: `D:\Dhaka City\android\app\src\main\res\values\styles.xml` (Line 19) & `MainActivity.kt`
- **Issue**:
  ```xml
  <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
      <item name="android:background">@drawable/splash</item>
  </style>
  ```
  `MainActivity` extends Capacitor's `BridgeActivity`, which directly inherits from AndroidX `AppCompatActivity`.
  In Android, `AppCompatActivity` checks upon `super.onCreate()`:
  ```java
  if (!a.hasValue(R.styleable.AppCompatTheme_windowActionBar)) {
      throw new IllegalStateException("You need to use a Theme.AppCompat theme (or descendant) with this activity.");
  }
  ```
  `Theme.SplashScreen` from `androidx.core:core-splashscreen` does **NOT** inherit from `Theme.AppCompat`. Because `installSplashScreen()` was not called prior to `super.onCreate()`, and `postSplashScreenTheme` was absent, `AppCompatActivity` threw a fatal `IllegalStateException` on the main UI thread during activity creation, causing Android OS to terminate the app immediately upon launch.
- **Fix**:
  1. Set `AppTheme.NoActionBarLaunch` parent to `AppTheme.NoActionBar` with `@drawable/splash` background, ensuring 100% AppCompat theme tree inheritance.
  2. In `MainActivity.kt`, explicitly call `setTheme(R.style.AppTheme_NoActionBar)` before `super.onCreate(savedInstanceState)` to safely transition from splash to transparent game container without flash.

---

## 2. Root Cause 2: Unsafe System Bar Inset Controller Call (NullPointerException)
- **Location**: `D:\Dhaka City\android\app\src\main\java\com\dhakacitygangstar\game\MainActivity.kt` (Lines 44-50)
- **Issue**:
  ```kotlin
  val controller = WindowCompat.getInsetsController(window, window.decorView)
  controller.let { // Platform type WindowInsetsControllerCompat!
      it.hide(WindowInsetsCompat.Type.systemBars())
      it.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
  }
  ```
  On various Android 12-15 OEM devices (Samsung OneUI, Xiaomi MIUI, Oppo ColorOS), when `onCreate` or `onResume` executes before the window decor view has an active window token, `WindowCompat.getInsetsController()` can return `null`. Because `controller.let` was called without a null-safe operator (`?.let`), accessing `it.hide(...)` throws an unhandled `NullPointerException`.
- **Fix**:
  Convert to null-safe `controller?.let` wrapped in a defensive `try { ... } catch (e: Exception)` block.

---

## 3. Root Cause 3: Vite Absolute Asset Path Routing in Capacitor WebView
- **Location**: `D:\Dhaka City\vite.config.js`
- **Issue**:
  `vite.config.js` lacked `base: './'`. Vite therefore emitted root-relative script URLs (`/assets/index-*.js`) in `index.html`. On certain Android WebViews or custom scheme loaders, root URLs resolve to the root domain instead of the local packaged `assets/` subpath.
- **Fix**:
  Add `base: './'` to `vite.config.js` ensuring all bundled JavaScript, CSS, WASM, and GLB models use relative path references (`./assets/...`).

---

## 4. Root Cause 4: Lack of Global JavaScript Error Boundary & Fallback Loading Screen
- **Location**: `D:\Dhaka City\src\main.js` & `index.html`
- **Issue**:
  If WebGL 2, WebAudio, or Rapier WASM throws an uncaught error during asynchronous initialization on low-end mobile devices, the WebView displays an unresponsive black screen that looks like a frozen/crashed app.
- **Fix**:
  Implement a visual Game Loading Screen with progress bar and a global `window.onerror` / `window.onunhandledrejection` banner that shows friendly recovery steps rather than a silent failure.

