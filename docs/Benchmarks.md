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
| Bouncing logos (game engine stress test) | [DeltaEngine Games/LogoApp](https://github.com/strict-lang/DeltaEngine/tree/main/Games/LogoApp) | [Unity 2022.3](https://github.com/strict-lang/DeltaEngine/tree/main/Games/LogoApp/Compare) |
| Forest (3D instancing stress test) | [DeltaEngine Games/Forest](https://github.com/strict-lang/DeltaEngine/tree/main/Games/Forest) | [Unity 2022.3](https://github.com/strict-lang/DeltaEngine/tree/main/Games/Forest/Compare) |
| 1 million particles (entity stress test) | [DeltaEngine Games/ParticleStress](https://github.com/strict-lang/DeltaEngine/tree/main/Games/ParticleStress) | [Unity 2022.3](https://github.com/strict-lang/DeltaEngine/tree/main/Games/ParticleStress/Compare) |
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

# Bouncing logos

The DeltaEngine LogoApp with 1,000 to 100,000 logos, each an entity with a sprite, a velocity and a spin, moved, turned and bounced every frame, drawn at 1280x720 with vsync off. The [Compare README](https://github.com/strict-lang/DeltaEngine/blob/main/Games/LogoApp/Compare/README.md) builds the same scene in Unity and times both the same way.

```sh
../Strict/strict.exe build Games/LogoApp/LogoApp.strict
cd Games/LogoApp/Release/Windows
DELTA_VSYNC=0 ./LogoApp.exe 300 100000
```

# Forest

The DeltaEngine Forest with 1,000 to 100,000 fir trees of 192 triangles on rolling hills, seen from just above the forest, every tree circles around its spot and turns every frame, drawn at 1280x720 with vsync off. The [Compare README](https://github.com/strict-lang/DeltaEngine/blob/main/Games/Forest/Compare/README.md) builds the same scene in Unity, with a GameObject per tree or with Graphics.RenderMeshInstanced, and times all of them the same way: milliseconds per frame from frame 50 on.

```sh
../Strict/strict.exe build Games/Forest/Forest.strict
cd Games/Forest/Release/Windows
DELTA_VSYNC=0 ./Forest.exe 300 100000
```

# 1 million particles

The DeltaEngine particle processor (`EffectSystem.Advanced`, on all cores) with 1,000 to 1,000,000 particles, each an entity with 5 components (position, velocity changed by an acceleration, rotation turned by a torque, a growing scale and a lifetime), updated every tick without rendering. The [Compare README](https://github.com/strict-lang/DeltaEngine/blob/main/Games/ParticleStress/Compare/README.md) builds the same particles in Unity as GameObjects with a MonoBehaviour per component.

```sh
../Strict/strict.exe build Games/ParticleStress/ParticleStress.strict
Games/ParticleStress/ParticleStress.exe 100 1000000
```

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
