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
| Moss image generation | [StrictComfy MossImage.strict](https://github.com/strict-lang/StrictComfy/blob/main/MossImage.strict), [MossWeb.strict](https://github.com/strict-lang/StrictComfy/blob/main/MossWeb.strict) | ComfyUI |
| MiniMax H3 video | [StrictComfy H3Video.strict](https://github.com/strict-lang/StrictComfy/blob/main/H3Video.strict) | ComfyUI |

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

The DeltaEngine particle processor (`EffectSystem.Advanced`, on all cores) with 1,000 to 1,000,000 particles, each an entity with 5 components (position, velocity changed by an acceleration, rotation turned by a torque, a growing scale and a lifetime), updated every tick without rendering. The [Compare README](https://github.com/strict-lang/DeltaEngine/blob/main/Games/ParticleStress/Compare/README.md) builds the same particles in Unity as GameObjects with a MonoBehaviour per component, and as one of Unity's own ParticleSystems simulated natively on its job threads.

```sh
../Strict/strict.exe build Games/ParticleStress/ParticleStress.strict
Games/ParticleStress/ParticleStress.exe 100 1000000
```

# FractalZoomer

Milliseconds for one finished image at all iterations (the Time shown in the right panel at rest), Image Scale 100%, a 1280x720 window, one Nvidia RTX 3080, Chrome 156 with WebGPU, November 2026. The web version computes 855x615 pixels, the Windows exe 933x573 (both about 0.53 megapixels). Too few iterations for a view give an all black image, so a link or zoom straight into a deep view raises the max iterations by 50% until the image shows detail: 100 grew to 8,675 at 1e20x and to 29,280 at 1e30x by itself.

| View | Iterations | Web (WebGPU, f32) | Windows exe (CUDA) | Other web viewer | Other web viewer |
| --- | --- | --- | --- | --- | --- |
| [Start](https://strict-lang.org/games/FractalZoomer/FractalZoomer.html?x=-0.5&y=0&z=1&i=100&s=1) | 100 | 12.5 ms | 6.8 ms | | |
| [Needle Chasm, 1e8x](https://strict-lang.org/games/FractalZoomer/FractalZoomer.html?x=-1.7706660190054566&y=-0.016332605287125934&z=100000000&i=1700&s=1) | 1,700 | 25.4 ms | 25.8 ms | | |
| [Seahorse Valley, 1e20x](https://strict-lang.org/games/FractalZoomer/FractalZoomer.html?x=-0.743643887037158704752191506114774&y=0.131825904205311970493132056385139&z=100000000000000000000&i=8675&s=1) | 8,675 | 100.2 ms | 147.2 ms | | |
| [Seahorse Valley, 1e30x](https://strict-lang.org/games/FractalZoomer/FractalZoomer.html?x=-0.743643887037158704752191506114774&y=0.131825904205311970493132056385139&z=1000000000000000000000000000000&i=29280&s=1) | 29,280 | 296.3 ms | 517.9 ms | | |

The web times stay the same over 4 readings, the exe times are the average of 3 runs. The web version keeps 60 fps while zooming continuously (2.7-11 ms per image at Image Scale 200%, down to 2.6e18x). The Windows exe opens the same views from the link in the `STRICT_LINK` environment variable:

```sh
../Strict/strict.exe build Games/FractalZoomer/FractalZoomer.strict
cd Games/FractalZoomer/Release/Windows
STRICT_LINK="x=-0.5&y=0&z=1&i=100&s=1" ./FractalZoomer.exe 120
cat artifacts/FractalZoomer.txt
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

Both run through [StrictComfy](https://github.com/strict-lang/StrictComfy), which loads the same model files and LoRAs as ComfyUI and runs the whole pipeline in Strict: text encoder, diffusion model, sampler and decoders. The releases of `MossImage` and `H3Video` for Windows and Linux are in its `Release` folder, built with:

```sh
strict build MossImage.strict windows
strict build H3Video.strict linux
strict build MossWeb.strict web
```

The Moss charts are batches of 720x1280 images of the default prompt (`MossImage --count 50`), the H3 charts a 12 s clip from the prompt to the saved mp4. ComfyUI runs its default workflows on the same GPU, model files and LoRAs. The Strict Moss Sampler node only replaces ComfyUI's sampling, so its gain grows with the image size: on the RTX 3080 per image 6.5 s against 4.5–4.8 s at 720p and 13.7 s against about 7 s at 1088p, while at 480p and below ComfyUI's own overhead (prompt encoding, passing models and conditioning, preparing the GPU per run, decoding) hides most of it. The H3 node measurements on the RTX 4090 are still to come. What the presets do, which GPUs are supported and how the browser version works is in [Moss Image Generation](MossImage.md) and [MiniMax H3 Video Generation](H3Video.md); MossWeb runs at [strict-lang.org/moss/MossWeb.html](https://strict-lang.org/moss/MossWeb.html).
