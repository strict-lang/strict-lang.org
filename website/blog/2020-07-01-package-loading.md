---
title: Jul 2020 Package Loading
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

Tons of changes have been made in the last few days to load packages with all types and all their methods. The reason and use case was trying to put Strict into production already. Having a few unit tests work and experimenting around with simplified language ideas is all nice and good, but useless in the long run if I can't prove it works with actual code in the real world. It is obviously way too early to tell. However nothing is preventing us to write some tests that assume we can run the existing code already.

Initially I tried running some code in a quick self written interpreter (ala virtual machine) like shown in most compiler/interpreter books and getting some simple state machine and calculator parser and interpreter off the ground is not that hard if you have done it a few times. Not that exiciting for me or Strict, so I was looking for a full solution instead. The much older Strict parser and interpreter was written in NRefactory and then later ported to Roslyn (many many years ago when it came out first) and also using Irony for the SNF parsing. That code still works, but is quite complex and not very similar to the new functional way. We also got the strict sdk running in go and that is working fine too, but we don't have an interpreter/virtual machine here yet, just some backend code to generate source code in another language, which has quite a lot of issues as well (e.g. for c++ code to compile each type must work and currently it just isn't done yet).

After some back and forth and trying different solutions I went back to Roslyn, which I know well enough to quickly generate a bunch of code, classes, methods, statements, etc. and run them. Initially getting Roslyn up and running at runtime can be slow (around 1-2s), but the cool thing about Roslyn is that subsequent runs are super fast (in the 10ms range), which makes it good enough for quick testing and running many NCrunch tests in the background all the time. We had 5000+ tests on the Delta Engine backend to generate C++, Objective-C, Java, JavaScript and C# code 6 years ago, initially using NRefactory and later Roslyn on top of our own AST model as well and while it wasn't as fast as the frontend 3000+ tests (which ran in a few seconds), it was fast enough to run all the time and especially on each CI commit. Nowadays computers are faster and tools are better too, our goal is always having unit tests run in under 10ms (with Roslyn the initialization time needs to be excluded as that is not possible to get up and running that quickly, especially generating a new assembly, loading all the required assemblies for analysis, code generation and execution).

Back to the problem at hand: Loading packages, which contain class types and sub packages. Types contain methods and all the statements are in those.

## Packages

A good example for a package is the Strict.Base package, which gives us all the base types we usually need anyway (reduced the implementation to what is working now, there will be more types soon).

For now Any.strict (providing ComputeHashCode and IsEqualTo methods) was removed as we don't want to force everyone to implement those or autogenerate them for everything. Every type should get a hashcode, equal checks and conversion to text (ala ToString) automatically anyway.

## Strict.Base

