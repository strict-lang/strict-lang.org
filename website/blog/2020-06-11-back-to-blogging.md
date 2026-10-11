---
title: Jun 2020 Back to blogging
author: Benjamin Nitschke
authorURL: http://twitter.com/BennyNitschke
---

My employee Abir poked me to blog more about Strict and the decisions I recently took for the IDE development. My old blog at https://BenjaminNitschke.com (2004-2016) is pretty much dead and I never found time to continue talking about Game Development in recent years, which is mostly because our company just didn't much game development work. All paid work for the past 5 years has been outside of creating games (aside from one mobile game app exception), we still did improve the Delta Engine, participated in Game Jams, worked on our Towers RTS game and stayed connected in the space. However, this was only if there was free time and paid work was always more important to keep the company and employees alive. Now we are doing much better with 10 employees at Delta Engine atm and our AI and Robotics work is getting off the road and use cases are in sight, however, no employee I currently have is a game developer atm (including me). So my focus in life will be work plus https://strict-lang.org

I am happy to announce that a new employee Mahmoud will help me will all this starting next week, continuing work on Strict, the IDE, compiling, SCrunch, etc. I am pumped to get more speed on the road again.

## IntelliJ vs Visual Studio Code

Merlin and me had this discussion earlier this year already, it was actually about which IDEs Strict should support. Merlin is coming from the Java world and really likes IntelliJ, which I agree is the most productive IDE for Java and other JDK languages and we also use Goland to develop https://github.com/strict-lang/sdk, so we decided to focus on that first. I use Visual Studio day in and day out and I am by far the most productive in C# utilizing many tools (ReSharper, NCrunch) and workflows that only exist in Visual Studio. I did actually write an earlier version of strict with the Irony Compiler Kit in .NET over 10 years ago and started writing a Visual Studio Extension, but it was not easy to fix all issues and constantly add features. We also worked at Delta Engine on Visual Studio Extensions around 7 years ago and it was a mess and very hard to maintain. I checked back around a year ago and it is still not a great development experience. So IntelliJ was choosen instead, which is a fully fletched IDE (and since we are using ReSharper, similar in features and hotkeys to what we use daily in Visual Studio) with many amazing features we want for Strict and the platform sdk docs are very good as well: https://www.jetbrains.org/intellij/sdk/docs/intro/welcome.html

The downside to IntellJ (and the Java world in general) is the complexity, there is way too much code, so many little issues you have to know about, so many annoying patterns and copy+pasting until stuff works, which is very different from what we want to archieve with Strict. Development slowed down to a halt, Merlin was annoyed, I didn't ever work with IntelliJ plugins and the learning curve is steep. I created a freelancer project to finish the blocking issues and found a developer that could finish it after a lot of back and forth: https://www.freelancer.com/projects/java/Add-Smart-Auto-Completion-IntelliJ/details

The IntelliJ plugin works, but it still sucks (Auto complete shows the same member we are just defining, there is no filtering, most things shouldn't pop up based on the context, etc. while still way better than any dynamic language or javascript, it is not like the fleshed out intelligent Auto Complete from good languages like C# or Java). It will take many iterations to make nice and useful and I don't really see a light at the end of the tunnel, feels more like a never ending painful story. We might continue on this road, but it won't be the top priority.

We also have created a simple Visual Studio Code plugin to support the .strict file format and syntax highlighting: https://github.com/strict-lang/vscode-strict
Since Visual Studio Code plugins are written in JavaScript (or TypeScript, which becomes JavaScript), it wasn't really our main choice to write strict parsing/lexing/SCrunch/etc. with such a messy language like JavaScript .. at least this is what I thought earlier this year. After creating a simple Visual Studio Code plugin using TypeScript (very nice) with the server language service that can be written in any language and just needs a thin client rpc connection from TypeScript, that already looks more promising. The main reason we wanted to support Visual Studio Code anyway is the way bigger community around it. It is small, slick, fast and most web developers know and use it already. There is also a new cool feature from github to run the VS Code IDE in the browser for your github project, which is amazing (not out yet, we are in the beta and while still cumbersome with azure setup, the idea fits extremely well to Strict): https://github.com/features/codespaces/

## Comparision

![alt text](https://www.jetbrains.com/idea/whatsnew/2018-3/img/Java12Convert-1.png "IntelliJ")

IntelliJ
- Very powerful, full fletched IDE
- Not as open and free as VS Code, thus smaller community outside of the Java world, but still work be free for Strict users (IntelliJ community is free)
- Great docs, lots of people comfortable with it
- Really Bloated, I really hate downloading 500MB+ just to launch gradle, grab some new sdk, get some IntelliJ version, etc.

![alt text](https://code.visualstudio.com/assets/updates/1_37/icons.gif "Visual Studio Code")

Visual Studio Code
- Free, small, slick, open source
- Greatest plugin ecosystem of all IDEs, really small and fast plugins, similar to Chrome plugins, just nice
- Not as powerful, haven't seen a really nice IDE experience or language implementation as good as Visual Studio or IntelliJ provide

![alt text](https://visualstudio.microsoft.com/wp-content/uploads/2019/04/Socialsharing2-500px.gif "Visual Studio 2019")

Visual Studio 2019
- Community edition is free as well
- IMO best IDE for the past 20 years by far, pretty much any professional C# or C++ developer uses it (especially game developers, which is the world I am coming from)
- Lots of commercial and professional plugins
- Not as popular in the open source community, also most of the things are stuck in their world, you can't just reuse features of some plugin as they are mostly closed source
- Extension development is not so nice and not so many people do it, smaller things are ok, but complex stuff is painful

## Summary

Going the Visual Studio Code route for now, I will post more when I find some time this or next week about my little language service and running it with Strict.