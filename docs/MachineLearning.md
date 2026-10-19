---
id: MachineLearning
title: Machine Learning
---

Strict now has working [NeuralNetworks](https://github.com/strict-lang/Strict/tree/master/NeuralNetworks) and [MachineLearning](https://github.com/strict-lang/Strict/tree/master/MachineLearning) packages. They exercise the same language, inline tests and native compiler as other programs. The neural-network layers, training algorithms, transformer blocks and tokenizers are written in Strict; small native helpers read tensor data.

# Start small

From the Strict repository root:

```sh
strict build NeuralNetworks/Xor.strict
strict build NeuralNetworks/Iris.strict
strict build MachineLearning/IrisClassifiers.strict
```

Run the resulting executable next to each source file to try it. Small programs can also run on the VM with `strict NeuralNetworks/Xor.strict`.

| Example | What it demonstrates |
|---------|----------------------|
| [LogicGates](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/LogicGates.strict) and [Xor](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Xor.strict) | Perceptrons and a hidden layer |
| [Iris](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Iris.strict) | Classification, softmax and cross-entropy training |
| [ActivationComparison](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/ActivationComparison.strict) and [OptimizerComparison](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/OptimizerComparison.strict) | Activation functions, momentum, RMSprop and Adam |
| [BinaryAddition](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/BinaryAddition.strict) and [ReberPrediction](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/ReberPrediction.strict) | Recurrent networks and GRUs learning sequences |
| [Neuroevolution](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Neuroevolution.strict) and [ArmEvolution](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/ArmEvolution.strict) | Evolving network weights and robot-arm joint angles |
| [IrisClusters](https://github.com/strict-lang/Strict/blob/master/MachineLearning/IrisClusters.strict) and [IrisClassifiers](https://github.com/strict-lang/Strict/blob/master/MachineLearning/IrisClassifiers.strict) | K-means, nearest neighbors, naive Bayes, decision trees and random forests |
| [MarkovText](https://github.com/strict-lang/Strict/blob/master/MachineLearning/MarkovText.strict) | Character generation from a downloaded text corpus |

Larger datasets belong outside the compiler repository. The [Mnist project](https://github.com/strict-lang/Mnist) contains the handwritten-digit example.

# GPT-2 and Qwen3 inference

```sh
strict build NeuralNetworks/Gpt2Text.strict
strict build NeuralNetworks/Qwen3Text.strict
```

These examples download model files on first use: GPT-2 124M uses a roughly 548 MB safetensors file in `gpt2/`, and Qwen3 0.6B uses a roughly 805 MB Q8_0 GGUF file in `qwen3/`. Use native builds for the real models; the VM is not suitable for them. Inline tests use tiny model fixtures instead.

* **GPT-2:** safetensors loading, a byte-pair tokenizer, transformer blocks with cached keys and values, and greedy generation. Weights can use 32-bit floats, 16-bit halves or Q8_0 quantization through `Gpt2.Loaded(path, 32)`, `16` or `8`.
* **Qwen3:** GGUF loading, RMS normalization, grouped-query attention, rotary positions and SwiGLU. The reader supports F32, F16, BF16, Q8_0, Q4_K and Q6_K tensors. Packed quantized blocks stay compact during execution. Mixture-of-experts routing supports Qwen3-Coder-30B-A3B as well as dense Qwen3 models.
* **Shared generation:** `Generation` continues prompts with either model. Tests compare the tiny fixtures with reference logits and tokens from the transformers library.

# Qwen3-8B: faster than llama.cpp

Qwen3-8B Q4_K_M reaches **150–151 generated tokens/second** (6.6–6.7 ms per token) on an RTX 4090 in the development results reviewed October 19. The recorded llama.cpp b11658 CUDA comparison takes 7.25 ms (138 tokens/second). The transformer logic is written in Strict. The measured baseline is llama.cpp, not a separate Ollama run.

| Model and weights | Strict GPU decode | llama.cpp CUDA comparison |
|-------------------|-------------------|---------------------------|
| Qwen3-8B Q4_K_M | 6.6–6.7 ms/token (150–151 tokens/s) | 7.25 ms/token (138 tokens/s) |
| Qwen3 0.6B Q4_K_M | 2.2–3.1 ms/token | 2.2 ms/token |
| Qwen3-Coder-30B-A3B Q4_K_M (mixture of experts) | 5.0 ms/token (200 tokens/s) | 4.78 ms/token (209 tokens/s) |

The recorded setup uses an RTX 4090 with 24 GB VRAM, a Threadripper 3990X and 128 GB RAM. The comparison uses the same GGUF weights and greedy sampling. These are steady-state decode measurements; prompt processing, context length, batching and startup are separate costs. In particular, the 30B example's initial upload of 18.6 GB of experts makes a short end-to-end run much slower than its 200 tokens/s decode rate. The [NeuralNetworks README](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/README.md) records the measurements; the benchmark reports warmup, prefill, median, mean and p95 decode latency separately.

## Prompt processing, batches and longer context

Qwen3-8B now processes prompts in chunks of up to 2,048 tokens. Tiled quantized matrix products and FlashAttention-style attention bring prefill to **0.15 ms per token at both 460 and 1,820 tokens**, and 0.17 ms at 3,720 tokens. These are the fastest of three prefills; full collections can interrupt individual runs. A 10-token prompt takes 1.0–1.2 ms/token and a 100-token prompt 0.21 ms/token. The recorded llama.cpp figures for 10, 100 and 460 tokens are 1.18, 0.175 and 0.10 ms/token.

| Qwen3-8B simultaneous sequences | Aggregate decode throughput | Recorded llama.cpp comparison |
|--------------------------------|-----------------------------|------------------------------|
| 8 | 953 tokens/s | 727 tokens/s |
| 16 | 1,655 tokens/s | — |
| 32 | 2,357 tokens/s | — |

These batch results combine tokens from all sequences at the same position; continuous batching with different sequence lengths is still open. They are separate from single-sequence latency.

An optional **8-bit key/value cache uses 74 KB instead of 295 KB per token** for the 8B model, fitting about four times the context in the same cache memory. Quantization can change generated text. With that cache, decode takes 8.6 ms/token after 7,450 prompt tokens, 9.7 ms after 14,900 and 12.8 ms after 29,700.

Build the benchmark from the repository root, then pass a local GGUF file:

```sh
strict build NeuralNetworks/Qwen3Benchmark.strict
NeuralNetworks/Qwen3Benchmark.exe path/to/Qwen3-8B-Q4_K_M.gguf 4 128
```

On Linux run `NeuralNetworks/Qwen3Benchmark` without the `.exe` suffix. The second argument keeps the weights in their quantized form; the final argument selects the number of generated tokens.

![Qwen3-8B inference pipeline in Strict at 150 tokens per second](/img/QwenInference.svg)

# What makes it fast

Quantized matrices remain packed, numeric loops become GPU kernels, intermediate calculations stay on the device and graph replay reduces host launch overhead. CPU workers and SIMD remain useful for other workloads. Set `STRICT_GPU=0` for a CPU comparison or `STRICT_GRAPHS=0` to measure without graph replay. See [Concurrency](Concurrency.md).

Graph replay, tiled tensor-core matrix products, fused bias operations, flash attention, batched decoding and the 8-bit cache are implemented and measured. Remaining work includes fewer small kernel launches, prefill pauses, continuous batching and memory reuse across larger workloads. Performance results are recorded per model and workload as the implementation changes. The earlier GPT-2 CPU benchmark reached 8.6 ms/token with 8-bit weights on an i9-13900KF; it is a different model and setup from the Qwen3 GPU results above.

# More than inference

The package also trains networks and implements recurrent models, GRUs, optimizers and evolutionary algorithms. [Qwen3CoderText](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3CoderText.strict) runs Qwen3-Coder-30B-A3B with expert routing. Tiny model fixtures compare logits and generated tokens with reference implementations, keeping the tests small while real models remain external downloads.

Open a block or layer in [VS Code](VSCode.md), press F12 into the operations it uses and read the tests beside the implementation. [Line values and coverage](Tests.md) make these algorithms easier to follow, using the same workflow as your own application code.
