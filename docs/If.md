---
id: If
title: If
---

`if` is the only conditional in Strict. It comes in three forms: the block `if`, the single-line `then … else`, and the selector `if`, which works like `switch` or `match` in other languages. Like everything in Strict, all three are expressions and have a value.

# Block if

```
if value > 0
	value
```

The condition is any `Boolean` expression, and the block below it is indented with one more tab. `else` and `else if` are optional:

```
if value is "("
	parentheses = parentheses.Increment
else if value is ")"
	parentheses = parentheses.Decrement
else if parentheses is 0
	value
```

An `if` often leaves a method early with `return`. From [`Examples/FizzBuzz.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/FizzBuzz.strict):

```
Classify Text
	FizzBuzz(3).Classify is "Fizz"
	FizzBuzz(5).Classify is "Buzz"
	FizzBuzz(15).Classify is "FizzBuzz"
	FizzBuzz(7).Classify is "7"
	if number % 15 is 0
		return "FizzBuzz"
	if number % 3 is 0
		return "Fizz"
	if number % 5 is 0
		return "Buzz"
	number to Text
```

When an `if` with an `else` is the last line of a method, the value of the branch that runs is the result. No `return` is needed:

```
AddIfEven(current Number, next Number) Number
	EvenFibonacci(100).AddIfEven(2, 4) is 6
	EvenFibonacci(100).AddIfEven(2, 3) is 2
	if next % 2 is 0
		current + next
	else
		current
```

Inside a `for` loop, an `if` without `else` filters values, see [For](For.md#filtering).

# Single-line then … else

A single-line conditional is used to return or assign a simple value based on a condition. It works like `?:` in C, C# or Java, but uses `then` and `else` like F#, Scala or Haskell. It must fit in one line.

```
value > 0 then value else 0
```

C#:
```csharp
var result = value > 0 ? value : 0;
```

Scala or Haskell:
```scala
val result = if value > 0 then value else 0
```

Conditionals can be chained. From [`Number.strict`](https://github.com/strict-lang/Strict/blob/master/Number.strict):

```
Clamp(minimum = 0, maximum = 1) Number
	1.7.Clamp(0.5, 1.5) is 1.5
	0.3.Clamp is 0.3
	-0.8.Clamp(-0.5, 0.5) is -0.5
	value > maximum then maximum else value < minimum then minimum else value
```

A conditional that is one of several arguments needs brackets: `Text(value, (isShort then 2 else 4))`.

# Selector if

The selector `if` starts like a block `if`, but the `if` line ends with `is` (or `is not`). Each line below it is a case with a value and `then`. It works like `switch` or `match` in other languages, but it is more powerful: a case can be any expression, any arithmetic or comparison, or a type check. From [`Examples/ArithmeticFunction.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/ArithmeticFunction.strict):

```
has first Number
has second Number
Calculate(operation Text) Number
	ArithmeticFunction(10, 5).Calculate("add") is 15
	ArithmeticFunction(10, 5).Calculate("subtract") is 5
	ArithmeticFunction(10, 5).Calculate("multiply") is 50
	if operation is
		"add" then first + second
		"subtract" then first - second
		"multiply" then first * second
		"divide" then first / second
```

The same in other languages:

```csharp
var result = operation switch
{
	"add" => first + second,
	"subtract" => first - second,
	"multiply" => first * second,
	"divide" => first / second,
	_ => throw new InvalidOperationException("Unknown operation: " + operation)
};
```

```scala
val result = operation match
	case "add" => first + second
	case "subtract" => first - second
	case "multiply" => first * second
	case "divide" => first / second
	case _ => "Unknown operation"
```

```haskell
let result = case operation of
	"add" -> first + second
	"subtract" -> first - second
	"multiply" -> first * second
	"divide" -> first / second
	_ -> "Unknown operation: " ++ operation
```

The last line can be an `else` case:

```
Name Text
	Count(1).Name is "one"
	Count(5).Name is "many"
	if number is
		1 then "one"
		2 then "two"
		else "many"
```

**If there is no `else` case and no case matches, an `Error` is created and thrown automatically at runtime.** You don't need to write a default case that throws, like the C# `_ => throw` above.

Cases can also check types. From [`HashCode.strict`](https://github.com/strict-lang/Strict/blob/master/HashCode.strict):

```
from(generic)
	HashCode(5) is 5
	HashCode("abc") is 3
	HashCode((1, 2)) is 2
	if generic is
		Number then generic
		Iterator then generic.Length
		else 0
```

Like any `if`, a selector `if` can be the body of a `for` loop, where `value` is the current element, see [For](For.md).
