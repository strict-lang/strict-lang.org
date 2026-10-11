---
id: CodingStyle
title: Coding Style
---

In most languages a coding style is a guideline. In Strict it is the language. Code that violates the rules doesn't compile, and there are no warnings, only errors. You can still write useless or senseless code, but not unclean code in the sense of [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882), and the result always looks the same, no matter if a human or a computer wrote it.

[TDD](https://en.wikipedia.org/wiki/Test-driven_development) and clean code are the basis of Strict. Strict looks most like Python, but it is much shorter and more compact. There are no curly brackets, no semicolons and no empty lines, comments don't exist, and methods are only a few lines long.

# Limits

Line, method, member and nesting limits are checked by [`Validators/Limits.strict`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict) when you run `NativeCompiler check`:

| Code block | Limit | Notes |
|-----------:|------:|:------|
| Characters per line | 120 | Short lines are easier to read |
| Lines per method | 13 | Including the header and the tests. Good methods have 1-5 lines of code |
| Parameters per method | 4 | Keep them to a minimum, 0-2 is best |
| Methods per type | 15 | Split bigger types into smaller ones |
| Members per type | 15 | Types that only contain constants (enums) may have 40 |
| Nesting depth | 5 | Don't indent too much |
| Name length | 2-50 characters | No single letters, no novels |
| Tests per method | at least 1 | Every method starts with tests |

# Formatting

There is exactly one way to format Strict code:

* Indent with tabs only, one tab per level. A tab shows as two spaces.
* One expression per line, no line continuations.
* No empty lines, no trailing whitespace, no whitespace-only lines, and no blank lines at the end of a file.
* No comments. Explanations go into a `README.md` next to the code.
* No empty brackets: `Run`, not `Run()`. `numbers.Sum`, not `numbers.Sum()`.
* Arguments and list elements are separated by `, `.
* UTF-8 without a byte order mark, `\n` line endings.

# One way to do things

* **Members don't repeat their type** when the name already says it: `has number`, not `has number Number`.
* **`constant`** for values computed only from constants, **`let`** for everything else that doesn't change, **`mutable`** only when a value really changes, like a loop counter.
* **Values never change.** `list + element` gives a new list, and a `mutable` variable can only be reassigned to such a new value. Never change an old version of a list. A list is either fixed, or growing and then only its latest version is used.
* **Tests are Boolean comparisons** at the start of every method. `is true` is never written.
* **Other packages are written as `Package/Type`** only in declarations: members, parameters and return types. Method bodies use the plain type name.
* **`is` has the lowest precedence.** Write `(a is b) and (c is d)`, see [precedence](Statements.md#precedence).
* **A conditional as one of several arguments needs brackets:** `Text(value, (isShort then 2 else 4))`.
* **Keywords and operator words** (`from`, `to`, `is`, `in`, `and`, `or`, `not`, `constant`, `mutable`, `let`, ...) can't be names. A parameter can't be called `value` either, because that is always the instance.
* **No duplicated code.** Use what exists: `Text.Combine` instead of joining texts in your own loop, `Length` instead of `characters.Length`. Strict replaces reimplemented code with the existing method.

# Naming

* Types, public members and public methods start with an uppercase letter: `Number`, `Start`, `Floor`.
* Private members, parameters and variables start with a lowercase letter: `number`, `startIndex`.
* Names describe what something is, not how it is stored: `count`, not `iCount` or `countNumber`. See [Naming](Naming.md).
* Lists are plurals: `numbers`, `Texts`, `ValidationIssues`.

# Refactoring

In most languages refactoring means cleaning up the mess programmers make while experimenting, learning or writing code quickly. [Refactoring.guru](https://refactoring.guru/refactoring/what-is-refactoring) is a great catalog of refactorings and code smells. In Strict, code that violates these rules simply doesn't compile, so most code smells can't happen in the first place. Methods are short, types are small, nothing is unused, and nothing is duplicated.

# Recommended reading

None of these guides are about Strict, but they explain why a clear set of rules matters so much for flexible languages like C, Java, C# or Python. In Strict the compiler enforces the rules, so you don't need a guide to follow them. Still, these are great reads:

- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882): the best book on TDD and the SOLID principles.
- [Code Complete 2](https://www.amazon.com/gp/product/0735619670/): a good handbook of programming best practices.
- [Flutter Style Guide](https://github.com/flutter/flutter/wiki/Style-guide-for-Flutter-repo): a great read for Dart, with good sections on philosophy, laziness and policies.
- [Twitter Style Guide](https://github.com/twitter-archive/commons/blob/master/src/java/com/twitter/common/styleguide.md#recommended-reading): a detailed and precise Java guide with tests and best practices.
