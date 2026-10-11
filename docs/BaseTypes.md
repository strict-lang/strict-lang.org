---
id: BaseTypes
title: Base Types
---

The repository root of [strict-lang/Strict](https://github.com/strict-lang/Strict) holds the base types. They are imported into every `.strict` file, have special language treatment, and are needed to build any package. They are also the documentation of the language: every method starts with tests that show how it works, and each file is short enough to read in a minute. Click any type name to read its source.

That is pretty much it. There are not many more types needed to write code. More specific types live in packages like [`Math`](https://github.com/strict-lang/Strict/tree/master/Math) and [`ImageProcessing`](https://github.com/strict-lang/Strict/tree/master/ImageProcessing).

# Values

| Type | Description |
|------|-------------|
| [`Any`](https://github.com/strict-lang/Strict/blob/master/Any.strict) | The base of every type: `from`, `to Type`, `to Text`, `to HashCode` and `is`. Never added as a member and never used directly. |
| [`Boolean`](https://github.com/strict-lang/Strict/blob/master/Boolean.strict) | `true` or `false` with `not`, `and`, `or`, `xor`, `is` and `to Text`, all implemented with `then … else`. |
| [`Number`](https://github.com/strict-lang/Strict/blob/master/Number.strict) | A 64-bit floating point number with arithmetic and comparison operators, `digits`, `Floor`, `Ceiling`, `Round`, `Absolute`, `Clamp`, `Lerp`, `SquareRoot`, `IsNearlyEqual`, `Increment`, `Decrement` and `to Text`. Iterating a number counts from 0 up to it. |
| [`Byte`](https://github.com/strict-lang/Strict/blob/master/Byte.strict) | A number constrained to 0..255. |
| [`Character`](https://github.com/strict-lang/Strict/blob/master/Character.strict) | One character, stored as its number. Created from a single-letter text or a number, with `Upper`, `Lower`, `to Number` and the `NewLine` and `Tab` constants. |
| [`Text`](https://github.com/strict-lang/Strict/blob/master/Text.strict) | A list of characters. Concatenation, `to Number`, `is in`, `Combine`, `StartsWith`, `Split`, `Lines`, `Trim`, `Capitalize`, `IndexOf`, `LastIndexOf`, `Substring`, `Replace`, `Upper`, `Lower`, `Count` and `ToBrackets`. |
| [`Name`](https://github.com/strict-lang/Strict/blob/master/Name.strict) | A text with at least 2 characters and no spaces. |

# Collections and iteration

| Type | Description |
|------|-------------|
| [`List`](https://github.com/strict-lang/Strict/blob/master/List.strict) | The list of `Generic` elements behind every `(1, 2, 3)` and every plural type like `Numbers`. Element-wise operators, `Sum`, `First`, `Last`, `X`/`Y`/`Z`/`W`, `Key`/`Value`, `is in`, `Index`, `Count`, `Reverse`, `Add` and `Remove`. See [Lists](Lists.md). |
| [`Dictionary`](https://github.com/strict-lang/Strict/blob/master/Dictionary.strict) | A list of key and value pairs with lookup by key, `is in`, `Add` (no duplicate keys) and `Remove`. |
| [`Range`](https://github.com/strict-lang/Strict/blob/master/Range.strict) | A `Start` and an `ExclusiveEnd` number, iterated by `for`. `is in`, `Length`, `Sum` and `Reverse`. |
| [`Iterator`](https://github.com/strict-lang/Strict/blob/master/Iterator.strict) | Trait for everything a `for` loop can enumerate: a length, a `for` method and `in`. |
| [`Length`](https://github.com/strict-lang/Strict/blob/master/Length.strict) | Trait for anything with a `Length`. |
| [`Generic`](https://github.com/strict-lang/Strict/blob/master/Generic.strict) | Placeholder for any type, replaced by a concrete type when used, like `Number` in `List(Number)`. |
| [`Mutable`](https://github.com/strict-lang/Strict/blob/master/Mutable.strict) | Wraps a value that is allowed to change, like `Mutable(Number)` returned by `Increment`. |
| [`Enum`](https://github.com/strict-lang/Strict/blob/master/Enum.strict) | Methods every enum (a type with only constants) gets: `GetName`, `CompareTo` and `Equals`. |
| [`HashCode`](https://github.com/strict-lang/Strict/blob/master/HashCode.strict) | A number computed from any value, for fast lookups. |

# Errors

| Type | Description |
|------|-------------|
| [`Error`](https://github.com/strict-lang/Strict/blob/master/Error.strict) | An error value with a `Name` and `Stacktraces`. Strict has no exceptions, see [Errors](Errors.md). |
| [`ErrorWithValue`](https://github.com/strict-lang/Strict/blob/master/ErrorWithValue.strict) | An error that also keeps the value that caused it, created by calling an error with a value. |
| [`Stacktrace`](https://github.com/strict-lang/Strict/blob/master/Stacktrace.strict) | One location of an error: method, file path and line, printed as a clickable `at Method in File:line N`. |

# Code describing code

| Type | Description |
|------|-------------|
| [`Type`](https://github.com/strict-lang/Strict/blob/master/Type.strict) | A type's `Name` and `Package`, printed as `Package.Name`. |
| [`Method`](https://github.com/strict-lang/Strict/blob/master/Method.strict) | A method's `Name`, return `Type` and `Parameters`. |
| [`Variable`](https://github.com/strict-lang/Strict/blob/master/Variable.strict) | A named value: `Name`, `Type`, an optional `InitialValue`, `IsMutable` and `IsConstant`. Used for members, parameters and variables. |

# Input, output and the system

Most of these are traits or have methods without bodies. The native runtime ([`Compiler/NativeRuntime.mlir`](https://github.com/strict-lang/Strict/blob/master/Compiler/NativeRuntime.mlir)) and the Strict VM implement them.

| Type | Description |
|------|-------------|
| [`Logger`](https://github.com/strict-lang/Strict/blob/master/Logger.strict) | `Log(text)` writes to its `TextWriter`, the console by default. Add `has logger` to any type to log. |
| [`TextReader`](https://github.com/strict-lang/Strict/blob/master/TextReader.strict) | Trait: `ReadLines` returns `Texts`. |
| [`TextWriter`](https://github.com/strict-lang/Strict/blob/master/TextWriter.strict) | Trait: `Write(lines Texts)`. |
| [`BytesReader`](https://github.com/strict-lang/Strict/blob/master/BytesReader.strict) | Trait: `ReadBytes` returns `Bytes`. |
| [`BytesWriter`](https://github.com/strict-lang/Strict/blob/master/BytesWriter.strict) | Trait: `Write(bytes Bytes)`. |
| [`Closeable`](https://github.com/strict-lang/Strict/blob/master/Closeable.strict) | Trait: `Close`. |
| [`File`](https://github.com/strict-lang/Strict/blob/master/File.strict) | A file created from a path, composed of all the reader and writer traits above, plus `Exists` and `Delete`. |
| [`Directory`](https://github.com/strict-lang/Strict/blob/master/Directory.strict) | Lists files and directories, checks `Exists` and creates directories. |
| [`Path`](https://github.com/strict-lang/Strict/blob/master/Path.strict) | A text with path operations: `+`, `FileName`, `RemoveExtension`, `ChangeExtension` and `PathOnly`. |
| [`Process`](https://github.com/strict-lang/Strict/blob/master/Process.strict) | Finds and runs external executables (`Find`, `IsAvailable`, `Run`, `RunTool`) and reports the `OperatingSystem`. |
| [`ProcessResult`](https://github.com/strict-lang/Strict/blob/master/ProcessResult.strict) | The exit code, output and error text of a finished process, with `Succeeded` and `Failed`. |

# Other packages in the repository

| Package | Description |
|---------|-------------|
| [`Math`](https://github.com/strict-lang/Strict/tree/master/Math) | Small value types for angles, trigonometry and 2D geometry: [`Degrees`](https://github.com/strict-lang/Strict/blob/master/Math/Degrees.strict), [`Radians`](https://github.com/strict-lang/Strict/blob/master/Math/Radians.strict), [`Ratio`](https://github.com/strict-lang/Strict/blob/master/Math/Ratio.strict) (a number from -1 to 1), [`Size`](https://github.com/strict-lang/Strict/blob/master/Math/Size.strict) (positive width and height, iterated as `Vector2` positions) and [`Vector2`](https://github.com/strict-lang/Strict/blob/master/Math/Vector2.strict). The trigonometry method bodies are still placeholders. |
| [`ImageProcessing`](https://github.com/strict-lang/Strict/tree/master/ImageProcessing) | Load, change and save images: [`Image`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/Image.strict) (a `Size` plus colors), [`Color`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/Color.strict) (RGBA bytes), [`ColorValue`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/ColorValue.strict) (RGBA from 0 to 1), [`AdjustBrightness`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/AdjustBrightness.strict), [`ProcessImage`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/ProcessImage.strict), [`BenchBrightness`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/BenchBrightness.strict) (a benchmark), and the [`ImageLoader`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/ImageLoader.strict) and [`ImageSaver`](https://github.com/strict-lang/Strict/blob/master/ImageProcessing/ImageSaver.strict) traits. |
| [`NativePlugins`](https://github.com/strict-lang/Strict/tree/master/NativePlugins) | C libraries that implement traits through a C ABI. [`ImageLoader`](https://github.com/strict-lang/Strict/tree/master/NativePlugins/ImageLoader) decodes JPG and PNG with stb_image, and [`ImageSaver`](https://github.com/strict-lang/Strict/tree/master/NativePlugins/ImageSaver) writes PNG or JPG with stb_image_write. |
| [`Examples`](https://github.com/strict-lang/Strict/tree/master/Examples) | Example programs and katas, see [Examples](Examples.md). |

The compiler packages (`Expressions`, `Validators`, `Bytecode`, `Runtime`, `Compiler`) are described in [Architecture](Architecture.md).
