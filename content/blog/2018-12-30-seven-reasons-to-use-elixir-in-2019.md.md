+++
title = "Seven reasons to use Elixir in 2019"
author = ["neiro"]
date = 2018-12-30T10:00:00+01:00
tags = ["elixir"]
draft = false
+++

Currently Elixir is not one of the most popular programming languages
but for sure it is one of the most promising and underrated ones. Elixir
and it's community has been growing and evolving this year steadily so
right now I can recommend it to everyone - no matter if you are a
business owner or you are an experienced developer or a total newbie -
it's time to learn or adopt the new technology.


## Reliability {#reliability}

Elixir seems to be like a fresh new programming language which was
created just a few years ago, in 2012, but it's not the full picture:
Elixir is really a friendly interface and tooling for Erlang virtual
machine (BEAM). And just to remind you, Erlang has been widely used
since the 80s to build reliable, fault-tolerant, concurrent and
distributed systems like backends, telephony, communications - and so
does Elixir.

If you want your service or server to be eternally available with
_almost zero_ downtime then it could be a top match for you. Elixir has
all the powers of Erlang and provides even more libraries, tools and
opportunities.


## Syntax and simplicity {#syntax-and-simplicity}

Erlang inherited its syntax and semantics mostly from Prolog - a logic
programming language associated with artificial
intelligence and computational linguistics. Right now it seems very aged
and clunky and not the best suitable for modern functional programming
language. Elixir, in contradistinction to Erlang, was heavily influenced
by Ruby and Clojure, and its syntax and semantics looks really fresh,
eloquent and easy to write and read. Elixir has really collected all the
best parts of these languages and Erlang to make developers much more
productive and efficient.

```text
  defmodule Example do
    def list_users(ids) do
        User
         |> where([u], u.id in ^ids)
         |> order_by(asc: :inserted_at)
         |> Repo.all()
    end
  end
```

Elixir's syntax is beautiful yet simple enough. Of course it seems like
syntax sugar for Erlang but it's really enough to let you compose
programs in most elegant and simple way. There are no sophisticated and
intricate features that can mislead you. There is less room for mistakes
but much more possibilities to write a reliable, robust code in the most
expressive yet simple way. As a developer you can always be sure that
your Elixir's program will be predictable, explicit, easy to understand
and extend.


## Scalability {#scalability}

Elixir VM's model of concurrency allows you to run your programs
efficiently on multi-core CPUs to use all the powers of your computer,
but it is not limited to only one machine - you can scale your
application on multiple machines and there are no any limitations. For
example,
[you
can have 2 million open web socket connections](http://phoenixframework.org/blog/the-road-to-2-million-websocket-connections) or
[5
000 000 concurrent users](https://blog.discordapp.com/scaling-elixir-f9b8e1e7c29b?gi=434344270ffd) .

Elixir's processes are extremely lightweight and it makes Elixir also
resource efficient - you don't need so many machines, CPUs or have
hundreds of GB of RAM to handle your load. But if you really need to
then your program will always be ready to scale both horizontally and
vertically.


## Performance {#performance}

Elixir is very fast and performant. Its most popular web framework is
Phoenix
[is
almost 10 times faster than Ruby on Rails and Node.js](https://github.com/mroth/phoenix-showdown/blob/master/README.md#benchmarking) . Phoenix is
much more consistent under the high load though. And as I've said
before, Elixir is quite resource effective so the same web server
implemented in Elixir and Phoenix will handle much more load than Ruby
on Rails application and will consume much less RAM.

However, Elixir can be not so good when it comes to heavy computations,
but you can avoid the bottlenecks by using the native implemented
functions - NIFs - that allow you to
[rewrite
problematic code to make it way more performant](https://medium.com/@jacob.lerche/writing-rust-nifs-for-your-elixir-code-with-the-rustler-package-d884a7c0dbe3).


## Functional programming {#functional-programming}

Elixir is a functional programming language and it encourages you to
write pure, side-effect free functions, keep your logic and data
separated and your variables immutable. Elixir has first-class
functions, functions composition, closures, high-order functions,
pattern-matching - all that you really need to write your programs
according to the functional programming paradigm.

All these features made Elixir's concurrency model so simple and easy to
use. You shouldn't be afraid to communicate between different processes,
nodes, machines but be insured from the most concurrency issues.


## Tooling {#tooling}

Elixir has a plethora of great tools and instruments that helps
developers to write, test, build, deploy and debug their applications.

-   Package manager
-   Interactive shell
-   Code formatter
-   [Packing into releases](https://github.com/bitwalker/distillery)
-   [Deployment tool](https://github.com/edeliver/edeliver)
-   [Linters
    and quality checks](https://medium.com/@neiro/elixir-code-quality-tools-and-checks-315ab9e9d7ea)
-   [Discrepancy analyzer](https://github.com/jeremyjh/dialyxir)
-   [Concurrency errors checker](https://github.com/parapluu/Concuerror)
-   [Gradual types system](https://github.com/josefs/Gradualizer)
-   [Frontend-independent
    language-server](https://github.com/JakeBecker/elixir-ls)
-   And even more!


## Community {#community}

Elixir was invented by Jose Valim who was a former Ruby on Rails
community participant. Starting from the very beginning many people have
switched from Ruby and Python to Elixir. Elixir's community is quite
friendly, responsive and welcoming, it's easy to find help or advice
there. Elixir could be your first programming language or tenth - it
doesn't matter, you will get support in any case.

Right now there are [so many
tools and libraries in Elixir](https://github.com/h4cc/awesome-elixir) and
[so in Erlang](https://github.com/drobakowski/awesome-erlang).


## Summary {#summary}

If you want so start your new 2019 year from a little adventure then you
can learn Elixir or adopt it in your business. It suits very well for
any server-side applications, web applications, embedded systems,
scripts. You can start by reading the
[learning resources](https://elixir-lang.org/learning.html) or try
[Elixir School](https://elixirschool.com).

We are 100% happy with Elixir as the core technology in our modern
social platform [Salam.io](https://salam.io) and really want to
encourage anyone to give Elixir a try in their projects.

Happy hacking everyone!
