---
id: Variables
title: Members and Variables
---

# Members

Members are always defined at the top of a type file, before any method. They are like fields in other languages, but they can do much more: a type is [composed](Types.md#composition-instead-of-inheritance) of its members and can be used as any of them. If a member is a trait, the type must implement all trait methods.

There are three kinds of members:

| Keyword | Meaning |
|---------|---------|
| `has` | The default. Set once when the instance is created, never changed afterwards. |
| `constant` | Never changes and only depends on other constants. Think `static readonly`, but it covers far more than in other languages, and it propagates upward: anything composed only of constants is a constant too. Constants are always precomputed and optimized away, even complex operations. |
| `mutable` | The value is allowed to change. Rarely used, mostly for optimizations. Avoid it otherwise, because mutable values make automatic parallelization harder. |

```
has number
has Name
has Start Number
has iterator Iterator(Vector2)
has Alpha = 1 with value >= 0 and value <= 1
constant Epsilon = 0.00001
constant NewLine = Character(10)
mutable Colors with Length is Size.Length
```

* **The name implies the type.** `has number` is a `Number` and `has logger` is a `Logger`. If the name already says it, don't repeat the type: write `has number`, not `has number Number`. When the name is different from its type, write the type after it: `has Start Number`.
* **Names starting with an uppercase letter are public**, lowercase names are private to the type. A private member that is never used is a [validation error](CodeValidations.md).
* **Initial values** use `=`. A `has` member computed from constants, like `has number = 17 + 4`, must be a `constant` instead.
* **Constraints** use `with`, see [Types](Types.md#constraints-with-with).

[`Variable.strict`](https://github.com/strict-lang/Strict/blob/master/Variable.strict) is how Strict itself describes a named value. This is all of its code:

```
has Name
has Type
has InitialValue Generic or None
has IsMutable = false
has IsConstant = false
to Text
	Variable("count", "Number" to Type) to Text is "count Strict.Number"
	Name + " " + Type
```

# Variables

Variables are created inside a method body. They look almost the same as members, but their scope is much smaller:

| Keyword | Use it for |
|---------|------------|
| `constant` | Values computed only from constants. They are always optimized away. |
| `let` | Everything else that doesn't change, for example a value computed from a member or parameter that is different for each instance. |
| `mutable` | Only when a value really changes, usually a counter in a loop. |

```
Floor Number
	1.Floor is 1
	2.4.Floor is 2
	(0 - 2.4).Floor is -3
	0.1.Floor is 0
	let fraction = value % 1
	fraction < 0 then value - fraction - 1 else value - fraction
```

A `mutable` variable is reassigned with `=`. Mutable variables are not dangerous as long as they don't leave their scope. From [`Text.strict`](https://github.com/strict-lang/Strict/blob/master/Text.strict):

```
TrimStart Text
	" hi ".TrimStart is "hi "
	mutable startIndex = 0
	for characters
		if value is in (" ", "\t", "\n", "\r")
			startIndex = startIndex + 1
		else
			return Substring(startIndex, Length - startIndex)
	""
```

The compiler checks the rules for you. A variable that is never used, a `mutable` that never changes, or a variable that hides a member with the same name are [validation errors](CodeValidations.md).

# Computed names

`name = expression` inside a method defines a computed name, evaluated again whenever it is used rather than storing one result like `let`. A type can expose a computed method the same way: `Area = Width * Height` infers its return type. Use this when the expression should follow the current values it depends on.

# `value`

`value` is the instance itself, like `this` or `self` in other languages, but you rarely need to write it. Members and methods of the instance are used directly, and inside a `for` loop `value` is the current element (see [For](For.md)). From [`Number.strict`](https://github.com/strict-lang/Strict/blob/master/Number.strict):

```
Absolute Number
	-1.Absolute is 1
	1.Absolute is 1
	value < 0 then 0 - value else value
```

Because `value` is always defined, a parameter or variable can't be called `value`.

# Values never change

Strict values are immutable. Even a `mutable` list never changes. `list + element` creates a new list, and a `mutable` variable can only be reassigned to such a new value:

```
mutable issues = List(Mutable(ValidationIssue))
for lines
	issues = issues + LineIssues(value, index)
```

Internally the runtime doesn't copy anything here. It keeps the same list, appends in place, and hands back the same memory as the new list, because the previous version is no longer used. If an old version is changed again, the runtime has to copy, and that is bad code: a list is either fixed, or growing, and then only its latest version is used.

Methods that change a value return `Mutable(Type)` and are only allowed on mutable values:

```
Increment(amount = 1) Mutable(Number)
	Mutable(5).Increment.Decrement.Increment is 6
	Mutable(4).Increment(4) is 8
	value = value + amount
```

```
mutable count = 0
for text
	if value is "("
		count = count.Increment
```

# Parameters never change

Parameters can't be `mutable`. A method that changes what it is given makes a mutable copy and returns it, as [`ImageProcessing/AdjustBrightness.strict`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/AdjustBrightness.strict) does:

```
Process(image) Image
	...
	mutable adjusted = image
	for adjusted.Size
		adjusted.Colors(index) = GetBrightnessAdjustedColor(adjusted.Colors(index) to ColorValue)
	adjusted
```

The value the caller passed in stays unchanged, and the caller uses the result: `let image = AdjustBrightness(0.25).Process(Image(Size(width, height)))`. A `mutable` parameter is the [validation error](CodeValidations.md) `ParameterMustNotBeMutableReturnTheChangedValue`.
