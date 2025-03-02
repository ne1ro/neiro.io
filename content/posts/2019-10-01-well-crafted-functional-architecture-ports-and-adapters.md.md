+++
title = "Well-crafted functional architecture: ports and adapters"
author = ["neiro"]
date = 2019-10-01T10:00:00+02:00
tags = ["elixir", "functional", "architecture", "ports", "adapters"]
draft = false
+++

At [Salam.io](https://salam.io) we are developing a modern social
platform containing a humongous amount of features.

Development of such product is quite hard and challenging - we need our
software to be robust, scalable, fault-tolerant, performant and at the
same time we want it to be easy to extend, test, maintain and support.

All these issues are inevitable upon growth of the app but they for sure
can be simplified or even avoided by choosing, optimising the software
architecture.

We also use functional programming languages -
[Clojure](https://clojure.org) &amp; [Elixir](https://elixir-lang.org) -
for the backend and frontend as much as possible. Therefore, we need to
adjust the existing architecture approaches to powerful abilities and
intricacies of modern functional programming.

That's why we're starting these series of articles - we think it's
crucial for everyone who's crafting the functional systems to understand
and apply software architectures rules and principles.


## Why ports &amp; adapters ? {#why-ports-adapters}

Even if you're developing a relatively small scale software you still
need to design it first - and to design it properly. The earlier you
start caring about your architecture the earlier you can benefit from it
and the later a lot of issues caused by bad architecture would appear.

The main idea of ports &amp; adapters architecture is that application that
you're building is a _closed area_. This means that all your business
logic should be separated from technical details in this area. Often
architecture is about the boundaries so are the ports &amp; adapters.

In case you stick with ports &amp; adapters from the very beginning then
this approach should help you to keep your business logic separated and
easily tested s well as technology agnostic - you can write a port &amp; an
adapter for any software/third-party service/library that you're using
so it can be easily extended or switched in favour of another one.


## Hexagonal {#hexagonal}

Ports &amp; adapters architecture also has another name: _Hexagonal
architecture_. According to this terminology the inner part of your
software - the place where you put your business logic - is hexagon
while your adapters are placed surround it.

The hexagon should not contain any references to another frameworks,
real world services, libraries, etc. - all these elements should be
adapters. At the same time the architecture doesn't prescribe you to
design your hexagon in some certain way - you can use Layer
architecture, Onion, DDD or any another suitable architecture inside or
it may be a pure business logic without any sophistications - it's up to
you.

Why hexagon? Well, any geometric figure with boundaries could work, but
the hexagon represents better the concept that you have ports at the
edges of your application and adapters behind it. Likewise, it's a
symmetric figure and we'll describe below why it's important.


## Ports {#ports}

Every time you need to interact with something from beyond of your
application logic you need to group these actions and describe them in a
_port_. The port is the edge of hexagon and it should be an integral and
essential part of your application.

Naming of the ports is quite important - you shouldn't use any
technology name in your port but focus on its mission instead. Some of
examples:

-   PushNotifications
-   Search
-   Persistence
-   Authentication

The majority of programming languages usually contain interfaces /
protocols feature allowing you to build a port. In Clojure, for example,
you can use _multimethods_ or _protocols_ to achieve this goal. But for
now let's see how we can implement the realisation of port for Elixir
using its' capability to create **behaviours**:

```text
  defmodule Core.PushNotifications do
    @moduledoc """
    Port for sending push notifications.
    """

    @type message :: %{title: String.t(), body: String.t()}
    @type payload :: Keyword.t
    @type recipients :: [map]

    @adapter :core |> Application.fetch_env!(__MODULE__) |> Keyword.fetch!(:adapter)

    @callback send_notifications(message, recipients, payload) :: {:ok, [map]} | {:error, any}

    defdelegate send_notifications(message, recipients, payload), to: @adapter
  end
```

The example above is nothing more than an abstraction for using push
notifications from `Core`. We declare the behaviour and one callback
that specifies what we send and what we can expect as the result. The
exact implementation - adapter - should be placed in your app
configuration like:

```text
  config :core, Core.PushNotifications, adapter: PushNotifications.APNS
```

If you want to call this port from your application you just need to use
the delegated function:

```text
  defmodule Core do
    alias Core.PushNotifications

    def register_user(params) do
      # business logic ...
       result = PushNotifications.send_notifications(message, recipients, payload)
      # handle the result somehow
    end
  end
```

As you can see, from the `Core` we know nothing about the implementation
details - we just send notifications to users and that's it. In ideal
case we need to move **any impure function, any side-effect** to the edge
of the system - to adapters and call them **only by using ports** .


## Driver Adapters {#driver-adapters}

Adapters are components which are placed outside of your application -
and your hexagon. They should represent the technology, service, library
that you need to interact through the port.

We specify two types of adapters: _Driver_ and _Driven_.

The first ones are something from the left side of the picture above. It
could be a HTML page, API endpoint, CLI application, GUI or anything
that _drives_ your application. That also means that the driver adapter
should use a driver port interface so your app receives technology
agnostic request on its borders.

Let's assume that we also have a web application that uses our _Core_.
If we want to register user then we need to call a
`Core.register_user/1` function from inside of our controller. In that
case `UserController` is our driver adapter and `Core` is the called
application. Fortunately, in Elixir we have type specs that can play a
role of specification of driver port so you'll always be able to see
what we need to send and what we should expect in response.

```text
  defmodule Web.UserController do
    use Web, :controller

    def create(conn, params) do
      result = Core.register_user(params) # will create user and send notifications
     # handle the result somehow
    end
  end
```

In the approach above you can see that we use `Core.register_user/1`
function as the driver port - because it's spec describes the
interface - and `Web.UserController.index/2` as the driver adapter.


## Driven Adapters {#driven-adapters}

A _Driven_ adapter implements an interface given by driven port. That
means that now driven adapter depends on our application, but not visa
versa. The same as driver, this adapter should also be placed outside of
our hexagon and represents a technology/library/real-world device.

Common examples are:

-   Persistence adapters - SQL, NoSQL databases or even in-memory / file
    storage
-   Cache adapters - Redis / Memcached / ETS or in-memory storage
-   Email adapters - SMTP or third-party services
-   Message queue adapters
-   Third-party APIs

Let's continue the push notifications solution we've started before.
Now, in order to implement the driver adapter, we need to use the port
`Core.PushNotifications` and it's callback `send_notifications`. We will
adapt realisation of sending push notifications over APNS by the
specification that was given us by this port:

```text
  defmodule PushNotifications.APNS do
    @moduledoc "APNS adapter for push notifications"
    @behaviour Core.PushNotifications

    @impl true
    def send_notifications(message, recipients, payload) do
      {:ok, recipients
      |> Enum.map(fn r -> build_notification(message, r, payload) end)
      |> Pigeon.APNS.Notification.push()}
    end

     defp build_notification(message, recipient, payload) do
       Pigeon.APNS.Notification.new(message, recipient.device_token, payload)
     end
  end
```

Now our push notifications are almost completed. We can always change
the implementation - for example, from APNS to Firebase - or use
third-party library **\* without changing our core application\*** - so we
can say that's technology agnostic approach.


## Testing {#testing}

Of course the main benefit of ports and adapters architecture is
improved testability. Instead of manually mocking calls to the
real-world providers we just need to create a test adapter that we
satisfy testing conditions. In the perfect case every _driven adapter_
should have a test analogue as well as all behaviours of `driver ports`
should be tested. Let's write a test adapter for the PushNotifications
port then:

```text
  defmodule PushNotifications.TestAdapter do
    @moduledoc "Test adapter for push notifications"
    @behaviour Core.PushNotifications

    @impl true
    def send_notifications(message, recipients, payload) do
       {:ok, [%{message: message, payload: payload, recipients: recipients}]}
    end
  end
```

As you can see we are not sending data to the outer world but use a pure
function instead. In case of any incoming input we will know its' output
for sure. Now, when we unit-test the `Core` module we just need to
select test adapter as the implementation of `PushNotifications`
interface. In Elixir ecosystem we have a great library called `Mox` that
can be used for such case:

```text
  Mox.defmock(PushNotifications.TestMock, for: Core.PushNotifications)

  defmodule CoreTest do
    use Core.DataCase, async: true
    import Mox

   # Make sure mocks are verified when the test exits
    setup :verify_on_exit!

    test "register/1" do
       stub_with(PushNotifications.TestMock, PushNotifications.TestAdapter)
       assert {:ok, _} = Core.register_user(some_params)
    end
  end
```

In this example you can see that we're not sending push notifications in
the real world but using the local test mock instead. We are free to
change the test adapter for any testing purposes if we want to.

From now you get your _driver_ port's behaviour tested. As the next step
you can test exactly the adapter implementation without any outside
logic attached - you just need to check that your implementation is
working fine as it was predicted. As for the integration testing you're
free to choose between the real-world adapters or you may use some test
adapters for this purpose - it's up to you.


## Pros vs Cons {#pros-vs-cons}

Now we've covered the basics of ports and adapters architecture. Let's
summarise what we have:


### Pros {#pros}

-   Testability
-   Replaceability
-   Technology-agnostic approach - you can delay technological solutions
-   Isolating pure code from impure code
-   Isolating side-effects
-   Maintainability


### Cons {#cons}

-   Sometimes it may be an overhead, especially for a small scale software
-   You may not need it if you are pretty sure that the technology stack
    of your project will remain the same over the years


## Conclusion {#conclusion}

We applied ports &amp; adapters architecture at
[Salam.io](https://salam.io) when it became clear that our software
will be using a lot of services which could be replaced in the future.
This approach has already given a lot of benefits and allowed us to make
our software even more testable and flexible.

If you want to know more about this architecture you can take a look at
the
[original
article by Alistair Cockburn](https://web.archive.org/web/20180822100852/http://alistair.cockburn.us/Hexagonal+architecture) .

In the next article of this series we will show how you can apply ports
&amp; adapters architecture in Clojure by using its language tools and
component libraries.

Stay tuned!
