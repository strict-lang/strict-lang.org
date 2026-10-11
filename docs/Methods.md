---
id: Methods
title: Methods
---

Methods follow the members of a type. A method has a header line that is not indented and a body indented with one tab.

```
Clamp(minimum = 0, maximum = 1) Number
	1.7.Clamp(0.5, 1.5) is 1.5
	0.3.Clamp is 0.3
	-0.8.Clamp(-0.5, 0.5) is -0.5
	value > maximum then maximum else value < minimum then minimum else value
```

# The header

`Name(parameters) ReturnType`

* **No parameters, no brackets.** Empty `()` are never written: `Floor Number`, `Run`, `Close`.
* **No return type** if the method returns nothing: `Run`, `Delete`, `Log(text)`.
* **Parameters are named like members.** If the name says the type, the type is left out: `Log(text)`, `from(path)`, `Index(other Generic)`, `Substring(start Number, length Number)`.
* **Default values** make parameters optional: `Increment(amount = 1)`, `Combine(texts Texts, separator = ", ")`, `IsNearlyEqual(other, difference = Epsilon)`. A call can leave them out: `0.3.Clamp`.
* **Parameters never change.** There are no `mutable` parameters. A method that changes what it is given works on a mutable copy and returns it: `Process(image) Image`, see [Members and Variables](Variables.md#parameters-never-change).
* **At most 4 parameters.** If you need more, the method is doing too much.

Methods may share a name if their parameter types differ. `List` has both `+(other) List` (add a list) and `+(generic) List` (add one element), and `Enum` has `GetName(type)` and `GetName(member Variable)`.

# The body

1. **Tests first.** Every method starts with at least one test line, see [Tests](Tests.md).
2. **Then the code.** One [statement or expression](Statements.md) per line.
3. **The last line is the result.** `return` is only needed to leave the method earlier.

```
Index(other Generic) Number
	(1, 2, 3).Index(2) is 1
	(1, 2, 3).Index(9) is -1
	for elements
		if value is other
			return index
	-1
```

`if` and `for` are expressions too, so a method can end with them. A method that ends with a `for` loop returns the combined loop result: a list, a sum, a concatenated text, or for a `Boolean` method, whether any iteration was true. See [For](For.md#the-for-result).

A method may be at most 13 lines long, including its header and tests. There are no empty lines and no comments.

# Calling methods

```
"hello".StartsWith("hel")
2.4.Floor
(1, 2, 3).Sum
Text.Combine(value).ToBrackets
logger.Log("Hi")
Mutable(5).Increment.Decrement.Increment
```

* Calls without arguments have no brackets: `numbers.Sum`, `text.Length`.
* Methods and members of the current instance are called directly, without `value.`: `Substring(0, 1).Upper`, `Length`, `IsEven`.
* Constants, and methods that don't use any member of an instance, are called through the type name: `Text.Combine(...)`, `Character.NewLine`, `InstructionType.Add`.
* Arguments are separated by `, `. A list is written with brackets, so many methods simply take a list: `Combine(("a", "b"), "")`.

# Operators are methods

Operators are methods with an operator as their name. They work for your own types exactly like for the base types. From [`Number.strict`](https://github.com/strict-lang/Strict/blob/master/Number.strict):

```
+(other) Number
	3 + 4 is 7
	value + other
>=(other) Boolean
	0 >= 0
	value >= other
```

[`Examples/Register.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Register.strict) defines arithmetic for a type with three numbers:

```
has RZero Number
has ROne Number
has RTwo Number
+(other Register) Register
	Register(0, 1, 2) + Register(1, 2, 3) is Register(1, 3, 5)
	Register(RZero + other.RZero, ROne + other.ROne, RTwo + other.RTwo)
```

Now `Register(0, 1, 2) + Register(1, 2, 3)` calls this method.

# Special methods

| Method | Purpose | Example |
|--------|---------|---------|
| `from(...)` | Custom constructor, called as `Type(...)` | `from(text)` in [`Character.strict`](https://github.com/strict-lang/Strict/blob/master/Character.strict) |
| `to Type` | Conversion, called as `value to Type` | `to Text`, `to Number`, `to Character` |
| `is(other)` | Equality, called as `a is b` and `a is not b` | `is(other) Boolean` in [`Text.strict`](https://github.com/strict-lang/Strict/blob/master/Text.strict) |
| `in(...)` | Containment, called as `a is in b` and `a is not in b` | `in(number) Boolean` in [`Range.strict`](https://github.com/strict-lang/Strict/blob/master/Range.strict) |
| `for` | Defines how a type is iterated in a `for` loop | `for Iterator(Number)` in [`Range.strict`](https://github.com/strict-lang/Strict/blob/master/Range.strict) |
| `not`, `and`, `or`, `xor` | Logic operators | [`Boolean.strict`](https://github.com/strict-lang/Strict/blob/master/Boolean.strict) |
| `Run` | Entry point for `NativeCompiler run` and `build` | [`Examples/HelloLogger.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/HelloLogger.strict) |

[`Any.strict`](https://github.com/strict-lang/Strict/blob/master/Any.strict) gives every type a default `from`, `to Type`, `to Text`, `to HashCode` and `is`.

# Methods that change a value

A method that changes its instance returns `Mutable(Type)` and assigns to `value`. It can only be called on a mutable value:

```
Add(element Generic) Mutable(List)
	(1, 2).Add(3) is (1, 2, 3)
	("a", "b").Add("c") is ("a", "b", "c")
	value = value + element
```

See [Members and Variables](Variables.md#values-never-change) for why this still doesn't change any value.

# Methods without a body

Trait methods have only a header. The type that has the trait implements them, see [Traits](Types.md#traits). A few base methods without a body, like `Directory.Exists` or `File.Delete`, are implemented by the native runtime.
