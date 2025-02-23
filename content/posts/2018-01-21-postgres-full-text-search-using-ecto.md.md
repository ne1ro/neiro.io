+++
title = "Postgres full-text search using Ecto"
author = ["neiro"]
date = 2018-01-21T10:00:00+01:00
tags = ["elixir", "query", "postgres", "search"]
draft = false
+++

PostgreSQL is one of the most popular, stable and common relational
database. It's widely used in Elixir infrastructure and has a great
integration with Ecto library.

If you're into web development you can often face the search problem.
You have a large stable database, you have tons of useful information,
great tools, but your users desire to find something by arbitrary
questions. You can't use your favourite plain SELECT ... WHERE ...
queries because you need to search for the words, not columns or
records.

This if what the full text search stands for.

Fortunately, PostgreSQL has a built-in support of the full-text search.
It allows you to parse your data into tokens, convert these tokens to
lexemes - normalised forms of words - and, finally, search and make
search optimisations.


## Ecto migration to use the search {#ecto-migration-to-use-the-search}

Let's start by creating a migration. Create a new Elixir project and a
new migration in priv/repo/migrations:

```text
  defmodule App.Repo.Migrations.IntroducePgSearch do
    @moduledoc """
    Create postgres extension and indices
    """

    use Ecto.Migration

    def up do
      execute("CREATE EXTENSION pg_trgm")
    end

    def down do
      execute("DROP EXTENSION pg_trgm")
    end
  end
```

As you can see, we will use PostgreSQL extension called pg_trgm. Run
ecto.migrate to execute this migration. Now you can use trigram indices
and trigram matching for your full-text search.


## Create a search module {#create-a-search-module}

Our next step will be creating a search module. Let's suppose that you
already have a User schema with a username, first name and last name
defined. In that case we can implement a simple search query that can be
used in your contexts or controllers:

```text
  defmodule App.Users.Search do
    @moduledoc """
    Implementation of the full-text user search
    """

    import Ecto.Query

    @spec run(Ecto.Query.t(), any()) :: Ecto.Query.t()
    def run(query, search_term) do
    end
  end
```

As you can see here, we're defining the run function that will accept
another Ecto.Query with the search term and will return Ecto.Query
though.

We need to escape all of non-words characters from user's input:

```text
  String.replace(term, ~r/\W/u, "")
```

Also we need to allow to search by prefix - beginning of the word. Let's
add :\* to our search term\*:

```text
  defp prefix_search(term), do: String.replace(term, ~r/\W/u, "") <> ":*"
```

Now we need to implement the search by using Ecto's fragment macro and
to_tsquery PostgreSQL function:

```text
  def run(query, search_term) do
      where(
        query,
        fragment(
          "to_tsvector('english', username || ' ' || first_name || ' ' || coalesce(last_name, ' ')) @@
          to_tsquery(?)",
          ^prefix_search(search_term)
        )
      )
    end
```

Let's take a look at the implementation. At first, we need to compose a
search token by joining columns:

```text
  to_tsvector('english', username || ' ' || first_name || ' ' || coalesce(last_name, ' ')) @@ to_tsquery(?)
```

Created tsvector will be tested by operator @@ with tsquery and will
return the result if the matching was sucessful.

But this result won't be as fast as we wanted. Let's suppose that we
have _11K_ users:

```text
  User |> App.Users.Search.run("meta") |> Repo.explain

  ###
  Filter: (to_tsvector('english'::regconfig,
  (((((username)::text || ' '::text) || (first_name)::text) || ' '::text)
  || (COALESCE(last_name, ' '::character varying))::text)
  @@ to_tsquery('meta:*'::text))

  Rows Removed by Filter: 11285
  Planning time: 1.640 ms
  Execution time: 62.235 ms
  ###
```


## Create an index {#create-an-index}

Auspiciously, we have opportunity to use the PostgreSQL trigram index in
order to improve performance of full-text queries. Let's modify our
transaction:

```text
  defmodule App.Repo.Migrations.IntroducePgSearch do
    @moduledoc """
    Create postgres extension and indices
    """

    use Ecto.Migration

    def up do
      execute("CREATE EXTENSION pg_trgm")

      execute("""
      CREATE INDEX users_trgm_idx ON users USING GIN (to_tsvector('english',
        username || ' ' || first_name || ' ' || coalesce(last_name, ' ')))
      """)
    end

    def down do
      execute("DROP INDEX users_trgm_idx")
      execute("DROP EXTENSION pg_trgm")
    end
  end
```

Now run mix do ecto.rollback, eco.migrate and try to run the search:

```text
  User |> App.Users.Search.run("meta") |> Repo.explain

  ###
  Recheck Cond: (to_tsvector('english'::regconfig, (((((username)::text || ' '::text) || (first_name)::text) || ' '::text) || (COALESCE(last_name, ' '::character varying))::text)) @@ to_tsquery('meta:*'::text))
    Heap Blocks: exact=57
    ->  Bitmap Index Scan on users_trgm_idx  (cost=0.00..20.74 rows=65 width=0) (actual time=0.093..0.093 rows=65 loops=1)
          Index Cond: (to_tsvector('english'::regconfig, (((((username)::text || ' '::text) || (first_name)::text) || ' '::text) || (COALESCE(last_name, ' '::character varying))::text)) @@ to_tsquery('meta:*'::text))

  Planning time: 1.348 ms
  Execution time: 0.457 ms
  ###
```

Voila! Now that's the speed we wanted. Our users will be so happy with
this search!


## Conclusion {#conclusion}

What's next? You can try using the functionality of pg_trgm module,
search for similar words or making the search not just prefix-only. See
the docs for
[PostgreSQL
full-text search](https://www.postgresql.org/docs/10/static/textsearch.html) and
[trigram](https://www.postgresql.org/docs/10/static/pgtrgm.html) .

Happy hacking!
