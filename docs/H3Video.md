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
- **Block skipping** (`--skip 5:45`, the default of every preset but `best`) reuses blocks 5 to 45 of the last full step on every other step: 28 % faster for an 8-step 10 s clip, with the same composition, sharpness and motion.

# Performance

A 12 s clip (480x832, 294 frames) with sound on the RTX 4090, the whole prompt from queueing to the saved mp4 (text encoding, sampling, video and audio decode, the same h264 encode everywhere):

| Sampling | Model evaluations | Whole prompt | Against ComfyUI's default | Quality |
|---|---:|---:|---:|---|
| ComfyUI's H3 template default: base model, 20 `res_multistep` steps | 20 | 291.0 s | 1x | ★★★★★ |
| ComfyUI, turbo 8-step checkpoint | 8 | 148.9 s | 2.0x | ★★★★ |
| ComfyUI, turbo checkpoint with 4 steps | 4 | 71.5 s | 4.1x | ★★ |
| ComfyUI, base model with the TaoMate 3-step LoRA | 3 | 62.4 s | 4.7x | ★ |
| `H3Video` `best` | 8 | 70.7 s | 4.1x | ★★★★ |
| `H3Video` `fast` | 8 | 41.4 s | 7.0x | ★★★★ |
| `H3Video` `faster` | 8 | 29.1 s | 10.0x | ★★★★ |
| `H3Video` `fastest4steps` | 4 | 27.6 s | 10.5x | ★★★ |
| `H3Video` `fastest2steps` (TaoMate) | 2 | 20.9 s | 13.9x | ★ |

With the same model and steps `H3Video` is 2.1x (`best` against ComfyUI's 8 turbo steps) to 2.6x (`fastest4steps` against 4 turbo steps) faster. Per step of a 10 s clip with the turbo checkpoint, ComfyUI's default attention takes 9.6–9.7 s, SageAttention 6.4 s, comfy_kitchen int8 5.2 s and Sol-Attn 3.3–3.5 s; Strict's `best` takes 5.5 s and `fast` 4.3 s, or 0.9 s for a step that reuses blocks.

Inside a ComfyUI workflow (5 s clip, 124 frames, prompt cached) ComfyUI's default workflow takes 38.5 s, the same graph with the Strict H3 Sampler node 25.4 s and `H3Video` on its own 17.8 s. The node is faster, the command line with many videos per run is the fastest.

Per video on the RTX 4090 (480x832, warm, prompt already encoded), sampling and the finished video, November 19:

| `--quality` | Model | Steps | 5 s (124 frames) | 10 s (243 frames) |
|---|---|---:|---:|---:|
| `best` | turbo LoRA | 8 | 17.7 s, 22.0 s | 44.4 s, 52.4 s |
| `fast` (default) | turbo LoRA, routed attention, block skipping | 8 | 10.9 s, 14.0 s | 24.8 s, 30.8 s |
| `faster` | turbo LoRA, routed, block skipping, Spectrum | 8 (5 evaluated) | 6.8 s, 9.9 s | 15.2 s, 21.1 s |
| `fastest4steps` | TaoMate 3-step LoRA, routed, block skipping | 4 | 6.1 s, 9.2 s | 14.3 s, 20.3 s |
| `fastest2steps` | TaoMate 3-step LoRA, routed | 2 | 4.1 s, 7.2 s | 9.3 s, 15.2 s |

The first video also starts a backend that loads the text encoder (6–10 s), the 21 GB model with its LoRA (about 17 s) and the VAEs (3.6 s) and keeps them for the next runs. A new prompt then adds about 1.5 s for its text encoding. All charts are in the [Performance section](/#generation), the method in [Benchmarks](Benchmarks.md).

# H3 Image

`H3Image.exe` (also in StrictGen) generates and edits images with MiniMax H3 Image. It keeps the 32B text encoder, H3 Image and its VAE loaded in a backend. Text to image with the 6 distilled steps of ComfyUI's H3 Image template on the RTX 4090, warm, a new prompt every run, seconds from the prompt to the saved image (text encoding, sampling, VAE decode, save) on the same GPU and model files:

| Size | `H3Image` | ComfyUI's H3 Image template | Faster |
|---|---:|---:|---:|
| 1024x1024 | 2.8 s | 6.9 s | 2.5x |
| 2048x2048 | 5.1 s | 13.1 s | 2.6x |
| 2880x2880 | 8.3 s | 20.1 s | 2.4x |
| 4096x4096 | 18.4 s | 27.2 s | 1.5x |

At 4096x4096 the sampling dominates. Another seed of the same prompt takes 1.2 s at 1024x1024 and 3.9 s at 2048x2048, the first run of a backend about 30 s. The VAE decodes with 8 bit weights (56 dB against 32 bit, 2.5 s down to 0.6 s at 2048x2048). Strict side November 19, ComfyUI November 12.

Editing a 2048x2048 image takes 8.7 s with the same image and instruction, 12.8 s with a new instruction and 14.3 s with a new image too. An edit encodes the image with the vision part of the text encoder and with the VAE; the backend keeps both and the encoded image, so editing the same image again with another seed or instruction skips that work.

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
