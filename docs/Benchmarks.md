---
id: Benchmarks
title: Benchmarks
---

Where the code behind each chart in the [Performance section](/#performance) lives and how to run it. Everything is written in Strict and builds with `strict build`, comparisons use the same inputs and settings.

All paths are in the [Strict repository](https://github.com/strict-lang/Strict) unless noted.

| Benchmark | Source | Compared against |
|-----------|--------|------------------|
| Image Blur | [ImageProcessing/BenchBlur.strict](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/BenchBlur.strict) | [ImageProcessing/Compare](https://github.com/strict-lang/Strict/tree/master/ImageProcessing/Compare): C, Rust, Goose, C#, TypeScript, Python, NumPy |
| Qwen3 models | [NeuralNetworks/Qwen3Benchmark.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3Benchmark.strict) | llama.cpp, Ollama |
| Qwen3.8 and reasoning models | [NeuralNetworks/Qwen3Benchmark.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3Benchmark.strict) | llama.cpp, Ollama |
| GPT-2 text generation | [NeuralNetworks/Gpt2Benchmark.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2Benchmark.strict) | PyTorch with Hugging Face transformers |
| Moss image generation | StrictComfy `MossImage.strict`, coming soon | ComfyUI |
| MiniMax H3 video | StrictComfy `H3Video.strict`, coming soon | ComfyUI |

# Image Blur

A 9x9 box blur of a 4096x2048 photo, written as a plain loop. Everything needed (input image, build and run commands for every language) is described in the [Compare README](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/Compare/README.md).

```sh
strict build ImageProcessing/BenchBlur.strict
ImageProcessing/BenchBlur.exe
```

Set `STRICT_THREADS=1` for one thread or `STRICT_GPU=0` for CPU only.

# Qwen3 and Qwen3.8

The model code is in [Qwen3.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3.strict) and [Qwen3Block.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3Block.strict), the GGUF reader in `Gguf.strict`. [Qwen3Benchmark.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3Benchmark.strict) reports prefill and decode speed, [Qwen3Text.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Qwen3Text.strict) generates text. The baseline is llama.cpp (b11658, CUDA) on the same GGUF files and GPU.

```sh
strict build NeuralNetworks/Qwen3Benchmark.strict
```

See [Machine Learning](MachineLearning.md) for the downloads and measured results.

# GPT-2

[Gpt2.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2.strict), [Gpt2Block.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2Block.strict) and [Gpt2Tokens.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2Tokens.strict) hold the model, [Gpt2Benchmark.strict](https://github.com/strict-lang/Strict/blob/master/NeuralNetworks/Gpt2Benchmark.strict) measures milliseconds per token. The baseline is PyTorch with Hugging Face transformers, best of 3 runs.

```sh
strict build NeuralNetworks/Gpt2Benchmark.strict
```

# Moss image and MiniMax H3 video

Both run through StrictComfy, which loads the same model files and LoRAs as ComfyUI and runs the diffusion in Strict. The source and instructions are coming soon.
