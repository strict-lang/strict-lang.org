---
id: Platforms
title: Platforms
---

The same `.strict` code builds for Windows, Linux, macOS, Android and the web. `strict build <file> <platform>` runs the tests first and only builds when they pass, see [Getting Started](GettingStarted.md#5-commands) for all commands and the `small` option.

| Platform | Command | Output | Status |
|----------|---------|--------|--------|
| [Windows](#windows) | `strict build Game.strict windows` | `Game.exe` | Available |
| [Linux](#linux) | `strict build Game.strict linux` | `Game` | Available |
| [macOS](#macos) | `strict build Game.strict` on a Mac | `Game.app` | Available |
| [Android](#android) | `strict build Game.strict android` | `Game.android.so`, `.apk` / `.aab` coming | In progress |
| [iOS](#ios) | | | Planned |
| [Web](#web) | `strict build Game.strict web` | WebAssembly, WebGL 2 page | Available |

In VS Code, **Strict: Build for Platform...** (the package icon above a `.strict` file) offers the platforms available on your machine and runs the same commands with one click, see [The VS Code Experience](VSCode.md#run-build-and-reuse-your-code).

# Windows

```sh
strict build Game.strict windows
```

Builds `Game.exe` with LLVM and clang, which `strict build` installs when they are missing. Without a platform argument, `strict build` on Windows also builds the Linux executable through WSL. Windowed programs go into a `Release` folder together with their content and GPU `.ptx` files.

# Linux

```sh
strict build Game.strict linux
```

On Linux `strict build Game.strict` builds the `Game` executable directly, LLVM is downloaded into `Tools/` when missing. On Windows the `linux` option builds a static Linux executable through WSL with `gcc` installed.

# macOS

```sh
strict build Game.strict
```

Run on a Mac with Apple Silicon or Intel. The LLVM toolchain is installed into `Tools/` via micromamba. Windowed programs become an app bundle in `Release/MacOS/Game.app`, signed with your Developer ID when one is installed, otherwise ad hoc. GPU loops are emitted as Metal shaders instead of PTX.

# Android

```sh
strict build Game.strict android
```

Builds `Game.android.so` for 64-bit ARM devices (Android 8.0, API 26 and newer) with OpenGL ES 3 and OpenSL ES audio. Install the Android NDK and set `ANDROID_NDK_ROOT`, or `ANDROID_HOME` / `ANDROID_SDK_ROOT` with an installed `ndk/<version>`; on Windows the default `%LOCALAPPDATA%/Android/Sdk` is found as well.

Currently being implemented in the compiler and [strict-vscode-client](https://github.com/strict-lang/strict-vscode-client):

* **Android** in the Build for Platform list, with `strict.androidNdkPath` and `strict.androidSdkPath` VS Code settings.
* **Build Android Package**, creating an `.apk` or `.aab`.
* `strict run Game.strict android`, installing the package on a connected device via `adb install -r` and starting it.

# iOS

iOS builds are planned after Android. The native runtime is shared with macOS, so the remaining work is packaging, signing and deploying to devices.

# Web

```sh
strict build Game.strict web
```

Compiles to WebAssembly with Emscripten, which is installed into `Tools/emsdk` when missing. The result is an HTML page with WebGL 2 rendering and the content of `Release/Content` preloaded. All games on the [homepage](/#games) are built this way and run directly in the browser.
