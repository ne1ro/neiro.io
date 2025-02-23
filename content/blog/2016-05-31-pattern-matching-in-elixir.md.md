+++
title = "Pattern matching in Elixir"
author = ["neiro"]
date = 2016-05-31T10:00:00+02:00
tags = ["elixir", "functional"]
draft = false
+++

Pattern matching is a key feature of functional programming. It allows
you to check a given sequence of tokens for the presence of the
constituents of some pattern. Using pattern matching you can easily
operate with complex data structures in most expressive and eloquent
way. Elixir provides pattern matching like any other functional
programming language.


## Match operator {#match-operator}

Most of programming languages have assign operator: `var x = 10` . In
Elixir equals sign is actually _match operator_. Using this operator we
can assign and match values:

```text
  x = 1
  1 = x
  x # 1
```

But if we will provide invalid pattern?

```text
  2 = x # ** (MatchError) no match of right hand side value: 1
```

As you see, Elixir raises `MatchError` because left and right sides of
match operator are different - they don't match. You can assign variable
only on the left side of match operator:

```text
  true = undefined # * (CompileError) undefined function undefined/0
```


## Pattern matching {#pattern-matching}

You can use match operator not for assign only - it's useful for
destructuring operations:

```text
    # Lists
    list = [1, 2]
    [1 | tail] = list
    tail # [2]
    [1 | _] = list # [1, 2]
    [2 | _] = list # ** (MatchError) no match of right hand side value: [1, 2]

    # Tuples
    { res, val } = { :ok, 1 } # res => :ok, val => 1
    { :ok, val } = { :ok, 1 } # val => 1
    { :ok, val } = { :fail, 1 } # ** (MatchError) no match of right hand side value: {:fail, 1}
    { :ok, val } = { :fail } # ** (MatchError) no match of right hand side value: {:fail}

    # Maps
    %{ foo: res } = %{ foo: "bar" } # res => "foo"
    %{ bar: res } = %{ foo: "bar" } # ** (MatchError) no match of right hand side value: %{foo: "bar"}
```

You can also use pattern matching with functions:

```text
  defmodule HelloWorld do
    def hello(:world), do: "Hello, world!"
    def hello(name), do: "Hello, #{ name }!"
    def hello, do: "Hello!"
  end

  HelloWorld.hello :world # "Hello, world!"
  HelloWorld.hello "Elixir" # "Hello, Elixir!"
  HelloWorld.hello # "Hello!"
```


## Pin operator {#pin-operator}

You can rebound Elixir's variables:

```text
  x = 1
  x = 2
  x # 2
```

If you want to provide existing variable's value in pattern matching,
then you should use _pin operator_:

```text
  x = 1
  ^x = 2 # MatchError because 1 != 2
  [^x, y] = [1, 2] # [1, 2]
  y # 2
  [2, ^y] = [2, 1] # ** (MatchError) no match of right hand side value: [2, 1]
  [_, ^y] = [3, 2] # [3, 2]
```


## Conclusion {#conclusion}

Elixir comes with match and pin operators that provide support of
pattern matching. It allows you to write simple and elegant code to
operate basic values, complex data structures or even functions.
