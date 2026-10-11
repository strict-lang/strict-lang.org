---
id: Grammar
title: Grammar
---

Strict is easy to read and write, and there is usually only one way to do things. Lines don't end with special characters. Blocks are indented with tabs and have no start or end markers or brackets, like in Python. Every line is an expression, and a line that stands on its own has to be true, otherwise execution and even compilation stop at that point. Callers can evaluate these expressions as checks, which is how tests work: every method starts with checks that call the method itself and must be true.

The grammar below, in [Extended Backus-Naur form](https://en.wikipedia.org/wiki/Extended_Backus%E2%80%93Naur_form), is informational. It is not used to generate the tokenizer or the parser, which are written in Strict ([`Expressions/Tokenizer.strict`](https://github.com/strict-lang/Strict/blob/master/Expressions/Tokenizer.strict), [`Expressions/SyntaxParser.strict`](https://github.com/strict-lang/Strict/blob/master/Expressions/SyntaxParser.strict) and [`Expressions/StatementParser.strict`](https://github.com/strict-lang/Strict/blob/master/Expressions/StatementParser.strict)). It is useful for syntax highlighters like TextMate (`.tmLanguage`) for Visual Studio Code, Sublime or Atom.

```text
NUMBER        := '-'? [0-9]+ ('.' [0-9]+)? ([eE] ('+' | '-')? [0-9]+)?
STRINGCHAR    := [a-zA-Z0-9 .,;:!?+*/=<>()_^%&|~@#$'-]
ESCAPEDCHAR   := '\\' ('"' | '\\' | 't' | 'n' | 'r')
STRING        := '"' (ESCAPEDCHAR | STRINGCHAR | TAB | '\\')* '"'
LF            := '\n'
SPACE         := ' '
TAB           := '\t'
NAME          := [A-Za-z]+
file          = member* method*

member        = ('has' | 'constant' | 'mutable') SPACE NAME ' with ' expression LF
              | ('has' | 'constant' | 'mutable') SPACE name_and_type (' = ' expression)? (' with ' expression)? LF
name_and_type = NAME (SPACE type)?
type          = NAME ('(' parameters ')')? (' or ' NAME)*
parameters    = parameter (',' SPACE parameter)*
parameter     = name_and_type (SPACE '=' SPACE expression)?
expression    = ternary_if | binary | unary | variable_or_method_call | constant | list
constant      = 'true' | 'false' | NUMBER | STRING
variable_or_method_call = reference ('(' arguments? ')')? ('.' variable_or_method_call)*
reference     = NUMBER '.' reference | call_target ('.' reference)*
call_target   = NAME | constant | list
arguments     = expression (', ' expression)*
ternary_if    = expression_without_ternary ' then ' expression ' else ' expression
binary        = expression_without_binary SPACE (binary_op_with_space | binary_op SPACE) expression_without_binary
                (SPACE (binary_op_with_space | binary_op SPACE) expression_without_binary)*
expression_without_binary = unary | method_reference | operator_call | variable_or_method_call | constant | list
expression_without_ternary = binary | expression_without_binary
binary_op_with_space = 'is not in ' | 'is not ' | 'is in '
binary_op     = '+' | '-' | '*' | '/' | '%' | '^' | '<=' | '<' | '>=' | '>' | '=' | 'in' | 'is' | 'and' | 'or' | 'xor' | 'to'
unary         = unary_op expression
unary_op      = '-' | 'not '
method_reference = 'to' SPACE type
operator_call = binary_op '(' arguments? ')' ('.' variable_or_method_call)*
list          = '()' ('.' variable_or_method_call)? | '(' expression (', ' expression)* ')' ('.' variable_or_method_call)?

method        = (type | binary_op ('(' parameters ')') | unary_op ('(' parameters ')')?) (SPACE type)? LF block*
block         = (TAB+ block_expression LF?)*
block_expression = if | selector_if | for | return | mutable | assignment | expression
if            = 'if ' expression LF block (TAB+ 'else' (SPACE if | LF block))?
selector_if   = 'if ' expression (' is' | ' is not') LF (TAB+ NAME ' then ' expression LF)+ (TAB+ 'else ' expression LF)?
for           = 'for ' ((reference ' in ' expression) | expression) LF block
return        = 'return ' expression
mutable       = 'mutable ' name_and_type (' = ' expression)?
assignment    = (('constant' | 'mutable' | 'let') SPACE)? assignable ' = ' expression
assignable    = NAME | variable_or_method_call
```

# Syntax highlighting files

| File | What it is for |
|------|----------------|
| [Strict.ebnf](/Strict.ebnf) | The grammar above. It comes from the C# implementation (`Strict.Grammar` on the [`dotnet` branch](https://github.com/strict-lang/Strict/tree/dotnet)) and isn't maintained anymore, but it is still mostly correct. |
| [Strict.tmLanguage](/Strict.tmLanguage) | TextMate grammar, used by the [VS Code extension](GettingStarted.md#visual-studio-code). It also works in Sublime Text and other editors that read TextMate grammars. |
| [Strict.iro](/Strict.iro) | Source of the TextMate grammar for [Iro](https://eeyo.io/iro/), which also generates highlighters for Atom, Ace, Pygments, Rouge and more. |
| [Strict_udl.xml](/Strict_udl.xml) | Notepad++ user-defined language. Import it with *Language → User Defined Language → Define your language… → Import*. |

The current versions of the last three are in [`strict-vscode-client/syntaxes`](https://github.com/strict-lang/strict-vscode-client/tree/main/syntaxes).

# Files

* `.strict` files are UTF-8 without a byte order mark.
* Lines are separated by a line feed (`\n`) only, never a carriage return.
* There are no empty lines, no trailing whitespace, no whitespace-only lines and no trailing blank lines at the end of a file.
* Indentation is tabs only, one tab per level. Spaces at the start of a line are an error.
* There are no comments.

# Other languages

Strict has a lot in common with C#, Java, C++, F#, Lisp, Scheme and Scala. Syntax-wise, Lua and Python are probably the closest, because they are simple and look simple too.

* [Lua 5.1 reference manual](https://www.lua.org/manual/5.1/manual.html)
* [Python grammar](https://docs.python.org/3/reference/grammar.html)
* [C# lexical structure](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/lexical-structure)
