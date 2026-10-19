---
id: Overview
title: Overview
---

**Strict** is a simple programming language that humans can read and understand, and that computers can also understand, modify and write.

# What it feels like to use

Open a project in [VS Code](VSCode.md), write a few examples of what a method should do and save. SCrunch runs the tests in the background, marks the results beside the source and shows the values used on each executed line. You can try an idea and follow what happened without adding logging. Semantic highlighting, hover details, completion and F12 make the rest of the code easy to explore.

The Testing view connects the project overview to each type and method. Thousands of small tests with subsecond feedback are the design goal; unchanged code reuses cached results. Native profiling and large external workloads have separate execution costs. [Try the editor walkthrough](VSCode.md#start-with-a-small-example).

# What you can build

[DeltaEngine games and SoulCraft](Projects.md), website and application logic alongside ASP.NET or Vite, [neural networks and Qwen3 inference](MachineLearning.md), or [native libraries for C and C#](UsingApis.md). Keep existing frameworks and use Strict for the logic you want to test and inspect. [Stepped decimals](Decimals.md) keep exact values across application boundaries.

The long-term goal is a language that computers can understand, modify and write as well as humans. Short methods, explicit examples and fast execution provide the foundation. Today's projects give that goal practical workloads.

Strict is written in Strict. The compiler is a set of `.strict` packages that compiles itself into a native executable. No .NET, JVM or other runtime is needed. The C# implementation that bootstrapped the language lives on the [`dotnet` branch](https://github.com/strict-lang/Strict/tree/dotnet). All source code is at [github.com/strict-lang/Strict](https://github.com/strict-lang/Strict).

# A first look

Every `.strict` file is one type, and the file name is the type name. Here is [`Examples/TemperatureConverter.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/TemperatureConverter.strict):

```
has celsius Number
has logger
ToFahrenheit Number
	TemperatureConverter(100).ToFahrenheit is 212
	TemperatureConverter(0).ToFahrenheit is 32
	celsius * 9 / 5 + 32
ToKelvin Number
	TemperatureConverter(100).ToKelvin is 373
	TemperatureConverter(0).ToKelvin is 273
	celsius + 273
Run
	constant boiling = TemperatureConverter(100)
	constant freezing = TemperatureConverter(0)
	logger.Log("100C in Fahrenheit: " + boiling.ToFahrenheit)
	logger.Log("0C in Fahrenheit: " + freezing.ToFahrenheit)
	logger.Log("100C in Kelvin: " + boiling.ToKelvin)
```

* `has celsius Number` and `has logger` are **members**. `logger` has no explicit type because the name already says it is a `Logger`.
* `ToFahrenheit Number` is a **method** that returns a `Number`. Method bodies are indented with one tab.
* The first lines of each method are **tests**. Every method needs at least one test, written as a comparison with `is`. Tests run once when the code is compiled and are then removed.
* The last line of a method is its return value. `return` is only needed to leave a method early.
* `Run` is the entry point used by `strict <file>` and `strict build`.

See [Getting Started](GettingStarted.md) to build and run this yourself.

# Strict is

## Readable

There is no fluff: no curly brackets, semicolons, empty lines, comments, access modifiers, `static`, `null`, inheritance or exceptions. Indentation is always one tab per level. Methods are short ([13 lines at most, including the header and tests](CodingStyle.md)), so any method fits on one screen and can be understood in seconds.

## Strict

There is exactly one way to do things. The compiler rejects anything that doesn't follow the rules: unused members or variables, `mutable` values that never change, lines that are too long, too many methods, wrong indentation, and more. There are no warnings, only errors. See [Code Validations](CodeValidations.md) and [Coding Style](CodingStyle.md).

## Tested

Tests are not optional, they are part of the method. Every method starts with test lines that show how to use it. This is why the base library doubles as the documentation of the language: open [`Number.strict`](https://github.com/strict-lang/Strict/blob/master/Number.strict) or [`List.strict`](https://github.com/strict-lang/Strict/blob/master/List.strict) and you see exactly what each method does. In [VS Code](GettingStarted.md#visual-studio-code), SCrunch runs the tests of a file and of every file that uses it each time you save. See [Tests](Tests.md).

## Immutable and functional

Values never change. `list + element` gives a new list. `mutable` exists, but only for values that really change, like loop counters. Everything is an expression: `if` and `for` return values. A `for` loop works like a pipe in functional languages and can filter, map, sum, multiply or concatenate in a couple of lines. See [For](For.md).

## Fast

The runtime reuses list storage where possible and combines generational collection with deferred reference counting; broader reuse of uniquely owned values is still being tuned. The compiler emits MLIR, which `mlir-opt`, `mlir-translate` and `clang` turn into small native executables. Native numeric loops can use SIMD, packed weights, CPU workers and NVIDIA GPUs, see [Concurrency](Concurrency.md). The recorded runtime benchmark reports 1 million loop iterations in 40 ms natively and 105 ms on the Strict VM. These are development measurements, not performance guarantees. See [Architecture](Architecture.md) for memory and build details.

## Small

The base library has a few dozen types: [`Boolean`](https://github.com/strict-lang/Strict/blob/master/Boolean.strict), [`Number`](https://github.com/strict-lang/Strict/blob/master/Number.strict), [`Text`](https://github.com/strict-lang/Strict/blob/master/Text.strict), [`List`](https://github.com/strict-lang/Strict/blob/master/List.strict), [`Dictionary`](https://github.com/strict-lang/Strict/blob/master/Dictionary.strict), [`Range`](https://github.com/strict-lang/Strict/blob/master/Range.strict), [`Error`](https://github.com/strict-lang/Strict/blob/master/Error.strict), [`Logger`](https://github.com/strict-lang/Strict/blob/master/Logger.strict), [`File`](https://github.com/strict-lang/Strict/blob/master/File.strict) and a handful of traits. That is pretty much all you need to write code. See [Base Types](BaseTypes.md).

## Works with your existing stack

Use established frameworks for the browser, HTTP, storage, graphics and platform services. Keep rules, algorithms and state transformations in Strict. Native C packages and generated C# bindings make that practical, from games to web applications. See [Using APIs](UsingApis.md) and [Built with Strict](Projects.md).

# Current developments

* **A much richer editor:** SCrunch test results, source-line values, coverage and timings; semantic highlighting, hover, completion and F12 navigation.
* **Libraries and exact values:** native C/C# interop, generated bindings and stepped decimals that stay exact as C# `decimal` parameters and results.
* **Local inference:** Qwen3-8B Q4_K_M at 150–151 decode tokens/second on an RTX 4090, up to 2,357 aggregate tokens/second across 32 sequences, and Qwen3-Coder-30B-A3B at 200 decode tokens/second. [Measurements and conditions](MachineLearning.md) separate decode, prefill and batching.
* **Memory and build size:** generational collection, deferred reference counting and allocation reuse are implemented. Native `Vector2` and `Size` pack two 32-bit floats into one slot. Smaller compiler and `Release` builds can shrink further with `strict build <file> small`; fast remains the default, since size optimization can cost up to 20% execution speed on demanding paths. Memory tuning continues across workloads.
* **Real applications:** the growing DeltaEngine game collection, SoulCraft, website logic and the compiler itself are all driving development.

See the [October 16 update](/blog/2026/10/16/strict-live-feedback-qwen3-and-interop) for the full story.

# Key design decisions

1. **Immutable expression tree.** Static analysis only, no runtime state sneaks in.
2. **Validation before execution.** Catch the trivial stuff early, let the VM handle the hard parts.
3. **The VM is king.** Only the virtual machine or the native executable sees real values and side effects. Everything before it is compilation.
4. **One-time tests.** Tests live where the code lives, run once, then disappear from the bytecode.
5. **Strict rules first, then hardware speed.** The first priority is clean, strict rules with exactly one way to solve each problem. The second is performance and parallelism as close to the hardware as possible (CPU, GPU, NPU, TPU, CUDA, distributed over the network).

# Why this matters

Only code that is actually called is ever parsed, validated, tested and executed. This approach lets you generate millions of lines of `.strict` code and immediately discard anything that isn't needed or doesn't work.

* **Fast feedback.** Formatting and type errors fail instantly, long before the VM.
* **Deterministic builds.** Immutable trees plus one canonical code style mean no drift. `strict` even builds itself byte-identically.
* **Lean bytecode.** By the time code reaches the VM, dead weight is already gone.

# Where to go next

* [Getting Started](GettingStarted.md): bootstrap the compiler, then run, test and build your first program.
* [Types](Types.md), [Members and Variables](Variables.md), [Methods](Methods.md), [Tests](Tests.md): the building blocks.
* [Statements and Expressions](Statements.md), [If](If.md), [For](For.md), [Lists and Dictionaries](Lists.md), [Errors](Errors.md): the language guide.
* [Base Types](BaseTypes.md), [Architecture](Architecture.md), [Examples](Examples.md): what each source file in the repository does.

# History

[Benjamin Nitschke](https://BenjaminNitschke.com) first wanted to write his own programming language in the 1990s, after reading his favorite book, "Gödel, Escher, Bach" by Douglas R. Hofstadter, as a child. The first iteration was built in 2008–2010. It worked, but it lacked integration and was dropped in favor of Lua. The current repository started on 2020-06-16 as an experiment in editor plugins and rethinking low-level parsing, using the [old Strict SDK](https://github.com/strict-lang/sdk) as a guide. A few Delta Engine employees helped from 2020 to 2022 (see the [blog](/blog)).

In mid 2025 Benjamin picked the project up again, working alone. In 2026 the C# implementation was converted step by step into `.strict` files, until Strict could compile itself natively. The goal is still the original one: a base layer that computers can actually understand and build on. Think of the way DNA and proteins are the building blocks of life, even though day to day we don't really think about them much.

# References

* [Structure and Interpretation of Computer Programs](https://web.mit.edu/alexmv/6.037/sicp.pdf): a great way to learn functional programming in Lisp/Scheme.
* [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Uncle Bob: the best guide to the test-driven, clean style Strict enforces.
* [Gödel, Escher, Bach](https://en.wikipedia.org/wiki/G%C3%B6del,_Escher,_Bach) by Douglas R. Hofstadter.
