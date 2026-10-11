---
id: Naming
title: Naming
---

Naming is hard. Most people don't like to think long about clever names for types, folders or methods. At least for products, packages or projects, most of us really do think long about a clever name.

What usually happens instead is some kind of copy and paste from an existing project architecture or design pattern:

- Code goes in /src or /src/company/project/package/
- Docs go in /docs, the database schema in /db, external libraries in /lib, and so on
- Each of those has many more naming rules inside, or we just use what already exists (names from external libraries, documentation tools, scripts)

Uncle Bob shows this in his great [Architecture: The Lost Years talk](https://www.youtube.com/watch?v=HhNIttd87xs&t=1402).

The code itself is often structured the same way, based on a design pattern like MVC:

- models
- controllers
- views
- utils
- helpers
- managers

None of this tells us anything about the app. We have to dig deeper just to figure out what it is about. A useful project name or good documentation might help, but digging into the code or working on it isn't much fun. Most projects like this have horrible code bases and rarely live on for years.

In Strict, names like these are discouraged everywhere: no folders, packages or types called `Utils`, `Helpers` or `Managers`. Name everything so it is decoupled and makes sense both up close and from afar. Look at the packages in the [Strict repository](https://github.com/strict-lang/Strict): `Expressions`, `Validators`, `Bytecode`, `Runtime`, `Compiler`, `Math` and `ImageProcessing` each say what they contain, and so do their types: `Tokenizer`, `TypeInference`, `Limits`, `FileCompiler`, `Machine`.

It is fine to reuse the same names over and over, like /entities, /services, /requests or /responses, especially if they come from a framework or design pattern. But don't append those common names to everything, the same way you don't name every member after its type:

- Don't use _m_iCount_, it is horrible to read, use _count_
- Don't use _AccountInterface_ or _IAccount_, just use _Account_
- Don't use _AccountService_ or _AccountStorage_, just use _Accounts_
- Don't use _MoveMotorRequest_ or _MotorPositionResponse_, just use _MoveMotor_ in /requests and _MotorPosition_ in /responses

# Names in Strict

* **Members don't repeat their type.** `has number`, `has logger`, `has keysAndValues List(key Generic, mappedValue Generic)`. If the name says the type, the type is left out.
* **Plurals are lists.** `numbers` is a list of `Number`, `ValidationIssues` is a list of `ValidationIssue`. Names never start with `List`: `numbers`, not `listOfNumbers`.
* **Case shows visibility.** Types, public members and public methods start with an uppercase letter. Private members, parameters and variables start with a lowercase letter.
* **No abbreviations or single letters.** `index`, not `i`. `separatorIndex`, not `si`. Names are 2 to 50 characters long.
* **Short scope, short name. Long scope, longer name.** A loop body is fine with `next`. A member used across a type deserves `outputFilePath`.
* **Keywords can't be names**, and neither can `value`, which is always the instance. A constant can't be named like a type or a method either. The [`Names` validator](CodeValidations.md#name-rules) checks all of this.

The compiler knows every type anyway, so there is no need to type all those extra letters over and over. Keep it short and simple!
