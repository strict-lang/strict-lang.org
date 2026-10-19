---
title: Faster Inference, Better Memory Reuse and Smaller Builds
author: Benjamin Nitschke
---

Strict's latest development results put **Qwen3-8B at 150–151 generated tokens/second on an RTX 4090**, with much faster prompt processing and up to **2,357 tokens/second across 32 sequences**. Qwen3-Coder-30B-A3B runs at **200 decode tokens/second**. Memory reuse has improved across native programs, and the compiler and generated `Release` builds are smaller. A new `small` build option lets you trade some execution speed for a further size reduction.

<!--truncate-->

## Inference beyond single-token speed

Qwen3-8B Q4_K_M now decodes in **6.6–6.7 ms per token**, improving on the 141–143 tokens/second reported last week. The recorded llama.cpp b11658 CUDA comparison is 7.25 ms, or 138 tokens/second. These are development measurements on an RTX 4090 with the same GGUF weights and greedy sampling.

Prompt processing has made a larger jump. Tiled quantized matrix products, fused bias operations and FlashAttention-style attention bring an 8B prompt of 460 or 1,820 tokens to **0.15 ms per token**. The benchmark reports the fastest of three prefills, because a full collection can interrupt an individual run. This is prompt throughput, separate from generated-token latency; llama.cpp's recorded 460-token result remains faster at 0.10 ms/token.

Tensor-core batching delivers **953 tokens/second across 8 sequences**, **1,655 across 16**, and **2,357 across 32**. Those are aggregate rates for sequences at the same position. Continuous batching with different sequence lengths remains work to do.

The optional 8-bit key/value cache takes **74 KB instead of 295 KB per token** for Qwen3-8B, allowing about four times the context in the same cache memory. It can change generated text. With it, decoding after 29,700 prompt tokens takes 12.8 ms per token.

Qwen3-Coder-30B-A3B's GPU expert routing reaches 5.0 ms per token in steady-state decoding. Its initial 18.6 GB expert upload still dominates short runs, so the 200 tokens/second figure should not be read as end-to-end throughput. [Machine Learning](/docs/MachineLearning) has the commands, comparison table and source measurements.

## Reuse memory across real workloads

Most of the major planned runtime and inference features are now implemented and tested. The work is increasingly about measuring and tuning them together across the compiler, games and neural networks.

The runtime combines young-generation collection with deferred reference counting. Larger dead objects, and small objects holding them, can be reclaimed without tracing all surviving data. Their blocks are reused by the next matching allocation; large allocations are reused too. In the recorded 784-64-6 MNIST training case, this reduced execution time from **834 to 520 ms**. Reference-count verification across **349 test programs and `strict.exe`** reported no counts too low.

Native `Vector2` and `Size` now hold two 32-bit floats in one 64-bit slot. Number members declaring 32-bit precision round consistently on construction in the VM and native code. Tail calls that return directly recurse without growing the stack on both paths, and cached test results track the source and data files they actually depend on.

There is still back and forth before every use case is tuned. Freeing each tiny object made self-compilation slower, so those objects stay with the collector unless they hold a counted object. Rewriting uniquely owned values in place, bulk reclamation of small objects and flat layouts for larger numeric types remain open. [Architecture](/docs/Architecture) describes the current memory model; the [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) tracks remaining work, including language-server and VM debugger tooling.

## Smaller executables, with speed as the default

`strict.exe` and generated `Release` builds are smaller now. GPU kernels live in companion `.ptx` files beside the executable, so include those files when distributing a GPU application.

The default build remains **fast** (`-O2`). To favor size, add `small`:

```sh
strict build Examples/Sum.strict small
strict build Examples/Sum.strict windows small
```

This uses `-Os` for both the Strict program and its package-local C code. It can reduce size further, at the cost of **up to 20% slower execution in some demanding paths**. Choose it when the smaller output is worth that tradeoff, and measure the workload you ship.

Windowed applications keep their `Release` folder between builds, with project content built or copied incrementally. These changes keep development and distribution practical as the [projects using Strict](/docs/Projects) grow. The editor workflow stays the same: write the inline tests, follow the values in SCrunch, and measure the native program when performance matters.
