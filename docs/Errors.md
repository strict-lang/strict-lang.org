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

# Errors stop execution

You can't use an error as a normal value. Using it, or any expression on its own line that isn't true, stops execution and shows the error message with clickable `file:line` locations pointing back into the `.strict` source. Each location is a [`Stacktrace`](https://github.com/strict-lang/Strict/blob/master/Stacktrace.strict):

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
