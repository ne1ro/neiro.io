+++
title = "Building dynamic queries with Ecto"
author = ["neiro"]
date = 2017-09-16T10:00:00+02:00
tags = ["elixir", "ecto", "query"]
draft = false
+++

[Ecto](https://github.com/elixir-ecto/ecto) is the most popular,
robust and solid solution to work with databases in **Elixir** ecosystem.
Ecto is not ORM, ODM nor it is a _Repository patern_ library. _Ecto_ is
just a wrapper for common constructions to work with databases, nothing
less and nothing more than that.

**Ecto.Query** is the core module for operations with database queries. It
allows us to build easily any queries with predefined conditions that we
wanted.

But what if we want to build a _really_ dynamic query? A common case can
be filtering by list of attributes.

Imagine a situation when you have a large set of users in your database.
Your customers want to filter or exclude users by any attributes that
can be allowed: `name, nickname, gender` etc. Writing code for all of
model attributes can be tedious and annoying.

So what can we do about it?


## Filter Query {#filter-query}

Let's create a new Elixir module that will implement logic of our future
dynamic query. I will name it `FilterQuery` :

```text
  defmodule FilterQuery do
    @moduledoc """
    Query that accepts inclusion or exclusion parameters and filters by this parameters
    """

    import Ecto.Query
  end
```

This module should have just one public function called `filter` that
accepts incoming query, inclusion and exclusion parameters as the
arguments:

```text
  @spec filter(Ecto.Query.t, map, map) :: Ecto.Query.t
  def filter(query, inclusion, exclusion)
```

Now let's implement the core of our future filter function. Assume that
we need to build two lists of dynamic queries both for inclusion and
exclusion parameters:

```text
  queries = dynamic_query(:inclusion, inclusion) ++ dynamic_query(:exclusion, exclusion)
```

Now we need to merge all these dynamic queries into a new big one. It
can be implemented using `Enum.reduce` :

```text
  Enum.reduce(queries, query, fn(q, acc) -> where(acc, ^q) end)
```

Now our `filter` function returns a new complex query that can be easily
composed with another queries using `Ecto.Query` functions or macroses.


## Dynamic filter query {#dynamic-filter-query}

We have just created a basic prototype for our future dynamic filter
query. However, the devil's always in the details. We need to hide
implementation in private functions:

```text
  defp dynamic_query(type, filters) when type in [:inclusion, :exclusion] do
    for {attr, values} <- filters, present?(values),
      do: dynamic_query(type, attr, values)
  end

  defp dynamic_query(:exclusion, exclusion) do
    for {attr, values} <- exclusion, do: dynamic_query(:exclusion, attr, values)
  end
```

We suppose that inclusion and exclusion filters are keyword lists with
keys as model attributes and lists as the filter values. Therefore, we
need to check if these lists contain values or we shall skip building
query:

```text
  defp present?(list) when is_list(list), do: length(list) > 0
  defp present?(_), do: false
```

Now we need to go straight to the implementation. `dynamic_query/3`
should finally return for us the result.

We will use `dynamic` macro from Ecto.Query that takes any query as
first argument and builds dynamic query for the second one. Also notice
that we need to use `field` macro to dynamically access attribute name:

```text
  defp dynamic_query(:inclusion, attr, values) do
    dynamic([q], field(q, ^attr) in ^values)
  end

  defp dynamic_query(_, attr, values) do
    dynamic([q], field(q, ^attr) not in ^values)
  end
```


## Restriction of filter keys {#restriction-of-filter-keys}

So, looks like our filter query is fully functional and dynamic! But
this is not enough when you are building a complex logic that
desperately needs to leave some attributes **unfiltered**.

For example, imagine the case when your `User` model has a
`relationships_status` attribute. If you're allowing your API customers
to filter any attributes they are likely to find out lonely users by
using this loophole. Therefore your customers will be dating, engaging,
tying the knots and finally will be lost for your application. Is this
what you really wished? Guess not :)

So let's restrict filtered attributes by using `__using__` macro:

