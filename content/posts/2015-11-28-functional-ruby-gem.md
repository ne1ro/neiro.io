+++
title = "Functional Ruby gem"
author = ["neiro"]
date = 2015-11-28T10:00:00+01:00
tags = ["ruby", "functional"]
draft = false
+++

Ruby is a great example of multi-paradigm programming language: it
allows you to write code in object-oriented, imperative or functional
styles. Ruby have much in common with functional programming languages:
_high-order functions, closures, anonymous functions, continuations,
statements all values_. If you want to use more functional programming
patterns and tools, you might want to take a look on
[Functional Ruby](https://github.com/jdantonio/functional-ruby) gem.


## Features {#features}

-   Thread-safe, immutable data structures
-   Protocol specifications
-   Functions overloading
-   `Either, Option` classes
-   Immutable variation of Ruby's `OpenStruct` class
-   Memoization
-   Lazy execution
-   Tuples
-   Pattern matching


## Installing {#installing}

Install this gem with or without bundler:

```shell
gem install functional-ruby
#  gem 'functional-ruby'
```

And then require it in your project:

\#+begin_src ruby require 'functional' #+end_src


## Immutable data structures {#immutable-data-structures}

\#+begin_src ruby
Address = Functional::Record.new(:city, :country, :street, :house) do
    mandatory :country, :city
    default :city, 'Moscow'
    default :country, 'Russia'
end # &lt;record Address :city=&gt;"Moscow", :country=&gt;"Russia", :street=&gt;nil, :house=&gt;nil&gt; #+end_src


## Immutable OpenStruct {#immutable-openstruct}

Immutable, thread-safe, write-once and read-only object variation of
`OpenStruct`:

\#+begin_src ruby
name = Functional::ValueStruct.new firstname: 'Hodor', lastname: 'Hodor'
name.get :firstname # Hodor
name.lastname # Hodor
name.firstname? # true #+end_src


## Tuples {#tuples}

Tuple is a data structure that is similar to array, but is immutable and
has a fixed length.

\#+begin_src ruby
tuple = Functional::Tuple.new %w(one two three)
tuple.at 0 # one
tuple.last 0 # three
tuple.fetch 4, 'four' # four
tuple.tail.to_a # ['two', 'three']
tuple.repeat(2).to_a.join ',' # one, two, three, one, two, three #+end_src


## Protocols {#protocols}

Protocols are specifications to provide polymorphism and method-dispatch
mechanism with strong typing, inspired by [Clojure protocols](http://clojure.org/protocols):

\#+begin_src ruby
Functional::SpecifyProtocol(:Address) do
    attr_accessor :city
    attr_accessor :country
    attr_accessor :street
    attr_accessor :house
end #+end_src


## Pattern matching {#pattern-matching}

\#+begin_src ruby

class AddressChecker
  include Functional::PatternMatching
  include Functional::Protocol
  include Functional::TypeCheck

def msg 'You live in Moscow, Russia' end

defn(:msg, \_) do |addr|
  "You live in #{addr}"
end

defn(:msg, \_) { |addr| "You live in #{addr.house}, #{addr.street},
  #{addr.city}, #{addr.country}" }
  .when { |addr| Satisfy?(addr, :Address) }

defn(:msg, :name, \_) do |addr|
  "Somebody live in #{addr}"
end

  defn(:msg, \_) { |zip| "Your zip is #{zip}" }.when { |addr| Type?(addr, Fixnum) }
end #+end_src


## Conclusion {#conclusion}

If you like functional programming, and want to use it's patterns and
tools with Ruby, then you can use
[Functional Ruby](https://github.com/jdantonio/functional-ruby) gem to
write code in more functional style. You can find more information in
[API documentation](http://jerrydantonio.com/functional-ruby/).
