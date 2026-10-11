---
id: EverythingNeededForKata
title: Cheat Sheet
---

Everything you need on one page to solve a kata in Strict. For the details, follow the links.

# Setup

```sh
git clone https://github.com/strict-lang/Strict
cd Strict
Compiler\Bootstrap.cmd                       # or: sh Compiler/bootstrap.sh
mkdir Kata                                   # your package
NativeCompiler test Kata/MyKata.strict .     # run all tests
NativeCompiler run Kata/MyKata.strict .      # run the Run method on the Strict VM
NativeCompiler check Kata .                  # validate the style rules
```

See [Getting Started](GettingStarted.md).

# A type

The file `Kata/MyKata.strict` is the type `MyKata`. Members come first, then methods. Every method starts with tests, and its last line is the result.

```
has numbers
has logger
Doubled Numbers
	MyKata((1, 2)).Doubled is (2, 4)
	for numbers
		value * 2
Run
	logger.Log(MyKata((1, 2, 3)).Doubled to Text)
```

If a list is the only member, its elements can be passed directly: `ReverseList(1, 2, 3)`. With more members, put the list in brackets: `MyKata((1, 2))`.

# Members and variables

| Code | Meaning |
|------|---------|
| `has number` | Member, the name says the type |
| `has start Number` | Member with an explicit type |
| `has Alpha = 1` | Member with an initial value, public because it is uppercase |
| `has Width Number with value > 0` | Member with a constraint |
| `constant Max = 255` | Constant member |
| `mutable Colors` | Member that may change |
| `constant zero = 0` | Variable computed from constants |
| `let fraction = value % 1` | Variable that doesn't change |
| `mutable count = 0` | Variable that changes |
| `count = count + 1` | Reassignment of a mutable variable |

See [Members and Variables](Variables.md).

# Methods

| Header | Meaning |
|--------|---------|
| `Floor Number` | No parameters, no brackets |
| `Log(text)` | No return type, the parameter name says its type |
| `Clamp(minimum = 0, maximum = 1) Number` | Parameters with default values |
| `+(other) Number` | Operator method |
| `to Text` | Conversion, called as `value to Text` |
| `from(text)` | Custom constructor, called as `Type(text)` |

`value` is the instance. `return` is only needed to leave early. See [Methods](Methods.md) and [Tests](Tests.md).

# Expressions

```
3 + 4 * 2 is 11
7 % 4 is 3
2 ^ 3 is 8
"Your age is " + 18 is "Your age is 18"
5 to Text is "5"
"5" to Number is 5
3 is in (1, 2, 3)
"lo" is in "hello"
(1 is 1) and (2 is not 3)
value > 0 then value else 0
```

See [Statements and Expressions](Statements.md).

# If

```
if number % 15 is 0
	return "FizzBuzz"
else if number % 3 is 0
	return "Fizz"
```

```
if operation is
	"add" then first + second
	"subtract" then first - second
	else 0
```

See [If](If.md).

# For

`value` is the current element and `index` its position. What a method ending in `for` returns depends on its return type:

| Loop | Result |
|------|--------|
| `for numbers` + `value * 2` in a `Numbers` method | the list `(2, 4, 6)` |
| `for numbers` + `value` in a `Number` method | the sum |
| `for numbers` + `* value` in a `Number` method | the product |
| `for numbers` + `if value > 0` + `value` | only the positive numbers |
| `for texts` + `value` in a `Text` method | all texts concatenated |
| `for elements` + `value is other` in a `Boolean` method | `true` if any iteration is true |
| `for 10` | 0 to 9 |
| `for Range(2, 5)` | 2, 3 and 4 |
| `for Range(0, 5).Reverse` | 4 down to 0 |

```
Positives Numbers
	Kata((1, -2, 3)).Positives is (1, 3)
	for numbers
		if value > 0
			value
```

See [For](For.md).

# Lists and texts

```
(1, 2, 3).Length is 3
(1, 2, 3).Sum is 6
(1, 2, 3).First is 1
(1, 2, 3).Last is 3
(1, 2, 3) + 4 is (1, 2, 3, 4)
(1, 2, 3) - 3 is (1, 2)
(1, 2) * 3 is (3, 6)
(1, 2, 3).Reverse is (3, 2, 1)
(1, 2, 3).Index(2) is 1
"a,b".Split(",") is ("a", "b")
"hello".Substring(1, 3) is "ell"
"hello".IndexOf("ll") is 2
" hi ".Trim is "hi"
```

`numbers(0)` is the first element and `numbers(-1)` the last. See [Lists and Dictionaries](Lists.md) and [Base Types](BaseTypes.md).

# Limits

120 characters per line, 13 lines per method, 4 parameters, 15 methods, 15 members, 5 nesting levels. Tabs only, no empty lines, no comments. See [Coding Style](CodingStyle.md).
