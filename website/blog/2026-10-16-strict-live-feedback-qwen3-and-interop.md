---
title: Strict Feels Alive — SCrunch, Qwen3-8B and C# Interop
author: Benjamin Nitschke
---

The biggest change in Strict this week is how it feels to use. Open a file in VS Code, change a calculation and see the tests respond beside it. SCrunch shows which lines ran, how long the tests took and the values they used. Thousands of small tests with subsecond feedback were a major goal for Strict, and that fast feedback loop is now part of everyday development.

At the same time, Qwen3-8B inference decodes faster than llama.cpp, C and C# interop let Strict fit into existing applications, and stepped decimals preserve exact values across those boundaries.

<!--truncate-->

## Write code and watch it execute

Tests have always lived inside Strict methods. Now the editor makes much more of them: passing and failing marks beside the source, method timings, expected and actual results, coverage and values on the lines that executed. The Test Explorer gives you the project overview, grouped by package, type and method; the editor gives you the detail.

This is the part that makes writing Strict fun. Try a different expression, save, and see its effect immediately. Follow the values through a method instead of adding temporary logging. When a test turns red, the failing result is right where you are working. When it turns green again, you can keep going without switching tools.

The inspiration is [NCrunch](https://www.ncrunch.net/), with its continuous testing, coverage and runtime data inspection. SCrunch brings that kind of feedback to VS Code with tests built into the language. Semantic highlighting, hover details, completion and F12 navigation make the surrounding code just as easy to explore. The tests you reach with F12 are also the examples that explain the method.

Read the new [VS Code experience guide](/docs/VSCode) for a short walkthrough, including changing a passing test, following line values and finding slow code. Repeated feedback uses caches for unchanged types; native profiling and large external workloads have their own execution costs.

[![SCrunch: passing tests and values beside each line of a real algorithm](/img/screenshots/fibonacci-values.jpg)](/img/screenshots/fibonacci-values.jpg)

## Qwen3-8B: faster than llama.cpp

The model here is **Qwen3-8B**, the eight-billion-parameter Qwen3 model. With Q4_K_M weights on an RTX 4090, the recorded development benchmark reaches **141–143 generated tokens/second**, or **7.0–7.1 ms per token**. llama.cpp b11658 CUDA takes **7.25 ms per token** (138 tokens/second) on the same machine and day, so Strict is now ahead, and the ongoing work gains a few percent with each commit. Qwen3 0.6B takes 2.2–3.1 ms per token against 2.2 ms in the comparison.

That puts Strict beyond the local-inference decode performance people associate with Ollama. The measured comparison is with llama.cpp, using the same GGUF weights and greedy sampling; it is not a separate Ollama benchmark, and decode throughput is distinct from prompt processing and batched serving.

The transformer blocks, tokenizer and generation logic are written in Strict. Quantized Q4_K/Q6_K weights, GPU-resident calculations and graph replay do the heavy work underneath. Mixture-of-experts models also run fully on the GPU: Qwen3-Coder-30B-A3B decodes at 5.0 ms per token (200 tokens/second) against 4.78 ms for llama.cpp. More optimization work continues around memory traffic, kernel fusion, quantized arithmetic, attention and batching.

Try the [Qwen3 benchmark and model examples](/docs/MachineLearning). The package README records the hardware, model formats and measurements so the numbers remain useful as the implementation improves.

![Qwen3-8B inference in Strict at 142 tokens per second](/img/QwenInference.svg)

## C, C# and exact decimals

`strict build Policy.strict library` produces a native shared library and a generated `Policy.cs` binding. Keep ASP.NET, your frontend, your database and your existing services; put the calculations and decisions you want to test in Strict. C callers use the exported native interface, and C# callers get generated types and methods.

Numbers, text, Booleans, number lists, records and lists of records cross the boundary. Stepped parameters and results carry their decimal scale and use C# `decimal`, exact up to 2^51 steps. In Strict, `Number with Step 0.01` declares hundredths, with half-to-even rounding by default and explicit `Floor` or `Ceiling` when needed. Overflow returns an Error instead of silently losing precision.

The same inline tests that explain rounding and edge cases are visible in SCrunch while you write the rules. See [Decimals](/docs/Decimals) and [Using APIs](/docs/UsingApis) for the workflow.

![Native C and generated C# interop with Strict](/img/NativeInterop.svg)

## Real projects are driving the language

The [DeltaEngine portfolio](https://deltaengine.net) is moving its ongoing work to Strict: games, applications, AI and robotics. Porting the engine was the larger effort; having that foundation made subsequent game ports much easier. There is already a growing collection of Strict games, and **SoulCraft keeps looking better** as the work brings together SoulCraft, SoulCraft 2 and Heroes of SoulCraft content.

![SoulCraft gameplay from the Strict port](/img/SoulCraft.webp)

Websites and internal applications use Strict logic alongside ASP.NET, Vite and existing frameworks. Neural-network code keeps growing, from small training examples and classic classifiers to recurrent models and local LLM inference. Strict itself is another substantial example: the parser, validators, VM and compiler are written in the language and compile themselves.

These are the workloads behind the improvements. They make the immediate feedback in VS Code valuable every day, and they give the compiler real code to optimize. Explore [Built with Strict](/docs/Projects), then [try the editor workflow](/docs/VSCode).
