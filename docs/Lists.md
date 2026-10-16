---
id: Lists
title: Lists and Dictionaries
---

Strict has two collections: [`List`](https://github.com/strict-lang/Strict/blob/master/List.strict) and [`Dictionary`](https://github.com/strict-lang/Strict/blob/master/Dictionary.strict). There is no Stack, Queue, LinkedList, HashSet or SortedDictionary. You just use `List` and `Dictionary`, and the runtime picks the internal structure that fits how they are used. Mixing patterns, like using a list as a queue while also inserting in the middle, can't be optimized as well.

# Lists

All lists are surrounded by brackets and separated by `, `. Method arguments are lists too, which is why calls look the way they do.

```
(1, 2, 3)
("Hi", "Hello")
(true, false, true)
((1, 1), (2, 2))
```

The type of a list is `List(Number)`, or shorter `Numbers`. Any type name ending in `s` is a list of that type: `Texts`, `Booleans`, `Characters`, `Variables`. `Numbers` on its own is an empty list of numbers, and so is `List(Number)`. A [`Text`](https://github.com/strict-lang/Strict/blob/master/Text.strict) is a list of characters, so everything below works on texts too.

A single value in brackets is a list too: `("abc").Length is 1`. Brackets around an operator expression group the calculation. Lists of stepped numbers such as `has prices Numbers with Step 0.01` are planned; see [Decimals](Decimals.md).

## Using lists

From the tests in [`List.strict`](https://github.com/strict-lang/Strict/blob/master/List.strict):

```
(1, 2) to Text is "(1, 2)"
(1, 2).Length is 2
(1, 2) is (1, 2)
(1, 2, 3) is not (1, 2)
(1, 2, 3).Sum is 6
(1, 2, 3).First is 1
(1, 2, 3).Last is 3
(1, 2, 3).X is 1
(1, 2).Y is 2
(1, 2, 3).Z is 3
(1, 2, 3, 4).W is 4
3 is in (1, 2, 3)
3 is not in (1, 2)
"b" is in ("a", "b", "c")
(1, 2, 3).Index(2) is 1
(1, 2, 3).Index(9) is -1
(1, 2).Count(1) is 1
("Hi", "Hello", "Hi").Count("Hi") is 2
(1, 2, 3).Reverse is (3, 2, 1)
```

Elements are accessed by position with brackets, starting at 0. Negative positions count from the end, so `Last` is `elements(-1)`:

```
First Generic
	(1, 2, 3).First is 1
	elements(0)
```

## List operators

`+` and `-` add and remove elements or whole lists. `*` and `/` work element by element with another list of the same length, or with a single number:

```
(1, 2, 3) + (4, 5) is (1, 2, 3, 4, 5)
(1, 2, 3) + 4 is (1, 2, 3, 4)
(1, 2, 3) - (3) is (1, 2)
(1, 2, 3) - 3 is (1, 2)
(1, 2, 3) - 4 is (1, 2, 3)
(1, 2) * (3, 5) is (3, 10)
(1, 2) * 3 is (3, 6)
(2, 4, 6) / (2) is (1, 2, 3)
(2, 4, 6) / 2 is (1, 2, 3)
(1, 2) / (2, 4) is (0.5, 0.5)
(1) * (1, 2) is listsHaveDifferentDimensions
```

Lists of texts and lists of numbers convert into each other:

```
("Hello", "World") + (1, 2) is ("Hello", "World", "1", "2")
("Hello", "World") + 5 is ("Hello", "World", "5")
("1", "2") to Numbers + (3, 4) is (1, 2, 3, 4)
("3", "4") + (1, 2) to Text is ("3", "4", "(1, 2)")
("3", "4") + (1, 2) to Texts is ("3", "4", "1", "2")
(1) + ("Hi") is Error("Cannot downcast Text to Number for list: Text \"Hi\"")
```

## Growing a list

Lists never change. `+` gives a new list, and a `mutable` variable can be reassigned to it. `Add` and `Remove` do exactly that, and they can only be called on mutable lists:

```
mutable issues = List(Mutable(ValidationIssue))
for lines
	issues = issues + LineIssues(value, index)
```

```
Add(element Generic) Mutable(List)
	(1, 2).Add(3) is (1, 2, 3)
	value = value + element
```

The runtime doesn't copy here. It keeps the same memory and appends in place, because the previous version of the list is never used again. See [Members and Variables](Variables.md#values-never-change).

A list in a `mutable` variable can also be changed element by element, like the pixels of an image copy:

```
mutable adjusted = image
for adjusted.Size
	adjusted.Colors(index) = GetBrightnessAdjustedColor(adjusted.Colors(index) to ColorValue)
```

## Building lists with for

Most lists are built by a [`for` loop](For.md#the-for-result) that maps and filters another list:

```
Remove Texts
	RemoveDuplicateWords("a", "b", "b").Remove is ("a", "b")
	for texts
		if texts.Index(value) is index
			value
```

# Ranges

A [`Range`](https://github.com/strict-lang/Strict/blob/master/Range.strict) is a start and an exclusive end. It works like a list of numbers without storing them:

```
Range(0, 5).Length is 5
3 is in Range(1, 4)
5 is not in Range(1, 4)
Range(2, 5).Sum is 2 + 3 + 4
Range(0, 5).Reverse is Range(4, -1)
```

# Dictionaries

A `Dictionary` maps keys to values. It is just a list of key and value pairs, and this is how [`Dictionary.strict`](https://github.com/strict-lang/Strict/blob/master/Dictionary.strict) starts:

```
has keysAndValues List(key Generic, mappedValue Generic)
from
	Dictionary(Number, Number).Length is 0
	Dictionary(Number, Number) is Dictionary(Number, Number)
	Dictionary(Number, Number) is not Dictionary(Number, Text)
	Dictionary((1, 1)).Length is 1
	Dictionary((1, 1), (2, 2)).Length is 2
```

Using a dictionary:

```
constant abbreviations = Dictionary(("A", "Apple"), ("B", "Ball"))
abbreviations("A") is "Apple"
abbreviations("C") is KeyNotFound
2 is in Dictionary((1, 1), (2, 2))
Dictionary((2, 4)).Add(4, 8) is Dictionary((2, 4), (4, 8))
Dictionary((1, 1)).Add(1, 2) is DuplicateKey
Dictionary((1, 1), (2, 2)).Remove(1).Length is 1
```

Enumerating a dictionary gives one pair per iteration. A pair is a list of two elements, and `value.Key` and `value.Value` are `value(0)` and `value(1)`:

```
for someDictionary
	if value.Key is "Apple"
		return value.Value
```

You might be surprised how simple `Dictionary.strict` is: lookups are plain loops over pairs. The base types describe how a type behaves functionally, not how it is made fast. All optimizations happen at runtime, where Strict decides on the internal structure based on how the dictionary is used.

Dictionaries and generic types compile for their concrete key and value types on both the Strict VM and native backend. Native lookup supports instance keys by comparing their members. A mutable dictionary also supports indexed assignment:

```
mutable prices = Dictionary(Text, Number)
prices.Add("Apple", 2)
prices("Apple") = 3
```

`Add` rejects duplicate keys; indexed assignment updates the mapped value. A mutating call used as a statement must target a `mutable` variable, otherwise it is a `MutatingCallNeedsMutableVariable` error.