```text
  defmacro __using__(attributes: allowed_attributes) do
  ...

    def filter(query, inclusion, exclusion) do
      [inclusion, exclusion] = [sanitize(inclusion), sanitize(exclusion)]

      queries = dynamic_query(:inclusion, inclusion) ++ dynamic_query(:exclusion, exclusion)
      Enum.reduce(queries, query, fn(q, acc) -> where(acc, ^q) end)
    end
  ...

     defp sanitize(keyword_list),
      do: for {key, val} <- keyword_list, allowed_key?(key), do: {key, val}

     defp allowed_key?(key), do: key in unquote(allowed_attributes)
  ...
  end
```

Voila! No one ever will find out how your users relationships are going.

Now let's take a quick look at our dynamic filter query:

```text
  defmodule FilterQuery do
    @moduledoc """
    Query that accepts inclusion or exclusion parameters and filters by this parameters
    """

    import Ecto.Query

    defmacro __using__(attributes: allowed_attributes) do
      quote do
        import FilterQuery

        @spec filter(Ecto.Query.t, map, map) :: Ecto.Query.t
        def filter(query, inclusion, exclusion) do
          [inclusion, exclusion] = [sanitize(inclusion), sanitize(exclusion)]

          queries = dynamic_query(:inclusion, inclusion) ++ dynamic_query(:exclusion, exclusion)
          Enum.reduce(queries, query, fn(q, acc) -> where(acc, ^q) end)
        end

        def filter(query, _) do
          query
        end

        defp dynamic_query(type, filters) when type in [:inclusion, :exclusion] do
          for {attr, values} <- filters, present?(values),
            do: dynamic_query(type, attr, values)
        end

        defp dynamic_query(:exclusion, exclusion) do
          for {attr, values} <- exclusion, do: dynamic_query(:exclusion, attr, values)
        end

        defp dynamic_query(:inclusion, attr, values) do
          dynamic([q], field(q, ^attr) in ^values)
        end

        defp dynamic_query(_, attr, values) do
          dynamic([q], field(q, ^attr) not in ^values)
        end

        defp sanitize(keyword_list),
          do: for {key, val} <- keyword_list, allowed_key?(key), do: {key, val}

        defp allowed_key?(key), do: key in unquote(allowed_attributes)

        defp present?(list) when is_list(list), do: length(list) > 0
        defp present?(_), do: false
      end
    end
  end
```


## Usage {#usage}

It's a piece of cake to use our query in another modules. Just include
our query and set the list of allowed attributes through `use`
construction:

```text
  {:ok, _} = Application.ensure_all_started(:ex_machina)

  defmodule Example do
    @moduledoc """
    Example of using dynamic ecto queries
    """

    import Factory
    use FilterQuery, attributes: ~w(proficiency name)a

    def run do
      insert_users()

      IO.inspect(count([])) # 3
      [relationships_status: ["married"]] |> count([]) |> IO.inspect # 3
      [proficiency: ["developer"]] |> count([]) |> IO.inspect # 1
      [proficiency: ["soldier"]] |> count([]) |> IO.inspect # 0
      IO.inspect(count([], %{proficiency: ["politic"]})) # 2
    end

    defp insert_users do
      Repo.delete_all(User)

      insert(:user, relationships_status: "single", proficiency: "developer")
      insert(:user, relationships_status: "married", proficiency: "politic")
      insert(:user, relationships_status: "dating", proficiency: "thief")
    end

    defp count(inclusion, exclusion \\ []) do
      User
      |> filter(inclusion, exclusion)
      |> Repo.aggregate(:count, :id)
    end
  end
```


## Conclusion {#conclusion}

However, this is not at all that we can achieve by using `dynamic` macro
in Ecto.

You can filter by regex, type or even your own query; sort by ascending
and descending; do aggregation or pagination; whatever comes to your
head - it all depends on your imagination and skills. Ecto provides you
a great tool to build any complex queries by writing minimal lines of
code without any duplication.

What's next? See the [full
example](https://github.com/ne1ro/dynamic_ecto_query) for this article or read
[Ecto documentation](https://hexdocs.pm/ecto/Ecto.Query.html) to
deepen your knowledge a little bit more.

Happy hacking!
