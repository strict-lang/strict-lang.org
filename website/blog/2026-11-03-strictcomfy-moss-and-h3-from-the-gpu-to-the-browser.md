---
title: "StrictComfy: Moss and H3 From the GPU to the Browser and Phones"
author: Benjamin Nitschke
---

This week I am releasing **[StrictComfy](https://github.com/strict-lang/StrictComfy)**: the MOSS-Image and MiniMax H3 diffusion models written in Strict, as command line programs for Windows and Linux and as ComfyUI nodes. `MossImage` is the fastest way I know to generate images with Moss, `H3Video` the fastest way to generate videos with H3. And Moss also runs in your browser at **[strict-lang.org/moss](https://strict-lang.org/moss/MossWeb.html)**, on desktop GPUs and even on phones.

<!--truncate-->

## Why the whole pipeline matters

ComfyUI stacks well designed and optimized parts together: a text encoder node, a sampler node, a VAE node, wired up by Python. That is flexible, but the process as a whole can't be optimized, because each node only sees its own part. Making 10 images means encoding, sampling and decoding 10 times, with the encoder, the diffusion model and the VAE taking turns on the GPU.

`MossImage` and `H3Video` own the whole pipeline: encode all prompts, free the encoder, sample all images with the model loaded once, then decode all latents. Strict compiles every part of it, parallelizes it and runs it on the GPU. On an RTX 3080 a batch of 720x1280 Moss images takes 2.9 s per image with the `best` preset, against 7.5 s for ComfyUI's default workflow. A 12 s H3 video with sound takes 58 s with `fast` on an RTX 4090, against 149 s with ComfyUI's turbo workflow and 291 s with its default template. The ComfyUI nodes give some of that inside ComfyUI too, and the gain grows with the image size: on the RTX 3080 a single 720p image takes 4.5–4.8 s with the Strict Moss Sampler node instead of 6.5 s, a 1088p image about 7 s instead of 13.7 s. At 480p and below ComfyUI's own overhead (encoding the prompt, passing the models to the node, preparing the GPU, decoding) dominates, so it isn't worth changing a workflow for. The main speed comes from running the command line in big batches. All numbers are in [Moss Image Generation](/docs/MossImage) and [MiniMax H3 Video Generation](/docs/H3Video).

The releases ship compiled GPU code for the RTX 20, 30, 40 and 50 series, and portable PTX that other NVIDIA GPUs compile once.

## How Moss ended up in the browser

It started with a project from over 30 years ago: FractalZoomer. Restoring it for the web meant WebGPU, since on the CPU it was way too slow, and the WebGPU kernels kept getting faster until it ran smoothly on desktops and phones. That raised the question whether Moss, or even H3, could run in a browser.

Loading any recent model in the browser flat out doesn't work. A page can use about 4 GB, WebGPU has no tensor cores (Chrome's D3D12 backend doesn't expose subgroup matrices yet), and H3 with its 21 GB model and 32B text encoder is way too big to ever be useful there. But Moss with a heavily compressed int4 model and a 4-step turbo LoRA looked close enough.

The first steps were humbling. The first complete 720x1280 VAE decode in Chrome took **55 s**, natively it takes 285 ms. One Moss transformer block at 480p took 371 ms against 20 ms natively. From there it was kernel after kernel:

- **The VAE decode** went from 55 s to **1.73 s**, below ONNX Runtime Web's 2.1 s for the same Flux 2 decoder on the same GPU. That came from Split-K matrix products, a tiled convolution, 16-bit results and binding GPU-resident inputs directly instead of copying 17 GB per decode.
- **The int8 matrix multiply** uses WebGPU's packed dot products (`dot4I8Packed`, DP4A on NVIDIA). Int4 weights are uploaded as they are in the file, with one scale per row, and computed in int8. Int4 compute was tried and rejected: blurry and blocky images for only 20 % more speed.
- **Fewer commands**: kernels are recorded into one command encoder and share compute passes. A 480p step went from 1962 compute passes to 49.
- **Many ideas didn't make it**: 128x64 tiles, staging attention keys in workgroup memory, unrolled convolution loops and wider staging were all measured, slower and reverted.

The first complete 480p image in the browser took 26.6 s to sample on November 2. Today it takes **4.4 s** on the RTX 3080 with the `fastest` preset. The text encoder (Qwen3.5 9B) runs in the browser too, so you can type any prompt, add Moss LoRAs or load a whole ComfyUI workflow. The models are streamed from Hugging Face in 16 MB range requests, 8 at a time, and kept in the browser's storage: a revisit loads them into the GPU in seconds.

## The memory wall

Getting it fast in Chrome on a desktop was only half of it. Firefox crashed with "Out of Memory" right after encoding the prompt, and phones showed "Aw, Snap!".

To find out why, I tagged every GPU buffer with the model file it came from and logged the totals. The text encoder held **5.7 GB** at its peak. 3.3 GB of that were its weights and **2.3 GB were joined copies** of those same weights: q, k and v and gate and up rows, merged into one block each. The originals stayed alive because the joined rows still pointed into them. Chrome on Windows quietly pages the excess out to shared memory; Firefox refuses. Now weights read from a file only get a GPU buffer when a kernel first uses them on their own, and joined blocks are filled straight from the cached file. The encoder's peak dropped to 3.4 GB, and the model load got shorter too, since the weights now upload during the first step. A second prompt still crashed, because Moss stayed loaded while the encoder loaded again. So evicting GPU memory on the web now drops the buffers of weights read from files, and they come back from the browser's cache on their next use.

Phones needed one more round. Over adb I sampled the phone's GPU memory every two seconds and read Android's log: it was not WebGPU running out, it was Android's low-memory killer ending Chrome's page. On a phone the GPU and the page share the same RAM. The GPU memory grew to 5.7 GB at step 2, because the phone's GPU is about 8 times slower than a desktop one, and the page kept queuing work at desktop pace. On phones the reuse pool is now capped at 256 MB instead of 2 GB, downloaded blocks in JavaScript at 192 MB instead of 768 MB, and the page waits once 256 MB of work is still unfinished on the GPU, where it had let 1.5 GB pile up. The biggest piece nobody had counted were the first uploads of Moss's weights.

Now a Galaxy S25 Ultra makes a 160p image in about 13 s and a 240p image in about 22 s. 368p takes about a minute and 480p about 3 minutes, and those can still run out of memory. The images at these sizes aren't very useful yet, but a 9B text encoder and a diffusion model running on a phone in a browser is something I haven't seen anywhere else. The page now starts phones at 160p, uses a layout made for small screens and warns above 240p. It is tested in Chrome, Edge and Firefox on the desktop and in Chrome on Android. As usual web development is still a lot of testing and very annoying, nothing ever works the first time or how you think it should, llm and agents help to test, but it is still very cumbersome work.

## What's next

StrictComfy is a good example of what Strict is for: one language from the model math down to the GPU kernels, the same code natively on CUDA and in the browser on WebGPU, and the freedom to restructure the whole pipeline when a part is slow. Next up are tensor core kernels on WebGPU once browsers expose subgroup matrices (might come by the end of 2026, but then it is a question when each browser actually enables it), and more GPU memory savings so phones can go above 240p.

Try it at [strict-lang.org/moss/MossWeb.html](https://strict-lang.org/moss/MossWeb.html), and get the desktop version from [StrictComfy](https://github.com/strict-lang/StrictComfy) for really fast image and video generation.
