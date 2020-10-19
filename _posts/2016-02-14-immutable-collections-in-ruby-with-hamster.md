---
    layout: post
    title: Immutable collections in Ruby with Hamster
    tags: [programming,ruby,functional,library,immutability,typing]
---

Ruby has much in common with functional programming languages. For example, Ruby supports
high-order functions, lambdas, currying and recursion, but not the immutability -
Ruby's types and data structures are mutable and can be changed at any time.

Why immutability is important? The're many arguments for that:

  * reliability
  * thread-safety
  * simpler debugging
  * purity - immutable data allows you to write side-effects free code

If you want to make Ruby hash immutable, you can use freeze it:

{% highlight ruby %}
immutable = { foo: 'bar' }
immutable.freeze

immutable[:foo] = 'tball '# RuntimeError: can't modify frozen Hash
{% endhighlight %}

But if you want to use already immutable collections, sets and other data structures,
you can try [Hamster](https://github.com/hamstergem/hamster) library.

## Hamster

Hamster provides efficient, immutable and thread-safe collection classes for Ruby,
such as *Hash*, *Vector*, *Set*, *SortedSet* and *List*.
Hamster collections offers Ruby`s *Hash*, *Array*, *Enumberable* compatibility
where it possible.
You can require all of Hamster collection classes:

{% highlight ruby %}
gem i hamster
require 'hamster'
{% endhighlight %}

or only certain types:

{% highlight ruby %}
require 'hamster/hash'
require 'hamster/vector'
require 'hamster/set'
require 'hamster/sorted_set'
require 'hamster/list'
require 'hamster/deque'
{% endhighlight %}

## Hash

{% highlight ruby %}
# Create new Hamster Hash
parrot = Hamster::Hash[type: 'bird', class: 'parrot', color: 'yellow']

parrot.get(:color) # yellow
parrot[:type] # bird

# You can not change hash because of it's immutability
parrot[:subclass] = 'budgie' # NoMethodError: undefined method `[]=' for #<Hamster::Hash:0x007fa34c6f5490>

# But you can create a new
budgie = parrot.put :subclass, 'budgie'
budgie == parrot # false
budgie[:subclass] # budgie
parrot[:subclass] # nil

budgie.to_hash.class # Plain Ruby Hash
{% endhighlight %}


## List

{% highlight ruby %}
list = Hamster::List[0, 1, 2]
list.tail # Hamster::List[1, 2]
list.head # 0

# Hamster's lists are immutable also
list[4] = 3 # NoMethodError: undefined method `[]=' for Hamster::List[0, 1, 2]:Hamster::Cons'`
list << 3 # Hamster::List[0, 1, 2, 3]
list # Hamster::List[0, 1, 2]

copied_list = list.add 3 # Hamster::List[3, 0, 1, 2]
copied_list.first # 3
list.first # 0
{% endhighlight %}

## Set

{% highlight ruby %}
# Hamster's set is an unordered collection with no duplicates
colors = Hamster::Set[:green, :white]
colors.include?(:green) # true

palette = colors.add :yellow # Hamster::Set[:green, :yellow, :white]
colors.include?(:yellow) # false
palette.superset?(colors) # true
palette.intersection(colors) # Hamster::Set[:green, :white]
palette.difference(colors).first # :yellow

palette.to_a # Plain Ruby array: [:green, :white, :yellow]
{% endhighlight %}

## Vector

{% highlight ruby %}
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
{% endhighlight %}

## Conclusion

If you want to use immutable data structures in Ruby to write more reliable,
efficient and at the same time thread-safe code, you can take a look at Hamster.
You can find more in Hamster's [API documentation](http://www.rubydoc.info/github/hamstergem/hamster/master).

