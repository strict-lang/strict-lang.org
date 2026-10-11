---
id: Architecture
title: Architecture
---

Strict is written in Strict. The compiler, the validators, the virtual machine and the native code generator are plain `.strict` packages in the [Strict repository](https://github.com/strict-lang/Strict), next to the base types. `NativeCompiler` compiles them into one native executable, and that executable then compiles its own sources again, byte for byte identical.

![How Strict code becomes a program](/img/StrictPipeline.svg)

Every source file is short and self-explanatory, and it starts with tests that show how to use it. This page gives a one-line summary of each type and links to its source. Folder names link to the package on GitHub.

![Strict layers: VS Code and NativeCompiler on top of the Strict packages](/img/StrictLayers.svg)

| Package | Responsibility |
|---------|----------------|
| [root types](BaseTypes.md) | `Number`, `Text`, `List`, `Dictionary`, `Error`, `File`, ... define the language and are its documentation |
| [`Expressions`](#expressions) | Tokenizer, syntax tree, statements, header tokens, type shapes, known types, and type inference over all packages |
| [`Validators`](#validators) | Unused and never-changed variables, names, constant folding, limits (`ValidateCheck` behind `NativeCompiler check`) |
| [`Bytecode`](#bytecode) | Compiles a type into register-based instructions (`FileCompiler`), inlines constants, removes tests, links used types, writes `.strictbinary` |
| [`Runtime`](#runtime) | The Strict VM that runs those instructions (`Execute` behind `NativeCompiler run`) |
| [`Compiler`](#compiler) | `NativeCompiler`: instructions to MLIR, the native runtime (texts, lists, files, processes, collector), then `mlir-opt`, `mlir-translate` and `clang` |
| [VS Code extension](#tools) | Edit, test, check and run `.strict` files, all through `NativeCompiler` |

# How a program is compiled

1. **[`SourceFiles`](https://github.com/strict-lang/Strict/blob/master/Bytecode/SourceFiles.strict)** collects the `.strict` files of the source folder, the base types, and every package that is referenced.
2. **[`Expressions`](#expressions)** reads type shapes and method headers, parses each method body into a syntax tree, and infers the type of every expression across all packages.
3. **[`Bytecode`](#bytecode)** compiles the entry type into register-based instructions. Constants are inlined and folded, inline tests are removed (or collected into a `$Tests` method for `NativeCompiler test`), and the [`Linker`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Linker.strict) adds only the methods of other types that are actually called.
4. Then either **[`Runtime`](#runtime)** runs the instructions on the Strict VM (`NativeCompiler run`), or **[`Compiler`](#compiler)** translates them into one MLIR module, appends the handwritten native runtime and lowers everything to an executable (`NativeCompiler build`).

Only code that is actually called is parsed, validated, tested and executed. This is what makes it possible to generate huge amounts of code and discard what isn't needed or doesn't work almost immediately.

# Native model

* Every value is one 64-bit slot. Numbers are doubles, and texts, lists and instances are pointer bits. `Error` values carry a tag in the top bits, so `x is Error` works for a value of any type.
* A type with one member is that member: `Name` is its text, `Degrees` its number. Other instances are heap blocks with one slot per member.
* Lists append in place as long as they are the newest version.
* Memory is managed by a conservative mark-sweep collector with 64 KB pages, size classes and interior pointers. It collects after 4 MB or 8 times the live data. 1 million loop iterations on the Strict VM use 9 MB.

Speed for 1 million loop iterations: 45 ms as a native executable (227 KB), 245 ms on the Strict VM, and 420 ms with the old C# `Strict.exe`. `NativeCompiler` builds itself in about 10 seconds, most of it in `mlir-opt` and `clang`. Executables are reproducible: single-threaded MLIR passes and `-Brepro` make every build byte-identical.

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
- [`RoundTrip`](https://github.com/strict-lang/Strict/blob/master/Expressions/RoundTrip.strict): checks that parsed method bodies print back exactly as their source lines.
- [`ParseDemo`](https://github.com/strict-lang/Strict/blob/master/Expressions/ParseDemo.strict) (demo): logs expression classifications and a `ShuntingYard` result.

**Simple text-backed expression model.** These are small records for each kind of expression, from before the syntax tree. Most of them aren't used by the compiler anymore:
[`Expression`](https://github.com/strict-lang/Strict/blob/master/Expressions/Expression.strict) (result type, line, mutability),
[`ExpressionParser`](https://github.com/strict-lang/Strict/blob/master/Expressions/ExpressionParser.strict) (classifies a line),
[`Binary`](https://github.com/strict-lang/Strict/blob/master/Expressions/Binary.strict),
[`BooleanExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/BooleanExpression.strict),
[`NumberExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/NumberExpression.strict),
[`TextExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/TextExpression.strict),
[`ListExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/ListExpression.strict),
[`DictionaryExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/DictionaryExpression.strict),
[`Declaration`](https://github.com/strict-lang/Strict/blob/master/Expressions/Declaration.strict),
[`MutableReassignment`](https://github.com/strict-lang/Strict/blob/master/Expressions/MutableReassignment.strict),
[`Return`](https://github.com/strict-lang/Strict/blob/master/Expressions/Return.strict),
[`IfExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/IfExpression.strict),
[`SelectorIf`](https://github.com/strict-lang/Strict/blob/master/Expressions/SelectorIf.strict),
[`ForExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/ForExpression.strict),
[`NotExpression`](https://github.com/strict-lang/Strict/blob/master/Expressions/NotExpression.strict),
[`To`](https://github.com/strict-lang/Strict/blob/master/Expressions/To.strict),
[`TypeComparison`](https://github.com/strict-lang/Strict/blob/master/Expressions/TypeComparison.strict),
[`Instance`](https://github.com/strict-lang/Strict/blob/master/Expressions/Instance.strict),
[`MethodCall`](https://github.com/strict-lang/Strict/blob/master/Expressions/MethodCall.strict),
[`MemberCall`](https://github.com/strict-lang/Strict/blob/master/Expressions/MemberCall.strict),
[`ListCall`](https://github.com/strict-lang/Strict/blob/master/Expressions/ListCall.strict),
[`ParameterCall`](https://github.com/strict-lang/Strict/blob/master/Expressions/ParameterCall.strict),
[`VariableCall`](https://github.com/strict-lang/Strict/blob/master/Expressions/VariableCall.strict),
[`Value`](https://github.com/strict-lang/Strict/blob/master/Expressions/Value.strict),
[`ValueInstance`](https://github.com/strict-lang/Strict/blob/master/Expressions/ValueInstance.strict),
[`ValueListInstance`](https://github.com/strict-lang/Strict/blob/master/Expressions/ValueListInstance.strict),
[`ValueDictionaryInstance`](https://github.com/strict-lang/Strict/blob/master/Expressions/ValueDictionaryInstance.strict) and
[`ValueTypeInstance`](https://github.com/strict-lang/Strict/blob/master/Expressions/ValueTypeInstance.strict).

# Validators

[`Validators`](https://github.com/strict-lang/Strict/tree/master/Validators) holds the static code-quality rules behind `NativeCompiler check`, see [Code Validations](CodeValidations.md).

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
- [`NumberLiteral`](https://github.com/strict-lang/Strict/blob/master/Bytecode/NumberLiteral.strict): checks whether a text is a number literal.

**Packaging**

- [`BinaryFile`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryFile.strict): packs compiled types into a `.strictbinary` zip with one `<Type>.bytecode` entry per type.
- [`ZipWriter`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ZipWriter.strict): writes uncompressed zip archives.
- [`ZipEntry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ZipEntry.strict): named bytes with their CRC-32 checksum.
- [`Crc`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Crc.strict): CRC-32 computed with plain arithmetic.

**Older line-based instruction model**, still used by the old `Optimizers` package and some tests:
[`BytecodeInstruction`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BytecodeInstruction.strict) (text-named register instruction),
[`InstructionList`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionList.strict),
[`InstructionNames`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionNames.strict),
[`InstructionText`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionText.strict) (assembly-like text),
[`Decompiler`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Decompiler.strict) (instructions back to lines like `R2 = R0 + R1`),
[`LineGenerator`](https://github.com/strict-lang/Strict/blob/master/Bytecode/LineGenerator.strict),
[`ExpressionCodegen`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ExpressionCodegen.strict),
[`ExpressionKind`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ExpressionKind.strict),
[`GenerationResult`](https://github.com/strict-lang/Strict/blob/master/Bytecode/GenerationResult.strict),
[`Registry`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Registry.strict) (register allocator),
[`Register`](https://github.com/strict-lang/Strict/blob/master/Bytecode/Register.strict) (64 registers named `R<n>`),
[`NameTable`](https://github.com/strict-lang/Strict/blob/master/Bytecode/NameTable.strict),
[`BytecodeValue`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BytecodeValue.strict),
[`BinaryExecutable`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryExecutable.strict),
[`BinaryTypeData`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryTypeData.strict),
[`BinaryMethod`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryMethod.strict),
[`BinaryMember`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BinaryMember.strict),
[`InvokeInfo`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InvokeInfo.strict) and
[`ValueKind`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ValueKind.strict).

**Tests and demos:**
[`BytecodeDemo`](https://github.com/strict-lang/Strict/blob/master/Bytecode/BytecodeDemo.strict),
[`DecompilerTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/DecompilerTests.strict),
[`ExecutableTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ExecutableTests.strict),
[`GeneratorTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/GeneratorTests.strict),
[`InstructionTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/InstructionTests.strict),
[`NameTableTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/NameTableTests.strict),
[`RegistryTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/RegistryTests.strict) and
[`ValueTests`](https://github.com/strict-lang/Strict/blob/master/Bytecode/ValueTests.strict).

# Runtime

[`Runtime`](https://github.com/strict-lang/Strict/tree/master/Runtime) is the Strict VM. It runs the instructions that `FileCompiler` produces, using immutable frames and values. `NativeCompiler run` calls [`Execute`](https://github.com/strict-lang/Strict/blob/master/Runtime/Execute.strict).

- [`Execute`](https://github.com/strict-lang/Strict/blob/master/Runtime/Execute.strict): compiles a file, checks that it has a `Run` method, converts the command-line numbers, and launches the machine or runs the tests.
- [`Machine`](https://github.com/strict-lang/Strict/blob/master/Runtime/Machine.strict): the VM core. Finds methods, binds members and parameters, and steps through the instructions, handling calls, indexing, printing and field loads.
- [`Frame`](https://github.com/strict-lang/Strict/blob/master/Runtime/Frame.strict): the immutable state of one method execution: method, instruction position, registers and locals.
- [`Locals`](https://github.com/strict-lang/Strict/blob/master/Runtime/Locals.strict): an immutable map from names to values for local variables.
- [`VmValue`](https://github.com/strict-lang/Strict/blob/master/Runtime/VmValue.strict): the universal runtime value (kind, number, text, items) with factories and text formatting.
- [`Invocation`](https://github.com/strict-lang/Strict/blob/master/Runtime/Invocation.strict): decodes an invoke instruction into type, method, return type, parameters, arguments and instance.
- [`Flow`](https://github.com/strict-lang/Strict/blob/master/Runtime/Flow.strict): control flow: returns, conditional jumps, jump ends, and dispatching loop instructions.
- [`Looping`](https://github.com/strict-lang/Strict/blob/master/Runtime/Looping.strict): loop begin and end, keeping the `index` and `value` state for numbers, ranges, lists and texts.
- [`Operations`](https://github.com/strict-lang/Strict/blob/master/Runtime/Operations.strict): arithmetic and comparisons, including text and list concatenation and removing list elements.
- [`Storage`](https://github.com/strict-lang/Strict/blob/master/Runtime/Storage.strict): loads and stores between registers and locals, plus list appends.
- [`Natives`](https://github.com/strict-lang/Strict/blob/master/Runtime/Natives.strict): built-in behavior for methods without bytecode: `from` constructors, `to` conversions, `Length`, logic, `in`, text methods, processes and default member values.
- [`PayloadDecoder`](https://github.com/strict-lang/Strict/blob/master/Runtime/PayloadDecoder.strict): decodes instruction payloads into numbers, doubles, texts, booleans, lists and ids.

# Compiler

[`Compiler`](https://github.com/strict-lang/Strict/tree/master/Compiler) translates the linked types from `FileCompiler` into one MLIR module, appends the handwritten MLIR runtime, and lowers everything with `mlir-opt`, `mlir-translate` and `clang` into a standalone executable. The entry point is [`NativeCompiler`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeCompiler.strict), see [Getting Started](GettingStarted.md#4-commands) for its commands.

**Command line and toolchain**

- [`NativeCompiler`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeCompiler.strict): the command-line entry with the `build`, `test`, `check` and `run` commands.
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
- [`MlirLoops`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirLoops.strict): loop begin and end for ranges, counts and collections.
- [`MlirTexts`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirTexts.strict): text concatenation and conversions from and to text.
- [`MlirNatives`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirNatives.strict): maps `Text`, `List`, `File`, `Directory` and `Process` methods to runtime functions.
- [`MlirMemory`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirMemory.strict): pointer and bits conversion, allocation and slot access.
- [`MlirAutomatic`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirAutomatic.strict): generates automatic `to Text` for types and lists of them.
- [`MlirEquality`](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirEquality.strict): generates member-by-member equality for types and lists, used by `is`.

**Native runtime**, written by hand in MLIR:

- [`NativeRuntime.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntime.mlir): the garbage collector, texts, lists, number formatting, math, files, arguments and processes.
- [`NativeRuntimeWindows.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntimeWindows.mlir): Windows memory, directories, temporary files and processes.
- [`NativeRuntimeLinux.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntimeLinux.mlir): Linux memory, directories, temporary files and processes.

**Bootstrapping.** `Compiler/Bootstrap.mlir` is `NativeCompiler.strict` compiled by itself. `Compiler/Bootstrap.cmd` (Windows) and `Compiler/bootstrap.sh` (Linux) combine it with the native runtime and build `NativeCompiler` with just the LLVM tools, see [Getting Started](GettingStarted.md#3-bootstrap-the-compiler).

# Older packages

[`Language`](https://github.com/strict-lang/Strict/tree/master/Language), [`HighLevelRuntime`](https://github.com/strict-lang/Strict/tree/master/HighLevelRuntime), [`TestRunner`](https://github.com/strict-lang/Strict/tree/master/TestRunner) and [`Optimizers`](https://github.com/strict-lang/Strict/tree/master/Optimizers) were the first Strict versions of the compiler. They work line by line on texts and have been replaced by the packages above.

**Language**, replaced by `Expressions` and `Validators/Limits`:
[`Package`](https://github.com/strict-lang/Strict/blob/master/Language/Package.strict) (loads a folder of `.strict` files),
[`Type`](https://github.com/strict-lang/Strict/blob/master/Language/Type.strict),
[`TypeLines`](https://github.com/strict-lang/Strict/blob/master/Language/TypeLines.strict),
[`TypeKind`](https://github.com/strict-lang/Strict/blob/master/Language/TypeKind.strict),
[`TypeFinder`](https://github.com/strict-lang/Strict/blob/master/Language/TypeFinder.strict),
[`TypeParser`](https://github.com/strict-lang/Strict/blob/master/Language/TypeParser.strict),
[`Member`](https://github.com/strict-lang/Strict/blob/master/Language/Member.strict) (parses `has`/`mutable`/`constant` lines),
[`MethodParser`](https://github.com/strict-lang/Strict/blob/master/Language/MethodParser.strict),
[`Parameter`](https://github.com/strict-lang/Strict/blob/master/Language/Parameter.strict),
[`NamedType`](https://github.com/strict-lang/Strict/blob/master/Language/NamedType.strict),
[`Body`](https://github.com/strict-lang/Strict/blob/master/Language/Body.strict) (classifies body lines),
[`Expression`](https://github.com/strict-lang/Strict/blob/master/Language/Expression.strict),
[`ConcreteExpression`](https://github.com/strict-lang/Strict/blob/master/Language/ConcreteExpression.strict),
[`ExpressionParser`](https://github.com/strict-lang/Strict/blob/master/Language/ExpressionParser.strict),
[`Context`](https://github.com/strict-lang/Strict/blob/master/Language/Context.strict),
[`Keyword`](https://github.com/strict-lang/Strict/blob/master/Language/Keyword.strict) (all keywords as constants),
[`BinaryOperator`](https://github.com/strict-lang/Strict/blob/master/Language/BinaryOperator.strict),
[`UnaryOperator`](https://github.com/strict-lang/Strict/blob/master/Language/UnaryOperator.strict),
[`Limit`](https://github.com/strict-lang/Strict/blob/master/Language/Limit.strict) (all code size limits as constants),
[`Parser`](https://github.com/strict-lang/Strict/blob/master/Language/Parser.strict) (demo) and
[`PackageTests`](https://github.com/strict-lang/Strict/blob/master/Language/PackageTests.strict) (tests).

**HighLevelRuntime**, a text-based interpreter replaced by `Runtime`:
[`Interpreter`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/Interpreter.strict),
[`ExecutionContext`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/ExecutionContext.strict),
[`RuntimeValue`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/RuntimeValue.strict),
[`BodyEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/BodyEvaluator.strict),
[`BodyResult`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/BodyResult.strict),
[`ExpressionEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/ExpressionEvaluator.strict),
[`MethodCallEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/MethodCallEvaluator.strict),
[`IfEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/IfEvaluator.strict),
[`SelectorIfEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/SelectorIfEvaluator.strict),
[`ForEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/ForEvaluator.strict),
[`ToEvaluator`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/ToEvaluator.strict),
[`TestBehavior`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/TestBehavior.strict),
[`RuntimeStatistics`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/RuntimeStatistics.strict),
plus the tests and demos
[`BodyTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/BodyTests.strict),
[`ContextTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/ContextTests.strict),
[`EvaluatorTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/EvaluatorTests.strict),
[`IfToTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/IfToTests.strict),
[`InterpreterTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/InterpreterTests.strict),
[`RuntimeValueTests`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/RuntimeValueTests.strict) and
[`RuntimeDemo`](https://github.com/strict-lang/Strict/blob/master/HighLevelRuntime/RuntimeDemo.strict).

**TestRunner**, replaced by `Bytecode/TestLines` and `Bytecode/TestCodegen` behind `NativeCompiler test`:
[`TestInterpreter`](https://github.com/strict-lang/Strict/blob/master/TestRunner/TestInterpreter.strict),
[`Assertion`](https://github.com/strict-lang/Strict/blob/master/TestRunner/Assertion.strict),
[`MethodUnderTest`](https://github.com/strict-lang/Strict/blob/master/TestRunner/MethodUnderTest.strict),
[`TypeUnderTest`](https://github.com/strict-lang/Strict/blob/master/TestRunner/TypeUnderTest.strict),
[`TestResult`](https://github.com/strict-lang/Strict/blob/master/TestRunner/TestResult.strict),
[`TestStatistics`](https://github.com/strict-lang/Strict/blob/master/TestRunner/TestStatistics.strict) and
[`TestDemo`](https://github.com/strict-lang/Strict/blob/master/TestRunner/TestDemo.strict) (demo).

**Optimizers**, peephole passes over the older instruction model, replaced by `Bytecode/ConstantFolding`, `Bytecode/LoadReuse` and test removal in `Bytecode/TestLines`:
[`AllOptimizers`](https://github.com/strict-lang/Strict/blob/master/Optimizers/AllOptimizers.strict),
[`ConstantFolder`](https://github.com/strict-lang/Strict/blob/master/Optimizers/ConstantFolder.strict),
[`DeadStore`](https://github.com/strict-lang/Strict/blob/master/Optimizers/DeadStore.strict),
[`JumpThread`](https://github.com/strict-lang/Strict/blob/master/Optimizers/JumpThread.strict),
[`RedundantLoad`](https://github.com/strict-lang/Strict/blob/master/Optimizers/RedundantLoad.strict),
[`StrengthReduce`](https://github.com/strict-lang/Strict/blob/master/Optimizers/StrengthReduce.strict),
[`TestCodeRemove`](https://github.com/strict-lang/Strict/blob/master/Optimizers/TestCodeRemove.strict),
[`UnreachableCode`](https://github.com/strict-lang/Strict/blob/master/Optimizers/UnreachableCode.strict),
[`OptimizerStats`](https://github.com/strict-lang/Strict/blob/master/Optimizers/OptimizerStats.strict),
plus the tests and demo
[`DeadStoreTests`](https://github.com/strict-lang/Strict/blob/master/Optimizers/DeadStoreTests.strict),
[`FolderTests`](https://github.com/strict-lang/Strict/blob/master/Optimizers/FolderTests.strict),
[`PipelineTests`](https://github.com/strict-lang/Strict/blob/master/Optimizers/PipelineTests.strict),
[`StrengthTests`](https://github.com/strict-lang/Strict/blob/master/Optimizers/StrengthTests.strict),
[`UnreachableTests`](https://github.com/strict-lang/Strict/blob/master/Optimizers/UnreachableTests.strict) and
[`OptimizerDemo`](https://github.com/strict-lang/Strict/blob/master/Optimizers/OptimizerDemo.strict).

# Tools

The [Strict extension for Visual Studio Code](https://github.com/strict-lang/strict-vscode-client) is written in TypeScript and is the main way to work on Strict code. It has no compiler of its own. Every action is a `NativeCompiler` call with the Strict folder as root:

| Purpose | Command |
|---------|---------|
| Inline tests of a file (SCrunch, on open and on save) | `NativeCompiler run test <file> .` |
| Validator diagnostics for the folder of a tested file | `NativeCompiler check <folder> .` |
| Strict: Run File (Ctrl+Shift+R) | `NativeCompiler run <file> . [arguments]` |

Each call looks up the newest `Compiler/NativeCompiler.exe` again, so a rebuilt compiler is used on the next save. Agents can run the same commands to verify `.strict` changes without VS Code. See [Getting Started](GettingStarted.md#visual-studio-code) for the features and how to install it.

# The C# implementation

Strict was bootstrapped by a C# implementation on .NET, which included a Language Server, a C# transpiler and a CUDA compiler. All of it lives on the [`dotnet` branch](https://github.com/strict-lang/Strict/tree/dotnet). It isn't needed anymore to build or run Strict.

# Open work

[`improvements.md`](https://github.com/strict-lang/Strict/blob/master/improvements.md) lists what is missing, in priority order: generic types like `Dictionary` in native code, operators between lists, the same results on the Strict VM as natively, better test output for VS Code, and replacing the older packages. A language server written in Strict comes after that.
