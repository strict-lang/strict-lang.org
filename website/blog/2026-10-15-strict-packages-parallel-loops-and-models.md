---
title: Packages, Parallel Loops and Language Models
author: Benjamin Nitschke
---

Since [Strict began compiling itself](/blog/2026/10/11/strict-compiles-itself), development has moved into using it for real programs. Packages and native libraries now work together, tested bytecode is cached, numeric loops use CPU workers and NVIDIA GPUs, and the neural-network package runs GPT-2 and Qwen3.

<!--truncate-->

## Shorter edit, test and build cycles

Successful tests write `.strictbinary` files. Running, testing and building reuse them until a source or a file read by the tests changes. Folder tests and checks include package subfolders. Every executed test reports its location and duration; `strict test <file> lines` builds the tests natively and reports line counts, total time and self time.

`strict format <file>` prints canonical source. `strict update .` refreshes copied packages from their `.origin` sources. Package lookup uses the project, Strict's own packages, sibling projects and repositories linked in the README, with local clones preferred when available. C implementations in a package's `native/` folder work on both the VM and native backend, and native builds reuse compiled C objects.

On Windows `strict build Strict.strict` can replace the running compiler directly. Application builds also pick up an `App.ico` beside `App.strict`.

## Language and runtime changes

Native dictionaries and concrete generic instances are implemented, including dictionary indexed assignment. `Type(instance, member = value)` makes a copy with selected members replaced. Constraints use `with` on members and parameters, including parameters with defaults. `for as long as condition` is the condition-controlled loop.

Equality now binds with the other comparisons before `and` and `or`. Errors used without handling immediately return from the current method and gain source stack frames as they propagate. You can keep a result, check `is Error`, and recover before using it normally. See [Statements](/docs/Statements), [Types](/docs/Types), [For](/docs/For) and [Errors](/docs/Errors).

## Parallel loops and models

Native compilation vectorizes supported numeric sums and reads packed 32-bit, 16-bit and Q8_0 weights directly. Pure collecting loops can use a CPU worker pool. Eligible large numeric loops become NVIDIA PTX kernels with cached device copies and a CPU fallback. These paths have specific eligibility rules; loops with side effects remain serial, and GPU transfers can cost more than the computation. [Concurrency](/docs/Concurrency) explains the current behavior.

[NeuralNetworks](https://github.com/strict-lang/Strict/tree/master/NeuralNetworks) now includes perceptrons, backpropagation, Adam and RMSprop, recurrent networks, GRUs and evolutionary examples. [MachineLearning](https://github.com/strict-lang/Strict/tree/master/MachineLearning) adds k-means, nearest neighbors, naive Bayes, trees, forests and Markov text generation.

GPT-2 124M runs from safetensors with cached attention and packed weights; Qwen3 0.6B runs from a Q8_0 GGUF file. Tokenizers and transformer blocks are written in Strict, with small C helpers for tensor loading. October 15 development measurements put GPT-2 at 8.6 ms per generated token with 8-bit weights on an i9-13900KF. That result depends on precision, workload and hardware; it is not a general performance guarantee. [Machine Learning](/docs/MachineLearning) links the examples, downloads and limitations.

## VS Code catches up

The [extension](https://github.com/strict-lang/strict-vscode-client) now provides completion, hover, definitions, references, rename, signature help and call hierarchy through its own source index. SCrunch shows test timings, slow tests and native line coverage. Formatting, refactorings, create-from-usage and suggestions checked against a method's tests help write Strict code. A language server written in Strict is still future work.

## Still open

The [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) tracks remaining defaults and type-resolution gaps, complete stack-overflow traces, graphical release packaging and larger model formats. GPU work includes reducing transfers and keeping intermediate results on the device. The documentation now describes the implemented paths and these limits instead of treating packages, caches and neural networks as future work.
