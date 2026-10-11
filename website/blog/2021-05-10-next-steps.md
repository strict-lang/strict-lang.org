---
title: May 2021 Next Steps
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

We recently got some interest again in developing Strict and got some freelancer help. Our job posts for full-time Compiler Engineers and a C# TDD Developer for our main project are still open: The intelligent robot arm.

<a href="https://strict-lang.org/blog/2020/07/29/getting-back-into-it">Last time</a> I talked about parsing libraries like <a href="https://github.com/benjamin-hodgson/Pidgin">Pidgin</a>, <a href="https://github.com/sprache/Sprache">Sprache</a> and <a href="https://github.com/datalust/superpower">Superpower</a>. The main idea still stands: Don't use the external lexer/parser code generator tools. Instead use combinational parsers and do everything in one go, the current code base shows this very nicely. To be honest I was a bit stuck last year with the supersimple approach of just fixing one test at a time until I ran into trouble with not looking forward or backward in the parser, which is very much needed for expressions in method bodies. We now have a custom tokenizer (thanks to Alexandre) and parsing solution again and things seem to work out.

The main reason nothing happened with Strict this year yet is simply that I have been busy 24/7 with the AI and robotics work, there was absolutely no time for anything else. Plus we recently trying to add some employees and there is a lot of interviews and teaching, learning, code reviews, etc. going on. Abir helps a lot with that recently.

## Documentation
<a href="https://strict-lang.org/docs/Overview">The Strict documentation</a> is still mostly valid, even my C# Coding Guidelines from 2012 are still used for every new programmer that joins the team and they have not changed much in the past 10 years. However recently in interviews applicants noticed that we could be more clear about the current state, what works, what is next, what are the immediate next steps. Hopefully this blog post helps a bit. I will also edit the Documentation once we have more things working (e.g. the tokenizer work from today), I hope the other Strict-ers can also join the fun and help out with writing up what is going on. Wiki and Websites will always be important for Strict as the source code is not allowed to contain any comments, it all has to be on the web instead (AI won't read or understand that anyway atm).

## Coverage not at 100%
Instead of pushing the coverage back to 100% with the mess I left behind last year with the tokenizer only working for simple usecases by commenting out problems and barely getting it up and working again, I moved all the commented out code and TODOs back and we should fix them one by one. Not much work really .. however there is plenty of unfinished stuff with both the backend (e.g. c# or c++ code generation) and the virtual machine (mostly not done, just some low level tests).

## Cuda
I added some Cuda experiments late last year and they are very promising, we could easily parallize any code that makes sense to parallize (big loops, neural networks, math, matrices) by running on Gpu or Cpu or both. We have quite a lot of decent computers in the office as well and connecting them all up with our own networking stack (Tachyon, very much a faster version of SignalR), similar to NCrunch work queue servers. This is not easy and we will probably revisit this much later this year. However the Cuda stuff has made some advances this year, we created our own internal repositories for our engine and AI work to handle Cuda code more easily. Still mostly hand-written, but there is also great help with libraries like cudnn that provide most of the math we need for neural networks. Maybe in Q3 we can check this out for Strict as well.

## Plan
This month (May 2021) our plan is to get all of the low level important parts up and running, there will be a lot of learning, teaching, discussions around many smaller problems like memory management, string handling, math, numbers. Next up is doing small hello world programs, expressions, and finally solving some 8kyu and 7kyu <a href="https://codewars.com">codewars.com</a> katas in strict.

June is all about integrating strict as quickly as possible into IDEs, most importantly Visual Studio Code, but also Visual Studio 2019, IntelliJ and others via <a href="https://microsoft.github.io/language-server-protocol/">Language Server Protocol</a>. We have some early stuff working from last year, but as usual there is a lot of fiddly work to be done to get it all nice and shiny. Especially SCrunch, nice auto-completion, always on compilation, super fast speed and easy refactoring, debugging and all the other great features any decent IDE brings.

In July we want to revisit some old use-cases and talk about new usecases we can then accomplish with the language, maybe focus on compiling Strict with Strict and see whats missing. Maybe networking, maybe parallization, concurrency or building neural networks with Cuda, who knows, we will find out. Most likely we have to go through the existing backlog and see if we are ready to give the language to other programmers and let them solve some katas with it.

Obviously all depends how much time I and the freelancers can spend on this and how successful we are. The most important goals as always are (in this order):
- Clean Code with Tests written first!
- Super fast always on compilation (I am talking nanoseconds here, with any backend this is not possible, so in our own Virtual Machine)
- Very short and easy to understand code (our strict rules will mostly enforce this)
- Almost all aspects of the language should be functional (deterministic, no inheritance, composition, most things are only calculated once and reused all the time). There will be 10% of mutatable fields and methods modifying those be allowed for special problems and optimizations, but this is not the norm.
- Running the code also must be fast, C++ comparable, all impacted tests are always executed (later with slower integration tests that only run at CI server or checkin times). This includes parallization, concurrency, networking, Cuda and lots and lots of optimizations
- And finally our main goal is to build AIs and let Strict be controlled by an AI as well -> we will start with normal Neural Networks like the ones we already write and maintain, up to evolutionary systems and meta parameters.

Till next time, I plan to blog about the progress weekly from now on, gives us also a good overview about our progress.

Btw: Abir and me do weekly Sharp Clean Code 1h live streams on <a href="https://twitch.tv/deltaengine">https://twitch.tv/deltaengine</a> and talk about very related things as well, mostly solving some interesting codewars kata or TDD problem.