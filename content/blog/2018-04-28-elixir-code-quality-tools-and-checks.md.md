+++
title = "Elixir code quality tools and checks"
author = ["neiro"]
date = 2018-04-28T10:00:00+02:00
tags = ["elixir", "quality", "ci"]
draft = false
+++

Elixir programming language has its great, huge community and ecosystem.
As for now, we can easily do static code analysis and code quality
checks by using plenty of standard or external tools. This allows us to
write robust solid Elixir code in a uniform way according to the
[style guide](https://github.com/christopheradams/elixir_style_guide)
.

Let's start with the most popular tools and solutions:


## mix compile --warnings-as-errors {#mix-compile-warnings-as-errors}

The first and the simplest check that could possibly exist. Elixir
compiler is smart enough to detect easily harsh mistakes like unused
variables or mismatched module names. At the same time it is pretty
friendly, because compiler just warns you about these problems, but does
not stop compilation. For some reasons, especially if we are running the
CI, we want to make it more obvious and stop any further checks. This
can be achieved by running `mix compile` task with related option:

```text
  mix compile --warnings-as-errors
```


## mix format --check-formatted {#mix-format-check-formatted}

Elixir 1.6 introduced yet another useful tool - the formatter. After
that we can keep our codebase consistent in one uniform code style
without any contradictions. However, in the real life, not everyone uses
the formatter and we need to force this option by running `mix format`
task with the `--check-formatted` option during CI.

```text
  mix format --check-formatted
```


## Credo {#credo}

[Credo](https://github.com/rrrene/credo) is a static analysis code
tool for Elixir. It's more than just a usual code checker - it can teach
you how to write your code better, show refactoring possibilities and
inconsistencies in naming.

In order to start using Credo you need to add this line to your
`mix.exs` deps:

```text
  {:credo, "~> 0.9.1", only: ~w(dev test)a, runtime: false}
```

You can enforce your own code style for your team by using Credo
configuration file. For example, you can create `config/.credo.exs` file
with this content:

```text
  %{
    #
    # You can have as many configs as you like in the `configs:` field.
    configs: [
      %{
        #
        # Run any exec using `mix credo -C <name>`. If no exec name is given
        # "default" is used.
        name: "default",
        #
        # These are the files included in the analysis:
        files: %{
          #
          # You can give explicit globs or simply directories.
          # In the latter case `**/*.{ex,exs}` will be used.
          excluded: [~r"/_build/", ~r"/deps/", ~r"/priv/"]
        },
        #
        # If you create your own checks, you must specify the source files for
        # them here, so they can be loaded by Credo before running the analysis.
        requires: [],
        #
        # Credo automatically checks for updates, like e.g. Hex does.
        # You can disable this behaviour below:
        check_for_updates: true,
        #
        # If you want to enforce a style guide and need a more traditional linting
        # experience, you can change `strict` to `true` below:
        strict: true,
        #
        # If you want to use uncolored output by default, you can change `color`
        # to `false` below:
        color: true,
        #
        # You can customize the parameters of any check by adding a second element
        # to the tuple.
        #
        # To disable a check put `false` as second element:
        #
        #     {Credo.Check.Design.DuplicatedCode, false}
        #
        checks: [
          {Credo.Check.Readability.Specs, priority: :low},
          {Credo.Check.Design.TagTODO, exit_status: 0},
          {Credo.Check.Design.TagFIXME, exit_status: 0},
          {Credo.Check.Readability.MaxLineLength, priority: :low, max_length: 100}
        ]
      }
    ]
  }
```

After that, it would be nice to force these settings by running Credo
mix task with `--strict` option:

```text
  mix credo --strict
```


## Xref {#xref}

Elixir has a `mix xref` task that performs cross-reference checks
between modules. This check can print all unavailable or deprecated
references, create a dependencies graph and show callers of the given
function. During the CI we want to check if we have any unavailable or
deprecated functions/modules:

```text
  mix xref unavailable
  mix xref deprecated
```

Don't forget to include `--include-siblings` option if you are using
this in umbrella application.


## Sobelow {#sobelow}

[Sobelow](https://github.com/nccgroup/sobelow) is a security-based
static analysis tool. Unfortunately, it comes just for the Phoenix
framework, so you can use it only in your web applications. Sobelow can
detect the following types of security issues:

-   Insecure configuration
-   Known-vulnerable Dependencies
-   Cross-Site Scripting
-   SQL injection
-   Command injection
-   Denial of Service
-   Directory traversal
-   Unsafe serialization

To install Sobelow you can use the next command:

```text
  mix archive.install hex sobelow
```

To run Sobelow just start the related mix task:

```text
  mix sobelow
```


## Dialyzer {#dialyzer}

[Dialyzer](http://erlang.org/doc/man/dialyzer.html) is the most
powerful and yet complex analysis tool for the BEAM platform. Dialyzer
means DIscrepancy AnaLYZer for ERlang programs, but it could be used in
Elixir too. It identifies software discrepancies like definite type
errors, dead or unreachable code.

To use Dialyzer in your Elixir application you may want to use
[Dialyxir](identifies%20software%20discrepancies). Just add this
line to your `mix.exs` file:

```text
  defp deps do
    [{:dialyxir, "~> 0.5", only: [:dev], runtime: false}]
  end
```

You can also configure warnings, dependencies and paths in `mix.exs`:

```text
  def project do
    [
    dialyzer: [plt_add_deps: :apps_direct, plt_add_apps: [:wx]]
    # flags: ["-Wunmatched_returns", :error_handling, :race_conditions, :underspecs]
    # paths: ["_build/dev/lib/my_app/ebin", "_build/dev/lib/foo/ebin"]
      ]
  end
```

You can ignore any unwanted warnings by providing `ignore_warnings`
option:

```text
  def project do
    [dialyzer: [ignore_warnings: "dialyzer.ignore-warnings"]]
  end
```

To run dialyzer on the CI add the next option to make sure that the
build fails in case of any errors:

```text
  mix dialyzer --halt-exit-status
```


## Conclusion {#conclusion}

As you can see, Elixir by itself and by its ecosystem has many useful
checks and tools that allow you to keep your code nice, simple, robust
and consistent. These checks are also highly configurable and
extensible. You can easily use them for any CI platforms to keep your
development workflow bright and shiny.

Happy hacking!
