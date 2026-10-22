---
id: Decimals
title: Decimals and Exact Values
---

Prices, quantities and percentages often need an explicit decimal precision. In Strict a decimal is a `Number` with a step. Declare the step where a value enters your calculation, and Strict preserves that precision through validation, tests and interop.

```
has price Number with Step 0.01
has count Number
Total Number with Step 0.01
	Prices(0.1, 3).Total is 0.3
	Prices(0.125, 1).price is 0.12
	Prices(0.135, 1).price is 0.14
	price * count
```

Save this as `Prices.strict`. In [VS Code](VSCode.md), the inline tests and line values make the rounding behavior visible beside the code. You can also run `strict test Prices.strict` from a terminal.

# Choose the precision and rounding rule

`with Step 0.01` means increments of one hundredth. Steps can constrain members, parameters and return values.

The default rounding is half to even: `0.125` rounds to `0.12`, and `0.135` to `0.14`. Add `Floor` or `Ceiling` to choose a direction explicitly:

```
Discounted(amount Number with Step 0.01 Floor) Number with Step 0.01
	Prices(0.1, 1).Discounted(0.015) is 0.09
	Prices(1, 1).Discounted(0.019) is 0.99
	price - amount
```

A comparison involving stepped values rounds both sides to the finest declared step. `Prices(0.1, 3).Total > 0.3` is false.

# Keep exact values across boundaries

Stepped values use exact integer step counts on both the VM and native backend, up to 2^51 steps. Values outside that range return `Error("DecimalOverflow")` rather than silently losing precision. Ordinary `Number` calculations retain binary floating-point behavior; declare a step when the decimal precision is part of your data's meaning.

Generated [C# bindings](UsingApis.md#call-strict-from-c-and-c) carry the scale information and use `decimal` for stepped parameters and results. Sending `12345678.12345678m` into a value with `Step 0.00000001` and returning it preserves the decimal value. You can keep an ASP.NET application's existing data model and put its tested calculation rules in Strict.

# Use the tests as the specification

Include examples for rounding ties, negative values, the smallest accepted step and overflow. Those examples document the contract for both your Strict callers and your host application. SCrunch shows the actual values, so an accidental precision change is visible while you edit.

See [`Examples/Prices.strict`](https://github.com/strict-lang/Strict/blob/master/Examples/Prices.strict) for the core syntax, [Types](Types.md#constraints-with-with) for other constraints, and [Using APIs](UsingApis.md) for integrating the result into C or C# applications.
