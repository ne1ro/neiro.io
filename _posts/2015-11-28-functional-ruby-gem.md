---
    layout: post
    title: Functional Ruby gem
    tags: [programming,ruby,functional,pattern matching]
---

Ruby is a great example of multi-paradigm programming language: it allows you to write  code in object-oriented, imperative or functional styles. Ruby have much in common with functional programming languages: *high-order functions, closures, anonymous functions, continuations, statements all values*.  If you want to use more functional programming patterns and tools, you might want to take a look on [Functional Ruby](https://github.com/jdantonio/functional-ruby) gem.

## Features
* Thread-safe, immutable data structures
* Protocol specifications
* Functions overloading
* `Either, Option` classes
* Immutable variation of Ruby's `OpenStruct` class
* Memoization
* Lazy execution
* Tuples
* Pattern matching

## Installing
Install this gem with or without bundler:  

{% highlight shell %}
gem install functional-ruby
gem 'functional-ruby'
{% endhighlight %}

And then require it in your project:  

{% highlight ruby %}
require 'functional'
{% endhighlight %}

## Immutable data structures

{% highlight ruby %}
Address = Functional::Record.new(:city, :country, :street, :house) do
  mandatory :country, :city
  default :city, 'Moscow'
  default :country, 'Russia'
end # <record Address :city=>"Moscow", :country=>"Russia", :street=>nil, :house=>nil>
{% endhighlight %}

## Immutable OpenStruct
Immutable, thread-safe, write-once and read-only object variation of `OpenStruct`:

{% highlight ruby %}
name = Functional::ValueStruct.new firstname: 'Hodor', lastname: 'Hodor'
name.get :firstname # Hodor
name.lastname # Hodor
name.firstname? # true
{% endhighlight %}

## Tuples
Tuple is a data structure that is similar to array, but is immutable and has a fixed length.

{% highlight ruby %}
tuple = Functional::Tuple.new %w(one two three)
tuple.at 0 # one
tuple.last 0 # three
tuple.fetch 4, 'four' # four
tuple.tail.to_a # ['two', 'three']
tuple.repeat(2).to_a.join ', ' # one, two, three, one, two, three
{% endhighlight %}

## Protocols
Protocols are specifications to provide polymorphism and method-dispatch mechanism with strong typing, inspired by [Clojure protocols](http://clojure.org/protocols):

{% highlight ruby %}
Functional::SpecifyProtocol(:Address) do
  attr_accessor :city
  attr_accessor :country
  attr_accessor :street
  attr_accessor :house
end
{% endhighlight %}

## Pattern matching

{% highlight ruby %}
# Pattern matching with type and protocol checking
class AddressChecker
  include Functional::PatternMatching
  include Functional::Protocol
  include Functional::TypeCheck

  def msg
    'You are live in Moscow, Russia'
  end

  defn(:msg, _) do |addr|
    "You are live in #{addr}"
  end

  defn(:msg, _) { |addr|
    "You are live in #{addr.house}, #{addr.street}, #{addr.city}, #{addr.country}"
  }.when { |addr| Satisfy?(addr, :Address) }

  defn(:msg, :name, _) do |addr|
    "Somebody live in #{addr}"
  end

  defn(:msg, _) { |zip|
    "Your zip is #{zip}"
  }.when { |addr| Type?(addr, Fixnum) }
end
{% endhighlight %}


## Conclusion
If you like functional programming, and want to use it's patterns and tools with Ruby, then you can use [Functional Ruby](https://github.com/jdantonio/functional-ruby) gem to write code in more functional style.
You can find more information in [API documentation](http://jerrydantonio.com/functional-ruby/).
