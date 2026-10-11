---
id: For
title: For
---

`for` is the only loop in Strict. It enumerates anything that can be iterated: lists, texts, numbers, ranges, dictionaries and any type with a `for` method. The syntax is closer to functional languages than to C-style loops. A `for` is an expression, and its result can filter, map, sum, multiply or concatenate values, often in two lines.

A `for` loop is also the one place where `mutable` variables make sense. The compiler works hard to avoid actual mutation at runtime, so almost all code can run without side effects and in parallel. You never write threads, processes, async code or locks. Running loops in parallel, and even on the GPU when that is faster, is up to the runtime.

# Normal iteration

```
has logger
Run
	constant someList = (1, 2, 3)
	for someList
		logger.Log(index + ": " + value)
```

This logs (the logger writes to the console by default):

```text
0: 1
1: 2
2: 3
```

You never declare a loop variable. Inside the loop body:

* `value` is the current element. Any call without an instance uses `value` by default, the same way it uses the instance in a method.
* `index` is the position, starting at 0.
* `outer` is the `value` from outside the loop. In a method, that is the instance itself.

# What can be iterated

**Numbers** loop from 0 up to the number. This logs 0 to 9 in 10 lines:

```
for 10
	logger.Log(value)
```

**Ranges** start at `Start` and stop before `ExclusiveEnd`. This logs 2, 3 and 4. Ranges can also be reversed:

```
for Range(2, 5)
	logger.Log(value)
```

```
Countdown Numbers
	Counting(3).Countdown is (2, 1, 0)
	for Range(0, number).Reverse
		value
```

**Lists** give their elements and **texts** give their characters, see [Lists and Dictionaries](Lists.md).

**Dictionaries** are lists of key and value pairs. Each element is one pair, and `value.Key` and `value.Value` are its parts:

```
for someDictionary
	if value.Key is "Apple"
		return value.Value
```

