---
id: UsingApis
title: Using APIs
---

Use Strict for the logic you want to write, test and inspect, and keep the frameworks that already solve the rest. A game can use DeltaEngine and native graphics libraries; a website can use ASP.NET and a Vite frontend. Strict can call C implementations and can compile into a library that C or C# applications call directly. See [Built with Strict](Projects.md) for the projects using these combinations.

External code is a black box. Strict can call it, but it can't understand it, so computers can no longer reason about that part (here we would be limited to LLMs), and it doesn't follow the strict rules. The more external code you use, the more powerful your program gets, but also the less of it Strict understands. The bigger practical problem is change: if an external library changes, all calls to it have to change too. Strict code calling Strict code can be fixed in a much more automated way.

# How external code plugs in

Strict calls external native implementations through a **trait**, a type with method headers but no bodies. A host application can also call Strict through a generated library interface. The integration boundary stays small so the logic remains easy to test in [VS Code](VSCode.md).

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
* A bodyless trait call needs an implementation. On the VM a missing one returns `TraitHasNoImplementation`. C# hosts use the generated library binding and host-service boundary; other runtimes can use a native adapter or external process/API boundary.

The base types use the native runtime for operating-system services: `File`, `Directory`, `Process` and `Logger`. See [Architecture](Architecture.md#compiler).

# Call Strict from C and C#

Build a tested Strict type into a shared library and generate its C# binding with one command:

```sh
strict build Policy.strict library
```

On Windows this produces `Policy.dll` and `Policy.cs`; on Linux it produces `libPolicy.so` and `Policy.cs`. Add the generated C# source to your application and deploy the native library beside it. The generated wrapper exposes the public methods, marshals arguments and results, releases returned native data and translates a Strict Error into an `InvalidOperationException`.

Supported values are `Number`, `Text`, `Boolean`, `Numbers`, records and lists of records. Plain `Number` maps to `double` and `Boolean` to `bool`; a [stepped number](Decimals.md) parameter or result maps to `decimal` and keeps its exact value up to 2^51 steps (beyond that the call throws an `OverflowException` named `DecimalOverflow`). A record whose members are all `Number` or `Boolean` crosses as a C struct of doubles in member order, and a list of numbers or records as a counted block (`double[]` or `Trade[]` in C#).

The exported C interface reports success or Error separately from the result. `strict_last_error()` exposes an error message and `strict_release()` releases returned native data. Use the generated binding for C# ownership and conversion details rather than copying marshalling code into application logic. This exported-library ABI is separate from the package-local `strict.h` plugin interface described above.

Pass the values a rule needs as arguments and test the rules with explicit inputs. A decimal calculation can move into Strict while an ASP.NET host retains HTTP, storage and deployment.

![Native C interface, a tested Strict library and generated C# bindings](/img/NativeInterop.svg)

# A practical integration workflow

1. Put the calculation or decision into a small Strict type. Write examples covering normal results, edge cases and Errors.
2. Open it in [VS Code](VSCode.md). Use SCrunch's test marks and line values to follow the calculation as you edit.
3. Run `strict build <file> library` and add the generated binding to the host application.
4. Pass a snapshot of the inputs and return a result the host can act on. Declare decimal steps when precision is part of the contract.
5. Keep reference fixtures at the boundary, so changes are checked against the behavior the host expects.

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
