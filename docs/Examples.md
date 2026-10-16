---
id: Examples
title: Examples
---

The [`Examples`](https://github.com/strict-lang/Strict/tree/master/Examples) folder holds example programs that show the current language features. It is also a playground for katas and for trying out new syntax. Every example can be tested, run and built:

```sh
strict Examples/FizzBuzz.strict
strict test Examples/FizzBuzz.strict
strict build Examples/FizzBuzz.strict
```

# Showcase

[`Examples/Greeter.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Greeter.strict): members, a tested method and `Run`.

```
has text
has logger
Greet Text
	Greeter("World").Greet is "Hello, World!"
	Greeter("Strict").Greet is "Hello, Strict!"
	"Hello, " + text + "!"
Run
	constant english = Greeter("World")
	constant strict = Greeter("Strict")
	logger.Log(english.Greet)
	logger.Log(strict.Greet)
```

[`Examples/ReverseList.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/ReverseList.strict): a `for` loop over a reversed range builds the result list.

```
has numbers
Reverse Numbers
	ReverseList(1, 2, 3, 4).Reverse is (4, 3, 2, 1)
	for Range(0, numbers.Length).Reverse
		numbers(index)
```

[`Examples/ReduceButGrow.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/ReduceButGrow.strict): `* value` multiplies all elements.

```
has numbers
GetMultiplicationOfNumbers Number
	ReduceButGrow(2, 3, 4, 5).GetMultiplicationOfNumbers is 120
	ReduceButGrow(120, 5, 40, 0).GetMultiplicationOfNumbers is 0
	ReduceButGrow(2, 2, 2, 2).GetMultiplicationOfNumbers is 16
	for numbers
		* value
```

[`Examples/EvenFibonacci.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/EvenFibonacci.strict): mutable variables, an early `return`, and an `if`/`else` as the result of a method.

```
has number
Sum Number
	EvenFibonacci(100).Sum is 44
	mutable first = 1
	mutable second = 1
	mutable total = 0
	for Range(1, number)
		let next = first + second
		if next >= number
			return total
		total = AddIfEven(total, next)
		first = second
		second = next
	total
AddIfEven(current Number, next Number) Number
	EvenFibonacci(100).AddIfEven(2, 4) is 6
	EvenFibonacci(100).AddIfEven(2, 3) is 2
	if next % 2 is 0
		current + next
	else
		current
```

More showcases are on the other pages: [FizzBuzz](If.md#block-if), [ArithmeticFunction](If.md#selector-if), [TemperatureConverter](Overview.md#a-first-look), [Fibonacci, RemoveParentheses and RemoveDuplicateWords](For.md) and [Register](Methods.md#operators-are-methods).

# All examples

**Programs and katas**

- [`AreaCalculator`](https://github.com/strict-lang/Strict/blob/master/Examples/AreaCalculator.strict): a rectangle's area and perimeter from width and height.
- [`ArithmeticFunction`](https://github.com/strict-lang/Strict/blob/master/Examples/ArithmeticFunction.strict): applies the operation named by a text with a selector `if`.
- [`AutofilledMutable`](https://github.com/strict-lang/Strict/blob/master/Examples/AutofilledMutable.strict): a `mutable` member gets a default when it isn't passed.
- [`Beeramid`](https://github.com/strict-lang/Strict/blob/master/Examples/Beeramid.strict): kata that counts the complete levels of a beer can pyramid you can buy, recursively.
- [`ConvertingNumbers`](https://github.com/strict-lang/Strict/blob/master/Examples/ConvertingNumbers.strict): converts a list of numbers to texts with a `for` expression.
- [`EvenFibonacci`](https://github.com/strict-lang/Strict/blob/master/Examples/EvenFibonacci.strict): sums the even Fibonacci numbers below a limit (Project Euler 2).
- [`ExecuteOperation`](https://github.com/strict-lang/Strict/blob/master/Examples/ExecuteOperation.strict): adds or subtracts two `Register` values through operator methods.
- [`Fibonacci`](https://github.com/strict-lang/Strict/blob/master/Examples/Fibonacci.strict): the nth Fibonacci number with mutable variables and a `Range` loop.
- [`FindFirstNonConsecutiveNumber`](https://github.com/strict-lang/Strict/blob/master/Examples/FindFirstNonConsecutiveNumber.strict): the first element that isn't one more than the one before it.
- [`FindNumberCount`](https://github.com/strict-lang/Strict/blob/master/Examples/FindNumberCount.strict): counts the numbers in a range by producing 1 per iteration.
- [`FizzBuzz`](https://github.com/strict-lang/Strict/blob/master/Examples/FizzBuzz.strict): classifies a number as Fizz, Buzz, FizzBuzz or itself.
- [`GcdCalculator`](https://github.com/strict-lang/Strict/blob/master/Examples/GcdCalculator.strict): the greatest common divisor with Euclid's algorithm.
- [`Grade`](https://github.com/strict-lang/Strict/blob/master/Examples/Grade.strict): turns a score into a letter grade with `if`/`else if`.
- [`Greeter`](https://github.com/strict-lang/Strict/blob/master/Examples/Greeter.strict): returns and logs "Hello, X!".
- [`HelloLogger`](https://github.com/strict-lang/Strict/blob/master/Examples/HelloLogger.strict): the minimal hello world, logs "Hi".
- [`Instruction`](https://github.com/strict-lang/Strict/blob/master/Examples/Instruction.strict) and [`InstructionType`](https://github.com/strict-lang/Strict/blob/master/Examples/InstructionType.strict): a toy virtual machine instruction and an enum of its kinds.
- [`LinkedListAnalyzer`](https://github.com/strict-lang/Strict/blob/master/Examples/LinkedListAnalyzer.strict): counts loop steps up to a maximum with a mutable counter.
- [`MatchingLoopFinder`](https://github.com/strict-lang/Strict/blob/master/Examples/MatchingLoopFinder.strict): finds a matching loop bracket, from a Brainfuck interpreter kata.
- [`Node`](https://github.com/strict-lang/Strict/blob/master/Examples/Node.strict): returns its number plus one.
- [`NumberSummer`](https://github.com/strict-lang/Strict/blob/master/Examples/NumberSummer.strict): sums a list with a mutable total and logs it.
- [`Pixel`](https://github.com/strict-lang/Strict/blob/master/Examples/Pixel.strict): an RGB pixel with `Brighten` and `Darken`.
- [`Processor`](https://github.com/strict-lang/Strict/blob/master/Examples/Processor.strict): returns `true`, `false` or a text, showing a `Boolean or Text` return type.
- [`PureAdder`](https://github.com/strict-lang/Strict/blob/master/Examples/PureAdder.strict): adds two numbers, the smallest pure function.
- [`ReduceButGrow`](https://github.com/strict-lang/Strict/blob/master/Examples/ReduceButGrow.strict): multiplies all numbers of a list with `* value`.
- [`Register`](https://github.com/strict-lang/Strict/blob/master/Examples/Register.strict): three numbers with `+`, `-`, `*` and `/` operator methods.
- [`RemoveDuplicateWords`](https://github.com/strict-lang/Strict/blob/master/Examples/RemoveDuplicateWords.strict): keeps the first occurrence of each text.
- [`RemoveExclamation`](https://github.com/strict-lang/Strict/blob/master/Examples/RemoveExclamation.strict): removes every "!" from a text.
- [`RemoveParentheses`](https://github.com/strict-lang/Strict/blob/master/Examples/RemoveParentheses.strict): removes parenthesized parts of a text with a mutable nesting counter.
- [`ReverseList`](https://github.com/strict-lang/Strict/blob/master/Examples/ReverseList.strict): reverses a list by iterating a reversed `Range`.
- [`ShorterPath`](https://github.com/strict-lang/Strict/blob/master/Examples/ShorterPath.strict): builds a direction text of "N" and "E" from north and east counts.
- [`SimpleCalculator`](https://github.com/strict-lang/Strict/blob/master/Examples/SimpleCalculator.strict): adds and multiplies two numbers.
- [`Sum`](https://github.com/strict-lang/Strict/blob/master/Examples/Sum.strict): logs the sum of the numbers passed on the command line.
- [`TemperatureConverter`](https://github.com/strict-lang/Strict/blob/master/Examples/TemperatureConverter.strict): Celsius to Fahrenheit and Kelvin.

**Base type tour**, in [`Examples/BaseTypesTest`](https://github.com/strict-lang/Strict/tree/master/Examples/BaseTypesTest):

- [`BaseTypesTest`](https://github.com/strict-lang/Strict/blob/master/Examples/BaseTypesTest/BaseTypesTest.strict): inline tests for `Boolean`, `Number`, `Text`, `List`, `Range`, `Character`, `Dictionary`, `File`, `Error` and `mutable`.
- [`DirectoryTests`](https://github.com/strict-lang/Strict/blob/master/Examples/BaseTypesTest/DirectoryTests.strict): tested wrappers around `Directory`.
- [`TextHelper`](https://github.com/strict-lang/Strict/blob/master/Examples/BaseTypesTest/TextHelper.strict): builds a greeting, used by `BaseTypesTest`.

**Conversions between types**, in [`Examples/CompactTypeTest`](https://github.com/strict-lang/Strict/tree/master/Examples/CompactTypeTest): [`NumberHolder`](https://github.com/strict-lang/Strict/blob/master/Examples/CompactTypeTest/NumberHolder.strict) and [`ByteHolder`](https://github.com/strict-lang/Strict/blob/master/Examples/CompactTypeTest/ByteHolder.strict) convert into each other with `from` and `to`.

**Parsing demos**, in [`Examples/Parsing`](https://github.com/strict-lang/Strict/tree/master/Examples/Parsing): [`ParseExpressions`](https://github.com/strict-lang/Strict/blob/master/Examples/Parsing/ParseExpressions.strict), [`ParseHelloLogger`](https://github.com/strict-lang/Strict/blob/master/Examples/Parsing/ParseHelloLogger.strict) and [`ParseMethodHeaders`](https://github.com/strict-lang/Strict/blob/master/Examples/Parsing/ParseMethodHeaders.strict) classify source lines the way an early parser did.

**Native smoke tests and probes**: [`NativeArithmetic`](https://github.com/strict-lang/Strict/blob/master/Examples/NativeArithmetic.strict), [`NativeConditions`](https://github.com/strict-lang/Strict/blob/master/Examples/NativeConditions.strict), [`NativeLoop`](https://github.com/strict-lang/Strict/blob/master/Examples/NativeLoop.strict), [`NumberStats`](https://github.com/strict-lang/Strict/blob/master/Examples/NumberStats.strict), [`MemoryPressure`](https://github.com/strict-lang/Strict/blob/master/Examples/MemoryPressure.strict) (appends 20,000 numbers to stress the collector), [`DirProbe`](https://github.com/strict-lang/Strict/blob/master/Examples/DirProbe.strict) and [`ProcessProbe`](https://github.com/strict-lang/Strict/blob/master/Examples/ProcessProbe.strict).

# Games, websites and larger programs

[Built with Strict](Projects.md) covers the growing DeltaEngine game collection, SoulCraft and application logic hosted by existing web stacks. The engine port provides shared rendering, input, audio and native services; game logic stays in Strict. [C and C# interop](UsingApis.md#call-strict-from-c-and-c) lets existing applications use the same tested types.

# Bigger programs

[Machine Learning](MachineLearning.md) covers the newer `NeuralNetworks` and `MachineLearning` packages: perceptrons, recurrent networks, GRUs, evolutionary algorithms, classic classifiers, GPT-2 safetensors inference and Qwen3 GGUF inference.

The biggest Strict program is Strict itself. The packages described in [Architecture](Architecture.md) are written in the same language, follow the same limits, and start every method with tests. [`ImageProcessing`](https://github.com/strict-lang/Strict/tree/master/ImageProcessing) shows image codecs written in Strict, changing a mutable copy and returning it, and multidimensional loops.
