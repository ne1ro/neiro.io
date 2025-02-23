+++
title = "Trine util library"
author = ["neiro"]
date = 2015-12-31T10:00:00+01:00
tags = ["javascript", "functional"]
draft = false
+++

As we know, functional programming in JavaScript is not the best
experience, unlike the plain functional languages (_Haskell, Lisp,
etc_). But new standards of JavaScript - ES6 _(ECMAScript 2015)_ and
_ES7(ECMAScript 2016)_ introduce some improvements and allows you to
write code in more functional style:

```javascript
 flatten(collection.filter(func1).map(func2));

```

But there's more: new
[function bind syntax](https://github.com/zenparsing/es-function-bind)
performs function binding and method extraction. The previous example
can be rewritten as:

```javascript

collection.filter(func1).map(func2)::flatten();
```

ES6 also introduces the concept of iterators - protocol, that most JS
collection types implement. You can extend your custom collections to
support the same protocol, and generators functions support it too. So,
if you looking for utility library that supports new function bind
syntax, and iterators, you can take a look on
[Trine](https://github.com/jussi-kalliokoski/trine).


## Installing {#installing}

First of all, you may want to use all features of ES6 and most of ES7
standards with [Babel](https://babeljs.io/):

_npm install --save babel babel-preset-stage-0 babel-preset-es2015_

```javascript
 //.babelrc { "presets": ["stage-0", "es2015"]
}
```

Then install Trine:

_npm install --save trine_

and import to your project required functions:

```javascript
 import { last } from 'trine/iterable/last';

 const lastCh = ['a', 'b', 'c']::last(0); // yields 'c'
 lastCh.next().value; // c
```


## Boolean {#boolean}

Trine provides common boolean helpers:

```javascript
true::not() // false
true::and(false) // false
true::or(false) // true
true::xor(false) // true
0::not() // true
```


## Number {#number}

\#+begin_src javascript
10::min(100) _/ 10
-100::abs() /_ 100
4::div(2) _/ 2
4::mod(3) /_ 1
2::pow(4)::max(15) // 16


## Value {#value}

Extract , compare or convert values to functions:

```javascript
'foo'::equals('bar')::is(false); // true
const func = { foo: 'bar' }::prop('foo')::toFunction();
func(); // bar

```


## Partial {#partial}

Trine includes partial helper:

```javascript
parseInt::partial(_, 2)('1010') // 10
```


## Object {#object}

```javascript
let obj = { foo: 'bar' };
obj::keys().next().value; // foo
obj::values().next().value; // bar
```


## Iterable {#iterable}

```javascript
 let nums = [5, 1];
nums::count().next().value; // 2
nums::reverse()::to(Array); // 1, 5
'cab'::sortAlphabetically()::to(Array) // a, b, c
[nums, [2, 3]]::flatten()::map(function() { return this * 3 })::to(Array); // 15, 3, 6, 9
```


## Conclusion {#conclusion}

If you like new syntax of ES6, ES7 and want to use iterators, function
binding, you can use Trine as base utility library. If you want to know
more about Trine, you can take a look at it's
[documentation](http://jussi-kalliokoski.github.io/trine/docs/latest/)
.
