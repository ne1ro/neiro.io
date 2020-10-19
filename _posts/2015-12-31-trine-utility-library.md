---
    layout: post
    title: Trine - functional utility library for modern JavaScript
    tags: [programming,javascript,functional,library,utility]
---

As we know, functional programming in JavaScript is not the best experience, unlike the plain functional languages (*Haskell, Lisp, etc*). But new standards of JavaScript - ES6 *(ECMAScript 2015)* and *ES7(ECMAScript 2016)* introduce some improvements and allows you to write code in more functional style:

{% highlight javascript %}
flatten(collection.filter(func1).map(func2));
{% endhighlight %}

But there's more: new [function bind syntax](https://github.com/zenparsing/es-function-bind) performs function binding and method extraction. The previous example could be rewritten as:

{% highlight javascript %}
collection.filter(func1).map(func2)::flatten();
{% endhighlight %}

ES6 also introduces the concept of iterators - protocol, that most JS collection types implement. You can extend your custom collections to support the same protocol, and generators functions support it too. So, if you looking for utility library that supports new function bind syntax, and iterators, you can take a look on [Trine](https://github.com/jussi-kalliokoski/trine).

## Installing
First of all, you may want to use all features of ES6 and most of ES7 standards with [Babel](https://babeljs.io/): 

{% highlight shell %}
npm install --save babel babel-preset-stage-0 babel-preset-es2015
{% endhighlight %}

{% highlight javascript %}
//.babelrc
{
  "presets": ["stage-0", "es2015"]
}
{% endhighlight %}

Then install Trine:

{% highlight shell %}
npm install --save trine
{% endhighlight %}

and import to your project required functions:

{% highlight javascript %}
import { last } from 'trine/iterable/last';

const lastCh = ['a', 'b', 'c']::last(0); // yields 'c'
lastCh.next().value; // c
{% endhighlight %}

## Boolean
Trine provides common boolean helpers:

{% highlight javascript %}
true::not() // false
true::and(false) // false
true::or(false) // true
true::xor(false) // true
0::not() // true
{% endhighlight %}

## Number
{% highlight javascript %}
10::min(100) // 10
-100::abs() // 100
4::div(2) // 2
4::mod(3) // 1
2::pow(4)::max(15) // 16
{% endhighlight %}

## Value
Extract , compare or convert values to functions:

{% highlight javascript %}
'foo'::equals('bar')::is(false); // true
const func = { foo: 'bar' }::prop('foo')::toFunction();
func(); // bar
{% endhighlight %}

## Partial
Trine includes partial helper:

{% highlight javascript %}
parseInt::partial(_, 2)('1010') // 10
{% endhighlight %}

## Object
{% highlight javascript %}
let obj = { foo: 'bar' };
obj::keys().next().value; // foo
obj::values().next().value; // bar
{% endhighlight %}

## Iterable
{% highlight javascript %}
let nums = [5, 1];
nums::count().next().value; // 2
nums::reverse()::to(Array); // 1, 5
'cab'::sortAlphabetically()::to(Array) // a, b, c
[nums, [2 ,3]]::flatten()::map(function() { return this * 3 })::to(Array); // 15, 3, 6, 9
{% endhighlight %}

## Conclusion
If you like new syntax of ES6, ES7 and want to use iterators, function binding, you can use Trine as base utility library. If you want to know more about Trine, you can take a look at it's [documentation](http://jussi-kalliokoski.github.io/trine/docs/latest/) .
