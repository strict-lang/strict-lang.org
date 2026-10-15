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
* **Qwen3:** GGUF loading, RMS normalization, grouped-query attention, rotary positions and SwiGLU. The reader supports F32, F16, BF16 and Q8_0 tensors. Q4_K, Q6_K and mixture-of-experts routing remain future work.
* **Shared generation:** `Generation` continues prompts with either model. Tests compare the tiny fixtures with reference logits and tokens from the transformers library.

# Performance and limits

The [package measurements](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/README.md) from October 15, 2026 report GPT-2 at 11.7 ms per generated token with 16-bit weights and 8.6 ms with 8-bit weights on an i9-13900KF using parallel CPU loops. These are workload-specific development measurements, not guarantees; precision, prompt, token count and hardware affect both speed and output.

Eligible matrix loops also run on NVIDIA GPUs. Transfers and driver launches can outweigh the gain, so the default uses the CPU for smaller work and 8-bit rows. See [Concurrency](Concurrency.md) for SIMD, packed weights, automatic selection and `STRICT_GPU` controls.

Safetensors currently reads F32 source tensors and can repack them for execution. Larger quantization formats and keeping intermediate results on the GPU are still open work. The [NeuralNetworks README](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/README.md) and [improvements list](https://github.com/strict-lang/Strict/blob/master/improvements.md) track the supported models and current gaps.
