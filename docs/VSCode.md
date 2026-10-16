---
id: VSCode
title: Writing Strict in VS Code
sidebar_label: The VS Code Experience
---

Write a test, change the code, see the result. That is the everyday Strict workflow. SCrunch keeps tests running in the background and puts the feedback beside the code you are editing: passing and failing tests, execution times, coverage and the values used on each line.

Thousands of small tests with subsecond feedback were a major goal for Strict. The result is an editor that feels responsive: you can try an idea and see what happened while it is still fresh in your mind. Test cost depends on the code; native profiling and model downloads are separate from this fast editing loop.

[![SCrunch showing 1,307 passing methods and per-line runtime values in the Strict repository](/img/screenshots/csv-test-explorer.jpg)](/img/screenshots/csv-test-explorer.jpg)

The Test Explorer and inline annotations in the actual Strict repository. Open the image to inspect the values at full size.

# Watch an edit go from red to green

<video autoplay controls muted loop playsinline preload="auto" poster="/img/screenshots/scrunch-demo-poster.jpg">
  <source src="/img/SCrunchDemo.mp4" type="video/mp4" />
  <a href="/img/SCrunchDemo.mp4">Watch the edit/test walkthrough</a>
</video>

In `Examples/Fibonacci.strict`, the tests come first and fail with the actual values they got. Writing the loop turns them green, and every line shows its hit count and the values it produced. This walkthrough uses actual VS Code captures; pauses are shortened.

# Start with a small example

Install the [Strict VS Code extension](https://github.com/strict-lang/strict-vscode-client), open your project folder and create `Temperature.strict`:

```
has celsius Number
Fahrenheit Number
	Temperature(0).Fahrenheit is 32
	Temperature(100).Fahrenheit is 212
	celsius * 9 / 5 + 32
```

Save the file. SCrunch runs the inline tests and marks the results in the gutter. Now change `+ 32` to `+ 30` and save again. The tests turn red, and the actual values show why. Restore `+ 32`: the feedback turns green again. There is no separate test project or test framework to set up.

Keep the **Testing** view open beside the editor. It groups tests by package, type and method, so you can move from an overview of the project straight to the code behind a result.

# Read the execution beside the code

Green and red marks tell you which tests pass and which implementation lines they cover. Method headers show their test duration. A failing comparison shows its expected and actual values beside the test, with source locations you can follow.

Line-value feedback shows what the tests used as they ran: the value assigned to a local, the collection a loop visited and which branches executed. Hit counts distinguish a line that ran once from one visited repeatedly. You can follow a calculation through its intermediate values without adding logging or starting a debugging session.

For example, in a temperature conversion you can read the input, the multiplication and the returned result alongside the implementation. When a result is surprising, follow those values back to the test that supplied them. Texts, lists, records and Errors are displayed as Strict values, making the feedback easy to relate to the source.

Use **SCrunch: Show Tests for Line** to see the tests behind a covered line. **Strict: Evaluate** (`Shift+Enter` on a selection) evaluates an expression, and **Fill expected value** completes a test ending in `is` or `is ?` from its actual result.

The experience is inspired by [NCrunch](https://www.ncrunch.net/): continuous testing, coverage and runtime data inspection close to the code. Strict makes tests part of the language, so this feedback is available from the first method you write.

[![Fibonacci with the values of each loop iteration shown beside the code](/img/screenshots/fibonacci-values.jpg)](/img/screenshots/fibonacci-values.jpg)

Here the tests visit the loop eleven times. The hints show how `first`, `second` and `next` evolve; hover reveals details beyond the compact inline summary.

# Explore without losing your place

* **Semantic syntax highlighting** distinguishes types, methods, members, parameters, constants and changing values. Test lines are recognizable as tests.
* **Hover** shows the type, method signature and tests that explain an operation. Inlay hints help you read inferred types and constructor arguments.
* **F12** follows a method or type to its definition, including the standard library. Its tests are examples you can read and use immediately.
* **Completion and signature help** offer members of the value you are working with and show the arguments a call needs.
* **References, rename and call hierarchy** help you make a change and understand the code it affects.

You spend less time guessing what an expression means and more time watching it do the work.

# From a failing test to working code

Start a method with a few examples of its behavior. SCrunch makes a failure visible immediately after saving. Change the implementation and watch the feedback update; dependent types are tested too.

The extension can suggest an implementation from your tests. The suggestion is checked by Strict before it appears as ghost text: **Tab** accepts it and **Alt+]** cycles through alternatives. Add examples that distinguish the behavior you want, then use the results to judge the suggestion.

Quick fixes explain and repair rule violations. Formatting keeps the canonical style, while extract/inline refactorings, create-from-usage and Fix All take care of routine edits.

# See what is slow

The Testing view records durations by method and type. **SCrunch: Show Slowest Tests** opens the tests that need attention. **Run with Coverage** adds execution counts and native total/self times to implementation lines, making a hot loop visible where you can change it.

Fast repeated feedback uses `.strictbinary` caches for unchanged code. A cached result is labeled `cached`; **SCrunch: Time All Tests (without cache)** measures fresh executions. Coverage and native builds use the native toolchain, so their build time is different from the normal save-and-test cycle.

# Run, build and reuse your code

Use **Strict: Run File** (`Ctrl+Shift+R`) for a type with a `Run` method. CodeLens above an entry point offers Run, Run with Arguments and Build Native. **Strict: Build Native Executable** produces a standalone program after its tests pass.

The same code can become a [C or C# library](UsingApis.md#call-strict-from-c-and-c), use [exact stepped decimals](Decimals.md), or run [Qwen3 inference](MachineLearning.md#qwen3-8b-faster-than-llamacpp). The editor workflow stays the same: small methods, examples beside them and immediate feedback.

See [Getting Started](GettingStarted.md) for installation and CLI setup, [Tests](Tests.md) for the test model, and the [extension README](https://github.com/strict-lang/strict-vscode-client) for the full command list.
