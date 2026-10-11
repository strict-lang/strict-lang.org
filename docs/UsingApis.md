---
id: UsingApis
title: Using APIs
---

Strict is not a general-purpose language and doesn't try to reinvent the wheel. If a library, framework or engine already exists for what you need, like a web API, a database, a UI, a game engine, or a C, C++, C#, Java or Python library, use it. Keep the logic in Strict and call the external code for the rest.

External code is a black box. Strict can call it, but it can't understand it, so computers can no longer reason about that part (here we would be limited to LLMs), and it doesn't follow the strict rules. The more external code you use, the more powerful your program gets, but also the less of it Strict understands. The bigger practical problem is change: if an external library changes, all calls to it have to change too. Strict code calling Strict code can be fixed in a much more automated way.

# How external code plugs in

External code is always hidden behind a **trait**, a Strict type with method headers but no bodies. The rest of your code only sees the trait, is tested against it, and stays pure Strict.

[`ImageProcessing/ImageLoader.strict`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/ImageLoader.strict) is such a trait:

```
from(path)
Colors Bytes
Width Number
Height Number
```

It is implemented by a small C library in [`NativePlugins/ImageLoader`](https://github.com/strict-lang/Strict/tree/master/NativePlugins/ImageLoader), which uses stb_image to decode JPG and PNG files. It exports `ImageLoader_Create`, `ImageLoader_Colors` and `ImageLoader_Delete` through a plain C interface. [`NativePlugins/ImageSaver`](https://github.com/strict-lang/Strict/tree/master/NativePlugins/ImageSaver) does the same for writing images.

The base types use the same idea for the operating system. `File`, `Directory`, `Process` and `Logger` are Strict types whose bodies come from the [native runtime](Architecture.md#compiler).

# Structure based on intent

Sometimes things are not that simple, and we can't just call a few methods and be done. A good example is database storage, where we need to map all the types we want to store, and maybe add business logic for transformations and computations on top of the data.

The usual database design, done the clean TDD way:

- Interfaces and abstract classes in a MyProject.Database project
- Adding MyProject.Database.Tests and MyProject.Database.Mocks
- Implementing the actual storage in MyProject.Database.MongoDB
- Then the logic on top in another set of projects: MyProject.Logic, .Mocks, .Tests, and so on
- And so on up to the application layer

That still doesn't say what goes into MyProject.Database or which other projects need it. Database code is easy to find, but this leads to a lot of messes. Every project and type that stores anything has to include the whole MyProject.Database project with all its types and dependencies, even if it only cares about one or two types in there.

[Structure based on intent](https://pasztor.at/blog/structure-based-on-intent) means structuring types by where they are used and needed, not by "database", "controllers", "models" and so on. Uncle Bob explains this in a [great talk](https://www.youtube.com/watch?v=HhNIttd87xs), and some Clean Coders episodes cover it too. [Talking to the External World](https://ebi.readthedocs.io/en/latest/external.html), from the Entity-Boundary-Interactor docs used in Go and Elixir, is a good read too.

In Strict, the first step is to make the external library as simple to use as possible: a small trait, implemented once and well tested. Then design the packages by use case, like `MyProject/ImageProcessing` or `MyProject/Robotics`. Tests are built into every method, and mocks are just other types implementing the same trait.

# Useful links

- [Microservices](Microservices.md)
- [Functional Object Oriented Programming: FP and OOP working well together](https://pasztor.at/blog/functional-object-oriented-programming)
- [One Controller One Action](https://pasztor.at/blog/one-controller-one-action)
