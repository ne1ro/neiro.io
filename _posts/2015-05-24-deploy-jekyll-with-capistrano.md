---
  layout: post
  title: Deploy Jekyll with Capistrano
  tags: [ruby,jekyll,deploy,capistrano]
---

If you're using Jekyll to generate your static website, you may want to deploy it as simple and fast, as Jekyll works. For this case, Ruby ecosystem has remote server automation and deployment tool that called [Capistrano](http://capistranorb.com/) . 

First of all, you need to create *Gemfile* in your Jekyll project and add this lines:

{% highlight ruby %}
source 'https://rubygems.org'

gem 'capistrano', '~> 3.4.0'
{% endhighlight %}

Then execute: 

{% highlight bash %}
bundle install && bundle exec cap install
{% endhighlight %}

This creates configuration files, that you can change with your parameters. Make sure that you set up production configuration with your server data (*/config/deploy/production.rb*):

{% highlight ruby %}
role :app, %w{user@server}
role :web, %w{user@server}
{% endhighlight %}

After configuration you can deploy your project with one simple command:

{% highlight shell %}
$ bundle exec cap production deploy
{% endhighlight %}

This command deploys  source to */var/www/website_name*, but it does not generate website. To execute `jekyll build` command you need to install Ruby using [rbenv](https://github.com/sstephenson/rbenv) or [RVM](https://rvm.io/) first.

Next you should add Capistrano plugin for rbenv in *Gemfile*:

{% highlight ruby %}
gem 'capistrano-rbenv', '~> 2.0'
{% endhighlight %}

Then execute

{% highlight shell %}
bundle exec
{% endhighlight %}

And add this line to *Capfile*:

{% highlight ruby %}
require 'capistrano/rbenv'
{% endhighlight %}

Install Jekyll gem on server and add it to rbenv binaries list in *config/deploy.rb*:

{% highlight ruby %}
set :rbenv_map_bins, %w{rake gem bundle ruby jekyll}
{% endhighlight %}

Now you can use my [capistrano-jekyll](https://github.com/ne1ro/capistrano-jekyll) gem to execute `jekyll build` command every time when you deploy your website's changes:  

{% highlight ruby %}
# Gemfile
gem 'capistrano-jekyll'
{% endhighlight %}

{% highlight shell %}
$ bundle install && bundle exec cap production deploy
{% endhighlight %}

