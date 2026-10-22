---
id: Projects
title: Built with Strict
---

Strict is being used for games, websites, application logic, neural networks and its own compiler. These projects drive the language: real workloads exercise the editor, tests, interop and native performance together.

# DeltaEngine and games

[DeltaEngine](https://deltaengine.net) is moving its ongoing engine and project work to Strict. The portfolio spans games, apps, AI and robotics; new development and ports use Strict while established libraries provide platform services.

With web support in the Strict compiler (`strict build <file> web`), all DeltaEngine games and samples compile to WebAssembly and run directly in modern web browsers at 60+ FPS via WebGL 2.

[![SoulCraft battle running on the Strict version of DeltaEngine](/img/SoulCraft.webp)](/img/SoulCraft.webp)

SoulCraft gameplay from the current Strict port.

Porting the engine took the larger share of the work: rendering, input, audio, content, math and native integration all needed a foundation the games could share. With that in place, game ports became much easier. The growing Strict game collection includes **SoulCraft**, **Arena Wars**, **WebWars**, **RacingGame**, **RocketCommander**, **Blocks**, **Breakout**, **Artifex**, **Tiny Bat**, **GhostWars**, **Armies of Steel** and interactive graphics/audio samples.

**SoulCraft** is the flagship action RPG. Its Strict implementation brings together SoulCraft, SoulCraft 2 and Heroes of SoulCraft content on the shared engine. Gameplay, level data, animation, collision, particles and rendering logic are written in Strict, with native graphics services underneath. Web play is coming soon; SoulCraft is available on [Steam](https://store.steampowered.com/app/369700/SoulCraft/), [Google Play](https://play.google.com/store/apps/details?id=de.mobilebits.soulcraftdefault) and [iOS](https://apps.apple.com/app/soulcraft-action-rpg/id558133054), with optional in-app purchases for extra gold, spells and gear.

**Arena Wars** brings fast-paced tactical RTS gameplay with bases and dynamic squad control. Web play is coming soon; it is available on [Steam](https://store.steampowered.com/app/468800/Arena_Wars_Reloaded/), transitioning to free to play.

**WebWars** and **RacingGame** are works in progress showcasing procedural maps and physics-based vehicle drift handling in the browser. You can test them directly on the [Strict homepage](/#games), alongside **RocketCommander** and the arcade samples.

The SoulCraft and DeltaEngine sources are proprietary; the [DeltaEngine project gallery](https://deltaengine.net) showcases the full portfolio of games being brought forward to Strict.

[![Arena Wars units and bases running in the DeltaEngine port](/img/ArenaWars.webp)](/img/ArenaWars.webp)

Arena Wars: high-speed tactical RTS using the shared engine foundation.

# Websites and application logic

Keep the web stack you already use. ASP.NET can host the application and call a generated [C# binding](UsingApis.md#call-strict-from-c-and-c); Vite and existing frontend frameworks can handle the browser interface. Strict supplies tested business rules, calculations and state transformations behind that interface.

This is how Strict fits into website and internal-application work: use mature frameworks for HTTP, storage and presentation, then write the rules you want to inspect and test in Strict. [Stepped decimals](Decimals.md) preserve exact values across the application boundary. There is no need to build another web framework to benefit from the language.

# Neural networks and local inference

The [NeuralNetworks and MachineLearning packages](MachineLearning.md) cover training, classifiers, recurrent networks, GRUs, evolution and transformer inference. The collection keeps growing as larger workloads guide compiler and runtime optimizations.

Qwen3-8B Q4_K_M now decodes at 150–151 tokens/second on an RTX 4090, with aggregate throughput of 953 tokens/second across 8 sequences and 2,357 across 32. Qwen3-Coder-30B-A3B reaches 210 decode tokens/second, and Qwen3.8 27B and Brilliance 50X run at 46.6 and 45.3 tokens/second. The transformer logic is Strict, supported by quantized weights, GPU kernels and graph replay. Prompt processing, flash attention, an optional 8-bit KV cache and low-overhead memory reuse are fully implemented. See [Machine Learning](MachineLearning.md) for the measurement conditions and comparisons.

# Strict itself

The language implementation is a substantial Strict application. Parsing, type inference, validation, bytecode, the VM and native code generation are all written in Strict and tested with the same tools you use for your own code. It compiles itself into the standalone `strict` executable.

Open the [compiler source](Architecture.md) in [VS Code](VSCode.md), follow a call with F12 and inspect the tests and execution feedback. The same short methods and live results remain useful even when the program is a compiler rather than a small example.
