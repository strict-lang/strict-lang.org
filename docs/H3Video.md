---
id: H3Video
title: MiniMax H3 Video Generation
---

[StrictComfy](https://github.com/strict-lang/StrictComfy) runs MiniMax H3, a video diffusion model that makes videos with sound, completely in Strict: the Qwen3-VL 32B text encoder, the 50 transformer blocks of H3, the samplers, the video VAE and the audio VAE are Strict code compiled to native GPU kernels. It loads the same `.safetensors` model files and LoRAs as ComfyUI.

- **`H3Video.exe`** (Windows) and **`H3Video`** (Linux): a command line program that only needs the model files, no Python and no ComfyUI. This is the fastest way to generate videos with H3.
- **Strict H3 Sampler**: a ComfyUI node that replaces the sampler nodes and both VAE decodes of an H3 workflow and returns the frames and the audio. **Strict H3 Sampler (Latent)** returns the latents instead, for upscaling or a second pass.

# How it works

Like [Moss](MossImage.md), `H3Video` owns the whole pipeline instead of passing work between separate nodes:

1. **Text encoding**: every distinct prompt is encoded with Qwen3-VL 32B (NVFP4) before the video model loads, and cached per prompt. For image to video the first and last frame are encoded with the video VAE and go into the context like in ComfyUI.
2. **Sampling**: all videos of a run are sampled with one model load. Video and audio are sampled together, each on its own noise schedule.
3. **Decoding**: after the last video is sampled, the video and audio of every video are decoded and written as `.mp4` (h264 and aac with the installed ffmpeg).

Three tricks skip work, each chosen by the quality preset:

- **Routed attention** (like Sol-Attn) attends only to the parts of the video that matter.
- **Spectrum** forecasts some steps from the earlier ones instead of computing them.
- **Block skipping** (`--skip 5:45`, the default) reuses blocks 5 to 45 of the last full step on every other step: 26 % faster for an 8-step 10 s clip, with the same composition, sharpness and motion.

# Performance

A 12 s clip (480x832, 294 frames) with sound on the RTX 4090, the whole prompt from queueing to the saved mp4 (text encoding, sampling, video and audio decode, the same h264 encode everywhere):

| Sampling | Model evaluations | Whole prompt | Against ComfyUI's default | Quality |
|---|---:|---:|---:|---|
| ComfyUI's H3 template default: base model, 20 `res_multistep` steps | 20 | 291.0 s | 1x | ★★★★★ |
| ComfyUI, turbo 8-step checkpoint | 8 | 148.9 s | 2.0x | ★★★★ |
| ComfyUI, turbo checkpoint with 4 steps | 4 | 71.5 s | 4.1x | ★★ |
| ComfyUI, base model with the TaoMate 3-step LoRA | 3 | 62.4 s | 4.7x | ★ |
| `H3Video` `best` | 8 | 61.2 s | 4.8x | ★★★★ |
| `H3Video` `fast` | 8 | 44.0 s | 6.6x | ★★★★ |
| `H3Video` `faster` | 8 | 33.8 s | 8.6x | ★★★★ |
| `H3Video` `fastest` | 4 | 32.9 s | 8.8x | ★★★ |
| `H3Video` `fastest2steps` (TaoMate) | 2 | 26.9 s | 10.8x | ★ |

With the same model and steps `H3Video` is 2.2x (`fastest` against ComfyUI's 4 turbo steps) to 2.4x (`best` against 8 turbo steps) faster. Per step of a 10 s clip with the turbo checkpoint, ComfyUI's default attention takes 9.6–9.7 s, SageAttention 6.4 s, comfy_kitchen int8 5.2 s and Sol-Attn 3.3–3.5 s; Strict's `best` takes 6.0–6.1 s and `fast` 3.7 s.

Inside a ComfyUI workflow (5 s clip, 124 frames, prompt cached) ComfyUI's default workflow takes 38.5 s, the same graph with the Strict H3 Sampler node 25.4 s and `H3Video` on its own 19.0 s. The node is faster, the command line with many videos per run is the fastest.

Per video on the RTX 4090 (480x832, warm), sampling and the finished video:

| `--quality` | Model | Steps | 5 s (124 frames) | 10 s (243 frames) |
|---|---|---:|---:|---:|
| `best` (default) | turbo int8 8-step | 8 | 13.7 s, 19.0 s | 34.6 s, 44.7 s |
| `fast` | turbo, routed attention | 8 | 10.7 s, 16.2 s | 21.5 s, 31.8 s |
| `faster` | turbo, routed, Spectrum | 8 (5 evaluated) | 6.6 s, 11.9 s | 14.1 s, 24.6 s |
| `fastest` | turbo, routed | 4 | 6.6 s, 12.5 s | 13.3 s, 24.3 s |
| `fastest2steps` | base + TaoMate 3-step LoRA | 2 | 4.2 s, 10.0 s | 9.4 s, 20.1 s |

The first video of a run also loads the 21 GB model (14–20 s) and the VAEs, a new prompt adds the text encoder (about 29 s to load, 7 s per prompt). That is why many videos per run pay off. All charts are in the [Performance section](/#generation), the method in [Benchmarks](Benchmarks.md).

# Supported GPUs

`H3Video` runs on Windows and Linux with an NVIDIA GPU; the release ships compiled GPU code for the RTX 20, 30, 40 and 50 series, other NVIDIA GPUs compile the shipped PTX once. The numbers above are measured on an RTX 4090 with 24 GB: the H3 model alone is 21 GB, so it needs a big card.

# Command line

`H3Video` reads `prompt.txt` from the current folder and the models from your ComfyUI `models` folder:

```sh
H3Video.exe --count 4
H3Video.exe --quality faster --count 4 --sampler res_multistep
H3Video.exe --quality fastest2steps --length 243 --seed 7
H3Video.exe --image first.png --last_image last.jpg
H3Video.exe --image starts --prompt prompts --length 49
H3Video.exe --workflow my_h3_workflow.json --count 10
```

`--image` takes a folder too, one video per image, and a `--prompt` folder gives each image the prompt of its name. `--sampler` and `--scheduler` take the ComfyUI samplers and schedulers H3 workflows use (`euler`, `res_multistep`, `er_sde`, `euler_ancestral`, `dpmpp_2m_sde`, `gradient_estimation`, `lcm`; `simple`, `sgm_uniform`, `normal`, `beta`, `beta57`, `linear_quadratic`, `hyperflow`). `--workflow` runs a ComfyUI image to video workflow with its model, LoRAs, prompt, images, size, length and sampler settings. `--help` lists every option, the [StrictComfy README](https://github.com/strict-lang/StrictComfy) explains the ComfyUI nodes.

# Why not in the browser?

[Moss runs in the browser](MossImage.md#moss-in-the-browser), H3 does not. The model is 21 GB in int8 and its text encoder a 32B model, while a browser page can use about 4 GB and WebGPU is far from the speed of native CUDA kernels. Even heavily compressed, H3 is way too big to ever get a useful generation rate out of it in a browser or on a phone.
