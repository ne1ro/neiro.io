+++
title = "High level Node.JS streams"
author = ["neiro"]
date = 2016-01-28T10:00:00+01:00
tags = ["javascript", "functional"]
draft = false
+++

Node.js has a simple and powerful stream API. Streams in Node.js are
unix pipes that let you perform asynchronous I/O operations by reading
source data and pipe it to destination. If your application operates not
with streams only, but promises, callbacks or synchronous code, you may
want to use more deeper abstraction that fits your needs. In this case
you may take a look at [Highland](http://highlandjs.org/).


## Highland {#highland}

Highland library allows you to manage asynchronous and synchronous code
easily both in Node.js and in the browser. With Highland you can simple
switch between synchronous and asynchronous data sources without
re-writing your code. You can install Highland with NPM:

```shell
 npm install highland
```

and require or import it as yet another Node.js module:

```javascript
 import _ from 'highland';
```


## General examples {#general-examples}

Converting from arrays to Highland Streams:

```javascript
 _([0, 1, 2]).toArray(xs => console.log(xs));
// 0, 1, 2
```

Map and reduce over a stream:

```javascript
 _([0, 1, 2]).map(x => x + 1).reduce(1, (a,
b) => a * b); // [6]
```

Reading files in parallel:

```javascript
 import fs from 'fs';
const readFile =
/.wrapCallback(fs.readFile); const stream = /(['./.babelrc',
'./.eslintrc']).map(readFile).parallel(2);
```

Handling errors:

```javascript
 stream.errors((err, rethrow) => { console.error(err); });
```

Pipe to Node.js streams:

```javascript
 stream.pipe(outputStream);
```


## Stream objects {#stream-objects}

Constructor:

```javascript
 const stream = _(source); // source - Array/Generator/Node Stream/Event Emitter/Promise/Iterator/Iterable
```

General functions:

```javascript
stream.destroy(); stream.end();
stream.pause(); stream.resume(); stream.write(x); // Write x value to
stream
```


## Transformations {#transformations}

```javascript
 ([0, 1, 2]).append(3); // [0, 1, 2, 3]
 ([0, 1, 2, null, undefined]).compact(); // [1, 2]
 ([1, 2, 5]).filter(x => x
<= 3); // [1, 2]
([1, 2, 3]).head(); // 1
([1, 2, 3]).last(); // 3
(['ABC']).invoke('toLowerCase', []); // abc
([{ foo: 'bar' }]).pick(['foo']); // { foo: 'bar' }
([{ foo: 'bar' }]).pluck(['foo']); // bar
[0, 1, 2, 3]).slice(2, 4); // [2, 3]
(['c', 'a', 'b']).sort(); // ['a', 'b', 'c']
_([0, 0, 2, 3]).uniq(); // [0, 2, 3]
```


## High-order Streams {#high-order-streams}

```javascript
([0, 1]).concat([2, 3]); // [0, 1, 2, 3]
([0, 1, [2, [3]]]).flatten(); // [0, 1, 2, 3]
(/([0, 1]), /([2, 3])).sequence(); // [0, 1, 2, 3]
(['a', 'b']).zip([1, 2]); // => ['a', 1], ['b', 2]

const fork = stream.fork(); const observer = stream.observe();
fork.resume();
```


## Objects {#objects}

```javascript
 .extend({ name: 'foo' }, { type: 'obj' });
// { name: 'foo', type: 'obj' }
.get('foo', { foo: 'bar' }); // bar
.keys({ foo: 'bar' }); // ['foo']
.values({ foo: 'bar' }); // ['bar']
_.pairs({ foo: 'bar' }); // ['foo', 'bar']
```


## Utils {#utils}

```javascript
.isStream([1, 2, 3]); // false
.isStream(stream); // true

([1, 2, 3]).each(.log); // 1, 2, 3

const readFile = .wrapCallback(fs.readFile); // Wraps callback to Highland stream
.isStream(readFile); // true
```


## Conclusion {#conclusion}

If you need to handle your synchronous and asynchronous data with
differrent abstractions in one way, operate with Node.js streams at
higher level, you can use Highland high-level streams library to fit
your needs. You can find more at [Highland
docs](http://highlandjs.org/).
