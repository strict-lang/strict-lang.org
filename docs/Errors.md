---
id: Errors
title: Errors
---

Strict has no exceptions, no `throw`, no `try` and no `catch`. An error is a value of type [`Error`](https://github.com/strict-lang/Strict/blob/master/Error.strict), and this is its complete source:

```
has Name
has Stacktraces
```

# Returning errors

Define an error as a constant with a descriptive name and return it like any other value. Tests can compare against it. From [`Character.strict`](https://github.com/strict-lang/Strict/blob/master/Character.strict):

```
to Number
	Character("3") to Number is 3
	constant notANumber = Error
	Character("A") to Number is notANumber
	let result = number - zeroCharacter
	result is in Range(0, 10) then result else notANumber(value)
```

The constant's name tells the caller what went wrong, and the error records where it happened. Calling it with a value, like `notANumber(value)`, creates an [`ErrorWithValue`](https://github.com/strict-lang/Strict/blob/master/ErrorWithValue.strict), which also keeps the value that caused the problem:

```
has Error
has Value Generic
```

More examples from the base types:

```
constant KeyNotFound = Error
abbreviations("C") is KeyNotFound
constant DuplicateKey = Error
Dictionary((1, 1)).Add(1, 1) is DuplicateKey
constant listsHaveDifferentDimensions = Error
(1) * (1, 2) is listsHaveDifferentDimensions
```

A method can return its normal type or an error, and tests can check for any error with `is Error`:

```
Character("ab") is Error
Numbers.X is Error
(1).Y is Error
```

An error can also be created with a message: `Error("Cannot downcast Text to Number for list: Text \"Hi\"")`.

# Handling an error

Keep the result, check it, then use the normal value. From [`Examples/ErrorHandling.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/ErrorHandling.strict):

```
Checked Number
	ErrorHandling(5).Checked is 10
	ErrorHandling(0).Checked is 0
	let found = Found
	if found is Error
		return 0
	found * 2
```

`is Error` matches any error; `is Missing` or `is Error("Missing")` matches a named one. `found is in (Missing, Error("Other"))` matches several. Inside `if found is Error`, `found` is treated as an Error, so `found.Name` and `found to Text` are available.

# Errors stop execution

An error must be handled where it appears. You can return it, keep it in a `let` or `mutable` variable, or compare it against an error. Arithmetic, comparisons such as `<`, conditions, calls, arguments, storing an error in a member or list, or dropping it as a statement immediately stop the current method and return that error to its caller. Each caller adds a stack frame.

A failed test reports the error as its actual value. An unhandled error reaching `Run` prints `Error: Name` and its stack trace and exits with code 1. A standalone Boolean expression must also be true; otherwise it fails. Each trace location points into the `.strict` source and is a [`Stacktrace`](https://github.com/strict-lang/Strict/blob/master/Stacktrace.strict):

```
has Method
has FilePath Text
has Line Number
to Text
	"	at " + Method + " in " + FilePath + ":line " + Line
```

Strict creates some errors for you:

* A [selector `if`](If.md#selector-if) without `else` where no case matches.
* Creating an instance that breaks a [`with` constraint](Types.md#constraints-with-with), like `Byte(300)`.
* Using a value as a type it isn't, like a failed cast in other languages.
* A conversion that can't work, like `10 to Character`.

In native executables an `Error` is tagged inside the 64-bit value itself, so `x is Error` works for a value of any type.

# Read failures in the editor and host

[SCrunch](VSCode.md) shows a failing test's Error as its actual value, with source locations and execution feedback beside the code. Errors and normal text have distinct value formatting, so a text such as `"Error: Missing"` is not confused with an Error value.

Exported [C/C# libraries](UsingApis.md#call-strict-from-c-and-c) report errors across the boundary; the generated C# wrapper turns them into `InvalidOperationException`. Decimal range failures use `DecimalOverflow`.
