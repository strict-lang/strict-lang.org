---
id: CodeValidations
title: Code Validations
---

After parsing, Strict runs a set of validation rules over every type. In other languages these would be warnings or linter hints. In Strict they are errors: the code isn't accepted until every issue is fixed. This keeps all code clean and makes sure every feature is used in exactly one way.

Run all validations on a package folder:

```sh
strict check Examples
```

Every issue is printed as `RuleName: target`, followed by `Validation issues: N`. The exit code is the number of issues.

The validators are written in Strict, in the [`Validators`](https://github.com/strict-lang/Strict/tree/master/Validators) package. [`ValidateCheck`](https://github.com/strict-lang/Strict/blob/master/Validators/ValidateCheck.strict) runs [`TypeValidator`](https://github.com/strict-lang/Strict/blob/master/Validators/TypeValidator.strict), [`Limits`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict), [`Names`](https://github.com/strict-lang/Strict/blob/master/Validators/Names.strict), [`DroppedResults`](https://github.com/strict-lang/Strict/blob/master/Validators/DroppedResults.strict), [`LoopBodies`](https://github.com/strict-lang/Strict/blob/master/Validators/LoopBodies.strict) and [`MagicNumbers`](https://github.com/strict-lang/Strict/blob/master/Validators/MagicNumbers.strict) on each file. The [VS Code extension](GettingStarted.md#visual-studio-code) shows the issues in the editor.

# Type rules

| Rule | Meaning |
|------|---------|
| `UnusedMemberMustBeRemoved` | A private (lowercase) member is never used in any method of the type. Remove it. |
| `UseConstantHere` | A `has` member is computed from constants only, like `has number = 17 + 4`. Make it a `constant`. |

# Method rules

These come from [`UsageRules`](https://github.com/strict-lang/Strict/blob/master/Validators/UsageRules.strict) and are checked for every method:

| Rule | Meaning |
|------|---------|
| `UnusedMethodVariableMustBeRemoved` | A `constant`, `let` or `mutable` variable is declared but never used. |
| `UnusedMethodParameterMustBeRemoved` | A parameter is never used in the method. |
| `VariableDeclaredAsMutableButValueNeverChanged` | A `mutable` variable is never reassigned or changed, so it should be `let` or `constant`. |
| `ParameterMustNotBeMutableReturnTheChangedValue` | A parameter is `mutable`. Parameters never change: change a mutable copy and return it. |
| `VariableHidesMemberUseDifferentName` | A variable has the same name as a member. |
| `ParameterHidesMemberUseDifferentName` | A parameter has the same name as a member. |
| `IsTrueIsNotNeeded` | A test line ends in `is true` although its value already is a `Boolean` call, like `Parity(2).IsEven is true`. Write `Parity(2).IsEven`. Checked by [`TestChecks`](https://github.com/strict-lang/Strict/blob/master/Validators/TestChecks.strict). |

# Name rules

These come from [`Names`](https://github.com/strict-lang/Strict/blob/master/Validators/Names.strict), see [Naming](Naming.md):

| Rule | Meaning |
|------|---------|
| `CannotUseKeywordsAsName` | A member, variable or parameter is named like a keyword, for example `has from Text` or `let constant = 1`. |
| `ListPrefixIsNotAllowedUseImplementationTypeNameInPlural` | A member or method is named `List…` or `list…`. Use the plural of the element type instead, like `numbers`. |
| `ConstantNameMustNotBeATypeOrMethodName` | A constant has the name of a type or of a method of its type, like `constant Number = 3`. |

# Numbers, loops and results

Many of these rules came out of [mutation testing](Tests.md#mutation-testing): when the same kind of surviving mutant showed up in many places, it became a rule that rejects the pattern everywhere instead of fixing it once.

| Rule | Meaning |
|------|---------|
| `NumberMustBeNamedConstant` | A magic number in a method body, like `if number is in Range(97, 123)`. Name it with a `constant` (`constant LowercaseA = 97`). Single digits, `10`, `0.5` and powers of ten like `100` or `0.01` are fine, test lines and `constant` lines are not checked. Checked by [`MagicNumbers`](https://github.com/strict-lang/Strict/blob/master/Validators/MagicNumbers.strict). |
| `LoopInvariantMustBeOutsideLoop` | In a method under 10 lines, a multiplication, division, remainder, power or longer computation inside a loop uses only values that don't change in the loop. Compute it once with a `let` before the loop. |
| `LoopGuardMustBeOutsideLoop` | An inner loop branches on a condition that doesn't change in it, with a constant or `return` branch. Check it once before the loop. |
| `LoopEdgeMustBeOutsideLoop` | An inner loop branches on its first (`index is 0`) or last iteration. Handle that iteration outside the loop. |
| `NestedLoopsMustNameIterators` | A loop whose only line is another loop must name both iterators, so `value` and `index` are never ambiguous. |
| `DroppedResultMustBeUsed` | A line only calls a method whose body is one plain expression without calls, so its result is thrown away for nothing. |
| `ZeroMinusMustBeNegation` | `0 - x` is written as `-x`. |

The loop rules are checked by [`LoopBodies`](https://github.com/strict-lang/Strict/blob/master/Validators/LoopBodies.strict) and [`LoopBody`](https://github.com/strict-lang/Strict/blob/master/Validators/LoopBody.strict). Calls and members of types or numbers (like `Process.Elapsed` or `1.Random`) count as changing. The compiler moves invariant arithmetic out of loops and peels first and last iterations by itself too, but the rules keep the source honest: a loop body only contains what really changes per iteration.

# Limits and formatting

These come from [`Limits`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict), see [Coding Style](CodingStyle.md#limits):

| Rule | Meaning |
|------|---------|
| `CharacterCountMustBeWithinLimit` | A line is longer than 120 characters. |
| `MethodLengthMustNotExceedTwelve` | A method body is longer than 12 lines, so the method is more than 13 lines with its header. |
| `NestingMoreThanFiveLevelsIsNotAllowed` | Code is indented more than 5 levels deep. |
| `ExtraWhitespacesFoundAtBeginningOfLine` | A line is indented with spaces instead of tabs. |
| `MethodCountMustNotExceedLimit` | A type has more than 15 methods. |
| `MemberCountShouldNotExceedLimit` | A type has more than 15 members, or more than 40 constants if it only has constants. |

# Rules applied while compiling

Some rules are also applied while compiling a type, so `strict test` and `strict build` report them too (`check` reports the name and type rules as well):

* Every method needs at least one test, see [Tests](Tests.md).
* Every name must be known: a member, parameter, variable, `value`, `index`, `outer`, or a type of this package, the base types or a referenced package. [`Expressions/FileCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/FileCheck.strict) and [`Expressions/ResolveCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/ResolveCheck.strict) report names that can't be resolved.
* Types must fit: assigning, comparing or passing incompatible types is an error.
* Constants are folded, and [`Validators/ConstantCollapser`](https://github.com/strict-lang/Strict/blob/master/Validators/ConstantCollapser.strict) reduces constant subexpressions like `"5" to Number` to their value.

# Mutation testing

Validation rules check how code looks, [mutation testing](Tests.md#mutation-testing) checks whether it matters. After the tests of a file pass, `strict test` changes each method in small ways (a comparison always true, `+` swapped with `-`, a call dropped, ...) and runs the tests again. A change that no test notices is a `MutationSurvived` error, so untested branches, useless checks and code that makes no difference can't hide either.

# Feedback while editing

[VS Code](VSCode.md) shows diagnostics on the affected source line, with quick fixes for formatting, unused values and naming issues. Checks also catch an incompatible return value or constructor argument (`ReturnTypeMismatch` for one element returned where a list is declared), an ambiguous name that is both a method and a type (`AmbiguousName`: write `outer.Size.Width` for the type or `value.Size.Width` for the method), a constant read through an instance instead of its type name (`ConstantNeedsTypeName`), a missing constant (`ConstantNotFound`), a dropped value and a method whose tested behavior already exists in a used type. `MethodAlreadyExists` points you toward the existing implementation.

Use **Alt+Enter** for a fix, **Fix All** for routine changes and F12 to read the existing method's tests. Line-value feedback lets you check the behavior after a change, alongside the static rules.
