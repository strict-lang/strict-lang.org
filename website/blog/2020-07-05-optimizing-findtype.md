---
title: Jul 2020 Optimizing FindType
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

Still working on the package loading code from the [last blog entry](https://strict-lang.org/blog/2020/07/01/package-loading). The main issue was the dummy repositories system I build a few days ago to grab code from a fixed folder, which didn't exist on the CI server. So instead of hacking another quick solution, the code was changed to download any repository from github and provide it at a **StrictPackages** local cache folder. This works very well and is also efficient, but there are so many problems to be solved, not just the caching and when to redownload the cached folders, but a huge amount of testing and CI issues took a long time to fix:
[![TeamCity CI issues](/img/TeamCityIssues_2020-07-04.jpg)](http://build.deltaengine.net:8080/buildConfiguration/Strict)

All good now, very fast for development and the CI server will just pull any github repository older than 1h and keep using it for all its tests, later with versioning and https://packages.strict.dev it will work much nicer. Also packages should not just be github repositories, but also be compiled and versioned, which will be much easier to download and use. Currently package management is not very high on the priority list, it just needs to work so testing can go on.

## FindType

Once packages work the first obvious use case is to grab Types from them. As explained in the last blog post any public type (any package publicly available and any upper-case type in them) are always available in all .strict files, there is no need to import anything, the whole universe is always available. This is pretty cool when writing code and discovering existing types and features, but it makes type discovery quite a challenge and requires a ton of high level optimizations and caching plus low level code that performs very well going through the code trees. This is the picture from the last blog post:
![FindType](/img/FindType2020-07-01.png)

The final implementation is actually just one expression body, but took me multiple days to find all the issues and write a lot of tests to cover all the required features. And even with it working now, the performance is not that great yet, see below for more optimizations.

```csharp
public override Type? FindType(string name, Context? searchingFrom) =>
	FindDirectType(name) ?? (IsPrivateName(name)
		? null
		: FindTypeInChildrenPackages(name, searchingFrom) ?? Parent.FindType(name, this));
```

FindDirectType is just a foreach loop on any type defined in the package directly (not in any sub folder, which are sub packages). It is about twice as fast as a similar Find or FirstOrDefault linq query. It is also usually inlined and only used at a few places:

```csharp
[MethodImpl(MethodImplOptions.AggressiveInlining)]
public Type? FindDirectType(string name)
{
	foreach (var type in types)
		if (type.Name == name)
			return type;
	return null;
}
```

Next the FindType method skips over any private name (when a type starts with a lower case letter) because it wouldn't be allowed to use it any other package anyway. The final line first searches all children packages recursively via *FindDirectType* again, also excluding the context we are coming from (usually our package we jumped into from the *Parent.FindType* search).

```csharp
private Type? FindTypeInChildrenPackages(string name, Context? searchingFromPackage)
{
	foreach (var child in children)
		if (child != searchingFromPackage)
		{
			var childType = child.FindDirectType(name) ??
				(children.Count > 0 ? child.FindTypeInChildrenPackages(name, searchingFromPackage) : null);
			if (childType != null)
				return childType;
		}
	return null;
}
```

Not the prettiest code, but it works and performs its job well. This was actually the most difficult part as I initially used FindType here recursively and had a lot of problem of sub trees not searching the same parent again or parents going into the same children over and over again (lots of StackOverflowExceptions).

## Performance

The first rule of optimization is to measure. I pretty much knew that the main issue will be searching from the root package to all children, so this is where I added the cache. This high level optimization gave already a good boost (10-100x faster depending on the use case), it will probably be way faster in the long run when there are hundreds of packages and thousand or million of files.

This is my first line-by-line profiling on the finished working code with all tests green and *ContextTests.LoadingTypesOverAndOverWillAlwaysQuicklyReturnTheSame* used to check the performance of doing 1 milion calls to FindType. Without the cache it is around twice as slow (and sometimes would time out NCrunch, so the cache is really good), but as you can see from the profile result, that is not really the main problem.
![FindType Performance Initial](/img/FindTypePerformanceInitial2020-07-05.png)

It seems only 39% of the time is even spend in the code I wrote, most of it is wasted on system, string and collection code. First order of business is to reduce the amount of string manipulations done and maybe inline a few more properties and methods just passing data around (with line-by-line profiling there is a lot of overhead, so switched to sample profiling mode).

Digging deeper into the performance results I saw a lot of Enumerators being created and disposed, so I started removing any foreach loop or linq query and if there was any string manipulation or comparison, I tried to remove it or simpify it. Profiling a bit more after some optimizations showed that most time in my example was spent in the Root package checking the cache, which means it works very well already, almost no time is spent in the tree and the only optimization left is to make the cache faster.
![FindType Performance Dictionary](/img/FindTypePerformanceDictionary2020-07-05.png)

After replacing Dictionary with [FastDictionary](https://github.com/redknightlois/fastdictionary/blob/master/src/FastDictionary.cs) it was time to profile again and surprise surprise, it was 3 times slower again. I guess .NET core 3.1 is already optimized quite well. I remembered that I could still make string operations about twice as fast by using **StringComparer.Ordinal** like [this blog post talks about](https://cc.davelozinski.com/c-sharp/fastest-way-to-compare-strings), except it didn't help either and made the code about 20% slower than just using non StringComparer methods. Last thing I tried was char.IsLower, [replaced it by some custom if code](https://www.dotnetperls.com/char-lowercase-optimization) making that part a bit faster as well, but I reverted it back because the .net core is quite optimized and good for this and much more capable than a quick if check (took like 3% of all string checks time, so not important anyway).

This is the final result, I spent over an hour trying out the above optimizations and just made it worse, so back to this version, good enough (78ms for 1 million FindType calls):
![FindType Performance Final](/img/FindTypePerformanceFinal2020-07-05.png)