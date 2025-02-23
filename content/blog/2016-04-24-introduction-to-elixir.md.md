+++
title = "Introduction to Elixir"
author = ["neiro"]
date = 2016-04-24T10:00:00+02:00
tags = ["elixir", "functional"]
draft = false
+++

If you want to use all features of functional programming with Ruby-like
syntax to write modern fast, fault-tolerant applications, you may take a
look at Elixir programming language.


## What is Elixir? {#what-is-elixir}

Elixir is dynamic, functional, concurrent, fast programming language
that runs on top of the same virtual machine as his ancestor - Erlang -
_(BEAM)_. Elixir was created by _José Valim_ and was inspired by Ruby
syntax, but also was influenced by Clojure.


## Key principles {#key-principles}

Elixir platform itself presents you next availabilities:

-   Scalability - Elixir code can runs in thousands and millions
    lightweight threads that are isolated, but can exchange information
    via messages.
-   Fault-tolerance - Elixir provides supervisors that can restart parts
    of your applications on errors
-   Functional programming - Elixir code is short, elegant and powerful at
    the same time. You can use pattern matching, immutable constructions,
    first class functions like in any other functional programming
    languages.
-   Extensibility, DSL - Elixir supports modules, metaprogramming that
    lets you easily extend language or another modules.
-   Erlang compatibility - You can use all of Erlang ecosystem tools and
    modules in Elixir.
-   Tooling - Elixir comes with _mix_ build tool, _Hex_ package manager,
    _IEx_ interactive shell, _ExUnit_ testing tool.


## Features {#features}

-   UTF-8 support by default.
-   Modules and namespaces.
-   Docstrings documentation support.
-   Everything is an expression.
-   Pattern matching.
-   Immutability.
-   Compiling to Erlang virtual machine bytecode.
-   Polymorphism via protocols.
-   Lazy and async collections with streams.
-   Recursion, high-order functions without side-effects.
-   Tail call optimizations.
-   Metaprogramming, macroses.
-   Simple and lightweight concurrency using Erlang's mechanisms.


## Code examples {#code-examples}

```text
    IO.puts "Hello Elixir!" # Hello Elixir!

    # Integers
    255; 0xFF # 255
    0b0110 # 6

    # Floats
    100.0 # 100.0
    1.0e-10 # 1.0e-10

    # Booleans
    true == false; false

    # Atoms - string constants whose name is their value
    :foo == :bar # false

    # Strings are binaries in Elixir and Erlang:
    "Hello" # Hello

    # Lists
    [3.14, :pie, "Apple"]
    [1] ++ [2] # [1, 2]
    [1, 2] -- [1] # [2]
    [head | tail] = [1, 2] # head: 1, tail: [2]

    # Tuples
    { 3.14, :pie, "Apple" }

    # Keywords lists
    [foo: "bar"] # foo: "bar"

    # Maps
    map = %{:foo => "bar"}
    map[:foo] # "bar"

    # Comprehensions
    for x <- [1,2,3], do: x * 2 # [2, 4, 6]

    # Pattern matching
    [1, a] = [1, 2]
    a # 2

    # Modules
    defmodule Foo do
      def bar, do: "bar"
    end
    Foo.bar # "bar"

    # Pipe operator
    "Hello world" |> String.split |> Enum.map(&String.first/1) |> Enum.join # Hw

    # Sigils
    ~r/abcd/ # Regexp
    ~s/hello world/ # String
    ~w/hello world/ # List of words: ["hello", "world"]
```


## Conclusion {#conclusion}

If you want to use functional programming language for web-development,
fault-tolerant , distributed applications, that you may like an Elixir.
It comes with familiar Ruby syntax, but with all of power and eloquence
of functional programming languages. Elixir built on top of Erlang
platform and you can easily use all of Erlang ecosystem tools and
modules in your projects with modern syntax.
