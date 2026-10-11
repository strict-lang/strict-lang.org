---
id: Concurrency
title: Concurrency
---

> This page is early brainstorming from 2020 and uses an old syntax that is no longer valid Strict. The direction still holds: values are immutable, so loops, tests and method calls can run in parallel without any code from you. Parallel execution is the runtime's job. See [For](For.md) for how loops are written today.

Strict Solutions:

- Coroutines
- Compiler Generated Fork Join and parallel Computation evaluation
- Thread Local Storage is injected
- Communication wise, start by offering simple NIO and later look at stuff like grpc

# Work in progress examples, thinking out loud

LocationDistance.strict

```
implement ManhattanDistance<Location>

Location source
Location target

method Number Compute()
  test
    ...
  return Sum([
    NumberDistance(source.X, target.X),
    NumberDistance(source.Y, target.Y),
    NumberDistance(source.Z, target.Z)
  ])

let distance = myPosition.DistanceTo(bigApplePosition)
let distanceToBigApple = VectorMath.Distance(myPosition, bigApplePosition) + amountOfStairs
```

NumberDistance.strict

```
implement Distance<Number>

Number source
Number target

method Number Compute()
  let [smaller, higher] = BiOrder(source, target)
  return higher - smaller
```

Range.strict

```
implement Computation<Number>

Number begin
Number end

method Number Compute()
```

BiOrder.strict

```
generic Value is Ordered
implement Computation<Value[]>

Value left
Value right

method Value[] Compute()
  return match
    right > left => [left, right]
	else => [right, left]

method add(Number left, Number right)
  return match
	left == 0 and right == 0 => 0
    left == 1 and right == 1 => 1
	else => left + right

let computation = BiOrder(10, 20)
```

PrimeNumbers.strict

```
implement Computation<Number>

factory (upTo: Number upperBound)

Number upperBound

method Number Compute()
  for entry from 0 to upperBound step 2
    if isPrime(entry)
	  yield entry

method Boolean isPrime(Number prime)
  for number from 0 to prime
    if number % prime is 0
	  return True

---
// RandomNumber.strict
implement Computation<Number>

Number upperBound
ThreadLocal<Random> random

method Number Compute()
  return random.GenerateNumber(upTo: upperBound)
```

World.strict

```
@mutable Tree[] trees

@mutable method Timber(Tree tree)
  test with (10, 20)
```

Player.strict

```
Score score

win(player)
  score = copy(player.score)
  score.points += 100
  player.score = score

addKillReward(player)
  score = copy(player.score)
  score.points += 100
  player.score = score
```

Score.strict

```
Count points

win(player)
  player.score.IncreasePoints(100)
```

older concepts:

# Concurrency

