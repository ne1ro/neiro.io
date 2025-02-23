+++
title = "Jekyll with Rails assets"
author = ["neiro"]
date = 2015-05-14T10:00:00+02:00
tags = ["jekyll", "rails"]
draft = false
+++

[Jekyll](http://jekyllrb.com/) is the great static website generator,
that can be easily used for blogs, portfolio pages, galleries and others
simple projects. It\`s very simple, flexible tool that can be upgraded
with hundreds powerful plugins.

If you like Ruby on Rails, you might want to use Rails assets pipeline
when you work with front-end in Jekyll. If so, here are
[jekyll-assets](https://github.com/jekyll-assets/jekyll-assets). This
project allows you to use some Rails-like assets pipeline functionality:

-   SASS, LESS, Coffeescript and even ERB
-   Rails assets dependencies management:
    ```javascript
      //=require 'jquery'
      //=require 'parallax'
      //=require 'slideout'
    ```

-   Minification and compression for Javascript and CSS
-   Gzipped versions of assets

But what if you also wants to use popular Bower packages with Jekyll and
jekyll-assets?<br />
First, you need [Rails assets](https://rails-assets.org/) project,
that allows you to use any Bower modules with Bundler. You just need to
add required packages in your _Gemfile_ like this:

```ruby
source 'https://rails-assets.org' do
  gem 'rails-assets-jquery'
  gem 'rails-assets-normalize-scss'
  gem 'rails-assets-slideout.js'
end
```

It works great with Ruby on Rails, but you need some hack to use it
with jekyll-assets - by default, jekyll-assets configuration does not
include rails-assets paths. To fix this, you can load paths with
**Sprockets** in your Jekyll plugin file (**\_plugins/ext.rb**) .

```ruby
require 'jekyll-assets'
require 'bundler/setup'

Bundler.require(:default, 'development')

if defined?(RailsAssets)
  RailsAssets.load_paths.each do |path|
    Sprockets.append_path path
  end
end
```

When you've completed this setup, you can manage your assets almost like in
Ruby on Rails.
