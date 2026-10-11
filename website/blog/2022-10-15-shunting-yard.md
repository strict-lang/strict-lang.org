---
title: October 2022 Shunting Yard
author: Murali Tandabany
---

When I was struggling with parsing the nested group expressions, Benjamin Nitschke introduced an algorithm to me called `Shunting Yard` which solves group expression parsing in a much simpler way. In this blog, we are going to discuss the details about this Shunting Yard algorithm and learn it's usages in Strict.

## What is Shunting Yard?

It is a stack-based algorithm which takes arithmetic or logical expressions as input and convert them into postfix notation. The output postfix notation gives us the order of execution of the arithmetic or logical expression operations in order to arrive at the correct result.

More details about the algorithm can be found in this wikipedia page link 

```
https://en.wikipedia.org/wiki/Shunting_yard_algorithm
```

## How Shunting Yard is used in Strict?

We took the complete advantage of Shunting Yard algorithm in the Parser section where each line of code needs to be parsed and spit out into correct expressions. Here, the strict program lines can contain any type of expression such as Number, Text or complex nested group Binary expression with member calls and method calls. In order to parse all theses types of expressions, mainly nested group expressions in the parser without having many performance intensive checks and conditions, we need a simple and clever algorithm like Shunting Yard.

The method expression parser itself takes care of all of the easy kind expressions in the front level which helps to improve the performance of parsing phase. When it comes to complex type expressions, we need to give it as input to the Shunting yard where the complex expression is first tokenized using Phrase Tokenizer class and then each token is ordered based on the operator precendence which then finally gives us back the postfix tokens.

These postfix tokens are stored in the Stack and the method expression parser will pop out each token and construct the result expression with few checks. Specifically, constructing binary expressions out of postfix tokens makes the job very much easier with the use of recursion.

For example:

```
(2 + (3 + 5) * 5) * 2  converted to -> 2, 3, 5, +, 5, *, +, 2, *
```

## What is Phrase Tokenizer?

Phrase Tokenizer is a class inside Shunting Yard and it is used to tokenize the complex expressions into separate tokens based on certains conditions. 

For example:

```
1 + 2 -> tokenized into "1" , "+", "2"
"Hello + World" + 5 -> tokenized into ""Hello + World"", "+", "5"
```

For certains types of expression where tokenizing is not helpful, Phrase Tokenizer will spit out the whole expression as single token and then the method expression parser will handle it by splitting the expression into much simpler form and uses Shunting yard again if needed. Mostly, if the expression is nested with arithmetic or logical operators, then tokenizing them will make more sense than for method call or member call expressions.

For example:

```
Add(4 * 5 + 3 - 1)
```

This whole expression will be treated as single token in the Phrase Tokenizer and then the method expression parser will split this into separate expressions as shown below

```
Add as Method call 
4 * 5 + 3 - 1 to Shunting Yard and get output as 4, 5, *, 3, +, 1, -
```

For more details about Shunting yard and phrase tokenizer, refer to the Strict code base in github.