---
id: Statements
title: Statements and Expressions
---

Everything in Strict is an expression. Each line of a method body holds exactly one, and `if` and `for` produce values too. There are no semicolons, no curly brackets, no line continuations and no empty lines. Blocks are indented with one more tab than their parent line.

An expression that stands on its own line and returns a `Boolean` must be true, otherwise execution stops with an error. That is how [tests](Tests.md) work, and it works the same way everywhere else.

# The statements

These are all the kinds of lines that can appear in a method body:

| Statement | Example | See |
|-----------|---------|-----|
| Test | `(1, 2, 3).Sum is 6` | [Tests](Tests.md) |
| Constant | `constant notANumber = Error` | [Members and Variables](Variables.md) |
| Let | `let fraction = value % 1` | [Members and Variables](Variables.md) |
| Mutable | `mutable startIndex = 0` | [Members and Variables](Variables.md) |
| Reassignment | `startIndex = startIndex + 1` | [Members and Variables](Variables.md) |
| Element assignment | `image.Colors(index) = GetBrightnessAdjustedColor(normalized)` | [Lists](Lists.md) |
| Method call | `logger.Log("Hi")` | [Methods](Methods.md) |
| Return | `return index` | [Methods](Methods.md) |
| If | `if value is other` | [If](If.md) |
| Selector if | `if operation is` | [If](If.md#selector-if) |
| For | `for elements` | [For](For.md) |
| Expression | `value * (1 - percentage) + other * percentage` | below |

The last line of a method is its result, so a method usually ends in an expression, an `if` or a `for`.

# Literals

| Type | Literals |
|------|----------|
| [`Number`](https://github.com/strict-lang/Strict/blob/master/Number.strict) | `5`, `-17`, `2.4`, `0.00001`, `1e10` |
| [`Text`](https://github.com/strict-lang/Strict/blob/master/Text.strict) | `"Hello"`, `""`, with the escapes `\"`, `\\`, `\t`, `\n` and `\r` |
| [`Boolean`](https://github.com/strict-lang/Strict/blob/master/Boolean.strict) | `true`, `false` |
| [`List`](https://github.com/strict-lang/Strict/blob/master/List.strict) | `(1, 2, 3)`, `("a", "b")`, `((1, 1), (2, 2))` |

All numbers are 64-bit floating point numbers. A [`Character`](https://github.com/strict-lang/Strict/blob/master/Character.strict) is a number too, and a `Text` is a list of characters.

# Operators

| Operators | Meaning | Examples |
|-----------|---------|----------|
| `+` `-` `*` `/` `%` `^` | Arithmetic, `%` is the remainder, `^` the power | `7 % 4 is 3`, `2 ^ 2 is 4` |
| `>` `<` `>=` `<=` | Comparison | `3 > 1` |
| `is`, `is not` | Equality | `"A" is "A"`, `2 is not 3` |
| `is in`, `is not in` | Containment in lists, ranges, texts and dictionaries | `3 is in (1, 2, 3)`, `"lo" is in "hello there"` |
| `and`, `or`, `xor`, `not` | Logic, written as words | `true and false is false`, `not false` |
| `to` | Conversion | `5 to Text is "5"`, `"1.3" to Number is 1.3` |
| `then` … `else` | Conditional value | `value < 0 then 0 - value else value` |

Operators work on lists element by element: `(1, 2) * 3 is (3, 6)` and `(1, 2) * (3, 5) is (3, 10)`. `+` on texts concatenates and converts numbers: `"Your age is " + 18 is "Your age is 18"`. All operators are methods, so your own types can define them, see [Methods](Methods.md#operators-are-methods).

# Precedence

Arithmetic works as in mathematics: `(1 + 2) * 3 is not 1 + 2 * 3`. These rules are worth knowing:

* **`is` has the lowest precedence.** `a is b and c is d` must be written `(a is b) and (c is d)`.
* **`is not` and `is not in` bind tighter**, so `value > 31 and value is not in (34, 92)` needs no brackets.
* **A conditional used as one of several arguments needs brackets:** `Text(value, (isShort then 2 else 4))`.
* **`(x)` is just `x`**, brackets only group. Where a single-element list is needed and the type isn't clear, build it with `List(Number) + x`.

# Lines are short

A line has at most 120 characters, and blocks can be nested at most 5 levels deep. If a line gets long, give part of it a name with `let` or move it into its own method.

# No comments

There are no comments in Strict. Code is meant to explain itself, and the tests at the top of each method show what it does. If you need to explain the bigger picture, put a `README.md` into the package folder.