- [**Any** trait](#anystrict): Basis for all classes, is always implemented. Provides **to HashCode** and **to Text** (both automatically implemented by default in the compiler, can be overwritten)
- [**Mutable** trait](#mutablestrict): Does not implement anything, just provides the compiler with the knowledge that this changes and is not threadsafe (and should be avoided)
- [**Number** class](#numberstrict): Most used type for anything that requires computation, provides number manipulation methods and **to** / **from** *Text*, etc.
- [**Character** class](#characterstrict): Needed for text, basically a number, but will be implemented as utf8 char
- [**Count** class](#countstrict): Mutable version of Number, which is only used in a single thread, often optimized away
- [**HashCode** class](#hashcodestrict): Just implements number and stores the hashcode in the implementation (usually as int)
- [**Text** class](#textstrict): List of characters with a bunch of helpful text methods (implemented as string obviously)
- [**Input** trait](#inputstrict): For getting data, usually from stdin, also reading files or any input device
- [**Output** trait](#outputstrict): For writing data, usually to stdout, stderr or any file, display, data, etc.
- [**Log** class](#logstrict): implements Output is by default implemented to write to the Console (but the user can provide his own implementation, which would change usages)
- [**App** trait](#appstrict): Entry point for all apps (there can only be one per package, which must be in the main namespace), requires *Run* to be implemented

This should be enough to create a console app. If a file is a class or trait usually doesn't matter except when you try to implement it for a new class, where only traits are shown and allowed. Classes are used via *has* keyword as members. On purpose most complicated methods and features have been left out (localization and culture stuff, we always assume international ISO formats for now). Also no Type, Function or Iterator features yet. Again: We don't want to replace any framework here, just provide the basis so simple programs can be understood and generated by machines.

## Any.strict

```ocaml
is(any) returns Boolean
to returns HashCode
to returns Text
```

Defines all the methods available in any type (everything automatically implements **Any**). These methods don't have to be implemented by any class, they will be automatically implemented with default behavior if not provided. In the current iteration I removed the method keyword as it is obvious that returns is only used for methods (and None methods are easy to spot as well). Often Any is replaced by a specific type or trait to be more useful in an implementation, for example **Input**.

## Mutable.strict

```ocaml
from(Any)
```

## Number.strict

```ocaml
+(other) returns Number
  +(5) is 5
	Number(3) + 4 is 7
	return self + other
-(other) returns Number
  -(5) is -5
	Number(3) - 2 is 1
	return self - other
/(other) returns Number
	/(50) is 0
	Number(1) / 20 is 0.05
	return self / other
*(other) returns Number
	Number(3) * 4 is 12
	return self * other
>(other) returns Is
	test(0) is false
	test(3) is true
	return self > other
>=(other) returns Is
	test(0) is true
	return self >= other
<(other) returns Is
	test(0) is false
	test(3) is true
	return self < other
<=(other) returns Is
	test(0) is true
	return self <= other
```

Currently implements all the basic math operations. Conversion to Text is done in that class.

## Character.strict

```ocaml
implement Number
from(number)
	test(7) is '7'
	return '0' + number
from(text)
	test("b") is 'b'
	return text.Characters[0]
to returns Text
	test('a') is "a"
	yield self
```

'7' is not valid yet, maybe Character will become private (thus character), not sure if there are any usecases outside *Text* for this. Converting numbers to Characters is helpful and getting the first Character from text is also good, same as converting back to Text.

## Count.strict

```ocaml
implement Mutable
implement Number
Increase
	Count(5).Increase is 6
	self = self + 1
Decrease
	Count(3).Decrease is 2
	self = self - 1
```

Here we can test methods that return None because they modify the state of itself (the Number), but we still allow the shortcut testing because we know that we talk about the thing before the None method call. This works everywhere else just as well (even with chaining). ++ or -- are not valid operators in Strict.

## HashCode.strict

```ocaml
implement Number
```

Nothing here yet except a number, probably will stay that way and the Any autoimplementation of **to HashCode** will just xor each member (with some optimizations for complex things like Text).

## Text.strict

```ocaml
has Characters
from(number)
  test(45) is "45"
  return stream digit from digits(number)
    create Character(digit)
digits(number) returns Iterator<Number>
  test(1) is (1)
  test(123) is (1, 2, 3)
  if number / 10 > 0
    yield digits(number / 10)
  yield number % 10
+(other) returns Text
  +("more") is "more"
  "Hey" + " " + "you" is "Hey you"
  return self.Characters + other.Characters
```

See the [blog post June 17, 2020 As Simple As Possible](https://strict-lang.org/blog/2020/06/17/as-simple-as-possible) for details. Because Characters ends with s, the type Character is used as an Iterator (readonly array). The + method adds two texts by using the + method for Iterators, which will just create a new bigger list containing both parts.

## Input.strict

```ocaml
Read returns Any
```

Typical example of a trait in Strict, it is super short and easy to read. When loading files *Iterator&lt;Text&gt;* or *Iterator&lt;Number&gt;* might be more useful than just Any, but anything is allowed and can be limited when implementing.

## Output.strict

```ocaml
Write(any)
```

## Log.strict

```ocaml
implement Output<Text>
Write(text)
```

**Log** implements Output via generic specification *implements Output&lt;Text&gt;*, so only text entries can be written (lines). The log trait is not implemented in Strict yet, the backend will provide us with a ConsoleLog version that will be injected. For testing we need a MockLog thingy as well and I am currently thinking about enforcing writing Mock implementation classes in Strict when using external classes.

## App.strict

```ocaml
Run
```

Another very simple trait just telling us to implement *Run*, which is the entry point for our package (in case we want to run it, most packages will just be libraries).

## Loading Order

All this was just done to force me to implement pre-loading types in a package for the current *LoadStrictBaseTypes* test, then pre-load each of the implementations, members and methods (which might use other not yet loaded types from the same package). And then do the same for the methods, which are evalutated lazily until they are needed. All types and methods defined in a method body need to be available to compile correctly.

This is not easy at all, I tried several approaches and had to revisit and update this a few times until it all made sense and worked, luckily unit tests helped to stay sane. The following picture shows the typical search steps and optimizations done. It is different from simple binary searchs or finding types in other languages because in Strict any public type can be used at any place. There is much more to be done to make this work by discovering types from packages.strict.dev, more on that later.
![FindType](https://strict-lang.org/img/FindType2020-07-01.png)
