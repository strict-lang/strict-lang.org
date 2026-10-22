---
id: GettingStarted
title: Getting Started
---

Strict is written in Strict. `strict` is the one command-line tool you need: it runs, tests, validates and builds `.strict` code, and it also builds itself. No .NET or other runtime is needed. It is `strict.exe` on Windows and `strict` on Linux.

# Start in VS Code

Install the platform-specific Strict extension package (`.vsix`) using **Extensions: Install from VSIX…**, then open your project folder. The package includes the native compiler and base types; an existing Strict checkout can supply the newest compiler during development. See the [extension repository](https://github.com/strict-lang/strict-vscode-client) for packaging instructions.

Create `Temperature.strict` and follow the [one-minute VS Code walkthrough](VSCode.md#start-with-a-small-example). Save to see SCrunch's test marks, open the Testing view, hover over a name for details and press F12 to explore the definition. Line values let you follow the calculation from its tests through the implementation.

For a native build or compiler development, use the toolchain steps below. To embed your logic in an existing application, see [C and C# interop](UsingApis.md#call-strict-from-c-and-c).

# 1. Get the code

```sh
git clone https://github.com/strict-lang/Strict
cd Strict
```

The repository is the compiler and the standard library at the same time. Any folder that contains `.strict` files is a package. The base types in the root folder (`Number`, `Text`, `List`, ...) are available everywhere, see [Base Types](BaseTypes.md).

# 2. Install the toolchain

`strict` emits [MLIR](https://mlir.llvm.org/) and uses LLVM 22 to turn it into native executables. It needs these tools:

* `mlir-opt` and `mlir-translate` (LLVM MLIR). On Windows, use the MSYS2 ucrt64 package `mingw-w64-ucrt-x86_64-mlir`.
* `clang` (LLVM 22).
* Optional: WSL with `gcc`. On Windows this also produces a static Linux executable.

You don't have to install anything by hand. When a tool is missing, `strict build` says so and starts the installation:

* On Windows it opens a new window with `winget install MSYS2.MSYS2`, `pacman -S mingw-w64-ucrt-x86_64-mlir` and `winget install LLVM.LLVM`.
* On Linux it downloads the LLVM 22.1.0 release archive into `Tools/`.

Tools are found on the `PATH`, in `C:/msys64/ucrt64/bin`, in `C:/Program Files/LLVM/bin`, or in `Tools/LLVM-22.1.0-Linux-X64/bin`.

# 3. Bootstrap strict

A fresh checkout contains a seed: [`Compiler/Bootstrap.mlir`](https://github.com/strict-lang/Strict/tree/master/Compiler) is `strict` itself, already compiled to MLIR. The bootstrap script combines the seed with the handwritten native runtime and runs the MLIR tools and `clang`. You don't need any Strict binary for this.

```sh
Compiler\Bootstrap.cmd        # Windows, creates strict.exe in the Strict folder
sh Compiler/bootstrap.sh      # Linux, creates strict in the Strict folder
```

From now on `strict` can build itself from its own `.strict` sources:

```sh
strict build Strict.strict
```

On Windows the compiler links `strict.new.exe`, swaps it into place and keeps the running executable as `strict.old.exe` until the next build.

Running this twice gives byte-identical output. `strict` is a fixpoint of itself.

# 4. Put Strict on your PATH

Add the Strict folder to your `PATH`. This is the recommended setup on every operating system: `strict` then works in any folder, and it always finds the base types and packages that live next to it.

```powershell
# Windows (PowerShell), then open a new terminal
[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\code\Strict", "User")
```

```sh
# Linux, add this line to ~/.bashrc or ~/.profile
export PATH="$PATH:$HOME/Strict"
```

Check that it works:

```sh
strict version    # prints the version and build date
```

`strict version` prints the version number and when this `strict` was built. `strict` alone, `strict help` or `--help` lists the commands.

# 5. Commands

Without a command, `strict` runs the file, like `python file.py`:

```sh
strict Examples/Sum.strict 5 10 20   # run the Run method on the Strict VM, prints 35
strict test Examples/Sum.strict      # run the inline tests of every method on the Strict VM
strict check Examples                # validate a folder (type rules, unused members, limits)
strict build Examples/Sum.strict     # run the tests, then build a native executable
```

| Command | What it does | Exit code |
|---------|--------------|-----------|
| `strict <file> [arguments]` | Compiles the file to bytecode and runs its `Run` method on the Strict VM. This is the fastest way to run code, everything stays in memory and no native code is involved. Arguments are passed to `Run` as numbers. A type without a `Run` method runs all its tests instead. | 0 |
| `strict test <file or folder>` | Runs inline tests on the Strict VM. A folder includes its package subfolders. Prints test locations and timings, or a cached result when nothing changed. | number of failed tests |
| `strict test <file> lines` | Builds and runs tests natively, then reports execution counts, total time and self time per source line. Requires the native toolchain. | number of failed tests, nonzero on build failure |
| `strict test <file> values` | Runs tests on the VM and reports executed-line hit counts and recorded values for editor feedback. | number of failed tests |
| `strict build <file> library` | Builds a shared library and its generated C# binding after tests pass. | 0 on success, nonzero on failure |
| `strict suggest <file> <method>` | Checks candidate implementations against a method's tests. | nonzero on failure |
| `strict format <file>` | Prints the canonical source to standard output; it does not overwrite the file. | 0 on success, nonzero on parsing failure |
| `strict update .` | Refreshes copied packages from their `.origin` sources. Run this inside your project folder. | 0 on success |
| `strict check <folder>` | Runs the [validators](CodeValidations.md) on every `.strict` file in the folder and its package subfolders. | number of validation issues |
| `strict build <file>` | Runs the tests first. If they pass, it compiles the type and every type it uses into MLIR, lowers it with `mlir-opt` and `mlir-translate`, and `clang` links `Name.exe` (Windows) or `Name` (Linux) next to the `.strict` file. On Windows it also builds the Linux executable through WSL. The executable and its `.mlir` are kept, the other tool files are removed. A type without a `Run` method builds its tests into `Name.test.exe` instead, whose exit code is the number of failed tests. | number of failed tests, 1 if the native build failed |
| `strict version` | Prints the version number and when this `strict` was built. | 0 |

Wrong usage or a missing file returns exit code 2.

## Choose speed or a smaller build

Native builds default to **fast**, using `-O2` for the program and its package-local C code. Add `small` to optimize both for size with `-Os`:

```sh
strict build Examples/Sum.strict small
strict build Examples/Sum.strict windows small
```

`strict.exe` and generated `Release` builds are smaller now, with `small` offering a further reduction. The tradeoff is up to **20% slower execution on some demanding paths**; keep the default for workloads where speed matters and measure your application before choosing.

Windowed `Run` programs build into a persistent `Release` folder. Existing content stays between builds; a project's `ContentBuild.strict` prepares `Release/Content`, or content is copied incrementally. GPU builds also produce `.ptx` files beside the executable: ship those files with it to retain GPU execution.

[`Examples/Sum.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Sum.strict) is the smallest program that takes arguments:

```
has logger
Run(numbers)
	logger.Log(numbers.Sum)
```

`strict Examples/Sum.strict 5 10 20` prints `35`.

# 6. How strict finds types

A type is used by its name, there are no imports. `strict` looks for it in this order and uses the first match:

1. **The current folder and all its sub folders.** In your project folder, `Shapes/Square.strict` is just `Square`. Your own packages win over the ones that come with Strict.
2. **The folder of the `strict` executable.** All base types and all packages of the Strict repository (`Math`, `ImageProcessing`, `Examples`, ...) live there. This is why putting the Strict folder on the `PATH` is all the setup a project needs.
3. **Package folders in sibling projects.** Local projects next to yours can supply types and their `native/` implementations in place.
4. **The GitHub repositories linked in your project's README, then [github.com/strict-lang](https://github.com/strict-lang/).** Missing packages are copied from local clones when available, or downloaded with `curl`. Their subfolders and `native/` code come with them.

If the type isn't found anywhere, compilation fails. The error names the missing type and has tips on how to fix it: correct the typo, or tell the compiler where to find the type, for example by adding its package to your project folder or linking its repository in your README.

Copied packages have a `.origin` file naming their source. Run `strict update .` from the project folder to refresh them; a package missing a newly used type is also refreshed automatically. A declaration like `has scene WebWars/Scene` selects a specific package when type names collide. Otherwise Strict prefers the file's own folder and reports `AmbiguousType` if it cannot choose.

A folder containing `Any.strict` after the file overrides where the base types come from, for example `strict test Game.strict C:/code/Strict`. Put it before program arguments. Paths resolve in the project context. Testing code supplied on standard input with `strict test <file> -` keeps that context without changing the file.

# 7. Your first type

Create a folder for your project anywhere, it doesn't have to be inside the Strict repository. For example `Kata`, with `Kata/Parity.strict`:

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

Now try every command inside the `Kata` folder:

```sh
cd Kata
strict Parity.strict          # 5 is odd
strict test Parity.strict     # All tests passed in Parity.strict
strict check .                # Validation issues: 0
strict build Parity.strict    # creates Parity.exe, which prints 5 is odd
```

`Number`, `Text` and `Logger` aren't in your folder, so `strict` takes them from the folder it lives in. Change a test so it fails, for example `Parity(7).Describe is "7 is even"`, and run `strict test` again. It reports the failing test and the value it got.

# 8. Learn the language

* [Types](Types.md), [Members and Variables](Variables.md), [Methods](Methods.md) and [Tests](Tests.md) explain how a `.strict` file is structured.
* [Statements and Expressions](Statements.md), [If](If.md) and [For](For.md) explain everything you can write in a method body.
* [Lists and Dictionaries](Lists.md) and [Errors](Errors.md) cover the most used base types.
* [Coding Style](CodingStyle.md) and [Code Validations](CodeValidations.md) list the rules the compiler enforces.
* The best way to learn how any expression or base type works is to read the base types. Every method starts with tests that show how to use it. [Base Types](BaseTypes.md) and [Examples](Examples.md) link every file.

# Editors

## Visual Studio Code

The [Strict extension for VS Code](https://github.com/strict-lang/strict-vscode-client) is the main way to work on Strict code. It runs everything through `strict`, so it needs no .NET and no language server process:

* **Semantic syntax highlighting**, hover details, completion and **F12** go to definition for `.strict` files.
* **SCrunch** tests every `.strict` file when the folder opens (`strict test`). Saving a file tests it again, then every file that uses its type.
* **SCrunch visualization:** ✓/✗ test marks, green/red coverage dots, method timings and `expected … got …` after a failure. Line values and hit counts show what the tests did inside the implementation.
* **Testing view** with every type and its tested methods. `Run` methods can be started from there and show their output.
* **Validator diagnostics** from `strict check`, with quick fixes (Alt+Enter) for formatting issues.
* **Strict: Run File** (Ctrl+Shift+R) runs the `Run` method of the current file in a terminal.

To install it, clone [strict-vscode-client](https://github.com/strict-lang/strict-vscode-client) next to the Strict repository, run `bun install` and `bun run package`, then use *Extensions: Install from VSIX…* in VS Code. The extension always uses the newest `strict.exe` it finds (in the workspace, or in a `Strict` folder next to it or next to the extension), so rebuilding `strict` is enough to update it. The `strict.root` setting forces one folder.

The extension also provides completion, hover, go to definition, signature help, references, rename and call hierarchy by indexing `.strict` source files.

* **Timings and coverage:** test durations, slow-test reports and Run with Coverage, using `strict test <file> lines` for native execution counts and total/self timings.
* **Implementations from tests:** ghost-text suggestions are checked against the method's tests before you accept them. Strong tests matter: a suggestion passing weak tests can still be wrong.
* **Editing tools:** Format Document uses `strict format`; quick fixes, Fix All, extract/inline refactorings and create-from-usage help maintain the canonical style.
* **Build and packages:** Strict: Build Native Executable and Strict: Update Packages run the same CLI commands available in a terminal.

See the [extension README](https://github.com/strict-lang/strict-vscode-client#features) for commands, settings and known limitations.

## Other editors

`.strict` files are plain UTF-8 text, so any editor works. Configure it to indent with tabs, as the repository's [`.editorconfig`](https://github.com/strict-lang/Strict/blob/master/.editorconfig) does. [Grammar](Grammar.md#syntax-highlighting-files) has syntax highlighting files for TextMate, Sublime Text, Notepad++ and Iro.

# Status

The current workflow combines live test feedback, line values, native programs and shared libraries, exact stepped decimals, package-local C code and generated C# bindings. [Real projects](Projects.md) include DeltaEngine games, SoulCraft, web-application logic, the self-hosted compiler and [Qwen3 inference](MachineLearning.md). Development continues on performance and larger workloads; the [package READMEs](https://github.com/strict-lang/Strict) record the latest measurements.
