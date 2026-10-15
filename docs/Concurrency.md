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

Eligible numeric collecting loops become PTX kernels embedded in the native executable. The runtime loads the NVIDIA driver through `nvcuda.dll` on Windows or `libcuda.so.1` on Linux. Running them needs a compatible driver and GPU, but no CUDA toolkit; building them uses the LLVM toolchain.

By default a loop must read at least four million numbers before it uses the GPU. Smaller loops stay on the CPU to avoid launch and transfer overhead. Bodies can perform numeric arithmetic, read list elements and call supported numeric methods, including conditionals inside those methods. An inner sum can use a warp of 32 threads per result row.

* Lists of at least 64 KB can keep a device copy between launches. The cache holds at most 128 lists and releases copies when garbage collection finds the source unreachable.
* Packed 8-, 16- and 32-bit data can stay packed on the device. Automatic selection currently keeps 8-bit rows on the CPU, where they are faster.
* `Range` loops stay on the CPU. A conditional directly in a collecting loop body also prevents the current parallel path.
* Without a usable GPU the program falls back to the CPU. GPU support does not make arbitrary Strict code run on the device.

Set `STRICT_GPU=0` in the program's environment to keep execution on the CPU, or `STRICT_GPU=all` to send every eligible loop to the GPU for experiments. GPU execution can be slower when transfers and driver launches outweigh the calculation. Profile the actual workload instead of assuming a speedup.

See [MlirGpu](https://github.com/strict-lang/Strict/blob/master/Compiler/MlirGpu.strict), the [current runtime model](https://github.com/strict-lang/Strict#how-it-is-built-from-low-to-high-level) and [Machine Learning](MachineLearning.md) for working examples. Distributed execution and NPU/TPU backends remain goals rather than supported execution paths.
