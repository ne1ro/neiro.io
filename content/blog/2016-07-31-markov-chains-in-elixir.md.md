+++
title = "Markov chains in Elixir"
author = ["neiro"]
date = 2016-07-31T10:00:00+02:00
tags = ["elixir", "functional"]
draft = false
+++

## Markov chains {#markov-chains}

Markov chain or Markov model is a process that undergoes transitions
from one state to another. The next state depends only on current state
and not the sequence of previous events. This allows us to use Markov
chains as statistical models for real-world processes.

{{< figure src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Markov_Chain_weather_model_matrix_as_a_graph.png" caption="<span class=\"figure-number\">Figure 1: </span>Simple Markov chain" >}}

For the next example we will try to build simple sentence generator
within Markov chain.


## Realization {#realization}

Let's create an entry point of new application:

```text
    # lib/elixir markov chain.ex
    defmodule ElixirMarkovChain do
      alias ElixirMarkovChain.Model
      alias ElixirMarkovChain.Generator

      def start(_type, _args) do
        case File.read(Application.get_env :elixir_markov_chain, :source_file) do
           {:ok, body} -> process_source body
           {:error, reason} -> IO.puts reason
        end

        System.halt 0
      end

      defp process_source do
      end
    end
```

At first, to process the source file for output sentences, we need to
tokenize it:

```text
    # lib/elixir_markov_chain/tokenizer.ex
    defmodule ElixirMarkovChain.Tokenizer do
      def tokenize(text) do
        text
          |> String.downcase
          |> String.split(~r{\n}, trim: true) # split text to sentences
          |> Enum.map(&String.split/1) # split sentences to words
      end
    end
```

Next we need to realize Markov model. We'll use agents to share state in
application:

```text
    # lib/elixir_markov_chain/model.ex
    defmodule ElixirMarkovChain.Model do
      import ElixirMarkovChain.Tokenizer

      def start_link, do: Agent.start_link(fn -> %{} end) # create map for sharing through agent

      def populate(pid, text) do
        for tokens <- tokenize(text), do: modelize(pid, tokens) # populate model with tokens
        pid
      end

      def fetch_token(state, pid) do
        tokens = fetch_tokens state, pid

        if length(tokens) > 0 do
          token = Enum.random tokens
          count = tokens |> Enum.count(&(token == &1))
          {token, count / length(tokens)} # count probability of the token
        else
          {"", 0.0}
        end
      end

      def fetch_state(tokens), do: fetch_state(tokens, length(tokens))
      defp fetch_state(_tokens, id) when id == 0, do: {nil, nil}
      defp fetch_state([head | _tail], id) when id == 1, do: {nil, head}
      defp fetch_state(tokens, id) do
        tokens
          |> Enum.slice(id - 2..id - 1) # fetch states by ids
          |> List.to_tuple
      end

      # Get tokens within agent
      defp fetch_tokens(state, pid), do: Agent.get pid, &(&1[state] || [])

      # Build Markov chain model using tokens
      defp modelize(pid, tokens) do
        for {token, id} <- Enum.with_index(tokens) do
          tokens |> fetch_state(id) |> add_state(pid, token)
        end
      end

      # Add new state within agent
      defp add_state(state, pid, token) do
        Agent.update pid, fn(model) ->
          current_state = model[state] || []
          Map.put model, state, [token | current_state]
        end
      end
    end
```

When our Markov model is done, we can use it in application. For this
example, we'll build a random sentence generator based on text source:

```text
    # lib/elixir_markov_chain/generator.ex
    defmodule ElixirMarkovChain.Generator do
      alias ElixirMarkovChain.Model

      def create_sentence(pid) do
        {sentence, prob} = build_sentence pid

        # Create new sentence or convert builded based on treshold value
        if prob >= Application.get_env(:elixir_markov_chain, :treshold) do
          sentence |> Enum.join(" ") |> String.capitalize
        else
          create_sentence pid
        end
      end

      # Sentence is complete when it have enough length
      # or when punctuation ends a sentence
      defp complete?(tokens) do
        length(tokens) > 15 ||
        (length(tokens) > 3 && Regex.match?(~r/[\!\?\.]\z/, List.last tokens))
      end

      defp build_sentence(pid), do: build_sentence(pid, [], 0.0, 0.0)
      defp build_sentence(pid, tokens, prob_acc, new_tokens) do
        # Fetch Markov model state through agent
        {token, prob} = tokens |> Model.fetch_state |> Model.fetch_token(pid)

        case complete?(tokens) do
          true ->
            score = case new_tokens == 0 do
              true -> 1.0
              _ -> prob_acc / new_tokens # count new probability for this word
            end
            {tokens, score}
          _ ->
            # Concat sentence with new token and try to continue
            build_sentence pid, tokens ++ [token], prob + prob_acc, new_tokens + 1
        end
      end
    end
```

Now, when basic logic is implemented, we need to fill `process_source`
function:

```text
    # lib/elixir_markov_chain.ex
    defp process_source(text) do
      {:ok, model} = Model.start_link
      model = Model.populate model, text # populate Markov model with the source

      # Generate 10 random sentences based on text source
      Enum.each(1..10, fn(_) -> model |> Generator.create_sentence |> IO.puts end)
    end
```


## Result {#result}

Processed from _Thus Spoke Zarathustra_ by _Friedrich Nietzsche_:

-   By thee pursued, my fancy!
-   Nether-world, thou exuberant star!
-   Well then! we part here!
-   Snare for me--the desire for love--that i should like to strangle me,
    thou fountain of delight!
-   As yet without meaning: a buffoon at heart.
-   Loved by overflowing hearts.
-   Growling bear, and sweeten thy soul!
-   Fountains shall rush down into his height!

Processed from _Metamorphosis_ by _Franz Kafka_:

-   "it's got to get up.
-   Where we have to open the door, holding himself upright as preparation
    for getting through the
-   Incidental damages even if he did not know that he wouldn't have to
    suffer the view
-   The gentlemen bent over the dishes set in front of them were blown
    onto the cool,
-   Gregor then turned to look after my parents suffer!
-   "we have to overcome it because of that.
-   Does not agree to be patient.
-   "leave my home. now!", said mr.


## Conclusion {#conclusion}

Elixir allows to easily build Markov chains and applicate them to real
world processes. In our case we have built the random text generator,
but you can find Markov models useful for another cases. To view entire
application please visit
[this repository](https://github.com/ne1ro/elixir-markov-chain).
