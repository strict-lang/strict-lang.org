---
id: Concurrency
title: Concurrency
---

Strict code uses ordinary expressions and immutable values. Native compilation decides which numeric loops can run on several CPU threads or an NVIDIA GPU. There are no thread, lock or async keywords to add to your program.

# CPU parallel loops

A collecting `for` with at least 256 elements can use a worker pool when its body only calculates: arithmetic, reading lists and members, and calling methods that do the same. A pool of a quarter of the logical processors divides the elements into chunks. Garbage collection waits until the workers finish.

Logging, files, processes, random numbers, list writes, constructing texts or lists, and nested collecting loops exclude a loop from this path. Loops with side effects or unsupported control flow remain serial. This is a native compiler optimization; running bytecode on the Strict VM does not use these native loop kernels.

The implementation is in [MlirParallel](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirParallel.strict) and [MlirPurity](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirPurity.strict). [NeuralNetworks/Layer](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Layer.strict) uses this for matrix products, computing one result for each weight row.

# SIMD and packed numbers

Native numeric sum loops can be vectorized. Lists supplied by native packages may keep 32-bit floats, 16-bit halves or Q8_0 8-bit quantized weights packed in memory. Supported reduction loops read them directly; another use unpacks them into ordinary double-precision numbers once. The Strict `Number` type remains a 64-bit floating-point value.

A sum can add terms in a different order after optimization, so its last fractional bits can differ between the VM and native executable. Compare approximate results with `IsNearlyEqual`. Other operations retain their written order.

# NVIDIA GPU execution

Eligible numeric loops become PTX kernels in the native executable. The runtime uses the installed NVIDIA driver on Windows or Linux; running the executable needs no separate CUDA toolkit. Selection retains a CPU fallback for workloads where a GPU is unavailable or not useful.

Packed Q4_K, Q6_K, Q8_0, 16-bit and 32-bit data reduce memory traffic. Transformer calculations can keep intermediate results on the device, and graph replay reduces repeated host launch work. This lets a Qwen3 step run predominantly on the GPU rather than copying each matrix result back to the CPU.

[Qwen3-8B measurements](MachineLearning.md#qwen3-8b-faster-than-llamacpp) now reach 150–151 decode tokens/second on an RTX 4090, with 953 aggregate tokens/second across 8 sequences and 2,357 across 32. Tiled tensor-core matrix products, fused biases, flash attention and an optional 8-bit KV cache are implemented. Work continues on launch overhead, memory reuse and continuous batching. Distributed execution and NPU/TPU backends remain longer-term directions; the current GPU runtime targets NVIDIA.

[![MlirGpu.strict in VS Code showing tests and generated GPU launch code](/img/screenshots/gpu-kernels.jpg)](/img/screenshots/gpu-kernels.jpg)

The compiler builds GPU launch code in Strict. [Open MlirGpu.strict](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirGpu.strict).

# Measure your workload

Use `strict test <file> lines` or VS Code's **Run with Coverage** to inspect execution counts and total/self time. Source-line values on the VM explain what a test did; native profiling explains where the compiled code spent time. See [Tests](Tests.md).

Set `STRICT_GPU=0` in the program's environment to compare against the CPU, or `STRICT_GRAPHS=0` to disable graph replay. Use the same weights, prompt, context and sampling when comparing inference results, and keep prefill separate from decode. Faster kernels do not automatically make every small program faster.

The [current runtime model](https://github.com/strict-lang/Strict#how-it-is-built-from-low-to-high-level) and [NeuralNetworks README](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/README.md) describe the implementation and measured workloads.
