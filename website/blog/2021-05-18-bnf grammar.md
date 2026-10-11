---
title: May 2021 BNF Grammar
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

In todays meeting we discussed the grammar a bit more and we updated our Strict.bnf file, it is still very small, distinct and most importantly not done yet (tm): 

```csharp
file ::= {implement} {import} {member} {method}
implement ::= 'implement' type '\n'
import ::= 'import' namespace '\n'
namespace ::= Name | namespace '.' Name
type ::= Name
member ::= 'has' variable '\n'
variable ::= Name [type]
method ::= methodcall ['returns' type] '\n' [block]
methodcall ::= methodname ['(' parameters ')']
methodname ::= Name | binary | unary | 'from' | 'to'
parameters ::= variable | variable ',' parameters
block ::= {'\t'} {expression '\n'} ['return' expression '\n']
expression ::= 'true' | 'false' | 'from' | 'to' | Number | String |
	expression binary expression | unary expression | [namespace] methodcall |
	'let' Name '=' expression |
	variablereference |
	'if' expression '\n' block '\n' ['else' '\n' block] |
	'for' variablereference 'in' expression 'to' expression '\n' expression
variablereference ::= [namespace] Name
binary ::= '+' | '-' | '*' | '/' | '%' |
	'<' | '<=' | '>' | '>=' |
	'is' | 'is' 'not' | 'and' | 'or'
unary ::= '-' | 'not'
```

# Strict Grammar

Strict is easy to read and write, there is usually only one way to do things and it doesn't need fluff like end of line characters. Blocks are indented and have no start, end or brakets (like in Python). All lines are expressions and have to evaluate to true, otherwise the execution and even compilation stops at this point. Callers can use catch blocks to check for this.

These grammar files are not really used to generate any lexer, parser, tokenizer. They are here for informational purposes and to generate syntax highlighting like for Textmate (.tmLanguage), which can be imported to Visual Studio Code, Textmate, Atom, Ace, Sublime, etc.

* [Strict.ebnf](/Strict.ebnf) ([Extended Backus-Naur form](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form), the newest version of the Strict.bnf file above, see [Grammar](/docs/Grammar))
* [Strict.iro](/Strict.iro) ([Iro to create syntax highlighters for modern IDEs](https://medium.com/@model_train/creating-universal-syntax-highlighters-with-iro-549501698fd2))

To generate .tmLanguage (for Visual Studio Code or Textmate) or syntax highlighter files for other IDEs or tools use https://eeyo.io/iro/

## Other languages

Strict has lots of similarity with C#, Java, C++, F#, Lisp, Scheme, etc. However Lua and Python are syntax-wise probably the closest because of their simplicity and more simple look.
* https://www.lua.org/manual/5.1/manual.html
* https://docs.python.org/3/reference/grammar.html
* https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure