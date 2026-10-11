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

Every expression in Strict that stands on its own has to be true, not just tests. If it isn't, execution stops with an error.

# Running tests

```sh
NativeCompiler test Examples/FizzBuzz.strict .
```

`test` collects the inline tests of every method into a generated `$Tests` method, compiles it into a native `FizzBuzz.test.exe` and runs it. Every failing test is printed with the value it actually got:

```text
Test failed: Squares(1, 2, 3).Squared is (1, 4, 9) in Squared
  got: 1
1 failed in Kata/Squares.strict
```

The exit code is the number of failed tests, so it plugs straight into any build script or CI.

`NativeCompiler run test Examples/FizzBuzz.strict .` runs the same tests on the Strict VM. It doesn't need the MLIR tools and starts faster. The [VS Code extension](GettingStarted.md#visual-studio-code) uses it to test every file when a folder opens and again on every save, and shows the results as green and red dots next to the tests.

# Tests run once

Tests run when the code is compiled, not every time a method is called. Code that is used must have passed its tests. Once they pass, test lines are stripped from the bytecode, so they cost nothing at runtime. Tests are constant expressions, and like every constant expression in Strict they are evaluated once and then optimized away.

The tests also tell the compiler what a method is supposed to do. That's what lets Strict check, replace or even generate code later. For example, it can replace a method with an existing, equivalent one from the base library.

# Tests must be fast

Every test should run in a few milliseconds. Slow or external things like files, the network or processes belong behind a trait or a type that can be replaced in tests. [`Process.strict`](https://github.com/strict-lang/Strict/blob/master/Process.strict) and [`Directory.strict`](https://github.com/strict-lang/Strict/blob/master/Directory.strict) are examples: their bodies are implemented by the native runtime, and the code using them is tested with values instead.
