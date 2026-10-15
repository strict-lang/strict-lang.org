---
id: Keywords
title: Keywords
sidebar_label: Keywords
---

Strict needs very few keywords. Most code can only be written in one way, so swapping arguments or changing the style usually means the code no longer compiles, or at least doesn't behave the same way. You will understand any `.strict` code you read. Writing it is harder because of all the strict rules.

Keywords and operator words can't be used as names.

# Declarations

| Keyword | Meaning | See |
|---------|---------|-----|
| `has` | Member that is set once when the instance is created | [Members and Variables](Variables.md) |
| `constant` | Member or variable computed only from constants, always optimized away | [Members and Variables](Variables.md) |
| `let` | Variable that doesn't change | [Members and Variables](Variables.md) |
| `mutable` | Member or variable that may change (parameters never do) | [Members and Variables](Variables.md) |
| `with` | Constraint on a member or parameter | [Types](Types.md#constraints-with-with) |
| `from` | Custom constructor | [Types](Types.md#creating-instances) |

# Control flow

| Keyword | Meaning | See |
|---------|---------|-----|
| `if`, `else` | Conditional blocks, `else if` chains and selector `if` | [If](If.md) |
| `then` | Single-line conditional `condition then a else b` and selector cases | [If](If.md) |
| `for` | The only loop, also the `for` method that makes a type iterable | [For](For.md) |
| `as long as` | Repeat a `for` while its condition is true | [For](For.md#condition-controlled-loops) |
| `in` | Containment (`is in`), and naming a loop variable | [For](For.md) |
| `return` | Leave a method early with a value | [Methods](Methods.md) |

# Operators

| Keyword | Meaning |
|---------|---------|
| `is`, `is not` | Equality, also used by every test |
| `is in`, `is not in` | Containment |
| `and`, `or`, `xor`, `not` | Logic, as English words instead of C symbols |
| `to` | Conversion: `5 to Text`, and conversion methods like `to Number` |
| `+` `-` `*` `/` `%` `^` `<` `>` `<=` `>=` | Arithmetic and comparison |
| `=` | Assignment. Equality is always `is` |
| `()` | Lists, which includes method parameters and call arguments. An empty `()` is never written |

# Implicit names

| Name | Meaning |
|------|---------|
| `value` | The instance in a method, the current element in a `for` loop, the member value in a `with` constraint |
| `index` | The position in a `for` loop, starting at 0 |
| `outer` | The `value` from outside the current `for` loop |
| `true`, `false` | The two `Boolean` values |
| `None` | The state of an optional value that was never set, see [`or None`](Types.md#optional-values-with-or-none) |

# Base types

The base types in the [repository root](https://github.com/strict-lang/Strict) are always available, everything else is found by name. [Base Types](BaseTypes.md) describes each of them:

`Any`, `Boolean`, `Byte`, `BytesReader`, `BytesWriter`, `Character`, `Closeable`, `Dictionary`, `Directory`, `Enum`, `Error`, `ErrorWithValue`, `File`, `Generic`, `HashCode`, `Iterator`, `Length`, `Library`, `List`, `Logger`, `Method`, `Mutable`, `Name`, `Number`, `Path`, `Process`, `ProcessResult`, `Range`, `Stacktrace`, `Text`, `TextReader`, `TextWriter`, `Type`, `Variable`

# Package structure

A Strict package is a folder:

* Every type is a `.strict` file. Subfolders are packages of their own.
* A `README.md` explains the package and should show how to use it. This is the only place for explanations, because code has no comments.
* `.editorconfig` sets up any editor for tabs and the Strict style.

See [Grammar](Grammar.md) for the complete syntax.
