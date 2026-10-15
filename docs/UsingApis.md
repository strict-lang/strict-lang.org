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

The image codecs are now implemented in Strict in the [ImageProcessing package](https://github.com/strict-lang/Strict/tree/master/ImageProcessing), including PNG and JPG reading and PNG writing. The old `NativePlugins` integration has been replaced by package-local native code where an external implementation is needed.

# Native packages

A bodyless type can be implemented by C sources in a `native/` folder next to its `.strict` file. The working [NativeAdd example](https://github.com/strict-lang/Strict/tree/master/Examples/NativeAdd) includes an `Adder.strict` trait with this header:

```
Add(left Number, right Number) Number
```

Its `native/Adder.c` exports `Adder_Add`. Calls on a type pass zero as `self`; a native type with one member can instead hold a handle returned by its bodyless `from` constructor.

* Every argument and result uses one double-sized slot. The shared [strict.h](https://github.com/strict-lang/Strict/blob/master/Compiler/strict.h) exposes helpers for Text, Numbers, packed numeric rows and `strict_fail("Name")` errors.
* `strict build` compiles and links the C sources. `native/Windows.flags` and `native/Linux.flags` supply platform libraries and flags. Compiled objects are reused until their source, headers or flags change.
* The VM builds and loads `native/<Folder>.dll` on Windows or `.so` on Linux. Packages copied into a project retain their `native/` folder.
* A bodyless trait call needs an implementation. On the VM a missing one returns `TraitHasNoImplementation`; it is not an automatic bridge to an arbitrary C#, Java or Python library. Those libraries need an appropriate native adapter or external process/API boundary.

The base types use the native runtime for operating-system services: `File`, `Directory`, `Process` and `Logger`. See [Architecture](Architecture.md#compiler).

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
