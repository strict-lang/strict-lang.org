---
id: Modular
title: Strict and Modular (Mojo, MAX)
---

[Modular](https://www.modular.com/) is the company of Chris Lattner (LLVM, Clang, Swift, MLIR). It builds two things: **Mojo**, a Python-like systems language for CPUs and GPUs, and **MAX**, an inference framework and server whose kernels are written in Mojo. Both projects and Strict build on MLIR, so the comparison is fair to ask for. This page states what Modular does and Strict doesn't, what Strict does and Modular doesn't, what is known about performance and how the code differs.

The focus is different. Modular is built for AI inference, and with its number of models and its closeness to Python it is what people should use for that kind of work. For Strict the [NeuralNetworks](MachineLearning.md) package and [StrictComfy](MossImage.md) are small side projects. The goal is a very strict language with one way to do things, a fast VM and fast native code, for [DeltaEngine](Projects.md) and the projects built on top of it. One solution and one way to write it is also what lets LLMs generate Strict code efficiently, the opposite of C++ with its many ways to do the same thing.

State of November 2026: MAX 26.7 and Mojo 1.2 (October 22). The AI models have **not been measured head to head on the same machine yet**, see [Performance](#performance). Small programs have, see [Measured speed](#measured-speed).

# At a glance

| | Strict | Modular |
|---|---|---|
| Language | Strict, one way to write things, tests in every method | Mojo, Python syntax with ownership, `comptime` and explicit SIMD and GPU code |
| Maturity | Changes all the time, small community | Mojo 1.0 since August 2026 with source stability for marked APIs, a Qualcomm company since July 2026 |
| License | MIT | Mojo and its compiler: Apache 2.0 with LLVM exceptions. MAX kernels, models and serving: Apache 2.0. MAX graph compiler, runtime and backends: source available under the MAX License |
| Models | A handful, each written by hand: GPT-2, Qwen3, Qwen3.5, Qwen3.8, Moss, FLUX decoder, MiniMax H3 video and image | 126 architecture folders (some are variants): Llama, Gemma, Qwen, DeepSeek, Mistral, FLUX.2, Z-Image, Wan and many more |
| Runs on | Windows, Linux, macOS, Android, iOS and the browser | Linux and macOS, Windows only through WSL |
| GPUs measured | Consumer cards: RTX 3080 and RTX 4090 | Datacenter cards: NVIDIA B200 and AMD MI355X, Apple silicon GPUs for a subset of models |
| Parallel and GPU code | The compiler decides, the code stays the same | You write the kernel and launch it |
| Deployment | One native executable, no Python | Python package and server with an OpenAI compatible endpoint |

# What Modular does and Strict doesn't

* **Many models, quickly.** MAX ships 126 architecture folders (some are variants of the same model) and often adds new models on the day they come out. Strict has a handful, each one written and tuned by hand.
* **Serving for many users.** `max serve` gives an OpenAI compatible endpoint with request scheduling, prefix caching, tiered KV caches, speculative decoding and a benchmark tool. Strict generates in a command line program, a ComfyUI node or the browser, and batches up to 32 sequences, but has no serving stack like this.
* **Datacenter and AMD GPUs.** MAX is verified on NVIDIA B200 and AMD MI355X on every release, the same compiled model runs on both. Strict's GPU kernels are NVIDIA only on Windows and Linux (Metal on macOS, WebGPU in the browser) and are measured on consumer cards.
* **Python.** Mojo imports Python modules and Python calls Mojo, MAX models are Python graphs. Strict has no Python interop, only [C and C#](UsingApis.md).
* **Low level control.** Mojo gives you SIMD types, pointers, ownership and borrowing, compile time metaprogramming and hand written GPU kernels with block and thread indices. Strict hides all of this on purpose. When the compiler doesn't find the fast path, you can't write it by hand in Strict, the compiler has to learn it.
* **Stability and people.** Mojo 1.0 promises source stability, has a language server, a package ecosystem, a large team and Qualcomm behind it. Strict is a small project, [changes all the time](Overview.md#a-language-that-keeps-moving) and has no proven community.
* **Music.** MAX 26.6 generates music with MiniMax-Music3. Strict generates the sound of H3 videos, nothing else.

# What Strict does and Modular doesn't

* **Windows.** Strict builds and runs natively on Windows. MAX doesn't officially support Windows, Modular points to WSL, native Windows support for Mojo is planned.
* **Browser and phones.** The same Strict code runs as WebAssembly with WebGPU ([MossWeb](https://strict-lang.org/moss/MossWeb.html) generates images in the browser) and on Android and iOS. MAX has no browser or phone target.
* **Consumer GPUs first.** Every GPU number on this site is from an RTX 3080 (10 GB) or RTX 4090. Modular publishes numbers for B200 and MI355X.
* **No kernels to write.** Strict code has no thread, SIMD or GPU keywords. A plain `for` runs on all cores or as a GPU kernel when the compiler finds it eligible, see [Concurrency](Concurrency.md).
* **One executable.** `MossImage.exe`, `H3Video.exe` or a Qwen3 program need the model files and nothing else: no Python, no packages, no server.
* **More than AI.** Strict is a general language: [games](Projects.md), a game engine, the compiler itself. Mojo is general too, but nearly everything built with it is AI infrastructure.
* **Tests are part of the language.** Every method starts with its tests and every test run includes [mutation testing](Tests.md#mutation-testing). Mojo has a normal test framework that you may or may not use.
* **License.** Strict is MIT. The MAX License allows commercial products without fees, but forbids distributing modified MAX source (except to contribute it back), requires a "Modular Accelerated" mark on commercial hosted inference services and forbids using MAX as input for an AI to reimplement it.

# Performance

Nobody has run Strict and MAX on the same GPU with the same model yet, so there is no direct number. Both sides only publish results against other baselines, on different hardware:

| Workload | Strict (RTX 4090) | Modular (B200 or MI355X) |
|---|---|---|
| LLM decoding | Qwen3-8B Q4_K_M 181 tokens/s against 138 for llama.cpp, Qwen3-Coder-30B 210 against 190, see [Machine Learning](MachineLearning.md#qwen3-8b-faster-than-llamacpp) | No published comparison with llama.cpp. Third party H100 results against vLLM go both ways: 800 against 1,324 tokens/s in a user report (MAX 25.6), 2,150 against 1,850 in a GPU cloud's blog |
| Image generation | Moss 3 to 4 times faster than ComfyUI's default workflow, H3 Image 1.7 to 4.7 times, see [Moss](MossImage.md) | FLUX.2 about 4 times faster than PyTorch Diffusers with torch.compile (4.1x at 1024x1024), hardware not stated, 1.25x on MI355X |
| Video generation | H3 with sound 2.0 to 2.5 times faster than ComfyUI with the same model and steps, see [H3](H3Video.md) | Wan 2.2 3.7 times faster than Diffusers on B200, no sound |

These baselines are not the same: ComfyUI and llama.cpp are what people run at home, Diffusers and vLLM are what runs in a datacenter. Read the table as "both are a few times faster than the usual tools", not as Strict against MAX. A real comparison needs MAX on the RTX 4090 with the same weights, steps and sizes.

The one benchmark both languages are in is the [Leibniz formula](Benchmarks.md) of [speed-comparison](https://github.com/niklas-heer/speed-comparison), 1 billion terms on one thread, scaled to the i9-13900KF:

| | Time |
|---|---:|
| Strict, 1 thread | 87.93 ms |
| C (clang, vectorized) | 417.68 ms |
| Mojo | 1,277.68 ms |

The Mojo entry there is a plain scalar loop. Measured again on one PC with more small programs: [Measured speed](#measured-speed).

# Side by side

Official Mojo and MAX examples from the [modular repository](https://github.com/modular/modular) next to Strict code that does the same job and already exists in the [Strict repository](https://github.com/strict-lang/Strict). Lines are counted without blank lines and comments. The Strict lines include the tests, which are part of every method.

| Sample | Mojo | Strict |
|---|---:|---:|
| Leibniz, whole program | 14 lines ([leibniz.mojo](https://github.com/niklas-heer/speed-comparison/blob/master/src/leibniz.mojo)) | the calculation is 4 lines ([Leibniz.strict](https://github.com/strict-lang/Strict/blob/master/Examples/Leibniz.strict)) |
| Complex number type with operators | 110 lines and 184 lines of tests in a second file (`operators/my_complex.mojo`) | 31 lines, 12 of them tests ([Complex.strict](https://github.com/strict-lang/Strict/blob/master/Math/Complex.strict)) |
| Add two lists on the GPU | 43 lines (`gpu-functions/vector_addition.mojo`) | 4 lines (`Added` in [Gpt2Block.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2Block.strict)) |
| Sum of a list on the GPU | 125 lines (`gpu-functions/reduction.mojo`) | 4 lines (`Sum` in [List.strict](https://github.com/strict-lang/Strict/blob/master/List.strict)) |
| Change every pixel of an image | 72 lines, grayscale (`gpu-functions/grayscale.mojo`) | 11 lines, brightness ([AdjustBrightness.strict](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/AdjustBrightness.strict)) |
| Matrix product | 68 lines, any size on the GPU (`gpu-functions/naive_matrix_multiplication.mojo`) | 10 lines, 4x4 only (`*` in [Matrix.strict](https://github.com/strict-lang/Strict/blob/master/Math/Matrix.strict)) |
| Mandelbrot image on the GPU | 70 lines (`gpu-functions/mandelbrot.mojo`) | [FractalZoomer](https://github.com/strict-lang/DeltaEngine/tree/main/Games/FractalZoomer) is a whole zoomer, not comparable in length |

The samples are not identical: the Mojo complex type has 31 methods (division, in place operators, mixing with numbers), the Strict one 8, and the Mojo examples print their results. Shorter code says nothing about speed, that is measured [below](#measured-speed).

Where does the difference in length come from? Not from the calculation, that is about the same size in both. It comes from everything around it.

**GPU code.** Adding two lists in Strict. The first line of the body is the test, and the compiler decides if this runs on one core, all cores or the GPU:

```
Added(left Numbers, right Numbers) Numbers
	Tiny.Added((1, 2), (3, 4)) is (4, 6)
	for left
		value + right(index)
```

The same in Mojo, shortened:

```python
comptime block_size = 256
comptime num_blocks = ceildiv(vector_size, block_size)

def vector_addition(
    lhs_tensor: TileTensor[float_dtype, type_of(layout), ImmutAnyOrigin],
    rhs_tensor: TileTensor[float_dtype, type_of(layout), ImmutAnyOrigin],
    out_tensor: TileTensor[float_dtype, type_of(layout), MutAnyOrigin],
):
    var tid = block_idx.x * block_dim.x + thread_idx.x
    if tid < vector_size:
        out_tensor[tid] = lhs_tensor[tid] + rhs_tensor[tid]

# in main: create host and device buffers, copy the inputs to the device, then
ctx.enqueue_function[vector_addition](
    lhs_tensor, rhs_tensor, result_tensor,
    grid_dim=num_blocks, block_dim=block_size,
)
# copy the result back and ctx.synchronize()
```

Mojo shows you everything: the device, the buffers, the grid and the thread index. That is more code and more control, and the kernel runs on NVIDIA, AMD and Apple GPUs. Strict shows you none of it and decides by itself.

**Types and tests.** Multiplying two complex numbers in Strict, with its two tests:

```
*(other) Complex
	Complex(1, 2) * Complex(3, -1) is Complex(5, 5)
	Complex(2, 3) * Complex(4, 5) is Complex(-7, 22)
	Complex(real * other.real - imaginary * other.imaginary, real * other.imaginary + imaginary * other.real)
```

In Mojo the method is about the same size:

```python
def __mul__(self, rhs: Self) -> Self:
    return Self(
        self.re * rhs.re - self.im * rhs.im,
        self.re * rhs.im + self.im * rhs.re,
    )
```

But Python style operators come in families: `__mul__` for a complex and for a number, `__rmul__` for the number on the left, `__imul__` twice for `*=`. The tests live in a second file with imports and one function per test. In Strict there is one way to write the operator and the tests are its first lines.

**Plain loops.** The Leibniz loop, as submitted to speed-comparison:

```
mutable pi = 1
for Range(1, rounds + 1)
	pi = pi + (1 - 2 * (value % 2)) / (2 * value + 1)
```

```python
var result = Float64(0)
var sign = Float64(1)
for i in range(rounds):
    result += sign / Float64(2 * i + 1)
    sign = -sign
```

Both are short. Here the speed differs: Strict vectorizes the loop and can split it over all cores, Mojo runs it as written and leaves SIMD and threads to you.

# Measured speed

Measured on November 18, 2026 on one PC: i9-13900KF, RTX 3080, Strict as a native Windows release build, Mojo 1.2.0 (`mojo build`, default optimization) in WSL 2 with Ubuntu 26.04. On datacenter GPUs and in the number of supported models Mojo and MAX are far ahead. For plain code like these small tests, loops and benchmarks, Strict is faster in every one: the same code that Mojo runs on one thread is vectorized, split over all cores or sent to the GPU by Strict, without anything in the code asking for it. The longer the code runs, the more that counts.

**Leibniz**, 1 billion terms, the loops shown above:

| | Time |
|---|---:|
| Mojo | 747 ms |
| Strict | 8.9 ms, 84 times faster |
| Strict held to 1 thread (`STRICT_THREADS=1`) | 87 ms, 8.5 times faster |

**List loops**, nanoseconds per element. The Strict side is [LoopSpeed.strict](https://github.com/strict-lang/Strict/blob/master/Examples/LoopSpeed.strict), the Mojo side the same three loops with `List[Float64]` and `append` into a list with reserved capacity:

| Loop | Elements | Mojo | Strict |
|---|---:|---:|---:|
| `raw(index + 397) + raw(index) * raw(index + 1)` into a new list | 227 | 1.0 | 0.6 |
| | 10 million | 2.0 | 0.6 |
| `value % 7` into a new list | 227 | 0.9 | 0.7 |
| | 10 million | 1.0 | 0.7 |
| Sum of a range | 227 | 0.29 | below 0.05 |
| | 10 million | 0.36 | below 0.05 |

Strict is ahead on every row. The small lists run on one thread in both languages, the big ones use all cores in Strict. Held to one thread, the two loops that build a list of 10 million numbers take 2.7 ns in Strict, more than in Mojo, so there the gain is the automatic use of all cores. Every round allocates an 80 MB list, so Windows against Linux memory handling is part of these numbers.

**Mandelbrot in full HD** on the GPU (1920x1080, center -0.5, 3.5 wide), milliseconds per image with the result back on the CPU. Mojo is Modular's `gpu-functions/mandelbrot.mojo` with only the grid, the view and the iterations changed, a hand written kernel that is launched by hand. Strict is the same calculation as an ordinary loop in 32 bit floats, which the compiler turns into a kernel:

| Max iterations | Mojo GPU | Strict GPU |
| --------------: | --------: | ----------: |
| 100            | 0.84     | 0.92       |
| 1,000          | 1.29     | 1.39       |
| 10,000         | 5.9      | 6.2        |

Both are close to what the GPU can do, Mojo's hand written kernel is about 5-10 % faster for bigger resolutions (which is very impressive, ever other mandelbrot implementation we tested and compared against is far behind). The same loop without a GPU takes 8 ms at 100 iterations on all cores in Strict, the calculation as an ordinary Mojo loop on its one thread 88 ms.

FractalZoomer is a bit slower than both because it does more: it iterates the difference to one reference orbit calculated with double-double numbers, which is what lets it zoom to 1e30 where 32 bit floats stop after a few ten thousand times. The same full HD image takes it 1.2 ms at 100, 2.4 ms at 1,000 and 13.4 ms at 10,000 iterations, and for a view this far out the extra work buys nothing. FractalZoomer is built for zooming, not for one image: in its window it computes a new image for every frame, on average in 1 to 3 ms while zooming to 1e10 and 1e14 with up to 4,100 iterations.

# How much code

Lines counted with `wc -l` on November 17, 2026 ([modular](https://github.com/modular/modular) at `bbc13a7`), including comments, license headers and, for Strict, the tests inside every method:

| What | Strict | Modular |
|---|---:|---:|
| Qwen3 model | 257 lines (`Qwen3.strict`, `Qwen3Block.strict`), 803 with the text, coder, image and benchmark programs | 2,727 lines of Python in 18 files (`qwen3`), 865 in 8 files with the newer module API (`qwen3_modulev3`) |
| Image model | Moss: 1,741 lines in 24 files, with LoRAs, ComfyUI workflows, the browser version and its server | FLUX.2: 8,300 lines in 24 files, Z-Image: 2,804 in 11 files |
| Video model | MiniMax H3: 4,614 lines in 53 files, with sound, image generation and editing | Wan: 4,358 lines in 14 files |
| Everything below the models | `NeuralNetworks` package: 6,117 lines (attention, GGUF, GPT-2, training, tokenizers) | MAX kernel library: 609,511 lines of Mojo in 577 files |

The models are not the same on both sides, so only the size class counts: a model is a few hundred to a few thousand lines in both. The big difference is below the models. MAX's kernels are written by hand in Mojo for every operation and every kind of hardware, which is what makes that many models on NVIDIA, AMD, Apple and CPUs possible. Strict has no kernel library, the compiler generates the kernels from ordinary loops. That is 100 times less code to read and maintain, for far fewer models and less hardware. The graph compiler and runtime of MAX and the Strict compiler are not counted.

# Which one to use

Use Modular for AI inference: when you serve models to many users, need a model that exists today, need datacenter or AMD hardware, Python or a language with a stability promise. Use Strict when you want short code that is fast without tuning, tests in every method and one way to write things, for games, tools or code written by LLMs, on your own PC, on Windows, in the browser or on a phone, and can live with a small language that still changes.

Sources: [MAX and Mojo releases](https://github.com/modular/modular/releases), [Mojo is open source](https://modular.com/blog/mojo-open-source), [MAX license](https://www.modular.com/blog/max-license), [system requirements](https://max.modular.com/system-requirements/), [Modular 26.2 image generation](https://www.modular.com/blog/modular-26-2-state-of-the-art-image-generation-and-upgraded-ai-coding-with-mojo), [video generation](https://modular.com/solutions/video-generation), [MAX against vLLM user report](https://forum.modular.com/t/inference-performance-issue/2408), [Spheron comparison](https://www.spheron.network/blog/modular-max-mojo-gpu-cloud-llm-inference/).
