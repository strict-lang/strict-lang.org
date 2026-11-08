---
title: "Mutation Testing for Every Test: Thousands of Tiny Issues in One Day"
author: Benjamin Nitschke
---

Every method in Strict starts with its tests, and nothing compiles without them. Since yesterday that is not enough anymore: after the tests of a file pass, `strict test` changes every method in tiny ways and runs the tests again. If no test notices a change, the run fails. This is **mutation testing**, and it now runs automatically for every test that isn't marked `Slow`. Turning it on for all Strict packages uncovered thousands of tiny issues, and fixing them produced a crazy amount of commits: **173 since yesterday afternoon, 158 of them since mutation testing landed at 1 am today**, and it's not fully done yet.

<!--truncate-->

## How it started

The original goal was finding performance bottlenecks in big for loops, from a lot of code review and performance investigation for the H3Video and StrictComfy loading times. Some loops did work that didn't change per iteration, some checks repeated what an earlier line already decided, and the same patterns showed up again and again. So I changed a few values and operations to see what would happen, and none of the tests broke. That means the code wasn't really tested, or wasn't really needed.

One manual experiment is a coincidence, so I made the check broader and broader, and more and more issues came up. In Strict we always look for a general solution instead of a one-off hack. Here the general solution is to let the computer do these experiments: for every method, for every operation, on every test run. Built for loops, it turned out to be even more useful applied everywhere.

## What gets mutated

Each method written in a tested file gets these mutants, one at a time:

- a comparison is always true or always false, which removes one side of a branch
- the result is replaced by its default (`0`, `""`, `false`)
- a reassignment, a call or a list `Add` is dropped
- `+` and `-` or `*` and `/` are swapped
- a text is emptied

A mutant that makes any test of its type fail is killed. A mutant that passes all tests survives and is reported with the method source:

```
Shop/Shop.strict:line 4: MutationSurvived: Discount: replaced the comparison > with true kept passing all tests, improve the tests!
  2: Discount Number
  3: 	Shop(200).Discount is 20
> 4: 	if total > 100
  5: 		return total / 10
  6: 	0
```

A survivor fails the run like a failing test, so the file gets no `.strictbinary` and can't be built. Either a test is missing (`Shop(50).Discount is 0` here), or the code makes no difference and should be removed. Both happened thousands of times today. The details are in [Tests: mutation testing](/docs/Tests#mutation-testing).

## Why this is only practical in Strict

Mutation testing is decades old, but almost nobody runs it all the time. In most languages each mutant means rebuilding the project and running a test suite that takes seconds or minutes, so a full run takes hours and happens maybe once per release, if at all.

Strict doesn't rebuild anything. A method is compiled once into bytecode, and a mutant swaps a single instruction right before execution. Unit tests must finish within 100 ms and usually take well under 1 ms, so the VM runs thousands of tests per second. All mutated methods of a file get their next mutant together in one round, each judged by the tests of its own type on a fresh machine, files with more than 16 rounds spread them over up to 16 worker processes, and folder runs test their files in parallel. A full run over the Strict repository alone executes **several million mutation tests**, the other repositories using Strict many more. The vast majority of mutants make a test line fail somewhere, which shows the mutation is bad, exactly as it should be. The few that survive come from badly tested code, corner cases, actual bugs or sometimes code that isn't used at all. The Math package takes 0.7 s without and 2.4 s with mutation testing, the first version from 1 am needed 6.1 s with one machine per mutant.

## Tests stay fast

The only downside is that a fresh test run takes longer now. Performance is our top priority, nobody wants to wait minutes for tests to complete, so:

- **Results are cached.** The test result is part of the `.strictbinary` generated for each type, the mutation result sits next to it in `obj/`. As long as nothing in the source changes, the result stays valid.
- **VS Code only runs what your current change affects.** That still gives sub millisecond test results and retests whole repositories in a few seconds in the background, so the view is always up to date. In the editor every test has run many times over anyway.
- **`strict test <type or package> unit`** runs the tests without mutation testing, and all `strict build` commands skip Slow tests and mutation testing as well.
- **`strict test <package folder> full`** is the other end: removes the caches and runs everything, all Slow tests, all CI tests and all mutants.
- **`strict build <file> fast`** is new, next to more command line options for all platforms. It skips all tests and does the quickest build possible without GPU kernels. Great for quick iterations and small tools, but it won't help a complex game or app, or anything that actually needs its GPU kernels: running LLMs or diffusion models with many billions of parameters on the CPU is not a good idea.

