---
id: Projects
title: Built with Strict
---

Strict is being used for games, websites, application logic, neural networks and its own compiler. These projects drive the language: real workloads exercise the editor, tests, interop and native performance together.

# DeltaEngine and games

[DeltaEngine](https://deltaengine.net) is moving its ongoing engine and project work to Strict. The portfolio spans games, apps, AI and robotics; new development and ports use Strict while established libraries provide platform services.

[![SoulCraft battle running on the Strict version of DeltaEngine](/img/SoulCraft.webp)](/img/SoulCraft.webp)

SoulCraft gameplay from the current Strict port.

Porting the engine took the larger share of the work: rendering, input, audio, content, math and native integration all needed a foundation the games could share. With that in place, game ports became much easier. The growing Strict game collection includes Blocks, Breakout, Artifex, Tiny Bat, GhostWars, Armies of Steel and more.

**SoulCraft** is one of the larger examples and keeps looking better as the port develops. Its Strict implementation brings together SoulCraft, SoulCraft 2 and Heroes of SoulCraft content on the shared engine. Gameplay, level data, animation, collision, particles and rendering logic are written in Strict, with native graphics services underneath. Reusing the engine made the SoulCraft port straightforward compared with the much larger engine conversion.

The SoulCraft and DeltaEngine sources are not public yet; the [DeltaEngine project gallery](https://deltaengine.net) shows the wider work in progress. The historical games in the gallery show the projects being brought forward; their original releases predate the Strict ports.

[![Arena Wars units and bases running in the DeltaEngine port](/img/ArenaWars.webp)](/img/ArenaWars.webp)

Arena Wars: another game using the shared engine foundation.

# Websites and application logic

Keep the web stack you already use. ASP.NET can host the application and call a generated [C# binding](UsingApis.md#call-strict-from-c-and-c); Vite and existing frontend frameworks can handle the browser interface. Strict supplies tested business rules, calculations and state transformations behind that interface.

This is how Strict fits into website and internal-application work: use mature frameworks for HTTP, storage and presentation, then write the rules you want to inspect and test in Strict. [Stepped decimals](Decimals.md) preserve exact values across the application boundary. There is no need to build another web framework to benefit from the language.

# Neural networks and local inference

The [NeuralNetworks and MachineLearning packages](MachineLearning.md) cover training, classifiers, recurrent networks, GRUs, evolution and transformer inference. The collection keeps growing as larger workloads guide compiler and runtime optimizations.

Qwen3-8B Q4_K_M now decodes at 150–151 tokens/second on an RTX 4090, with aggregate throughput of 953 tokens/second across 8 sequences and 2,357 across 32. Qwen3-Coder-30B-A3B reaches 200 decode tokens/second. The transformer logic is Strict, supported by quantized weights, GPU kernels and graph replay. Prompt processing, flash attention and an optional 8-bit KV cache are implemented; memory and launch overhead continue to be tuned. See [Machine Learning](MachineLearning.md) for the measurement conditions and comparisons.

# Strict itself

The language implementation is a substantial Strict application. Parsing, type inference, validation, bytecode, the VM and native code generation are all written in Strict and tested with the same tools you use for your own code. It compiles itself into the standalone `strict` executable.

Open the [compiler source](Architecture.md) in [VS Code](VSCode.md), follow a call with F12 and inspect the tests and execution feedback. The same short methods and live results remain useful even when the program is a compiler rather than a small example.
