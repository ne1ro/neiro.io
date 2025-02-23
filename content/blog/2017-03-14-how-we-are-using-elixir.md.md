+++
title = "How are are using Elixir"
author = ["neiro"]
date = 2017-03-14T10:00:00+01:00
tags = ["elixir"]
draft = false
+++

This post is a continuation of series of posts started in previous
article. Previously we've talked about one of the most awesome,
innovative and pleasant projects that we had the honor to develop here
in FlatStack. In this article I will tell you about the problems we've
faced and how the right choice of technologies stack helped us to solve
them.


## Concerns that we've faced {#concerns-that-weve-faced}

When we started this project we knew right away that the features that
we need to implement aren't that simple. It's not a typical website with
predefined functionality and common list of features, it's not a web
store or blog, but rather a more complex and solid service. The heart of
our project is the time lapse build process.

We're operating the huge amount of photos distributed in time by hours,
days, months or even years. It would be nice if we could see these
photos through time to see progress, changes or development of
something. Therefore we can just clue these images into one
video --- time lapse. However, this feature isn't that simple as it
sounds. The entire build process is multi-staged and sophisticated
because it requires operations with external resources, data storages,
system utilities. We need to make several steps before we get the time
lapse:

-   We need to select only favourable photos that we want to see in our
    video. Shoots made late at night or at the noon may be not acceptable
    by users so we need to define a time range and filter images that are
    following this conditions.
-   We need to download preferred images each one by one in the fastest
    and most reliable way. We need to fetch them in parallel but at the
    same time we must be sure that all of downloads have been completed
    successfully --- we can't make time lapse with broken files or
    incomplete data.
-   Finally we need to create a video from downloaded images. It's an
    external process that is most important and fragile in entire
    infrastructure. We need to make it most stable and reliable part
    because we need to get finished video despite of all.
-   After successful time lapse build it would be nice to upload it to
    cloud storage to share it with the other users.

So these features were not easy and straightforward. We've faced many
concerns and problems regarding these tasks:

-   We need an external service to store photos and related data.
    Therefore, it's required to have sharp tools to operate with it.
-   Downloading many files as fast as possible is quite hard. We need to
    create batch fetches to achieve this velocity and not overflow network
    connections.
-   We want to use well-tried, attested tools to operate video processes.
    Unfortunately, these tools come as a command line utilities and we
    need to run them in external threads per each time lapse build
    process.
-   As it was said before, time lapse functionality is much more than core
    of our entire system. Consequently, we must be sure that every fetch,
    download or build process is successful. We can't afford the errors or
    broken builds.
-   Timelapse server can be easily distributed and scaled in case of
    increased load. It should just work despite high pressure, low system
    resources or any other cases.

These issues are not so easy to solve when you're trying to fix them
using popular programming languages or technologies. Most of them are
not so fault-tolerant, not process-oriented and requires much more
complexity to build such things. But we were free in selecting
technologies stack so we've decided to give a chance to Elixir. And
after successful development of time lapse service we certainly sure
that this was the right choice.


## What is an Elixir? {#what-is-an-elixir}

It's not just a new fancy, shiny programming language. It's an entire
platform based on mature, robust Erlang VM and it's ecosystem. What are
key benefits of Erlang runtime system? Well, the are plenty of them:

-   Light-weight user-space threads
-   It can be easily distributed on myriads of servers
-   You can swap your code without restarting server e.g. hot-swap
-   It encourages to write highly available, non-stop applications
-   Fault-tolerancy
-   It allows you to write soft real-time systems

Elixir comes with pleasant Ruby-like syntax and fully compatibility with
any Erlang code. But it also extends standard Erlang library and
provides more tools and libraries:

-   Unicode string and operations
-   Built-in test framework
-   Meta-programming e.g. macroses
-   Even more data structures
-   Polymorphic records
-   Strict and lazy enumeration APIs
-   Advanced scripting tools
-   A project management tool to compile and test Elixir code
-   Useful OTP (Open Telecom Platform) abstractions like Agent, Task,
    GenStage

We've tried Elixir before in our hackathon projects and it established
itself as a powerful and eloquent tool for developing complex
thread-based applications, e.g servers, process supervisors. Therefore
we've decided that core features and advantages of Elixir as both
programming language and platform will doubtless help us to solve our
problems so we've decided to give it a chance.


## How we've actually used Elixir? {#how-weve-actually-used-elixir}

At the first, we've created a base skeleton for our new Elixir
applications: <https://github.com/fs/elixir-base>. In this repository
we've developed just a simple template that contains required libraries,
scripts and tools that we like to use to.

The heart of project, time lapse service is based on this skeleton.
Basically it's just a simple server written in Elixir, but it contains
multiple supervisors, processes, distribution steps. OTP tools are just
great for building such applications, they allow us to write complex
multi-thread logic in elegant and simple way. So how it help us with
solving main problems and concerns?

-   We're using Amazon Web Services for storing our data. Elixir and
    Erlang have a great third-party libraries that work with it's API. We
    can provide any configuration that we want, we can supervise calls or
    request to AWS and make sure that they will be successful.
-   We can create complex asynchronous constructions using processes.
    Batch files download can be easily implemented by starting fetching
    each file in parallel, in his own process.
-   Elixir ecosystem has great tools for operating external processes,
    e.g. command line utilities. You can use ports for or native
    implemented functions for communicating with another system-level
    processes, supervise them, start or shut them down.
-   Elixir is extremely fault-tolerant. It's core principle "Let it crash"
    may sound confusing, but really it's a whole gift. Everything that can
    fail will restart again. It encourages you not to use defensive
    programming, but to architecture your application using supervisor and
    processes tree. This will lead to stability and robustness.
-   Elixir has great tools for distribution and scaling that come out of
    the box. Nevertheless, it has also libraries that help us to avoid
    performance issues. Any bottlenecks related to limited system
    resources or calls to external services can be solved using GenStage
    and it's dynamic supervisors. We will provide your more details about
    this fascinating abstractions in the next post of this series.


## Conclusion {#conclusion}

Developing process of Elixir micro service was not that fast at first.
When we created the first fully-functional prototype we thought that it
was already completed and reliable. But after some time we saw the
endless possibilities to improve our current implementation and making
it more robust and stable.

We did a stress testing of our service and understood that we need more
flexibility and steadiness for each step of time lapse build process.
Therefore we tried to rethink our entire architecture and the build flow
and we've ended up reconstructing our application using GenStages. This
approach finally resolved our main concerns regarding application
stability and performance bottlenecks and we'll share with you some more
information about this in our next post.
