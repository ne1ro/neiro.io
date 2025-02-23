+++
title = "Type checking ruby with contracts"
author = ["neiro"]
date = 2015-10-24T10:00:00+02:00
tags = ["ruby", "contracts", "functional", "typing"]
draft = false
+++

Ruby is dynamically and strong typed programming language. In the most
of the cases it gives you required level of type safety with minimal
code. But if you want build more secure applications or you're like
static typing, then you need to check every variable or method for it's
type or class:

```ruby

def foo(bar)
  fail 'I supposed it`s not a bar!'
  unless bar.is_a?(String) p 'Hi, bar!'
end

foo 'bar' # Hi, bar!
foo 100_500 # RuntimeError: I supposed it`s not a bar!
```

But what if you're needing more complex type checking on multiple types
or conditions? Then you need to provide more boilerplate, defensive
code. If you're want to make your type safety code much cleaner, there
is the [contracts](https://github.com/egonSchiele/contracts.ruby) library.


## Contracts {#contracts}

What is a contract? It's a pattern, that comes from functional
programming world. In most cases this is one line of code before
function or method, that validates the arguments and validates return
value.

For example, there is a simple contract:

```ruby
require 'contracts'

class Square
  include Contracts::Core
  include Contracts::Builtin

  Contract Num => Num
  def self.area(a) a**2 end
end

Square.area 10 # 100
Square.area 'a' # ParamContractError: Contract violation for argument 1 of 1
Square.area [] # ParamContractError: Contract violation for argument 1 of 1
```

You can also use it on multiple arguments or returns:

```ruby
class Rectangle
  include Contracts::Core
  include Contracts::Builtin

  Contract Num, Num => Num
  def self.area(a, b)
    a * b
  end
end

Rectangle.area 10, 10 # 100
Rectangle.area [], false # ParamContractError: Contract violation for argument 1 of 2
Rectangle.area 10, 'a' # ParamContractError: Contract violation for argument 2 of 2
```

If you don't want to throw exception, you can easily override error
callback:

```ruby
Contract.override_failure_callback do |data|
  puts 'IT`S AN OM~ ERROR!1'
  p data
end

Rectangle.area 10, 'a' # 'IT`S AN OM~ ERROR!1'
```


## Custom types {#custom-types}

_Contracts_ library comes with many built-in type contracts:

-   Basic types: `Num, Pos, Neg, Nat, Bool, Any, None`
-   Logical: `Maybe, Or, Xor, And, Not`
-   Collections: `ArrayOf, SetOf, HashOf, RangeOf, Enum`

and others. But if your want to create your own types or check more
complex conditions, then you have to use lambdas:

```ruby
class CharCounter
  include Contracts::Core
  include Contracts::Builtin

  Char = -> (char) { char.is_a?(String) && char.length == 1 && char =~ /\w/ }

  Contract Maybe[String], Char => Num

  def self.count_chars(str, ch)
    str.count ch
    end
end

CharCounter.count_chars 'hello', 'N' # 0
CharCounter.count_chars 'hello', 'l' # 2
CharCounter.count_chars 'hello', '*' # ParamContractError: Contract violation for argument 2 of 2
CharCounter.count_chars 'llo', 'llo' # ParamContractError: Contract violation for argument 2 of 2
```


## Pattern matching {#pattern-matching}

Pattern matching, like a contract, comes from functional programming.
You can use your contracts to test if your method matches pattern or
not. For example, let's find a factorial of number with contracts:

\#+begin_src ruby
class Factorial
  include Contracts::Core
  include Contracts::Builtin

Contract 0 =&gt; 1
def self.factorial(_n)
  1
end

  Contract Num =&gt; Num
  def self.factorial(n)
    n \* factorial(n - 1)
  end
end

Factorial.factorial 0 # 0
Factorial.factorial 10 # 3628800
Factorial.factorial 'a' # ContractError: Contract violation for argument 1 of 1 #+end_src


## Conclusion {#conclusion}

Ruby has simple and powerful type system, but if it's not enough or you
want to use safety type checking and you don't like to write tons of a
defensive code, then you may like _Contracts_ library. Contracts allows
you to check many types, conditions for your class methods much cleaner
and simpler. Also you can define your own types or conditions with plain
Ruby lambdas, and then use them for pattern-matching.

If you're like it and want to know more,
[there is Ruby contracts
tutorial](http://egonschiele.github.io/contracts.ruby/).
