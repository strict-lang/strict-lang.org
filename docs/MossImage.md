---
id: MossImage
title: Moss Image Generation
---

[StrictComfy](https://github.com/strict-lang/StrictComfy) runs the MOSS-Image diffusion model completely in Strict: the Qwen3.5 9B text encoder, the Moss diffusion transformer, the sampler and the image decoder are all Strict code, compiled to native GPU kernels for NVIDIA GPUs or to WebGPU shaders for the browser. The same `.safetensors` model files and LoRAs as in ComfyUI are used.

There are three ways to use it:

- **`MossImage.exe`** (Windows) and **`MossImage`** (Linux): a command line program that only needs the model files, no Python and no ComfyUI. This is the fastest way to generate images with Moss.
- **Strict Moss Sampler**: a ComfyUI node that replaces the KSampler in a Moss workflow and samples with a resident `MossImage` process.
- **[MossWeb](https://strict-lang.org/moss/MossWeb.html)**: the same Strict code running in your browser on WebGPU, nothing to install, works even on mobile. It is about 2 times slower and worse quality (int4 only, 4 step turbo lora) than MossImage executable and way worse for bigger images because of the 4gb limit in browsers and WebGPU, but still fun to use as you need nothing to install and can still run Moss locally. 100% private and stays in your browser cache. Any lora can be added on top, ComfyUI workflow import is posssible, completely uncensored, everything runs on your hardware.

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 600px"><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample1.jpg" alt="Moss example 1" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample2.jpg" alt="Moss example 2" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample3.jpg" alt="Moss example 3" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample4.jpg" alt="Moss example 4" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample5.jpg" alt="Moss example 5" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample6.jpg" alt="Moss example 6" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample7.jpg" alt="Moss example 7" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample8.jpg" alt="Moss example 8" style="width: 100%; display: block; border-radius: 6px"></a><a href="https://strict-lang.org/moss/MossWeb.html"><img src="https://strict-lang.org/moss/MossWebExample9.jpg" alt="Moss example 9" style="width: 100%; display: block; border-radius: 6px"></a></div>

<p><em><a href="https://strict-lang.org/moss/MossWeb.html">MossWeb</a> examples, RTX 3080 WebGPU, 480p fastest (4.4s per image), 480p fast (7.4s per image)</em></p>

# How it works

A prompt like `closeup of a {young|elderly} {woman|man} walking with friends on a busy street in {Tokyo|Paris} at night, candid street photo` goes through three stages:

1. **Text encoding**: `{a|b}` picks one alternative per image, then the Qwen3.5 9B encoder turns each distinct prompt into a context.
2. **Sampling**: Moss starts from seeded noise and removes it step by step (Euler, 2 to 50 steps). A turbo LoRA (lodestones' DMD for 8 steps, akhaliq's 4-step LoRA for 4 or fewer) makes few steps possible. Spectrum can forecast some steps from the earlier ones instead of computing them.
3. **Decoding**: the latent becomes the image with the Flux 2 VAE or the tiny taef2 decoder, then it is saved as `.jpg` or `.png`.

Each stage needs different model files on the GPU. ComfyUI runs these stages as separate nodes for every prompt, and Python wires them together. `MossImage` owns the whole pipeline instead: for 10 images it first encodes all 10 prompts, frees the encoder, samples all 10 images with Moss loaded once, then decodes all latents. Strict compiles every part of it, parallelizes it and runs it on the GPU, so nothing waits on glue code between well optimized parts. That is where most of the speed comes from, and why big batches on the command line are the fastest way to generate many images. A single image is still faster than in ComfyUI, which is why the ComfyUI node exists too.

# Performance

Average seconds per 720x1280 image of the default prompt in a batch (50 images on the RTX 3080, 10 on the RTX 4090), from the prompt to the saved image, int8 Convrot Moss, warm:

| Quality preset | Steps | RTX 3080 | RTX 4090 |
|---|---|---:|---:|
| `fastest2steps` | 2 (4-step LoRA) | 1.12 s | 0.39 s |
| `fastest` | 4, 1 forecast by Spectrum | 1.33 s | 0.51 s |
| `faster` | 8, 4 forecast | 1.75 s | 0.65 s |
| `fast` | 8, 3 forecast | 1.91 s | 0.75 s |
| `best` (default) | 8 (DMD turbo LoRA) | 2.91 s | 1.11 s |
| ComfyUI with the Strict Moss Sampler node | 8 | 5.9 s | |
| ComfyUI default workflow (turbo LoRA) | 8 | 7.5 s | 3.2 s |

`best25steps` and `best50steps` sample 25 or 50 steps without a turbo LoRA (two model runs per step), for the last bit of quality. All charts and their dates are in the [Performance section](/#generation), the method in [Benchmarks](Benchmarks.md).

**In ComfyUI** the Strict Moss Sampler node only replaces the sampling. ComfyUI's own work stays: encoding the prompt, loading and passing the models and the conditioning to the node, preparing the GPU for each run, decoding. At small sizes that overhead dominates, so even sampling almost twice as fast barely shows: at 480p and below the node is not worth changing a workflow for. The bigger the image, the more the sampling counts. On the RTX 3080 a 720p image takes 6.5 s with ComfyUI's default workflow and 4.5–4.8 s with the node, about half of it sampling. At 1088p it goes from 13.7 s to about 7 s. On slower GPUs the gain is bigger too, as long as the overhead doesn't dominate. For many images the command line stays the fastest, since it skips ComfyUI's overhead completely.

**Which settings to use:**

- **720p with `best`** gives the best quality if you have a fast GPU (RTX 40xx, RTX 50xx+, fast is 30%+ faster and recommended for any other GPU)
- **1080p (1088x1920)** with good prompts gives even sharper images, at the cost of longer generation time. Going beyond this works, but requires more vram and is usually not getting you better results, use RTX Super Sampling or other upscalers to go to 4k+.
- **480p with `fastest`** is fine for quick previews and much faster. It is the default in the browser on desktop computers (for mobile it is 160p as phones are really not built for inference).

# Supported GPUs

`MossImage` runs on Windows and Linux with an NVIDIA GPU. The release ships compiled GPU code for the RTX 20, 30, 40 and 50 series (sm_75, sm_86, sm_89 and sm_120). Other NVIDIA GPUs (A100, H100 and newer ones) compile the shipped PTX once on their first run, which takes tens of seconds, later runs use the driver's cache. The int8 model is measured on the RTX 3080 (10 GB) and RTX 4090 (24 GB); for 6–8 GB cards `MossImage` also loads 4-bit GGUF checkpoints or int4 convrot like the MossWeb version uses.

# Command line

`MossImage` reads `prompt.txt` (if it exists, or change it via --prompt) from the current folder and the models from your ComfyUI `models` folder (`--models`):

```sh
MossImage.exe --count 10
MossImage.exe --quality fastest --width 480 --height 848 --count 20
MossImage.exe --lora moss/my_style.safetensors:0.5 --quality best
MossImage.exe --workflow my_moss_workflow.json --count 4
```

`--workflow` takes a ComfyUI workflow as saved by ComfyUI and makes its images with the same model, LoRAs, prompt, size and seed settings. `--help` lists every option. The [StrictComfy README](https://github.com/strict-lang/StrictComfy) explains the ComfyUI node and which model files go where.

# Moss in the browser

[MossWeb](https://strict-lang.org/moss/MossWeb.html) takes any prompt, downloads the int4 text encoder, int4 Moss model and the vae decoder from [HuggingFace](https://huggingface.co/DeltaEngine/MossInt4) and runs all of it on your own GPU, nothing is sent to a server. It is the same Strict code as `MossImage`, built with `strict build MossWeb.strict web` into WebAssembly with generated WGSL shaders.

A browser page can only use about 4 GB and WebGPU has no tensor cores, so the page uses heavily compressed models: Moss and the Qwen3.5 9B encoder as int4 Convrot (3 GB and 4.3 GB) with the 4-step LoRA merged in, computed in int8. They are downloaded once from Hugging Face in 16 MB range requests and kept in the browser's storage, so the next visit starts in seconds. Weights only go to the GPU when they are first used, and the encoder gives its GPU memory back before Moss samples. You can add Moss LoRAs or load a whole ComfyUI workflow, and your images stay locally in a gallery in the browser.

Seconds per image in Chrome on the RTX 3080, without loading the models or encoding the prompt:

| Size | `fastest` | `fast` |
|---|---:|---:|
| 480p (480x848) | 4.4 s | 7.4 s |
| 720p (720x1280) | 13.7 s | 22.6 s |

On an RTX 4090 a 480p image takes about 2.7 s with `fastest` and 1.7 s with `fastest2steps` (3.3 s on the RTX 3080). A new prompt adds the encoding: GPUs with 8 GB or more keep Moss on the GPU while encoding and GPUs with 16 GB or more also keep the text encoder, the page tells them apart by the GPU's name. On the RTX 4090 a new prompt with `fastest` takes about 6.2 s in total.

The page is tested in Chrome, Edge and Firefox on the desktop and in Chrome on Android, all with WebGPU enabled; the GPU needs 4 GB of memory or more. WebGPU limits the speed: for really fast image generation use the desktop version.

**On phones** it is recommend to use 160p or 240p. Even the best and fastest phones are not built for inference, and Moss stresses the limits of WebGPU and mobile memory: the GPU and the page share the phone's RAM, and Android ends the page when it runs short. On a Galaxy S25 Ultra in Chrome a 160p image takes about 13 s and a 240p image about 22 s, 368p about a minute and 480p about 3 minutes (it can run out of memory, reloading the page or closing other apps helps). At these sizes Moss doesn't produce very useful images, but that a 9B text encoder and a diffusion model run on a phone at all is quite amazing: I have not found anything close that works like this.

# Why it was built

It started with restoring a very old project from over 30 years ago: [FractalZoomer](https://strict-lang.org/#games). It should run on the web, but on the CPU it was way too slow, so Strict got WebGPU support, and the kernels improved more and more until it ran really fast on desktops and phones. That raised the question whether Moss image generation, and maybe even H3 video generation, could run in a browser or on a phone.

Loading any recent model in the browser flat out doesn't work: everything is way too big and WebGPU is way too limited. [MiniMax H3](H3Video.md) is far too big to ever get a useful generation rate out of it. But Moss with a heavily compressed int4 model and a 4-step turbo LoRA looked close enough, and that is what MossWeb is today. The story of getting there, with all the memory limits and crashes on the way, is in the [blog](/blog/2026/11/03/strictcomfy-moss-and-h3-from-the-gpu-to-the-browser).
