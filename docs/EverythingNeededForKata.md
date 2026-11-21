---
id: EverythingNeededForKata
title: Cheat Sheet
---

Two ways to solve a kata in Strict. [Write the program yourself](#write-it-yourself), or describe the kata with examples and let [Ben](#ben) search millions of variations until Strict accepts one. Both end as the same kind of code: a small type, tests first, no comments.

# Write it yourself

## Setup

```sh
git clone https://github.com/strict-lang/Strict
Strict\Compiler\Bootstrap.cmd            # or: sh Strict/Compiler/bootstrap.sh, creates strict(.exe)
                                         # then put the Strict folder on your PATH
mkdir Kata && cd Kata                    # your project, can be anywhere
strict MyKata.strict                     # run the Run method on the Strict VM
strict test MyKata.strict                # tests, then mutation testing
strict check .                           # the style rules, as errors
```

Open [Writing Strict in VS Code](VSCode.md) and save a test: the result and the values on the executed lines show up beside the code. [Getting Started](GettingStarted.md) covers installation.

Write the tests before the body. A test that already passes does not tell you the body is right. Use values a wrong program would miss: an empty list, zero, a negative, a single element. `Square(3) is 9` distinguishes more than `Square(0) is 0`.

## Editor and commands

| Action | Command or key |
|--------|----------------|
| Follow a definition | F12 |
| Details and tests | Hover over the name |
| Run the current file | Ctrl+Shift+R |
| Inspect test values on executed lines | `strict test MyKata.strict values` |
| Native execution counts and timing | `strict test MyKata.strict lines` |
| Skip mutation testing | `strict test MyKata.strict unit` |
| Build for a C/C# host | `strict build MyKata.strict library` |

`strict test` of a file runs every test, including `Slow` tests, and then mutation testing: each comparison, operation and value is changed, and the tests must fail. `unit` skips mutation and skips `Slow` tests. One slow method, with its mutants, is `strict test MyKata.strict MethodName`.

## A type

The file `Kata/MyKata.strict` is the type `MyKata`. Members come first, then methods. Every method starts with tests. The last line is the result, and `return` is only for leaving early.

```
has numbers
Doubled Numbers
	MyKata((1, -2)).Doubled is (2, -4)
	MyKata(List(Number)).Doubled.Length is 0
	for numbers
		value * 2
Positives Number
	MyKata((1, -2, 3)).Positives is 4
	MyKata(List(Number)).Positives is 0
	MyKata((-1, -4)).Positives is 0
	for numbers
		if value > 0
			value
```

If a list is the only member, its elements can be passed directly: `ReverseList(1, 2, 3)`. With more members, put the list in brackets: `MyKata((1, 2))`.

Use a method Strict already has (`Sum`, `Length`, `Reverse`) instead of writing that loop again. [Coding Style](CodingStyle.md) rejects a second copy of an existing method.

## Members and variables

| Code | Meaning |
|------|---------|
| `has number` | Member, the name says the type |
| `has start Number` | Member with an explicit type |
| `has Alpha = 1` | Member with an initial value, public because it is uppercase |
| `has Width Number with value > 0` | Member with a constraint |
| `has price Number with Step 0.01` | Exact decimal precision, half-to-even rounding |
| `constant Max = 255` | Constant member |
| `mutable Colors` | Member that may change |
| `fraction = value % 1` | Local that does not change, calculated once |
| `mutable count = 0` | Variable that changes |
| `count = count + 1` | Reassignment of a mutable variable |

A number other than a single digit, `10`, `0.5` or a power of ten is a named `constant`. Tests and constant lines may use any number. See [Members and Variables](Variables.md).

## Methods

| Header | Meaning |
|--------|---------|
| `Floor Number` | No parameters, no brackets |
| `Log(text)` | No return type, the parameter name says its type |
| `Clamp(minimum = 0, maximum = 1) Number` | Parameters with default values |
| `+(other) Number` | Operator method |
| `to Text` | Conversion, called as `value to Text` |
| `from(text)` | Custom constructor, called as `Type(text)` |

`value` is the instance. See [Methods](Methods.md) and [Tests](Tests.md).

## Expressions

```
3 + 4 * 2 is 11
7 % 4 is 3
2 ^ 3 is 8
"Your age is " + 18 is "Your age is 18"
5 to Text is "5"
"5" to Number is 5
3 is in (1, 2, 3)
"lo" is in "hello"
(1 is 1) and (2 is not 3)
value > 0 then value else 0
```

See [Statements and Expressions](Statements.md).

## If

```
if number % 15 is 0
	return "FizzBuzz"
else if number % 3 is 0
	return "Fizz"
```

```
if operation is
	"add" then first + second
	"subtract" then first - second
	else 0
```

See [If](If.md).

## For

`value` is the current element and `index` its position. A nested `for` also binds `index`, so keep the outer index in an assignment before the inner loop (`outerIndex = index`). What a method ending in `for` returns depends on its return type:

| Loop | Result |
|------|--------|
| `for numbers` + `value * 2` in a `Numbers` method | the list `(2, 4, 6)` |
| `for numbers` + `value` in a `Number` method | the sum |
| `for numbers` + `* value` in a `Number` method | the product |
| `for numbers` + `if value > 0` + `value` | only the positive numbers, summed when the method returns `Number` |
| `for texts` + `value` in a `Text` method | all texts concatenated |
| `for elements` + `value is other` in a `Boolean` method | `true` if any iteration is true |
| `for 10` | 0 to 9 |
| `for Range(2, 5)` | 2, 3 and 4 |
| `for Range(0, 5).Reverse` | 4 down to 0 |

`+` on two lists concatenates them. It does not add element by element. See [For](For.md).

## Lists and texts

```
(1, 2, 3).Length is 3
(1, 2, 3).Sum is 6
(1, 2, 3).First is 1
(1, 2, 3).Last is 3
(1, 2, 3) + 4 is (1, 2, 3, 4)
(1, 2, 3) - 3 is (1, 2)
(1, 2) * 3 is (3, 6)
(1, 2, 3).Reverse is (3, 2, 1)
(1, 2, 3).Index(2) is 1
"a,b".Split(",") is ("a", "b")
"hello".Substring(1, 3) is "ell"
"hello".IndexOf("ll") is 2
" hi ".Trim is "hi"
```

`numbers(0)` is the first element and `numbers(-1)` the last. A list has to be turned into text explicitly: `numbers to Text`. See [Lists and Dictionaries](Lists.md) and [Base Types](BaseTypes.md).

## Limits

`strict check` enforces these. The method and member counts are in [`Validators/Limits.strict`](https://github.com/strict-lang/Strict/blob/master/Validators/Limits.strict):

| Limit | Maximum |
|------:|--------:|
| Characters per line | 120 |
| Lines per method, header and tests included | 13 |
| Methods per type | 18 |
| `has` members per type | 15 |
| `constant` members per type | 40 |
| Nesting levels | 5 |

Tabs only, one expression per line, no empty lines, no comments, no trailing blank line. At most 4 parameters ([Methods](Methods.md)). A method that needs more room is two methods. See [Coding Style](CodingStyle.md).

# Ben

Ben is a Strict program still in development, it is the language build on top of Strict. Strict is the DNA, Ben is the organism with memory, skills, tools and a lot of knowledge. It is not really a programming language anymore and also not like an llm, but you can talk to it via Strict or LLMs. It starts from Strict's base types, builds candidate programs for a typed kata, and keeps a program only after `strict test` accepts it. A kept program becomes a skill. The next kata can call that skill instead of searching for it again.

The measured ladder (lists, toddler, beginner, loops, Codewars 8 kyu through 5 kyu, and the trap questions) is in the Ben README. This section is how to run that loop and what it is doing.

## What you give it

A task is the kata, not the solution. Ben's benchmark stores them in `Tasks/Tasks.json`, one object per kata:

| Field | Meaning |
|-------|---------|
| `name` | Type name of the skill Ben will write |
| `parameters` | Name and type (`Number`, `Numbers`, `Text`, `Texts`, `Boolean`) |
| `result` | Return type |
| `examples` | `{ "inputs": [...], "output": ... }`, the cases the search may see |
| `checks` | More of the same, still visible. Used when a program fits the examples and fails a check |

Tasks are grouped by `"<stage> <split>"`, for example `"codewars heldout"`. `training` may be learned from. `heldout` is scored and, on a normal run, not learned.

The files under `Tasks/Specs/` are the kata before outputs exist: parameters, ranges, the example inputs, and one instruction sentence. `Tasks/generate.py` runs that kata's oracle on the Strict VM and writes `Tasks/Tasks.json` plus `Tasks/Holdout.json`. The search never reads the holdout file. Those cases are the score after a program has already passed the examples and the checks.

Three examples are enough for a search and not enough to trust a conditional. Add checks. A program that memorizes three rows will fail a fourth case, and Ben then searches again with that case included.

## What one search does

For each kata, in this order:

1. **Retrieve.** If a learned skill has the same input types and return type and matches every example, that skill is the answer. No candidates are built.
2. **Decompose.** Known shapes are tried first: filter then aggregate, map, sort, unique, fold. The search fills in the missing piece (the condition, the mapped expression, the fold step) instead of inventing the whole program.
3. **Enumerate.** Otherwise Ben enumerates programs from its catalogue, cheapest first. The catalogue is Strict's operations (`+`, `*`, `Sum`, `Length`, `Filter`, `Map`, `Fold`, `digits`, `then`, …) plus every learned skill. Default budget: cost 8, at most 400,000 candidates. A stage of tasks is millions of candidates across the tasks.
4. **Verify.** Each candidate is rendered as a Strict type and run with `strict test`. Nothing is accepted because it looks plausible.
5. **Repair the examples.** If the program fits the examples and fails a check, up to 2 of those checks are added to the examples and the search repeats. At most 6 rounds.

A verified program is written as a Strict file under `Memory/Skills/` (tests included, same limits as a kata you write by hand) and recorded in `Memory/Knowledge.json` with a belief: how often that skill has worked. Later searches call it by name.

The sum of the positive numbers is three skills, not one long method. `SumOfPositivesCondition` is `number > 0`. The filter's term is `Filter(numbers, >(value, 0))`, and the Strict it writes is the same `for` and `if value > 0` as the hand-written `Positives` above. The sum's body is `SumOfPositivesFilter(numbers).Result.Sum`. A later kata that needs the positives retrieves the filter instead of searching for it. The same thing happens with digits: `DigitSum` is `Sum(digits(number))`, and a harder kata can call `DigitSum`.

Retrieval is exact on the examples Ben was given. A skill that is right on those examples and wrong outside them can still be learned. The holdout score is what says so. Wrong skills also make later searches wider, so a library that only grew is not always a faster library.

## When the search stops short

`Ben.exe solve` takes an optional last argument. Each step retries what the previous step left unsolved.

| Argument | What changes |
|----------|----------------|
| *(none)* | Retrieve, decompose, enumerate, verify |
| `more` | Same search with four times the candidate budget, then one more cost level if it is still unsolved and the first tries were short |
| `qwen` | The local model (Strict's own Qwen runner, a GGUF under `Strict/NeuralNetworks/`) is asked for a program in Ben's term language. The prompt lists every callable skill and its types. A program that fails an example or a check is sent back with that case, up to two repairs. Only a program Strict verifies is kept |
| `frontier` | The same question to an outside model, through `Providers`. Off unless you set it up. Task names, signatures and the visible examples leave the machine |

The model is a proposer. Constants it suggests (`"aeiou"`, `3`, `5`) are seeded into another search. A program it writes is rendered and tested like any other candidate. Vowels, age thresholds and leap-year rules are the kind of fact no example contains. The search can use them only when they arrive as a hint or inside a proposed program.

Asking for constants alone rarely solves a kata the budget could not solve. Asking for a whole program does, because those programs are larger than cost 8 and they carry the missing facts. They are assisted results. The plain search numbers and the model numbers stay separate. Public katas may already be in a model's training data.

## Commands

From the Ben folder, after `../Strict/strict.exe build Ben.strict`:

```sh
./Ben.exe
# every stage: held-out tasks with no skills, then training, then the same held-out tasks with what was learned

./Ben.exe remember codewars
# keep Memory/, and run one stage on top of it

./Ben.exe solve codewars heldout YouCantCodeUnderPressure Memory/Knowledge.json
# one kata, plain search

./Ben.exe solve codewars7 heldout DescendingOrder Memory/Knowledge.json Tasks/Tasks.json more
# one kata, four times the budget

./Ben.exe serve 8080
```

`serve` is Ben's own site (the pages are Strict too):

- **Ben** shows the queue and accepts a task as the same JSON, plus hints (constants such as `"aeiou"` or `5` for a named kata).
- **Skills** lists every learned skill, its belief, and the Strict file under `Memory/Skills`.
- **Activity** is `Memory/Activity.log`: queued, solving, rounds, candidate counts, the program, what was learned, what was asked.
- **Chat** turns an English request into a task. The model writes examples and checks. A task with only a few examples and no checks can be "solved" by a wrong program and then learned, so checks matter here too.

While a search runs, the process answers with where it is (`thinking about NthPrime, level 6, 62083 of 400000 candidates`). A long search does not queue a new task yet. Send it again when the search is idle.

## What this is good at, and what it is not

Good: list and number katas whose answer is a short composition of `Map`, `Filter`, `Fold`, `Sum`, `digits` and skills already learned. A greeting learned as `"Hello, " + name + "!"` is reused inside a later conditional. A fold learned as repeated multiplication is reused as a power.

Still open, in the Ben README under "Where Ben fails": a map after a filter, index and slice, facts that never appear as a hint, text layout (padding, masks, repeating characters), and conditionals with more branches than the search will spend. Codewars 6 kyu and 5 kyu are mostly in that list. A bigger budget does not repair a condition that passed every visible check and fails the hidden ones.

Add a kata by writing the task, not by pasting a solution into `Memory/Skills`. A skill that did not pass `strict test` on the examples and the checks is not knowledge.
