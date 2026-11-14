---
title: "182 Tokens per Second, Stricter Rules and a Week of Fixes"
author: Benjamin Nitschke
---

This week was mostly about making Strict more correct: bug fixes, refactoring and a lot of new validation rules. Underneath that ran a steady stream of performance work, especially for local LLMs (Qwen3, Qwen3.5 with multi token prediction, Qwen3.8 27B) and for StrictComfy's image and video generation. In numbers: **519 commits in Strict**, 73 in StrictComfy, 19 in DeltaEngine and 10 in Ben, all of them following the same rules.

<!--truncate-->

## Qwen3.5 9B with MTP: 182 tokens/second

Qwen3.5 9B comes with a multi token prediction (MTP) head: a small extra block that guesses the next three tokens. One verify step of the full model then checks all of them at once and keeps on average 2.67 tokens, giving exactly the same text as decoding one token at a time. On an RTX 4090 with the Q4_K_M weights:

| Qwen3.5 9B Q4_K_M | Strict | llama.cpp b11827 |
|-------------------|--------|------------------|
| MTP drafts | **5.5 ms/token (182 tokens/s)** | 6.0–6.3 ms/token (158–167 tokens/s) |
| Plain decoding | 6.6 ms/token (152 tokens/s) | 7.1 ms/token (141 tokens/s) |

On Monday MTP took 8.2–9 ms per token, slower than plain decoding. Three changes got it to 5.5 ms:

- **Small GPU lists stay on the GPU while it is busy.** A tiny loop over a GPU list used to download the list first, and a download waits for all queued GPU work. In the DeltaNet layers that happened 24 times per verify step and kept the GPU half idle. Now such a loop runs on the GPU while the stream still has work queued. That alone halved the time of 4 sequences in `Qwen3Benchmark` (15.4–18.3 → 7.5–8.9 ms per step).
- **The draft head only scores the first 32768 words** of the 248320 word vocabulary (0.87 → 0.12 ms per draft, still 2.67 accepted tokens per step).
- **The verify products stage their token inputs in shared memory** next to the quantized weight blocks they already copied ahead with `cp.async`, instead of waiting for them from L2 on every block (8.87 → 8.49 ms of products per verify step).

Plain decoding is close to the hardware limit now: of the 6.9 ms of GPU time per token, 5.85 ms are the matrix products, which read 5.3 GB of weights at about 900 GB/s on a card with a theoretical 1008 GB/s. What is left are about 760 small kernels per token, so faster decoding beyond MTP means fusing those.

## Updated LLM numbers on the RTX 4090

| Model | Before | Now |
|-------|--------|-----|
| Qwen3-8B Q4_K_M, 1 sequence | 150–151 tokens/s | **181 tokens/s** |
| Qwen3.8 27B Q4_K_M | 49.8 tokens/s | **55.4 tokens/s** |
| Qwen3.8 27B with MTP drafts | 76.4 tokens/s | **84 tokens/s** (Ollama 74.7) |
| Qwen3.5 9B with MTP drafts | – | **182 tokens/s** |

These are mean decode times. A small but useful lesson from this week: the per-step median of a decode benchmark lies when the GPU runs ahead of the host. Some steps only queue work and return in 4 ms, others wait for everything and take 15–20 ms, so only the mean (total time divided by tokens) tells the real speed.

Other LLM work: mixture of experts routing for Qwen3-Coder 30B takes 4608 instead of 17408 steps per token (1000 prompt tokens in 1.1–1.4 instead of 3.8–4.8 ms), few-token products got a `cp.async` ring (the 4096 x 12288 product on an RTX 3080 in 110 instead of 141 us), the GPU memory collector backs off after a collection that freed nothing, and runtime kernels are only rebuilt when they changed (a one line edit prepares its GPU code in about 1.1 instead of 1.5 s).

## StrictComfy: images and videos

