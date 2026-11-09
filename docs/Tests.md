---
id: Tests
title: Tests
---

Tests are not optional in Strict and there is no test framework. Every method starts with at least one test line, and the tests show how to use the method. That is why the base library is the documentation of the language. To learn what a method does, read its first lines.

```
Count(searchFor Generic) Number
	(1, 2).Count(1) is 1
	(1, 3).Count(2) is 0
	("Hi", "Hello", "Hi").Count("Hi") is 2
	for elements
		if value is searchFor
			1
```

# See the results while you work

[SCrunch in VS Code](VSCode.md) keeps the tests close to the code: ✓/✗ marks on tests, coverage dots on implementation lines, method durations and expected/actual values on failures. The Testing view groups the project by package, type and method. Save a change to test it and its dependents, then keep editing with the result in view.

Line-value feedback shows what the tests used as they executed. Follow locals, assignments, loops and branch hits through a method without adding logging. Hover and **SCrunch: Show Tests for Line** connect a line to the tests behind it. Thousands of small tests with subsecond feedback are the goal for the editing loop; cached results are identified separately from fresh executions.

# Writing tests

* A test is a Boolean expression at the start of a method body, usually a comparison with `is`, `is not`, `>`, `<`, `is in` or `is not in`.
* `is` compares values (like `==` in C-like languages, `=` is only used for assignments). `is true` is never written at the end: an expression that already is a `Boolean`, like `"hello".StartsWith("hel")`, is a test by itself.
* Tests call the method the same way any user would: on literals (`2.4.Floor is 2`), on new instances (`FizzBuzz(3).Classify is "Fizz"`), or on constants of the type (`Sample.Issues.Length is 2`).
* Constants can serve as test data, and they can be defined right inside the test lines:

```
get(key Generic) Generic
	constant abbreviations = Dictionary(("A", "Apple"), ("B", "Ball"))
	abbreviations("A") is "Apple"
	abbreviations("B") is "Ball"
	constant KeyNotFound = Error
	abbreviations("C") is KeyNotFound
	for keysAndValues
		if value.Key is key
			return value.Value
	KeyNotFound
```

A Boolean expression standing on its own must be true, not just in tests. An unhandled Error also stops the current method and propagates to its caller, see [Errors](Errors.md).

# Running tests

```sh
strict test Examples/FizzBuzz.strict
```

`test` collects the inline tests of every method into a generated `$Tests` method and runs it on the Strict VM, in memory and without the MLIR tools. Each executed test reports its source location and elapsed time. A failed test also prints the value it actually got:

```text
Test failed: Squares(1, 2, 3).Squared is (1, 4, 9) in Squared at Kata/Squares.strict:line 3 (0.02 ms)
  got: 1
1 tests failed in Kata/Squares.strict
```

