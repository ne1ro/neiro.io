+++
title = "Immutable collections in Ruby with Hamster"
author = ["neiro"]
date = 2016-02-14T10:00:00+01:00
tags = ["ruby", "functional", "immutable"]
draft = false
+++

Ruby has much in common with functional programming languages. For
example, Ruby supports high-order functions, lambdas, currying and
recursion, but not the immutability - Ruby's types and data structures
are mutable and can be changed at any time.

Why immutability is important? The're many arguments for that:

-   reliability
-   thread-safety
-   simpler debugging
-   purity - immutable data allows you to write side-effects free code

If you want to make Ruby hash immutable, you can use freeze it:

```ruby
immutable = { foo: 'bar' } immutable.freeze

immutable[:foo] = 'tball'# RuntimeError: can't modify frozen Hash
```

But if you want to use already immutable collections, sets and other
data structures, you can try
[Hamster](https://github.com/hamstergem/hamster) library.


## Hamster {#hamster}

Hamster provides efficient, immutable and thread-safe collection classes
for Ruby, such as _Hash_, _Vector_, _Set_, _SortedSet_ and _List_.
Hamster collections offers Ruby\`s _Hash_, _Array_, _Enumberable_
compatibility where it possible. You can require all of Hamster
collection classes:

```ruby
gem i hamster
require 'hamster'
```

or only certain types:

```ruby
require 'hamster/hash'
require 'hamster/vector'
require 'hamster/set'
require 'hamster/sorted_set'
require 'hamster/list'
require 'hamster/deque'
```


## Hash {#hash}

```ruby
# Create new Hamster Hash
parrot = Hamster::Hash[type: 'bird', class: 'parrot', color: 'yellow']

parrot.get(:color) # yellow
parrot[:type] # bird

# You can not change hash because of immutability
parrot[:subclass] = 'budgie' # NoMethodError: undefined method `[]='
# But you can create a new

budgie = parrot.put :subclass, 'budgie'
budgie == parrot # false
budgie[:subclass] # budgie
parrot[:subclass] # nil

budgie.to_hash.class # Plain Ruby Hash
```


## List {#list}

```ruby
list = Hamster::List[0, 1, 2] list.tail # Hamster::List[1, 2]
list.head # 0
```


## Set {#set}

```ruby
# Hamster's set is an unordered collection with no duplicates
colors = Hamster::Set[:green, :white]
colors.include?(:green) # true

palette = colors.add :yellow # Hamster::Set[:green, :yellow, :white]
colors.include?(:yellow) # false palette.superset?(colors) # true
palette.intersection(colors) # Hamster::Set[:green, :white]
palette.difference(colors).first # :yellow

palette.to_a # Plain Ruby array: [:green, :white, :yellow]
```


## Vector {#vector}

```ruby
 # Vector is an integer-indexed immutable array
vector = Hamster::Vector[0, 1, 2]
vector[2] # 2
vector[-1] # 2
vector[-4] # nil
vector[1,2] # Hamster::Vector[1, 2]
vector[0..2] # Hamster::Vector[0, 1, 2]

binary_vector = vector.delete_at 0 # Hamster::Vector[1, 2]
vector.size # 3
binary_vector.size # 2
vector == binary_vector # false

(binary_vector + vector).sort.uniq # Hamster::Vector[0, 1, 2]
(binary_vector + vector).sort.uniq == vector # true
```


## Conclusion {#conclusion}

If you want to use immutable data structures in Ruby to write more
reliable, efficient and at the same time thread-safe code, you can take
a look at Hamster. You can find more in Hamster's
[API
documentation](http://www.rubydoc.info/github/hamstergem/hamster/master).