[StrictComfy](https://github.com/strict-lang/StrictComfy) had a busy week too:

- **H3Image is 2–4x faster with a warm backend** on the 4090: the same prompt at 1024x1024 went from 6.1 to 1.6 s, a 2048x2048 edit from 17.7 to 9.0 s, and the 2048x2048 VAE decode with saving from 2.5 to 0.6 s. Against ComfyUI at 1, 4, 8 and 16 megapixels: 4.6, 6.8, 10.5 and 20.4 s for Strict against 6.9, 13.1, 20.1 and 27.2 s.
- **H3Video** decodes a 124 frame video with sound in 1.1–1.5 s instead of 15–19 s with the taeh3 decoder on an RTX 3080 (43 dB against ComfyUI's reference), a warm run with a new prompt went from 28 to 8–9 s by keeping the models resident, and the VAE attention moved to the 8 bit path (2.6 → 2.35 s).
- **MossImage** keeps its encoder, the model and the tokenizer resident: one image with a new prompt takes 0.8–0.9 instead of 1.7–1.9 s, and the web version on 16 GB GPUs 6.2–6.8 instead of 13 s.
- **StrictGen** is a new browser UI to generate on remote PCs with uploads and live video previews.

## Faster everywhere else

- PNG and JPEG go through stb: a 1536x1024 PNG loads in 54 instead of 822 ms and saves in 214 instead of 1254 ms.
- `NativeCompiler.exe` is gone, `strict.exe` alone builds everything (10 MB). Windows builds reuse unchanged parts: a one line edit builds in 0.96 instead of 1.68 s, and a build through the resident server with nothing changed takes 0.03 instead of 0.37 s.
- The compiler's own cold build went from about 35 to 28–31 s, partly because reading the 80 MB module now takes 0.39 instead of 2.2 s.
- `List(Number).Sorted` is native (1187 numbers in 195 instead of 1000 us), chained matrix products went from 67 to 27 ns, garbage collection marks in parallel (full collections of a build take about half the time), and `strict test Strict.strict unit` takes 1.7 instead of 3.3 s.

## Stricter rules and correctness

Strict has exactly one way to solve each problem, and this week about 20 new validation rules made that more precise. A few examples:

- `ResultMustBeUsed`: every computed value must be used, and a method that writes something returns nothing.
- `LoopValueMustNotBeAssigned`, `AssignmentNeedsMutableVariable`, `MutatingCallNeedsMutableVariable` and `StepMustBeOnNumber` catch misuse of loops and mutable values.
- `NameAlreadyDeclared`, `TooManyArguments`, `MembersMustComeBeforeMethods`, `SameNamedTypes` and `GenericMemberTypeMustBeNamed` catch confusing declarations.
- `EmptyLineIsNotAllowed` and `ByteOrderMarkIsNotAllowed` keep the files themselves clean, and `InputOutputMustBeSlow` makes every method that touches files or processes say so.

That last one goes together with a language change: `slow` is now a keyword at the end of a method header (`Load(path Text) Image slow`) instead of a wrapper type. 241 methods in Strict and 421 in StrictComfy were converted. Status numbers are gone too: build steps and the runtime return Errors, and checking for an Error that a method can't return is refused. Mutation testing from last week kept finding redundant conditions, which were deleted. StrictComfy's `strict check .` went from 38 issues to 0, and DeltaEngine and Ben follow all the new rules.

## Bug fixes

About a quarter of the week's commits were bug fixes. Some examples: a text index past the end is now an `IndexOutOfRange` error in compiled code as well, `%` by zero inside a comparison gives `ModuloByZero` instead of `false`, a lane-split GPU sum with an early return gave 160 instead of -1, a memoized grouped loop returned 20 instead of 60, subnormal numbers survive the binary format, a Windows rebuild works while an old `strict.old.exe` is still running, and a `File.Locked` test that failed in 5 of 27 runs now passes 30 of 30.

The [Machine Learning](/docs/MachineLearning) page has the full table with the llama.cpp comparisons and the measurement conditions.
