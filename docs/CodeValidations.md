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

The validators are written in Strict, in the [`Validators`](https://github.com/strict-lang/Strict/tree/master/Validators) package. [`ValidateCheck`](https://github.com/strict-lang/Strict/blob/master/Validators/ValidateCheck.strict) runs [`TypeValidator`](https://github.com/strict-lang/Strict/blob/master/Validators/TypeValidator.strict), [`Limits`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict) and [`Names`](https://github.com/strict-lang/Strict/blob/master/Validators/Names.strict) on each file. The [VS Code extension](GettingStarted.md#visual-studio-code) shows the issues in the editor.

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

# Name rules

These come from [`Names`](https://github.com/strict-lang/Strict/blob/master/Validators/Names.strict), see [Naming](Naming.md):

| Rule | Meaning |
|------|---------|
| `CannotUseKeywordsAsName` | A member, variable or parameter is named like a keyword, for example `has from Text` or `let constant = 1`. |
| `ListPrefixIsNotAllowedUseImplementationTypeNameInPlural` | A member or method is named `List…` or `list…`. Use the plural of the element type instead, like `numbers`. |
| `ConstantNameMustNotBeATypeOrMethodName` | A constant has the name of a type or of a method of its type, like `constant Number = 3`. |

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

Some rules are part of compiling a type rather than `check`:

* Every method needs at least one test, see [Tests](Tests.md).
* Every name must be known: a member, parameter, variable, `value`, `index`, `outer`, or a type of this package, the base types or a referenced package. [`Expressions/FileCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/FileCheck.strict) and [`Expressions/ResolveCheck`](https://github.com/strict-lang/Strict/blob/master/Expressions/ResolveCheck.strict) report names that can't be resolved.
* Types must fit: assigning, comparing or passing incompatible types is an error.
* Constants are folded, and [`Validators/ConstantCollapser`](https://github.com/strict-lang/Strict/blob/master/Validators/ConstantCollapser.strict) reduces constant subexpressions like `"5" to Number` to their value.

# Planned

* A `let` with only constant values must be `constant`. This isn't checked for list literals yet.
* Finding duplicated code and replacing it with the existing implementation, for example a hand-written join loop with `Text.Combine`, or `Text.characters.Length` with `Text.Length`.
* Rejecting double brackets where the arguments are turned into a list automatically: `ReverseList(1, 2, 3)` instead of `ReverseList((1, 2, 3))` when the only member is a list.
