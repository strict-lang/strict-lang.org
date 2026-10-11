---
title: Jun 2020 As Simple As Possible
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

While exploring options yesterday and today for creating a great editor experience for Strict, I discovered some new options. We already got a [VSCode integration](https://github.com/strict-lang/vscode-strict) that provides basic syntax highlighting and works to write a few lines, but is not a fun experience at all if you are used to fully fletched IDEs. The Strict IntelliJ plugin we recently got working is good enough for some basic Auto Completion / IntelliSense, but there are thousand little issues, which makes the experience not very good yet (which is why it is not released yet and we have noone using or working it daily atm, as opposed to the sdk, Strict and VSCode code bases). I am by no means a Java Guru and don't really like working on top of the [IntelliJ platform sdk](https://www.jetbrains.org/intellij/sdk/docs/intro/welcome.html), so I am unsure when this plugin is gonna be improved.

What sounds very promising is the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) and the growing numbers of [implementations](https://langserver.org/). Doing some early experiments a Stritc language server works in Visual Studio Code, Visual Studio 2019 and even IntelliJ (plus a lot of other IDEs and Editors that support it like Emacs, Vim, Atom, whatever people like to use). More on that in the next blog post.

## As Simple As Possible, but not simpler

"Everything should be as simple as it can be but not simpler!" - Albert Einstein

While trying to get the Strict Language server plugin up and running for testing, I still noticed some pain points. I am currently preparing the upcoming work for the new employee Mahmoud (starting tomorrow). I can explain away most design decissions, but there are some open issues plus some simplifications that Merlin and me talked about in the past, but are not implemented yet. So instead of continuing with the current [sdk in go](https://github.com/strict-lang/sdk), I thought why not try starting to bootstrap the Strict compiler directly in Strict .. but no, its not ready yet, I got stuck very quickly.

The sdk code base is already too large for quick experiments, so I just created a new one in c# (where I feel most comfortable until Strict is hopefully more useable later this year) and keep staring at the very old design, the redesign from last year and the redesign from this year (in go). The main thing I noticed is that many checks are just not needed and Strict is very clear on what is valid code and what isn't, so why not get away with no lexing or parsing at the file level at all.

We know a .strict file is describing a type. A type can either be just a trait (think interface) describing what should be implemented, or it is a class optionally implementing one or multiple traits. From the outside it doesn't really matter, you want to use some functionality like Account, Count, Computation, Number, Iteration, etc.

Everthing automatically derives from the Any.strict trait, which looks like this (notice there is no implementation):
```ocaml
method ComputeHashCode() returns Number
method IsEqualTo(target Any) returns Boolean
```

Either a file contains no implementations, then it is a trait, or it has just implementations, which is most files. Let's look at some String.strict examples while simplifying the language.

## Iteration 1

```ocaml
implement Sequence<Character>
has characters
factory From(number)
  From(5) is "5"
  From(123) is "123"
  let result = create StringBuilder()
  while number > 0
    result = "0" + (number % 10) + result
    number = number / 10
  return result
```

This was an early implementation idea, close to the current [String.strict code](https://github.com/strict-lang/Strict.Base/blob/master/src/String/String.strict). You can see it starts with a bunch of tests to make sure what we are doing makes sense and works. Strict enforces to have at least one test condition for every method (which can be any expression returning true, anything else would fail the test and thus compilation).

Here we implement the generic trait *Sequence* with the Character class, which is used in the next line to create an *array* (which is immutable like everything else not marked with the mutable trait). Next we have a special factory method called *From*, which has no **method** and no **return** type as it is a factory method to construct this type based on a number.

Next we create a result, which is not a class name, so here we see a type definition for the first time as the compiler can't figure out what we mean by result automatically (string, text, name would all be *string*s, stringBuilder would be a *StringBuilder*, but that is long and ugly). The *StringBuilder* internally keeps a mutable array of characters we can append to, which is useful in this usecase. Now we use a simple formula to add each base10 number at the beginning of result, then reducing the number by a factor of 10. Finally we return the *StringBuilder*, which has a **to** method to give us a *String*, which matches the *characters* defined above.

Now there are several problems with this code, first of all the number can't be mutated as everything is immutable by default in Strict. We can change that by making it mutable. Next is that we don't even have while loops, there is currently only one form of loops, which is the good old for loop.

## Iteration 2

Let's skin the code another way:

```ocaml
implement Sequence<Character>
has characters
from(mutable number)
  test(5) is "5"
  test(123) is "123"
  create result StringBuilder
  for digit in Range(0, Log10(number))
    result = "0" + (number % 10) + result
    number = number / 10
  return result
```

Ok, here we removed factory, just named it *from*, which is a reserved keyword anyway to convert stuff *to* something else. We also added a mutable to the number (which is still of type *Number*) to allow changing it in our loop. The tests look better as they directly tell us what we are asserting (btw: complex tests with multiple lines can be written as indented code blocks like everything else). Also calling yourself and trying the method name again and again isn't produce, lets just use the test keyword and pass the parameters directly in here.

Next I have renamed **let** to **create** and removed all the assignment stuff and the parentheses as there is nothing we pass as parameters. The loop is now a for loop and got the *Range* going over the digits of the *number* and still does the same logic inside the loop.

## Iteration 3

This is still not very functional and it seems I am still trying to low level optimize, which should be the job of the compiler and not the coder. Let's try to go a more functional approach.

```ocaml
implement Sequence<Character>
has characters
from(number)
  test(45) is "45"
  return stream digit from digits(number)
    create Character(digit)
method digits(number)
  test(1) is (1)
  test(123) is (1, 2, 3)
  if number / 10 > 0
    yield digits(number / 10)
  yield number % 10
```

Here we use streams, which are not documented well yet. I just added the [streams page](/docs/For). Basically they grab any array, collection, sequence or data and pass it though the pipe in the lines below. Here we simply create a *Character* for each digit (which does the **"0" + number** thing for us). The stream combines it all back to an array of characters, which automatically matches our *String* we wanted to build (any type can be constructed by supplying the has members, no need to write any method, constructor or factory like that, as usual this is forbidden in Strict ^^).

## Iteration X

This is not done yet and will be changed many times. I am currently just experimenting with parsing the above code and see if the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) that pops out makes any sense.

Anyway, methods contain code that needs to be parsed, everything else (implement, has, from, method) we can make up from simple rules, which is what I am currently trying at https://github.com/strict-lang/Strict

One final note: I completely removed **imports** as the *Context* that is used to parse a file knows all types already and if any unknown type is used in a .strict file, the parsing (and thus compiler) stops. There is probably some ordering that needs to be done and the optional **build.yml** file needs to allow users to point to more than just the [default repository](https://github.com/strict-lang) for all known types.

## Summary

Just two nightly code sessions with most of the time thinking about simplifications what what makes sense, this repository will stay in flux for some time and should not be considered stable (the sdk repo works and is usable and any bugs there we will still fix till the new repo is remotely usable). The main goal here is to make the editor support and language server implementation much easier and also think on what makes sense while adding some code we can compile and run soon (using as much as possible from existing blocks).

Todays goal is just to get it all green on TeamCity CI (Continuous Integration), which is still complaining about some ugly comments, some small issues and not having 100% coverage yet .. no biggy.