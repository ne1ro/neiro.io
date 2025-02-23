+++
title = "Partial function application and currying in Ruby"
author = ["neiro"]
date = 2016-03-08T10:00:00+01:00
tags = ["ruby", "functional"]
draft = false
+++

Currying and partial function application are common concepts of the
functional programming. They look similar, but have differences in
realization and using. Ruby allows you to easily operate with both of
them.


## Partial function application {#partial-function-application}

First we need to know what is really _application_ is: it's the process
of applying function to **all of it's arguments** to return value.<br />
_Partial function application_ is the process of applying function to
**some of it's arguments**. This process creates a new function, based on
the parent function, but with lower arity (_with fewer arguments_). So,
if we have an abstract function
![](https://upload.wikimedia.org/math/4/3/a/43a45f58c8f35707c396444463e2ef24.png)
with three arguments, then we can create a partial function
![](https://upload.wikimedia.org/math/1/d/5/1d54867424707e76c6f46bf426fc193e.png)
with two arguments that both of this functions return the same result.

For example, we have a simple multiply function that multiplies two
arguments:

```ruby
 multiply = -> (x, y) { x * y } multiply.(2, 2) # 4

```

But what if we want just double numbers ? Should we pass the _2_
argument each time? Not really. We can use partial function application
to create a new _double_ function that takes just one argument:

```ruby
double = -> (x) { multiply.(2, x) }
double.arity # 1
double.(2) # 4
double.(1984) # 3968
```

Ruby has _Proc#curry_ method that allows you to use partial function
application even more simpler:

```ruby
double = multiply.curry.(2) double.(2) # 4
double.(300) # 600
```


## Currying {#currying}

Currying is similar to partial function application concept.

**Currying** is the process of translating the evaluating of _function
with many arguments_ into evaluating a sequence of functions, each with
_exactly one parameter_. So, if we have a function with two arguments:
![](https://upload.wikimedia.org/math/4/3/b/43ba302d099d623ae50cce466eb1f34d.png)
then we can translate it with
![](https://upload.wikimedia.org/math/0/1/3/0138ee5c8706ca68729e27f0e01e56ee.png)
transformation to return a new function with one parameter:
![](https://upload.wikimedia.org/math/7/b/5/7b547dc91687bfb09ee27d4c22f815eb.png).

For example, look back at previous _multiply_ function. What if we want
to multiply more than two arguments?

```ruby
multiply.(2, 2, 2) # ArgumentError: wrong number of arguments (given 3, expected 2)
```

To prevent this, we can change multiply function and use _Proc#curry_
method:

```ruby
multiply = -> (head, /tail) { head / tail.inject(1, &:*) }
multiply.curry.(2, 2, 2) # 8
multiply.curry.(2, 3, 7) # 42
```

If we want to restrict arguments count, we can use _arity_ optional
argument in _Proc#curry_ function:

```ruby
multiply.curry(3)[1][2][3] # 6
multiply.curry(3)[1][2][3][4] # 0 because of the last argument is nil
```

You can also use _curry_ method on plain methods, not only procs with
Ruby 2.2:

```ruby
def sum(*args)
  args.inject(:+)
end

plus_two = method(:sum).curry(2).(2)
plus_two.(3) # 5
```


## Conclusion {#conclusion}

Partial function application and currying are both great features of
functional programming that allows you to write clean, simple and
flexible functions based on anothers. You can use Ruby's _#curry_ method
with procs or methods to write eloquent and powerful code.