The exit code is the number of failed tests, so it plugs straight into any build script or CI. After the tests pass, `strict test` also runs [mutation testing](#mutation-testing) on the methods of the file, so passing tests alone are not enough: they also have to notice when the code changes. `strict test <file> unit` runs only the tests.

`strict build` runs the same tests before it builds anything, and a failing test stops the build. For a type without a `Run` method, `strict build Character.strict` compiles the tests natively into `Character.test.exe`. Its exit code is the number of failed tests too, this is how the native code generator is tested.

The [VS Code extension](GettingStarted.md#visual-studio-code) runs `strict test` for every file when a folder opens and again on every save, and shows the results as green and red dots next to the tests.

# Mutation testing

A test that passes says little if it would also pass with different code. Mutation testing checks exactly that: it changes the code a tiny bit (a mutant) and runs the tests again. If a test fails, the mutant is killed and everything is fine. If all tests still pass, the mutant survived, and either the tests miss a case or the changed code was never needed in the first place.

Every `strict test` of a file or folder does this automatically once the normal tests passed. Each method written in the file gets these mutants:

| Mutant | Example |
|--------|---------|
| A comparison is always true or always false, removing one side of a branch | `if total > 100` becomes `if true` |
| The result is replaced by its default | `0`, `""` or `false` instead of the computed value |
| A reassignment is dropped | `sum = sum + value` does nothing |
| A call or a list `Add` is dropped | `issues.Add(issue)` is removed |
| `+` and `-` or `*` and `/` are swapped | `total / 10` becomes `total * 10` |
| A text is emptied | `"Fizz"` becomes `""` |

A survivor is a `MutationSurvived` error with the line, what was changed and the method source, and it fails the run like a failing test:

```
Shop/Shop.strict:line 4: MutationSurvived: Discount: replaced the comparison > with true kept passing all tests, improve the tests!
  2: Discount Number
  3: 	Shop(200).Discount is 20
> 4: 	if total > 100
  5: 		return total / 10
  6: 	0
```

The only test uses a total above 100, so a `Discount` that always takes the first branch passes just as well. Adding `Shop(50).Discount is 0` kills the mutant. Most survivors are like this: a corner case nobody tested, a boundary value, a list that was never empty. Others show code that does nothing: a check that an earlier line already covers, an empty-list shortcut that gives the same result as the loop, a `Substring` length that is clamped anyway. Then the right fix is to remove the code, not to add a test.

## Why it is fast enough to run on every test

Mutants are not new source files. Strict compiles a method once into bytecode and swaps a single instruction right before execution, so a mutant needs no parsing, validation or compilation. All mutated methods of a file get their next mutant together in one round, each judged only by the tests of its own type on a fresh VM machine, so a file needs as many rounds as its most mutated method has mutants. A file with more than 16 rounds hands them to up to 16 worker processes, and folder runs test their files in parallel anyway. A mutant that loops forever stops after 100,000 steps per frame or ten times the file's normal test time.

Since unit tests take milliseconds, thousands of tests per second run on the VM. A full run over the Strict repository alone executes several million mutation tests, the projects using Strict many more. The vast majority of mutants make a test line fail somewhere, which proves the change is bad. The few that survive point at badly tested code, missed corner cases, actual bugs or unused code. The Math package takes 0.7 s without and 2.4 s with mutation testing.

Everything is tested, all the time. Every single .strict method has multiple tests, so every line runs many times, and mutation testing tries every possible change hundreds of times more. All of this runs far faster than other languages ever could, because the whole language is designed around this concept.

## Caching and skipping

Mutation testing makes a fresh test run longer, and nobody wants to wait minutes for tests. So results are cached: the test result is part of the `.strictbinary` written for each type, the mutation result is kept in `obj/Name.mutations`, and both stay valid until the source of the type changes. [VS Code](VSCode.md) only tests what the change you are currently making affects, so results still come back in under a millisecond, whole repositories retest in a few seconds in the background, and the view is always up to date. In the editor every test has run many times over already.

When you don't want to wait for mutants on the command line:

| Command | Tests | Mutation testing |
|---------|-------|------------------|
| `strict test <type or package>` | unit tests, cached | yes, for changed types |
| `strict test <type or package> unit` | unit tests, cached | no |
| `strict test <package folder> full` | everything again: `obj/` caches removed, Slow and CI tests included | all mutants |
| `strict build <file>` | unit tests, Slow ones skipped | no |
| `strict build <file> fast` | none | no |

`strict build <file> fast` is the quickest build possible: no tests, no GPU kernels (GPU loops run on the CPU) and no `Release` folder. It is great for quick iterations and small tools, not for a complex game or app or anything that needs its GPU kernels. Running LLMs or diffusion models with billions of parameters on the CPU is no fun.

## What is not mutated

Mutation testing only makes sense for code whose tests can see the change. These methods are skipped and reported:

* Base package types (the runtime and the compiler replace most of them) and `Slow` methods in folder runs.
* Methods whose tests read files, fail with a failing body (native, hosted), or take over 1 s (0.1 s in folder runs), and methods that reach file, process, socket or GPU input.
* Values that only reach Error details, log output or loop counts.

Mutation runs can't write or delete files, open sockets or run tools, so a mutant can't damage anything. Methods are compiled without loop peeling and hoisting for mutation runs, so each mutant is exactly one source edit. Folder runs skip files whose tests take over 100 ms, an explicit file run, CI and `strict test <folder> full` mutate all of them. `unit` and the test steps of `strict build` and `strict check` skip mutation testing.

# Folder tests, caches and profiling

`strict test Examples` tests a folder and its package subfolders. Successful tests write `Name.strictbinary` next to the source, containing the bytecode of used types and references to matching caches in the same package. Running, testing and building reuse this bytecode while its tracked inputs are unchanged. Inputs include source files and files read by tests through `Process.FilesRead`; replacing `strict.exe` alone does not invalidate the cache. A cached test result does not measure a fresh execution.

```sh
strict test Examples/FizzBuzz.strict lines
```

The `lines` option builds and runs tests natively. It reports how often each source line ran, its total time including callees, and its self time excluding them. It needs the LLVM tools and has native-build overhead. VS Code exposes it as **Run with Coverage** and marks slow lines. **SCrunch: Time All Tests (without cache)** forces fresh test timings.

# Values on executed lines

`strict test <file> values` runs on the VM and reports source-line hit counts and captured values. The editor uses these records for execution feedback. For values that change across repeated hits, counts and summaries describe the execution rather than pretending there is one fixed value. Text and collection summaries keep the feedback readable. For [`Examples/Fibonacci.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Fibonacci.strict):

```
Value Examples/Fibonacci.strict:line 5 hit 2 times: first = 1
Value Examples/Fibonacci.strict:line 7 hit 11 times, each: 2, 3, 4, 2, 3, 4, 5, 6, 7, 8, ...
Value Examples/Fibonacci.strict:line 8 hit 11 times, each: 2, 3, 5, 2, 3, 5, 8, 13, 21, 34, ...
```

A line with the same values on every hit shows its substituted calculation, like `sum = 5 + 3 = 8`; otherwise up to 10 values per hit follow `each:`. Test lines print nothing, because a passed test is true.

Texts, lists, records and Errors use source-like value formatting, so an actual result can be understood alongside the test that produced it. To verify suggested or unsaved code in the same project context, pass it on standard input with `strict test <file> -`. The original file stays unchanged.

For native profiling across a package, `strict test . lines` gathers tests in one build. For implementation suggestions, `strict suggest <file> <method>` checks candidates against the method's tests in one process.

[![Failing area tests showing the expected and actual values beside the source](/img/screenshots/demo-03-red.jpg)](/img/screenshots/demo-03-red.jpg)

A deliberately changed expression makes the failures visible beside their tests. The example was restored after the capture.

# Tests run once

Tests run when the code is compiled, not every time a method is called. Code that is used must have passed its tests. Once they pass, test lines are stripped from the bytecode, so they cost nothing at runtime. Tests are constant expressions, and like every constant expression in Strict they are evaluated once and then optimized away.

The tests also tell the compiler what a method is supposed to do. That's what lets Strict check, replace or even generate code later. For example, it can replace a method with an existing, equivalent one from the base library.

# Tests must be fast

All tests run in the Strict VM. It is not as fast as the generated native code (sometimes up to 100x slower), but fast enough to run all tests of huge projects and packages in milliseconds or seconds.

Every test should run in a few milliseconds. Slow or external things like files, the network or processes belong behind a trait or a type that can be replaced in tests. [`Process.strict`](https://github.com/strict-lang/Strict/blob/master/Process.strict) and [`Directory.strict`](https://github.com/strict-lang/Strict/blob/master/Directory.strict) are examples: their bodies are implemented by the native runtime, and the code using them is tested with values instead.

Fast tests are also what makes [mutation testing](#mutation-testing) possible: every mutant runs the tests of its type again, so a 1 ms test runs thousands of times per file. A unit test may take 100 ms at most (`TestDurationMustNotExceedHundredMilliseconds`), mark integration tests with `Slow(ReturnType)`.
