---
id: GettingStarted
title: Getting Started
---

Strict is written in Strict. `NativeCompiler` is the one command-line tool you need: it builds, tests, validates and runs `.strict` code, and it also builds itself. No .NET or other runtime is needed.

# 1. Get the code

```sh
git clone https://github.com/strict-lang/Strict
cd Strict
```

The repository is the compiler and the standard library at the same time. Any folder that contains `.strict` files is a package. The base types in the root folder (`Number`, `Text`, `List`, ...) are available everywhere, see [Base Types](BaseTypes.md).

# 2. Install the toolchain

`NativeCompiler` emits [MLIR](https://mlir.llvm.org/) and uses LLVM 22 to turn it into native executables. It needs these tools:

* `mlir-opt` and `mlir-translate` (LLVM MLIR). On Windows, use the MSYS2 ucrt64 package `mingw-w64-ucrt-x86_64-mlir`.
* `clang` (LLVM 22).
* Optional: WSL with `gcc`. On Windows this also produces a static Linux executable.

You don't have to install anything by hand. When a tool is missing, `NativeCompiler build` says so and starts the installation:

* On Windows it opens a new window with `winget install MSYS2.MSYS2`, `pacman -S mingw-w64-ucrt-x86_64-mlir` and `winget install LLVM.LLVM`.
* On Linux it downloads the LLVM 22.1.0 release archive into `Tools/`.

Tools are found on the `PATH`, in `C:/msys64/ucrt64/bin`, in `C:/Program Files/LLVM/bin`, or in `Tools/LLVM-22.1.0-Linux-X64/bin`.

# 3. Bootstrap the compiler

A fresh checkout contains a seed: [`Compiler/Bootstrap.mlir`](https://github.com/strict-lang/Strict/tree/master/Compiler) is the compiler itself, already compiled to MLIR. The bootstrap script combines the seed with the handwritten native runtime and runs the MLIR tools and `clang`. You don't need any Strict binary for this.

```sh
Compiler\Bootstrap.cmd        # Windows, creates Compiler\NativeCompiler.exe
sh Compiler/bootstrap.sh      # Linux, creates Compiler/NativeCompiler
```

From now on the compiler can build itself from its own `.strict` sources:

```sh
Compiler\NativeCompiler.exe build Compiler\NativeCompiler.strict .
```

Running this twice gives byte-identical output. The compiler is a fixpoint of itself.

# 4. Commands

```sh
NativeCompiler build Examples/Sum.strict .        # native executable (on Windows also the Linux one through WSL)
NativeCompiler test Examples/Sum.strict .         # compile every inline method test into an executable and run it
NativeCompiler check Examples .                   # validate a folder (type rules, unused members, limits)
NativeCompiler run Examples/Sum.strict . 5 10 20  # compile with the Strict compiler and run on the Strict VM
```

The second path is the repository root. Base types and packages are resolved from there.

| Command | What it does | Exit code |
|---------|--------------|-----------|
| `build <file> <root>` | Compiles the type and every type it uses into MLIR, then lowers it with `mlir-opt` and `mlir-translate`. `clang` links `<file>.exe` (Windows) or `<file>` (Linux). The entry point is the `Run` method. | 0 |
| `test <file> <root>` | Compiles all inline tests of the type into `<file>.test.exe` and runs it. Prints every failing test with the value it got. | number of failed tests, 128 if the test executable crashed |
| `check <folder> <root>` | Runs the [validators](CodeValidations.md) on every `.strict` file in the folder. | number of validation issues |
| `run <file> <root> [numbers]` | Compiles to bytecode and runs `Run` on the Strict VM, no native code involved. Extra arguments are passed to `Run` as numbers. | 0 |
| `run test <file> <root>` | Runs the inline tests on the Strict VM instead of natively. It skips the MLIR tools, so it is the fastest way to test a single file. | number of failed tests |

Wrong usage returns exit code 2.

[`Examples/Sum.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Sum.strict) is the smallest program that takes arguments:

```
has logger
Run(numbers)
	logger.Log(numbers.Sum)
```

`NativeCompiler run Examples/Sum.strict . 5 10 20` prints `35`.

# 5. Your first type

Create a folder for your package, for example `Kata`, and add `Kata/Parity.strict`:

```
has number
has logger
IsEven Boolean
	Parity(2).IsEven
	Parity(3).IsEven is false
	number % 2 is 0
Describe Text
	Parity(4).Describe is "4 is even"
	Parity(7).Describe is "7 is odd"
	number to Text + (IsEven then " is even" else " is odd")
Run
	logger.Log(Parity(5).Describe)
```

* The file name `Parity` is the type name. `has number` is a `Number` member and `has logger` is a `Logger` member. Because the names say which type they are, you don't write the type.
* `IsEven Boolean` is a method returning a `Boolean`. Its first two lines are tests. A test that is already a `Boolean`, like `Parity(2).IsEven`, doesn't need `is true`.
* `Parity(4)` creates an instance. Arguments fill the members in order. The `logger` member is filled in automatically.
* The last line of a method is its result.

Now try every command:

```sh
NativeCompiler test Kata/Parity.strict .    # All tests passed
NativeCompiler run Kata/Parity.strict .     # 5 is odd
NativeCompiler check Kata .                 # Validation issues: 0
NativeCompiler build Kata/Parity.strict .   # creates Kata/Parity.exe, which prints 5 is odd
```

Change a test so it fails, for example `Parity(7).Describe is "7 is even"`, and run `test` again. It reports the failing line and the value it got.

# 6. Learn the language

* [Types](Types.md), [Members and Variables](Variables.md), [Methods](Methods.md) and [Tests](Tests.md) explain how a `.strict` file is structured.
* [Statements and Expressions](Statements.md), [If](If.md) and [For](For.md) explain everything you can write in a method body.
* [Lists and Dictionaries](Lists.md) and [Errors](Errors.md) cover the most used base types.
* [Coding Style](CodingStyle.md) and [Code Validations](CodeValidations.md) list the rules the compiler enforces.
* The best way to learn how any expression or base type works is to read the base types. Every method starts with tests that show how to use it. [Base Types](BaseTypes.md) and [Examples](Examples.md) link every file.

# Editors

## Visual Studio Code

The [Strict extension for VS Code](https://github.com/strict-lang/strict-vscode-client) is the main way to work on Strict code. It runs everything through `NativeCompiler`, so it needs no .NET and no language server process:

* **Syntax highlighting** for `.strict` files.
* **SCrunch** tests every `.strict` file when the folder opens (`NativeCompiler run test`). Saving a file tests it again, then every file that uses its type.
* **Test dots** in the gutter: green and red marks on tests and covered lines, and `expected … got …` after a failing test.
* **Testing view** with every type and its tested methods. `Run` methods can be started from there and show their output.
* **Validator diagnostics** from `NativeCompiler check`, with quick fixes (Alt+Enter) for formatting issues.
* **Strict: Run File** (Ctrl+Shift+R) runs the `Run` method of the current file in a terminal.

To install it, clone [strict-vscode-client](https://github.com/strict-lang/strict-vscode-client) next to the Strict repository, run `npm install` and `npm run package`, then use *Extensions: Install from VSIX…* in VS Code. The extension always uses the newest `Compiler/NativeCompiler.exe` it finds, so rebuilding the compiler is enough to update it.

Autocomplete, hover and go to definition will come with a language server written in Strict.

## Other editors

`.strict` files are plain UTF-8 text, so any editor works. Configure it to indent with tabs, as the repository's [`.editorconfig`](https://github.com/strict-lang/Strict/blob/master/.editorconfig) does. [Grammar](Grammar.md#syntax-highlighting-files) has syntax highlighting files for TextMate, Sublime Text, Notepad++ and Iro. The old C# Language Server lives on the [`dotnet` branch](https://github.com/strict-lang/Strict/tree/dotnet), together with the original C# implementation.

# Status

Strict compiles itself, but not every feature of the base library works natively yet. Each remaining gap has a failing inline test. The [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) names them in priority order, for example `Dictionary` methods and operators between lists.