## Getting the tool itself right

The first hours were spent on making the mutation testing precise, because a tool that reports noise gets ignored:

- **Each mutant runs alone.** Running mutants of different methods together let one method's mutant hide another one's survivor.
- **One source edit per mutant.** Mutation runs compile without loop peeling and hoisting, otherwise one instruction could stand for several places in the source.
- **Survivors must match their line.** A dropped assignment only counts when the source line assigns that name, a swapped `+` only when the line has a `+`.
- **No noise from logs and errors.** Values that only reach log output, Error details or loop counts are not mutated, and a logger message compiles to a plain `Print`.
- **No side effects.** Mutation runs can't write or delete files, open sockets or run tools, methods whose tests read files or that reach file, process, socket or GPU input are skipped and reported, and a mutant that loops forever stops after 100,000 steps.
- **Pasted constants.** A handful of `Add` mutants survived although the same edit by hand failed three tests. The root cause: constant folding pastes constants into test lines, so those mutants changed a copy of another constant. When not optimizing, constants now stay calls.

## What it found

Over the day, commit messages like "MlirRational tests kill 214 of 215 survivors" add up to **6,466 killed survivors out of 9,372 reported**, across the base types, Math, Compression, Xml, ImageProcessing, MachineLearning, Networking, the validators, the VM, the bytecode compiler and the MLIR code generator. The rest are mostly equivalent mutants: code that gives the same result either way, which is a finding too. Every one of those is written down with its reason, waiting for its cleanup.

Most fixes were better tests. Tests with zeros and ones are the classic: `Square(1) is 1` passes for `value`, `value * value`, `value / value` and many others. The Math tests now use distinguishing values, so `Complex` no longer only multiplies by 1 and -1, `Rectangle` finally gets points left of and below it and `DoubleDouble.Decimals` sees a negative number. The PNG tests got tiny header-only fixtures for RGB, RGBA, 16 bit gray alpha and 2 bit gray images plus the Up, Average and Paeth filter corner cases, Inflate and Deflate tests kill all their mutants.

Then there is code that turned out useless:

- An unused `ExpressionParser` with its 26 node types, the leftover `InstructionNames` and a dead `OptionMember` line were deleted.
- Redundant empty checks and shortcuts in `Xml.Decoded`, `Markov.Generated`, `ValueTrace.Hits`, `TestChecks.Leading` and many more are gone, `Storage.Written` lost arithmetic that `Substring` clamps anyway.
- The compiler writes the exact parts of f32 stores twice in a few places, and a guard pattern after `instructions(writer < 0 then before else writer)` turned out redundant everywhere in the MLIR code generator.

And a few real bugs showed up: `Socket.Listen(-1)` didn't fail but wrapped around and listened on port 65535 forever, now ports outside 0 to 65535 or with a fraction give `InvalidPort`. An Error result could pass a list comparison. An empty list times a number now is an empty list. Others are noted for fixing: a nested constructor crash, an `ElementType` nesting bug, a wrong constant member type, a parser that accepts a missing closing parenthesis.

## From survivors to rules

When the same survivor shows up in fifty places, fixing it fifty times is the one-off hack. Two kinds of repeated patterns became validation rules that `strict check` reports everywhere:

- **Loops only contain what changes.** `LoopInvariantMustBeOutsideLoop`, `LoopGuardMustBeOutsideLoop` and `LoopEdgeMustBeOutsideLoop` reject computations, guards and first/last iteration checks inside a loop that don't depend on it. 32 places in Strict moved a `let` before their loop, and the compiler now hoists invariant arithmetic and peels first and last iterations on its own. Applying the same idea to the low level C code of the native runtime made many methods processing huge amounts of data 4 to 10 times faster.
- **Magic numbers are constants.** `NumberMustBeNamedConstant` rejects `if number is in Range(97, 123)` in a method body: name it. Single digits, `10`, `0.5` and powers of ten stay allowed, tests and constants can use any number.

See [Code Validations](/docs/CodeValidations#numbers-loops-and-results) for the full list.

## What's next

The Compiler, NeuralNetworks and Examples folders still have survivors left, the remaining equivalent mutants each need their cleanup, and a few limits are still wall clock based and should count steps instead. Then I want to benchmark how many mutants per second this can really do, and bring the survivors into SCrunch in VS Code next to the failing tests, so you see untested code while you type, not just failing code.

The result is a codebase where every comparison, operation, call and value either matters to a test or is gone. Run `strict test` on your own code and see what survives.
