---
title: October 2026 Strict Compiles Itself
author: Benjamin Nitschke
---

Last year's [July 2025 post](/blog/2025/07/20/new-strict-parsing-and-runtime-design) ended with the plan to get the runtime working, "switch all the code to Strict itself and let it rip". This month that happened: **Strict compiles itself**. The compiler is no longer C#. It is a set of `.strict` packages that build into one native executable, `strict`, which then builds its own sources again, byte for byte identical.

<!--truncate-->

![Strict layers](/img/StrictLayers.svg)

## What is finished

* **No more .NET.** Master is Strict only. The C# implementation that bootstrapped everything moved to the [`dotnet` branch](https://github.com/strict-lang/Strict/tree/dotnet). A fresh checkout starts from `Compiler/Bootstrap.mlir`, the compiler as MLIR, and needs nothing but the LLVM tools.
* **Everything is written in Strict:** the tokenizer, parser and type inference (`Expressions`), the rules (`Validators`), bytecode generation and linking (`Bytecode`), the Strict VM (`Runtime`) and the MLIR code generation (`Compiler`). See [Architecture](/docs/Architecture) for what each type does.
* **One command line tool:** `strict file.strict` runs a file like `python file.py`, plus `strict build | test | check | version`. Put the Strict folder on your `PATH` and it works in any folder, see [Getting Started](/docs/GettingStarted).
* **Native executables for Windows and Linux** through MLIR, `mlir-opt`, `mlir-translate` and `clang`, with a mark-sweep garbage collector. 1 million loop iterations take 45 ms natively, 245 ms on the Strict VM and 420 ms with the old C# `Strict.exe`. `strict` builds itself in about 10 seconds.
* **All 41 example programs** run on the natively compiled Strict VM like they did with C#, and 296 files pass all their inline tests natively.
* **Stricter rules:** parameters can't be `mutable` anymore (return the changed value instead), keywords can't be names, and `is Error` works for any value in native code.
* **VS Code is the main editor now.** The extension runs everything through `strict`, no language server process needed: SCrunch tests every file when a folder opens and on every save, shows green and red test dots, validator diagnostics and quick fixes, and runs programs with Ctrl+Shift+R.
* **This website** has a new language guide, a [cheat sheet](/docs/EverythingNeededForKata) and a page for every [base type](/docs/BaseTypes).

## What is next

The [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) is in priority order: generic types like `Dictionary` in native code, operators between lists, the same test results on the Strict VM as natively, better test output for VS Code, and removing the older line-based packages. After that comes a language server written in Strict, for autocomplete and go to definition in VS Code.
