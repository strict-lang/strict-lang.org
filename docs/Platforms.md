---
id: Platforms
title: Platforms
---

The same `.strict` code builds for Windows, Linux, macOS, iOS, Android and the web. `strict build <file> <platform>` runs the tests first and only builds when they pass, see [Getting Started](GettingStarted.md#5-commands) for all commands and the `small` option.

| Platform | Command | Output | Status |
|----------|---------|--------|--------|
| [Windows](#windows) | `strict build Game.strict windows` | `Game.exe` | Available |
| [Linux](#linux) | `strict build Game.strict linux` | `Game` | Available |
| [macOS](#macos) | `strict build Game.strict` on a Mac | `Game.app` | Available |
| [Android](#android) | `strict build Game.strict android` | `Game.android.so`, `.apk` / `.aab` coming | In progress |
| [iOS](#ios) | `strict build Game.strict ios` | `Game.ios.a` static archive | In progress |
| [Web](#web) | `strict build Game.strict web` | WebAssembly, WebGL 2 page | Available |

Games use the graphics, sound and input of [DeltaEngine](https://github.com/strict-lang/DeltaEngine), which is being extended for each platform. Keep the Strict and DeltaEngine clones side by side.

# Building from VS Code

**Strict: Build for Platform...** (the package icon above a `.strict` file, or the context menu) lists Web, Android and the platforms your machine can build (Windows and Windows + Linux on Windows, Linux or macOS elsewhere) and runs the same command with one click. iOS is not in the list yet, use the command line.

| Setting | Meaning |
|---------|---------|
| `strict.root` | Folder with `strict.exe` and the base types. Empty = automatic. |
| `strict.androidNdkPath` | Android NDK folder, passed to the compiler as `ANDROID_NDK_ROOT`. |
| `strict.androidSdkPath` | Android SDK folder, passed as `ANDROID_HOME`. |

Empty settings fall back to your environment variables. Restart VS Code after changing environment variables or `PATH`. See [The VS Code Experience](VSCode.md#run-build-and-reuse-your-code) for more.

# Windows

```sh
strict build Game.strict windows
```

Builds `Game.exe` with LLVM and clang, which `strict build` installs when they are missing, nothing to set up. Without a platform argument, `strict build` on Windows also builds the Linux executable through WSL. Windowed programs go into a `Release` folder together with their content and GPU `.ptx` files.

# Linux

```sh
strict build Game.strict linux
```

On Linux `strict build Game.strict` builds the `Game` executable directly, LLVM is downloaded into `Tools/` when missing. On Windows the `linux` option builds a static Linux executable through WSL: install WSL (`wsl --install`) and `gcc` inside the distribution (`sudo apt install gcc`).

# macOS

```sh
strict build Game.strict
```

Run on a Mac with Apple Silicon or Intel, there is no cross-compiling from other systems. The LLVM toolchain is installed into `Tools/` via micromamba. Install the Xcode Command Line Tools (`xcode-select --install`) for programs using native packages. Windowed programs become an app bundle in `Release/MacOS/Game.app`, signed with your Developer ID when one is installed (check with `security find-identity -v -p codesigning`), otherwise ad hoc. GPU loops are emitted as Metal shaders instead of PTX.

# Android

```sh
strict build Game.strict android
```

Builds `Game.android.so` for 64-bit ARM devices (Android 8.0, API 26 and newer) with OpenGL ES 3 and OpenSL ES audio. Works from Windows, Linux and macOS.

Setup:

1. Install Android Studio, or only the command line tools, and through the SDK Manager an NDK (**Side by side**).
2. Tell the compiler where it is, one of:
   * environment variable `ANDROID_NDK_ROOT` pointing at the NDK folder (e.g. `.../Sdk/ndk/27.0.12077973`)
   * environment variable `ANDROID_HOME` or `ANDROID_SDK_ROOT` pointing at an SDK with an installed `ndk/<version>`
   * in VS Code the settings `strict.androidNdkPath` / `strict.androidSdkPath`
   * on Windows the default `%LOCALAPPDATA%/Android/Sdk` is found automatically

The build stops with `Android NDK not found: set ANDROID_NDK_ROOT or ANDROID_HOME ...` when none is found.

Still being implemented: **Build Android Package** creating an `.apk` or `.aab`, and `strict run Game.strict android` installing via `adb install -r` on a connected device and starting it.

# iOS

```sh
strict build Game.strict ios
```

Builds the arm64 static archive `Release/iOS/Game.ios.a` (iOS 15.0 and newer, device only, no Simulator yet) plus `Release/iOS/Content`. The archive exports `int strict_main(int argc, char **argv)`; UIKit keeps the app's `main` and lifecycle. It is an input to an Xcode app target, not a signed app or IPA.

Setup:

* Plain Strict programs build on any system with LLVM, but SDK symbols are not resolved there.
* Programs with native packages (and DeltaEngine games) need a Mac with full Xcode, not only Command Line Tools. Check that `xcrun --sdk iphoneos --show-sdk-path` prints a path.
* Packages provide `native/IOS.flags` with include paths, definitions and extra C/Objective-C sources.
* To run it: add `Game.ios.a` and `Content` to an Xcode iOS app, call `strict_main` from the app, select your Apple developer team for signing and run on a device.

Still in progress: UIKit window, touch, rendering and audio bridge in DeltaEngine, app signing and TestFlight. Details in `Strict/Compiler/IOS.md`.

# Web

```sh
strict build Game.strict web
```

Compiles to WebAssembly with Emscripten, which is installed into `Tools/emsdk` when missing, nothing to set up. The result is an HTML page with WebGL 2 rendering and the content of `Release/Content` preloaded. Serve it over HTTP (e.g. `python -m http.server` in `Release`), `file://` does not load WebAssembly. All games on the [homepage](/#games) are built this way and run directly in the browser.
