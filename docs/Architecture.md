---
id: Architecture
title: Architecture
---

Strict is written in Strict. The compiler, the validators, the virtual machine and the native code generator are plain `.strict` packages in the [Strict repository](https://github.com/strict-lang/Strict), next to the base types. They compile into one native executable, `strict` (`strict.exe` on Windows), and that executable then compiles its own sources again, byte for byte identical.

![How Strict code becomes a program](/img/StrictPipeline.svg)

This is a substantial real-world Strict application: open it in [VS Code](VSCode.md), follow definitions with F12 and use the inline tests and line values to understand each stage. Every source file is short and self-explanatory, and it starts with tests that show how to use it. This page gives a one-line summary of each type and links to its source. Folder names link to the package on GitHub.

![Strict layers: VS Code and strict on top of the Strict packages](/img/StrictLayers.svg)

| Package | Responsibility |
|---------|----------------|
| [root types](BaseTypes.md) | `Number`, `Text`, `List`, `Dictionary`, `Error`, `File`, ... define the language and are its documentation, [`Strict`](https://github.com/strict-lang/Strict/blob/master/Strict.strict) is the `strict` command |
| [`Expressions`](#expressions) | Tokenizer, syntax tree, statements, header tokens, type shapes, known types, and type inference over all packages |
| [`Validators`](#validators) | Unused and never-changed variables, names, constant folding, limits (`ValidateCheck` behind `strict check`) |
| [`Bytecode`](#bytecode) | Compiles a type into register-based instructions (`FileCompiler`), inlines constants, removes tests, links used types, writes `.strictbinary` |
| [`Runtime`](#runtime) | The Strict VM that runs those instructions (`Execute` behind `strict <file>` and `strict test`) |
| [`Compiler`](#compiler) | `NativeBuild` behind `strict build`: instructions to MLIR, the native runtime (texts, lists, files, processes, collector), then `mlir-opt`, `mlir-translate` and `clang` |
| [VS Code extension](#tools) | Edit, test, check and run `.strict` files, all through `strict` |

# How a program is compiled

1. **[`SourceFiles`](https://github.com/strict-lang/Strict/blob/master/Bytecode/SourceFiles.strict)** collects the `.strict` files of the current folder and its sub folders, then the base types and packages next to `strict.exe`, see [how strict finds types](GettingStarted.md#6-how-strict-finds-types).
2. **[`Expressions`](#expressions)** reads type shapes and method headers, parses each method body into a syntax tree, and infers the type of every expression across all packages.
3. **[`Bytecode`](#bytecode)** compiles the entry type into register-based instructions. Constants are inlined and folded, inline tests are removed (or collected into a `$Tests` method for `strict test`), and the [`Linker`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Linker.strict) adds only the methods of other types that are actually called.
4. Then either **[`Runtime`](#runtime)** runs the instructions on the Strict VM (`strict <file>` and `strict test`), or **[`Compiler`](#compiler)** translates them into one MLIR module, appends the handwritten native runtime and lowers everything to an executable (`strict build`).

Only code that is actually called is parsed, validated, tested and executed. This is what makes it possible to generate huge amounts of code and discard what isn't needed or doesn't work almost immediately.

[![NativeBuild.strict in VS Code: the compiler pipeline written in Strict](/img/screenshots/native-compiler.jpg)](/img/screenshots/native-compiler.jpg)

The native build pipeline, written in the same language it compiles.

# Native model

* Every value is one 64-bit slot. Numbers are doubles, and texts, lists and instances are pointer bits. `Error` values carry a tag in the top bits, so `x is Error` works for a value of any type.
* A type with one member is that member: `Name` is its text, `Degrees` its number. Other instances are heap blocks with one slot per member.
* Lists append in place as long as they are the newest version.
* Memory is managed by a conservative mark-sweep collector with 64 KB pages, size classes and interior pointers. It collects after 16 MB or 8 times the live data. The current runtime measurements report 22 MB for 1 million VM loop iterations.

The [current VM benchmark](https://github.com/strict-lang/Strict/blob/master/Runtime/README.md) reports 1 million loop iterations in 40 ms natively and 105 ms on the Strict VM. These development measurements depend on the workload and hardware. `strict` builds itself in about 14.5 seconds, most of it in `mlir-opt` and `clang`. Executables are reproducible: single-threaded MLIR passes and `-Brepro` make every build byte-identical.

# Expressions

[`Expressions`](https://github.com/strict-lang/Strict/tree/master/Expressions) is the compiler front end. It tokenizes and parses Strict lines into [`SyntaxNode`](https://github.com/strict-lang/Strict/blob/master/Expressions/SyntaxNode.strict) trees, reads type and method headers, and infers the type of every statement. `FileCompiler` calls [`ResolveCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/ResolveCheck.strict) to build the type inference for all files.

**Parsing**

- [`Tokenizer`](https://github.com/strict-lang/Strict/blob/master/Expressions/Tokenizer.strict): splits a source line into words, numbers, quoted texts and operators.
- [`PhraseTokenizer`](https://github.com/strict-lang/Strict/blob/master/Expressions/PhraseTokenizer.strict): splits a phrase on spaces into tokens.
- [`NumberChars`](https://github.com/strict-lang/Strict/blob/master/Expressions/NumberChars.strict): checks whether a text starts with a digit or a minus sign.
- [`SyntaxNode`](https://github.com/strict-lang/Strict/blob/master/Expressions/SyntaxNode.strict): a syntax tree node (kind, text, children) with precedence-aware printing.
- [`SyntaxParser`](https://github.com/strict-lang/Strict/blob/master/Expressions/SyntaxParser.strict): precedence-based expression parser for binary operators, `not`, negation, calls, members, lists and literals.
- [`StatementParser`](https://github.com/strict-lang/Strict/blob/master/Expressions/StatementParser.strict): parses one line into a statement: declaration, `return`, `if`, `for`, `else`, reassignment or expression.
- [`BodyParser`](https://github.com/strict-lang/Strict/blob/master/Expressions/BodyParser.strict): parses indented method body lines into nested blocks by tab depth.
- [`ShuntingYard`](https://github.com/strict-lang/Strict/blob/master/Expressions/ShuntingYard.strict): converts infix expressions to postfix by operator precedence.
- [`HeaderTokens`](https://github.com/strict-lang/Strict/blob/master/Expressions/HeaderTokens.strict): reads member and method headers: declared or implicit types, parameters, return type and whether it returns `Mutable`.
- [`TypeShape`](https://github.com/strict-lang/Strict/blob/master/Expressions/TypeShape.strict): analyzes a type's lines: members, methods, parameters, constants, enum values, traits and generics.
- [`MethodBodies`](https://github.com/strict-lang/Strict/blob/master/Expressions/MethodBodies.strict): flattens method bodies into scoped statements, tracking declarations and `value`, `index` and `outer`.
- [`Scope`](https://github.com/strict-lang/Strict/blob/master/Expressions/Scope.strict): ordered names and types, later entries shadow earlier ones.
- [`ScopedStatement`](https://github.com/strict-lang/Strict/blob/master/Expressions/ScopedStatement.strict): a parsed statement with its visible scope and source line.

**Types**

- [`KnownTypes`](https://github.com/strict-lang/Strict/blob/master/Expressions/KnownTypes.strict): all types with their member, method and parameter scopes. Resolves member, element and plural types.
- [`TypeInference`](https://github.com/strict-lang/Strict/blob/master/Expressions/TypeInference.strict): infers result types of literals, calls, members, operators and `then … else`, and finds `to` and `from` conversions.
- [`TypePattern`](https://github.com/strict-lang/Strict/blob/master/Expressions/TypePattern.strict): a constant type pattern with a concrete name and a display name.
- [`ResolveCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/ResolveCheck.strict): builds the type inference for all files and reports unresolved names in a folder.
- [`FileCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/FileCheck.strict): reports identifiers that no known type, scope name or `value` member resolves.

**Tools**

- [`TypeReport`](https://github.com/strict-lang/Strict/blob/master/Expressions/TypeReport.strict): logs the inferred type of every statement line in a folder.
- [`RoundTrip`](https://github.com/strict-lang/Strict/blob/master/Validators/RoundTrip.strict): checks that parsed method bodies print back exactly as their source lines.

# Validators

[`Validators`](https://github.com/strict-lang/Strict/tree/master/Validators) holds the static code-quality rules behind `strict check`, see [Code Validations](CodeValidations.md).

- [`ValidateCheck`](https://github.com/strict-lang/Strict/blob/master/Validators/ValidateCheck.strict): the `check` entry point. Collects mutating methods across files, validates each file, logs the issues and returns their count.
- [`TypeValidator`](https://github.com/strict-lang/Strict/blob/master/Validators/TypeValidator.strict): per-type checks for unused private members and computed `has` members that should be `constant`, plus `UsageRules` for every method.
- [`UsageRules`](https://github.com/strict-lang/Strict/blob/master/Validators/UsageRules.strict): per-method rules for unused variables and parameters, names that hide members, `mutable` values that never change and `mutable` parameters.
- [`Limits`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict): line length, nesting, tab indentation, method length, and method and member counts.
- [`Names`](https://github.com/strict-lang/Strict/blob/master/Validators/Names.strict): rejects keywords as names, names starting with `List`, and constants named like a type or a method.
- [`ConstantCollapser`](https://github.com/strict-lang/Strict/blob/master/Validators/ConstantCollapser.strict): folds constant subexpressions (arithmetic, text concatenation, `and`/`or`, `to` conversions).
- [`ValidationIssue`](https://github.com/strict-lang/Strict/blob/master/Validators/ValidationIssue.strict): one issue (rule, target, message), printed as `RuleName: target`.

# Bytecode

[`Bytecode`](https://github.com/strict-lang/Strict/tree/master/Bytecode) turns a type, plus the packages it references, into register-based instructions. Along the way it folds constants and strips inline tests, or collects them into a `$Tests` method. It links in only the methods of other types that are actually used, and packs everything into a `.strictbinary` zip. The entry point is [`FileCompiler`](https://github.com/strict-lang/Strict/blob/master/Bytecode/FileCompiler.strict).

**Compiling and linking**

- [`FileCompiler`](https://github.com/strict-lang/Strict/blob/master/Bytecode/FileCompiler.strict): compiles a file with its packages and optional tests, links the used types and writes the `.strictbinary` bytes.
- [`SourceFiles`](https://github.com/strict-lang/Strict/blob/master/Bytecode/SourceFiles.strict): collects the `.strict` files of the source folder and the packages it references.
- [`TypeCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/TypeCodegen.strict): compiles a type's lines into a `TypeEntry`: members, constants, and all or only the selected methods.
- [`Linker`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Linker.strict): repeatedly adds the used types, with only their called methods, to the compiled entry type.

**Caches and packages**

Successful tests write a `.strictbinary` cache. Source and test-read file timestamps determine freshness, so unchanged code can run, test and build without recompilation. Matching package caches can be referenced instead of embedding the same dependencies repeatedly. `strict update .` refreshes packages tracked by `.origin`; resolution can use sibling projects, local clones or GitHub. See [Getting Started](GettingStarted.md#6-how-strict-finds-types) and [Tests](Tests.md#folder-tests-caches-and-profiling).

**Code generation**

- [`MethodCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/MethodCodegen.strict): generates a method body: statements, assignments, `if`/`else`, logging and returns.
- [`ValueCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ValueCodegen.strict): the core expression generator for literals, variables, calls, member access, indexing and type lookups.
- [`OperatorCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/OperatorCodegen.strict): arithmetic, comparisons, `and`/`or`, `is in`, `then … else` and operator methods of custom types.
- [`LoopCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/LoopCodegen.strict): `for` loops over ranges, counts, iterators and nested loops, plus the implicit sum, product, list and any results.
- [`SelectorCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/SelectorCodegen.strict): selector `if x is` blocks with `value then result` cases.
- [`IndexCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/IndexCodegen.strict): indexing like `numbers(1)`, two-dimensional `Colors(x, y)` flattened by `Size.Width`, and `error(value)`, which attaches a value to an `Error`.
- [`ListCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ListCodegen.strict): list literals, `Add`/`Remove`, list operators, and copies for shared lists.
- [`ConversionCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ConversionCodegen.strict): inserts implicit `from`/`to` conversions for assignments, operands and list elements.
- [`BranchValues`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BranchValues.strict): turns branch values into returns or loop accumulations (sum, product, list, any).
- [`CallTarget`](https://github.com/strict-lang/Strict/blob/master/Bytecode/CallTarget.strict): resolves method signatures, full type names, parameter types and implicit owners of calls.
- [`CodeBlock`](https://github.com/strict-lang/Strict/blob/master/Bytecode/CodeBlock.strict): an immutable instruction block under construction: next register, jump ids, scope and list ownership.
- [`TestLines`](https://github.com/strict-lang/Strict/blob/master/Bytecode/TestLines.strict): separates the inline test lines of a method from its code lines.
- [`TestCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/TestCodegen.strict): builds the `$Tests` method from inline tests. It prints failures and returns the failed count.

**Optimizations**

- [`ConstantFolding`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ConstantFolding.strict): inlines constants, including those of other types, and folds arithmetic on number literals.
- [`LoadReuse`](https://github.com/strict-lang/Strict/blob/master/Bytecode/LoadReuse.strict): drops repeated loads of an unchanged variable by reusing the earlier register.

**Instruction format**

- [`InstructionEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionEntry.strict): one instruction (kind, names, numeric payload) with constructors and its byte encoding.
- [`InstructionType`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionType.strict): the opcodes: loads, stores, arithmetic, comparisons, invoke, loops, jumps, list writes, print and field loads.
- [`MethodEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/MethodEntry.strict): a compiled method (name, parameters, return type, instructions).
- [`MemberEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/MemberEntry.strict): a compiled member (name, type, initial value instructions, constant flag).
- [`TypeEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/TypeEntry.strict): a compiled type with members and methods, encoded as `.bytecode` bytes.
- [`BinaryNames`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryNames.strict): the per-type name table (predefined built-in names plus the type's own names) and its encoding.
- [`ByteEncoder`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ByteEncoder.strict): encodes integers, 7-bit variable-length numbers, UTF-8 texts and IEEE doubles as bytes.
- [`Register`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Register.strict): the 64 registers of the Strict VM, named `R0` to `R63`.

**Packaging**

- [`BinaryFile`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryFile.strict): packs compiled types into a `.strictbinary` zip with one `<Type>.bytecode` entry per type.
- [`ZipWriter`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ZipWriter.strict): writes uncompressed zip archives.
- [`ZipEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ZipEntry.strict): named bytes with their CRC-32 checksum.
- [`Crc`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Crc.strict): CRC-32 computed with plain arithmetic.

# Runtime

[`Runtime`](https://github.com/strict-lang/Strict/tree/master/Runtime) is the Strict VM. It runs the instructions that `FileCompiler` produces, using slot-based frames and values. `strict <file>` and `strict test` call [`Execute`](https://github.com/strict-lang/Strict/blob/master/Runtime/Execute.strict).

- [`Execute`](https://github.com/strict-lang/Strict/blob/master/Runtime/Execute.strict): compiles a file, checks that it has a `Run` method, converts the command-line numbers, and launches the machine or runs the tests.
- [`Machine`](https://github.com/strict-lang/Strict/blob/master/Runtime/Machine.strict): the VM core. Finds methods, binds members and parameters, and steps through the instructions, handling calls, indexing, printing and field loads.
- [`Frame`](https://github.com/strict-lang/Strict/blob/master/Runtime/Frame.strict): executes a method using an owned list of slots for registers and locals, avoiding a new frame per instruction.
- [`Resolver`](https://github.com/strict-lang/Strict/blob/master/Runtime/Resolver.strict): resolves names to slots before execution.
- [`VmValue`](https://github.com/strict-lang/Strict/blob/master/Runtime/VmValue.strict): the universal runtime value (kind, number, text, items) with factories and text formatting.
- [`Invocation`](https://github.com/strict-lang/Strict/blob/master/Runtime/Invocation.strict): decodes an invoke instruction into type, method, return type, parameters, arguments and instance.
- [`ErrorCheck`](https://github.com/strict-lang/Strict/blob/master/Runtime/ErrorCheck.strict): detects unhandled Error values and propagates them with source stack frames.
- [`Looping`](https://github.com/strict-lang/Strict/blob/master/Runtime/Looping.strict): loop begin and end, keeping the `index` and `value` state for numbers, ranges, lists and texts.
- [`Operations`](https://github.com/strict-lang/Strict/blob/master/Runtime/Operations.strict): arithmetic and comparisons, including text and list concatenation and removing list elements.
- [`Storage`](https://github.com/strict-lang/Strict/blob/master/Runtime/Storage.strict): loads and stores between registers and locals, plus list appends.
- [`Natives`](https://github.com/strict-lang/Strict/blob/master/Runtime/Natives.strict): built-in behavior for methods without bytecode: `from` constructors, `to` conversions, `Length`, logic, `in`, text methods, processes and default member values.
- [`Hosted`](https://github.com/strict-lang/Strict/blob/master/Runtime/Hosted.strict): file, directory, process and `Math` calls that the Strict VM hands to the running `strict` executable.
- [`PayloadDecoder`](https://github.com/strict-lang/Strict/blob/master/Runtime/PayloadDecoder.strict): decodes instruction payloads into numbers, doubles, texts, booleans, lists and ids.

# Compiler

[`Compiler`](https://github.com/strict-lang/Strict/tree/master/Compiler) translates the linked types from `FileCompiler` into one MLIR module, appends the handwritten MLIR runtime, and lowers everything with `mlir-opt`, `mlir-translate` and `clang` into a standalone executable. The entry point is [`NativeBuild`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeBuild.strict) behind `strict build`, see [Getting Started](GettingStarted.md#5-commands) for all commands.

**Command line and toolchain**

- [`Strict`](https://github.com/strict-lang/Strict/blob/master/Strict.strict) (in the repository root): the `strict` command. Runs a file, or the `test`, `check`, `build`, `format`, `update` and `version` commands, and finds the base types next to `strict.exe`.
- [`NativeBuild`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeBuild.strict): `strict build`. Runs the tests, compiles the program (or its tests for a type without `Run`) to MLIR, builds the executables and removes the intermediate tool files.
- [`Toolchain`](https://github.com/strict-lang/Strict/blob/master/Compiler/Toolchain.strict): finds and installs the tools, lowers MLIR, links executables, and cross-builds the Linux executable through WSL.
- [`ToolRunner`](https://github.com/strict-lang/Strict/blob/master/Compiler/ToolRunner.strict): finds and runs an external tool and returns its `ProcessResult`.
- [`Platform`](https://github.com/strict-lang/Strict/blob/master/Compiler/Platform.strict): the Windows, Linux and MacOS constants and detection of the current OS.

**MLIR generation**

- [`MlirModule`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirModule.strict): builds the whole module from the reachable functions, globals and helpers.
- [`MlirEntry`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirEntry.strict): emits `main`: starts the collector, creates the instance, parses the arguments, calls the entry method and returns the exit code.
- [`MlirFunction`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirFunction.strict): translates one method into an MLIR function.
- [`MlirStatements`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirStatements.strict): arithmetic, comparisons, stores, returns and jumps.
- [`MlirCalls`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirCalls.strict): method calls, constructor calls, default arguments, native helper calls and printing.
- [`MlirConstants`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirConstants.strict): constant values and escaped text globals.
- [`MlirInstances`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirInstances.strict): creating instances, loading fields, default member values and referenced constants.
- [`MlirLayout`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirLayout.strict): decides the memory layout: base type, single-member wrapper or heap struct.
- [`MlirKinds`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirKinds.strict): infers which kind of value (number, text, boolean, list, type) each register holds.
- [`MlirLists`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirLists.strict): list literals, appending, indexing, element writes, copies and list operators.
- [`MlirListOperators`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirListOperators.strict): `+`, `-`, `*` and `/` between lists, or between a list and a number.
- [`MlirLoops`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirLoops.strict): loop begin and end for ranges, counts and collections.
- [`MlirTexts`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirTexts.strict): text concatenation and conversions from and to text.
- [`MlirNatives`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirNatives.strict): maps `Text`, `List`, `File`, `Directory` and `Process` methods to runtime functions.
- [`MlirMemory`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirMemory.strict): pointer and bits conversion, allocation and slot access.
- [`MlirAutomatic`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirAutomatic.strict): generates automatic `to Text` for types and lists of them.
- [`MlirEquality`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirEquality.strict): generates member-by-member equality for types and lists, used by `is`.

**Native optimizations and packages**

[SIMD, packed numeric rows, CPU worker pools and NVIDIA PTX kernels](Concurrency.md) accelerate eligible numeric loops. [Neural-network and machine-learning programs](MachineLearning.md) are working workloads for these paths. Ordinary `Number` values remain doubles; [stepped decimals](Decimals.md) use exact integer step counts. GPU-resident intermediate values and graph replay support larger inference workloads.

[Package-local `native/` C implementations](UsingApis.md#native-packages) link into native builds and load as shared libraries on the VM. Native builds reuse compiled C objects until sources, headers or flags change. On Windows an `App.ico` next to `App.strict` becomes the executable icon via `llvm-rc`; a changed icon is compiled again each build.

**Native runtime**, written by hand in MLIR:

- [`NativeRuntime.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntime.mlir): the garbage collector, texts, lists, number formatting, math, files, arguments and processes.
- [`NativeRuntimeWindows.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntimeWindows.mlir): Windows memory, directories, temporary files and processes.
- [`NativeRuntimeLinux.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntimeLinux.mlir): Linux memory, directories, temporary files and processes.

**Bootstrapping.** `Compiler/Bootstrap.mlir` is `Strict.strict` compiled by itself. `Compiler/Bootstrap.cmd` (Windows) and `Compiler/bootstrap.sh` (Linux) combine it with the native runtime and build `strict.exe` (Linux: `strict`) in the repository root with just the LLVM tools, see [Getting Started](GettingStarted.md#3-bootstrap-strict).

# Shared libraries

`strict build <file> library` tests the exported type, emits a native shared library and generates a C# binding. The boundary carries numbers, texts, Booleans, number lists, records and lists of records; stepped parameters and results carry their decimal scale. [Using APIs](UsingApis.md#call-strict-from-c-and-c) explains the application workflow; the compiler packages handle generation and linking.

# Tools

The [Strict extension for Visual Studio Code](https://github.com/strict-lang/strict-vscode-client) is written in TypeScript and is the main way to work on Strict code. It has no compiler of its own. Every action is a `strict` call with the Strict folder as root:

| Purpose | Command |
|---------|---------|
| Inline tests of a file (SCrunch, on open and on save) | `strict test <file> .` |
| Validator diagnostics for the folder of a tested file | `strict check <folder> .` |
| Executed-line values and hit counts | `strict test <file> values` |
| Suggested implementation candidates | `strict suggest <file> <method>` |
| Strict: Run File (Ctrl+Shift+R) | `strict <file> . [arguments]` |

Each call looks up the newest `strict.exe` again, so a rebuilt `strict` is used on the next save. Agents can run the same commands to verify `.strict` changes without VS Code. See [Getting Started](GettingStarted.md#visual-studio-code) for the features and how to install it.

# Development direction

[Real projects](Projects.md) drive the next optimizations: DeltaEngine and SoulCraft, website and application logic, neural-network training and [Qwen3 inference](MachineLearning.md). The compiler, runtime and editor evolve together so larger programs retain the short feedback loop you get from a small Strict method. Package READMEs record measurements; the [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) tracks development priorities.
