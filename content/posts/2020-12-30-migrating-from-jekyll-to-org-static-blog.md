+++
title = "Migrating from Jekyll to org-static-blog"
author = ["neiro"]
date = 2020-12-30T13:20:00+01:00
tags = ["blog", "emacs", "jekyll"]
draft = false
+++

One of the biggest (and positive) discoveries this year for me was definitely an Emacs.
I've decided to switch to this editor after using Vim for almost 8 years as I've started embracing
Lisps (especially Clojure) and wanted an editor where I can have a first-class integration with these programming languages.

Besides the nice integration I've found out a lot of very interesting related things,
e.g. REPL-driven development, Org-mode, org-roam, and plenty of others.
For sure, one of the biggest benefits is the **org-mode** - which is a most powerful, elegant
and nicely integrated in Emacs ecosystem markdown language and extensions, in my opinion.

After some time I've started to thinking about improving my blogging experience.
The ergonomics of typing, ease of use are quite important to me, so the ideal solution
would be to embrace the power of the org-mode, evil mode (to keep vim bindings in place) and
apply it for my personal blog. However, this was not as simple as I've expected - and there were
a lot of options.


## Org-mode support in existing blog engines {#org-mode-support-in-existing-blog-engines}


### Jekyll {#jekyll}

Jekyll has [a support for org mode](https://github.com/eggcaker/jekyll-org) , however, it's based on an outdated
**org-ruby** gem which might not have a full support of all \`org-mode\` features.


### Gatsby {#gatsby}

Gatsby.js seems to be a relatively popular choice for building static websites - and it has all
modern and shiny technologies on the front side, like React, server-side rendering, GraphQL, etc.
Gatsby also has an [org-mode plugin](https://www.gatsbyjs.com/plugins/gatsby-transformer-orga/), and it looks more or less fully-featured.


### Emacs itself {#emacs-itself}

Emacs has a variety of solutions to have some static website or a small blog built from org-mode.
So far I've liked [an org-static-blog](https://github.com/bastibe/org-static-blog) solution which can be installed right to an emacs and could be
an extension to the org-mode.


## Migration from Jekyll {#migration-from-jekyll}

I've had a lot of issues with outdated Jekyll version and my attempts to update it with assets have failed.
As for the Gatsby, I've gave it a try, but it looked like that it focuses more on Markdown and it took a lot of
efforts to make something tangible with org-mode.
I've wanted to re-organise the current assets structure to make it way more minimalistic, so I've decided to switch
to the **org-static-blog**.


### Installation of the org-static-blog {#installation-of-the-org-static-blog}

It's quite simple - you just need to run from your Emacs

```emacs
package-install
```

and choose

```nil
org-static-blog
```


### Configuration {#configuration}

org-static blog has a lot of configuration options, so it's better to refer the [examples and documentation on the website](https://github.com/bastibe/org-static-blog#examples).


### Convert markdown to org {#convert-markdown-to-org}

This is required step which can be quickly done by simple script, assuming that you have pandoc installed:

```shell
for f in `ls *.md`; do
    pandoc -f markdown -t org -o ${f}.org ${f};
done
```


### Writing a new post {#writing-a-new-post}

```emacs
org-static-blog-mode
org-static-blog-create-new-post
```

These commands will create a new post with some default template. Run <span class="underline">org-static-blog-publish</span> once you have your post ready.
This will build a new HTML page in the **/blog** directory.


### CI/CD {#ci-cd}

So far the simplest solution I've found is just to keep built HTML version of the website in the repo and deploy it on
each change. [There's an example](https://gitlab.com/_zngguvnf/org-static-blog-example) of how the CI/CD can be improved.


## Issues that are still not solved by migration {#issues-that-are-still-not-solved-by-migration}

The migration was not ideal, and there are still some pain points and issues not solved:


### Better code highlighting {#better-code-highlighting}

Some programming languages are highlighted poorly.


### Better CI/CD experience {#better-ci-cd-experience}

There is a way to build the website right from CI, e.g. by executing Emacs Lisp code from the container,
though it may require some setup &amp; efforts spent before.


### Assets management {#assets-management}

Probably I'll still need to configure Webpack, stylesheets, javascripts to make the website looking more neat
and more fully featured.


## Conclusion {#conclusion}

Switching from Jekyll to **org-static-mode** definitely improved the blogging experience, and now it's a way more
simpler, faster and enjoyable process. There are still some painful issues which were resolved in other mainstream
blog engines, but the benefits of having everything typed in **org-mode** and managed by the Emacs are more significant for me.

Happy new year and keep hacking!