Immutable types and thread safety
Like in many programming languages (Java, C#, Python) string and other build in types (number, int, bool) are immutable. Basically whenever you assign something different to them, they are a new instance. This makes them thread safe. In addition all types created in Strict are immutable (like in functional languages like F# or Clojure, which focuses on multithreaded robust programs by using immutable values).

Idea: Maybe all data should work like Event Sourcing, which means all data changes are recorded and can be played back: https://www.youtube.com/watch?v=8JKjvY4etTY This could help a lot, basically any variable is just created and from then on things are just applied on top of it (e.g. number starts with 0, then we add +1, and the result is the original number and everything that was applied to it). Obviously some caching would be useful, this would be very bad for performance.

As you can see from the operators on the statements page creating types happens via the build in create method, which is always available, but can also be customized for each type (like a constructor). Often writing this create method is not required and many types can be thought of as data containers like in Go. Go however has no constructors and you just would write a method to create your type, which is usually not required in Strict. For example simple data types almost require no special code like a Vector2D class has tons of build in functionality like a create method, adding, subtracting, etc. without having to write a single method.

Vector2D.type
number x
number y
Some methods are still useful to have like calculating the length of a vector.

length.x.y.method
return System.Math().Sqrt(x _ x + y _ y)

Like explained in the overview, any type that has x and y can now call this length method. You might notice that the Sqrt method of Math was invoked via System.Math(), which is calling the get method of System.Math. In this case System.Math is a static .NET class and we can access its static members this way via this default instance.

Not very useful for a Vector2D, you can also get a created instance via the get operator by writing Vector2D(x is 1). This will always return a valid Vector2D instance (remember, there are no null values allowed in Strict), if no Vector2D with x = 1 was ever created, a new Vector2D is created automatically. Alternatively you can ask if a Vector2D exists via Vector2D.exists(x is 1), which returns a bool. A better example would be a User with some simple members:

User.type

number id
string name
string email
You can immediately use this type, create new instances via User.create(1, "Ben") or check if a user exists via User.exists(id is 1) or User.exists(name is "Ben") or grab a user by its id or name in the same way, e.g. User(id is 1). However this might not be the way you want to create such users. Maybe you want to enforce a valid email and the id should never be set by the caller, but instead be calculated in the create method automatically. Then you would add a create method like this:

User.create.name.email.method

static number idCounter = 0
id = idCounter++
Since all instances are immutable we cannot store a unique id somewhere in the class accessible for all new instances. Instead we have to declare a static member (only visible to this method), which will only be created once and is available to all threads. Static members can only be thread safe types (build in types, like number, bool, string, list and map) and they work pretty much like const, except they are NOT immutable and can be changed via each call made to them. We exploit this here to easily count up the id. Please note that name and email are set automatically from the parameters of the method to the members of the type, no further action is required. User.create(1, "Ben") cannot compile now and needs to be changed. Using User.create() or User.create("Ben") is also not allowed as there is no explicit create method for those cases. In case we want to make email optional two methods are created.

Thread Safety
Here is a great long article of Threading in C#, and you can see from its length it is not an easy topic. We want to avoid all that hassle and provide a solid foundation in Strict so we can just write code and let it be executed on different threads automatically.

If immutable types are too restrictive we can fallback to STM (Software transactional memory) to easily allow changing data, there are some nice implementations available and this is what Clojure uses.

All Strict code must be thread safe as we will always execute it on multiple threads and machines, not knowing who executes it right now and we don't want to bother locking or taking care of race conditions.

Links

http://blogs.msdn.com/b/ericlippert/archive/2007/11/13/immutability-in-c-part-one-kinds-of-immutability.aspx
https://github.com/jbakic/Shielded (.NET implementation of Software transactional memory)
http://en.wikipedia.org/wiki/Thread_safety
http://www.drdobbs.com/architecture-and-design/the-need-for-immutability/231000092

# Parallelism

Strict programming is not parallel, the code that is executed very much is so. You or Strict just write sequential code because that is how the hardware works on a low level. You can certainly call parallel methods (like Parallel.For for number crunching or even GPU code like with Cuda or OpenCL), but in general code that is written is executed sequentially (even without things like async and await, which are not present in the language, you would need to hock up a simple state machine to do that).

However, each call made to a function is not necessarily sequential, each call might be executed on a different task (locally on a machine via thread, but also can be on a different machine, see below). The language does not know anything about this, it just evaluates a statement and will wait by default a maximum of 1 second for Strict calls, anything longer is not allowed, external calls can take longer, but Strict keeps counting the time and might abort if it gets bored by waiting on any task for more than 60 seconds. Internally most calls happens on the same task, but depending on the structure of the code more tasks might be invoked. Strict knows the complexity of each thing that it calls, if it exceeds more than 1000 instructions or much more (10x+) than whatever the task switch cost is going to be, then each branch of calling the code (like a method call in a loop) is going to be executed in a different task.

Early versions of strict will just run locally in one thread (one task) and be fast because not much is going on. As things get slower and we will hit the 1 second call limit, things need to be parallelized. On a machine with 8 hyper threads this is going to work out for a while, but again at some point code needs to be moved from one machine to another and be executed remotely. Talking over threads or machines is going to be the same thing for tasks, the overhead for talking to other machines is however added to the task switching, which means if I can calculate it faster locally, then I am not going to call other machines for it.

It is very important to note that each task has its own memory and when spinning up a new task all input data needs to be fed into it, which might be huge and not worth the effort (especially sending big data over the network). Then tasks must be executed locally on a thread with a shared state, which will look EVERY non simple data type for each access (basically everything that is not a int, bool or number). This can be bad too, but slow code like that should be avoided and the system needs to refactor itself if it finds itself in a situation with slow code like this.

Implementation
Early implementations will just use Plinq and Parallel.Task, but only do so if the loop is huge or the statements called exceed a threshold (like the 1000 instructions listed above).

Here is a great read about Plinq, Parallel.Task and Concurrency in C# in general.
