+++
title = "Deploy Jekyll with Capistrano"
author = ["neiro"]
date = 2015-05-24T10:00:00+02:00
tags = ["jekyll", "capistrano", "deploy"]
draft = false
+++

If you're using Jekyll to generate your static website, you may want to
deploy it as simple and fast, as Jekyll works. For this case, Ruby
ecosystem has remote server automation and deployment tool that called
[Capistrano](http://capistranorb.com/) .

First of all, you need to create _Gemfile_ in your Jekyll project and
add this lines:

```ruby
source 'https://rubygems.org'
gem 'capistrano', '~> 3.4.0'
```

Then execute:

```shell
bundle install && bundle exec cap install
```

This creates configuration files, that you can change with your
parameters. Make sure that you set up production configuration with your
server data (_/config/deploy/production.rb_):

```ruby

role :app, %w{user@server}
role :web, %w{user@server}
```

After configuration you can deploy your project with one simple command:

```shell
bundle exec cap production deploy
```

This command deploys source to _/var/www/website_name_, but it does not
generate website. To execute `jekyll build` command you need to install
Ruby using [rbenv](https://github.com/sstephenson/rbenv) or
[RVM](https://rvm.io/) first.

Next you should add Capistrano plugin for rbenv in _Gemfile_:

```ruby
gem 'capistrano-rbenv', '~> 2.0'
```

Then execute

```ruby
bundle exec
```

And add this line to _Capfile_:

```ruby
require 'capistrano/rbenv'
```

Install Jekyll gem on server and add it to rbenv binaries list in
_config/deploy.rb_:

```ruby
set :rbenv_map_bins, %w{rake gem bundle ruby jekyll}
```

Now you can use my
[capistrano-jekyll](https://github.com/ne1ro/capistrano-jekyll) gem to
execute `jekyll build` command every time when you deploy your website's
changes:

```ruby
# Gemfile
gem 'capistrano-jekyll'
```

```shell
$ bundle install && bundle exec cap production deploy
```