**The instance itself.** A `for` without an iterator enumerates `value`, which is the instance in a method. From [`Text.strict`](https://github.com/strict-lang/Strict/blob/master/Text.strict) and [`Range.strict`](https://github.com/strict-lang/Strict/blob/master/Range.strict):

```
Upper Text
	"HeLlo".Upper is "HELLO"
	for
		Upper
```

```
Sum Number
	Range(2, 5).Sum is 2 + 3 + 4
	Range(42, 45).Sum is 42 + 43 + 44
	for
		index
```

**Enums.** An enum type can be enumerated like a list of its values. Enumerating one enum value enumerates that value: a number counts up to it, and a text gives its characters.

```
for Connection
	logger.Log(value)
```

Enumerating an enum type is not supported by the self-hosted compiler yet. Use its values directly for now, like `(Connection.Google, Connection.Microsoft)`.

**Any type with a `for` method.** A type defines how it is iterated with a `for` method that returns an `Iterator`. `Range` simply returns its numbers:

```
has iterator
has Start Number
has ExclusiveEnd Number
for Iterator(Number)
	value
```

[`Math/Size.strict`](https://github.com/strict-lang/Strict/blob/master/Math/Size.strict) is multidimensional. It returns every `Vector2` position, so `for image.Size` visits every pixel of an image:

```
has Width Number with value > 0
has Height Number with value > 0
has iterator
for Iterator(Vector2)
	for Height
		for Width
			Vector2(index, outer.index)
```

`Size(0, 0)` or `Size(-1, 5)` are not valid, because the constraints require all dimensions to be positive.

# outer

`outer` is the `value` from outside the loop. In [`List.strict`](https://github.com/strict-lang/Strict/blob/master/List.strict) the loop runs over a range of positions, so `value` is a number, and `outer` is the list being reversed:

```
Reverse List
	(1, 2, 3).Reverse is (3, 2, 1)
	(5, 10, 5).Reverse is (5, 10, 5)
	for Range(0, Length).Reverse
		outer.value(index)
```

# Named loop variables

The grammar also allows a name for the loop variable, which leaves `value` untouched for the outer scope:

```
for element in (1, 2, 3, 4)
	logger.Log(element)
```

The self-hosted compiler doesn't support named loop variables yet. All code in the repository uses `value`, `index` and `outer`.

# Filtering

An `if` without `else` inside a loop is a filter: only the values of iterations where the condition is true end up in the result. From [`Examples/RemoveDuplicateWords.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/RemoveDuplicateWords.strict):

```
has texts
Remove Texts
	RemoveDuplicateWords("a", "b", "b").Remove is ("a", "b")
	RemoveDuplicateWords("a", "b", "c").Remove is ("a", "b", "c")
	RemoveDuplicateWords("hello", "hi", "hiiii", "hello").Remove is ("hello", "hi", "hiiii")
	for texts
		if texts.Index(value) is index
			value
```

# Leaving a loop early

`return` leaves the loop and the method. Here the list isn't sorted, so we have to search through it and stop when we find the element:

```
Index(other Generic) Number
	(1, 2, 3).Index(2) is 1
	(1, 2, 3).Index(9) is -1
	for elements
		if value is other
			return index
	-1
```

# The for result

When a method ends with a `for`, the loop is its result. The value of the loop body is collected over all iterations, and how it is combined depends on the method's return type:

| Return type | Result | Start value |
|-------------|--------|-------------|
| A list (`Numbers`, `Texts`, `List(Vector2)`, ...) | every body value becomes one element | empty list |
| `Number` | the sum of all body values | 0 |
| `Number` with `* value` | the product of all body values | 1 |
| `Text` | all body values concatenated | `""` |
| `Boolean` | `true` as soon as one iteration is true, otherwise `false` | `false` |

**Lists.** The body value is mapped into a new list:

```
Doubled Numbers
	Loops(1, 2, 3).Doubled is (2, 4, 6)
	for numbers
		value * 2
```

**Sums.** `Length` adds 1 for every element, `Sum` adds the elements, and `Count` adds 1 for every element that matches:

```
Length Number
	(1, 2).Length is 2
	for elements
		1
```

```
Sum Generic
	(1, 2, 3).Sum is 6
	for elements
		value
```

```
Count(searchFor Generic) Number
	(1, 2).Count(1) is 1
	(1, 3).Count(2) is 0
	("Hi", "Hello", "Hi").Count("Hi") is 2
	for elements
		if value is searchFor
			1
```

**Other operators.** You can start the body line with an operator instead of using the default. `+ value` gives the same sum as above, so Strict, being very picky, would replace it with the shorter version. Multiplying is different. A body line starting with `*` gives the product. From [`Examples/ReduceButGrow.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/ReduceButGrow.strict):

```
has numbers
GetMultiplicationOfNumbers Number
	ReduceButGrow(2, 3, 4, 5).GetMultiplicationOfNumbers is 120
	ReduceButGrow(120, 5, 40, 0).GetMultiplicationOfNumbers is 0
	ReduceButGrow(2, 2, 2, 2).GetMultiplicationOfNumbers is 16
	for numbers
		* value
```

**Texts.** The body values are concatenated. This is how [`Text.Combine`](https://github.com/strict-lang/Strict/blob/master/Text.strict) joins texts with a separator. `index is 0` checks for the first element, which gets no separator in front:

```
Combine(texts Texts, separator = ", ") Text
	Combine(("a", "b", "c")) is "a, b, c"
	Combine(("a", "b"), "") is "ab"
	Combine(("hi", "there"), Character.NewLine) is "hi\nthere"
	for texts
		(index is 0 then "" else separator) + value
```

If you wrote this loop yourself in another type, Strict would replace it with the existing `Text.Combine` method.

**Booleans.** A `Boolean` method that ends with a `for` returns `true` as soon as one iteration is true. From [`Dictionary.strict`](https://github.com/strict-lang/Strict/blob/master/Dictionary.strict):

```
in(key Generic) Boolean
	2 is in Dictionary((1, 1), (2, 2))
	3 is not in Dictionary((1, 1), (2, 2))
	for keysAndValues
		value.Key is key
```

# Functional programming

The `for` result works like the pipe operator in functional languages (Lisp, Clojure, F#, Haskell). Let's filter the even numbers from 0 to 9, multiply them by 10 and sum them up. All of the following do the same thing.

C#:
```csharp
int[] numList = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 };
int result =
    numList
        .Where(n => n % 2 == 0)
        .Select(n => n * 10)
        .Sum();
```

Haskell:
```haskell
numList :: [Int]
numList = [0..9]
result :: Int
result =
    sum
      . map (* 10)
      . filter even
      $ numList
```

Clojure:
```clojure
(def num-list [0 1 2 3 4 5 6 7 8 9])
(def result
  (->> num-list
       (filter even?)
       (map #(* 10 %))
       (reduce + 0)))
```

F#:
```fsharp
let numList = [| 0..9 |]
let result =
    numList
    |> Array.filter (fun n -> n % 2 = 0)
    |> Array.map (fun n -> n * 10)
    |> Array.sum
```

JavaScript:
```javascript
const numList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const result = numList
    .filter(n => n % 2 === 0)
    .map(n => n * 10)
    .reduce((acc, n) => acc + n, 0);
```

Python, which is more compact, but maps first and filters last, unlike all the others:
```python
num_list = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
result = sum(n * 10 for n in num_list if n % 2 == 0)
```

Strict, in a method returning a `Number`:
```
for Range(0, 10)
	if value % 2 is 0
		value * 10
```

# Pipelines

The language design goes further: every line of a loop body can transform the value from the line before it, like a pipeline.

```
for numbers
	to Text
	Length * Length
	if value > 3
		4 + value * 3
		to Text
```

Each number is converted to `Text`. `Length * Length` squares the length of that text, which gives a number again. If that number is above 3, it is transformed once more and converted back to `Text`. The result is a list of texts, or one concatenated `Text` if the method returns a `Text`. Some of this could be written in one line, like `(value to Text).Length * (value to Text).Length`, but that is longer and not preferred.

Multi-line pipelines like this are not supported by the self-hosted compiler yet. Today each loop body ends in one expression.

# Mutable variables in loops

Sometimes a loop needs state, like a counter or the previous values. This is where `mutable` belongs. From [`Examples/Fibonacci.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Fibonacci.strict):

```
has number
has logger
GetNthFibonacci Number
	Fibonacci(5).GetNthFibonacci is 5
	Fibonacci(10).GetNthFibonacci is 55
	mutable first = 1
	mutable second = 1
	for Range(2, number)
		let next = first + second
		first = second
		second = next
	second
```

And [`Examples/RemoveParentheses.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/RemoveParentheses.strict) combines a mutable counter with filtering:

```
has text
Remove Text
	RemoveParentheses("example(unwanted thing)example").Remove is "exampleexample"
	mutable parentheses = 0
	for text
		if value is "("
			parentheses = parentheses.Increment
		else if value is ")"
			parentheses = parentheses.Decrement
		else if parentheses is 0
			value
```

# Image processing

Iterating over a multidimensional type and changing a mutable parameter, from [`ImageProcessing/AdjustBrightness.strict`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/AdjustBrightness.strict):

```
Process(mutable image) Image
	constant testImage = Image(Size(1, 1), (testColor))
	AdjustBrightness(0.25).Process(testImage) is Image(Size(1, 1), (ColorValue(0.5, 0.75, 0.5)))
	for image.Size
		let normalized = image.Colors(index) to ColorValue
		image.Colors(index) = GetBrightnessAdjustedColor(normalized)
	image
```

You don't need to think about loop order for cache efficiency, for example iterating over y first. Strict picks the fastest execution. If it can see that the input image stays unchanged and the result is assigned back to it, it removes the mutation and just swaps two images (double buffering).
