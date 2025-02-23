+++
title = "Asynchronous testing in Elixir with Mox"
author = ["neiro"]
date = 2018-07-29T10:00:00+02:00
tags = ["elixir", "testing"]
draft = false
+++

Testing in Elixir is pretty neat. You can easily test anything written,
you have instruments like ExUnit or ESpec, you can
[practice TDD](https://github.com/lpil/mix-test.watch) and more and
more. Functional programming paradigm helps you a lot to make your
testing even simpler by forcing you to use pure, small functions that
will be pleasant to test. Concurrency of Elixir allows you to run all
your tests asynchronously and blazingly fast.

However, there can be some pitfalls.


## Mocks problem {#mocks-problem}

If you're programming a big project then I suppose that you will be
using third-party services anyway. Imagine that you are sending SMS
through you favorite provider services. This code can look like that:

```text
  SmsProvider.send_sms(from, to, "message")
```

In this case you are using some external provider API in order to send
SMS. The HTTP request will go from your application to the destination
and it will trigger SMS delivery.

Now we need to test this situation. This will be our very first
approach:

```text
  assert {:ok, %Message{}} = SmsProvider.send_sms(from, to, "message")
```

As you can see it will behave as if it was on production. Your SMS with
the nasty fake test message will be delivered to non-existent users with
absent phone numbers. Sad!

The most popular solution is mocking. You're supposing that call of
`send_sms` function with the expected arguments which will return the
expected result:

```text
  mock(SmsProvider, :send_sms, fn _, _, _ -> {:ok, %Message{status: :sent}} end)
  assert {:ok, %Message{status: :sent}} = SmsProvider.send_sms(from, to, "message")
```

This approach will work, at least for this test. The problem is simple
enough - it's not the best solution for asynchronous tests. We have
mocked SmsProvider so it will be overriden in every next asynchronous
test:

```text
  use MyApp.DataCase, async: true

  # ...

  assert {:error, :wrong_phone_number} = SmsProvider.send_sms(wrong_number, to, "message")
```

This test will fail because `send_sms` call was already mocked in
another test earlier. The entire mocking approach is not suitable for
concurrent testing, so we need to find another one to serve this
purpose.


## Asynchronous testing {#asynchronous-testing}

Instead of mocking we can try calling the function that will override
`sms_send/3`. Let's create a `TestProvider` module with the next
content:

```text
  defmodule TestProvider do
    def send_sms(from, to, message) do
      {:ok, %Message{status: :sent, from: from, to: to, text: message}}
    end
  end
```

Now we can try to use this module as an adapter in our `SmsProvider`
module. It will use default adapter in development, production
environments and will use `TestProvider` in testing:

```text
  # config/test.exs
  config :my_app, SmsProvider, adapter: TestProvider

  # config/config.exs
  config :my_app, SmsProvider, adapter: SmsApiService

  # sms_provider.ex
  defmodule SmsProvider do
    @adapter Application.fetch_env(:my_app, :sms_provider, :adapter)

    defdelegate send_sms(from, to, message), to: @adapter
  end
```

Let's go straight to the test:

```text
  assert {:ok, %Message{}} = SmsProvider.send_sms(from, to, "message") # true
```

Now it should work even in concurrent tests. Your SMS will not be
delivered neither to the real nor fake users, your money will be saved
and your tests will not suffer more.


## Using Mox {#using-mox}

However, there is still a room for improvement.

[Mox](https://github.com/plataformatec/mox) is a relatively new
library that solves the issue of concurrent testing and mocks. It
follows the next principles:

-   You can only create mocks based on behaviours
-   No dynamic generation of mocked modules, every mock should be defined
    in tests
-   Full concurrency support
-   Use of pattern matching and function clauses for asserting

Now let's add it to our dependencies list:

```text
  # mix.exs
  def deps do
    [
      {:mox, "~> 0.4", only: :test}
    ]
  end
```

It's easy as a pie to rewrite our tests with Mox. We need to create an
SMS provider behaviour and implement it for different environments:

```text
  # sms_provider.ex
  defmodule SmsProvider do
    @callback send_sms(String.t, String.t, String.t) :: {:ok, %Message{}} | {:error, :wrong_number}
  end

  # test_helper.exs
  Mox.defmock(SmsProviderMock, for: SmsProvider)

  # test.exs

  defmodule Test do
    use ExUnit.Case, async: true

    import Mox

    # Make sure mocks are verified when the test exits
    setup :verify_on_exit!

    test "returns message on success" do
      expect SmsProviderMock, :send_sms, fn _, _, _ -> {:ok, %Message{status: :sent}}
      assert {:ok, %{status: :sent}} = SmsProvider.send_sms(from, to, message)
    end
  end
```

If you don't need to check expectations in test you can try
`stub_with/2` function in order to stub entire module:

```text
  # sms_provider.ex
  defmodule SmsProvider do
    @callback send_sms(String.t, String.t, String.t) :: {:ok, %Message{}} | {:error, :wrong_number}
    @callback sent_sms(String.t) :: [%Message{}]
  end

  # test_provider.ex
  defmodule TestProvider do
    @behaviour SmsProvider
    def send_sms(_from, _to, message), do: {:ok, %Message{status: :sent, message: message}}
    def sent_sms(number) :: [%Message{}]
  end

  # test.exs
  defmock(SmsProviderMock, for: SmsProvider)
  stub_with(SmsProviderMock, TestProvider)
```

Viola! Now your tests are all green, fast and shiny thanks to concurrent
testing and Mox :)


## Conclusion {#conclusion}

If you're definitely interested in concurrent testing, you might want to
read
[excellent
article from Jose Valim](http://blog.plataformatec.com.br/2015/10/mocks-and-explicit-contracts/) and dive in into
[Mox documentation](https://hexdocs.pm/mox/Mox.html).

Happy hacking, everyone!
