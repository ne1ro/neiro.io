+++
title = "Elixir continious integration with CircleCI"
author = ["neiro"]
date = 2018-06-19T10:00:00+02:00
tags = ["elixir", "quality", "ci"]
draft = false
+++

Elixir programming language has gained popularity and now it is
supported at many platforms, including plenty of CI services. In this
article we will see how we can achieve seamless and _(almost)_ dead
simple continious integration by using CircleCI in our Elixir projects.


## CircleCI 2.0 {#circleci-2.0}

[CircleCI](https://circleci.com) is one of the most popular and
user-friendly continious integration solutions. It supports many
programming languages and tools, including Elixir and Erlang/OTP.

CircleCI is entirely free when it comes to open-source GitHub
repositories, but it also provides free 1500 minutes a month for any
private repos.

Starting version 2.0 CircleCI can create jobs based on any images from
[DockerHub](https://hub.docker.com/). This feature makes possible to
build any programming language or platform that can be placed in Docker
image.

Imagine you have a standard Elixir Phoenix / Ecto application. You need
to run it on the latest versions of Elixir and Erlang/OTP and run the
tests on PostgreSQL database.

Let's start by creating a CircleCI configuration file in
`.circleci/config.yml`:

```text
  version: 2  # use CircleCI 2.0 instead of CircleCI Classic
  jobs:  # basic units of work in a run
    build:  # runs not using Workflows must have a `build` job as entry point
      parallelism: 1  # run only one instance of this job in parallel
      docker:  # run the steps with Docker
        - image: circleci/elixir:1.6 # ...with this image as the primary container; this is where all `steps` will run
          environment:  # environment variables for primary container
            MIX_ENV: test
            SHELL: /bin/bash
        - image: mdillon/postgis:9.6-alpine  # database image
          environment:  # environment variables for database
            POSTGRES_DB: app_test

      steps:  # commands that comprise the `build` job
        - checkout  # check out source code to working directory

        - run: mix local.hex --force  # install Hex locally (without prompt)
        - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)
```

As you can see here, we are declaring the `build` continious integration
job. Basically we will use the Elixir 1.6 with PostgreSQL 9.6 to run
tests on the `app_test` database. After that we will checkout source
code base to fetch our recent changes into the build. `mix local` tasks
are also necessary in order to use any of _Mix_ tasks later.


## Running tests and code quality {#running-tests-and-code-quality}

All of us want to run all common continious integration steps such as:

-   Fetch dependencies and compile application
-   Run code quality tools and checks (_you can read more about it
    [here](https://neiro.io/2018/04/28/elixir-code-quality-tools-and-checks.html))_
-   Execute all tests to make sure that our build is successful and
    infallible
-   Run heavy and bulky static analysis tools

Also we want to make our builds as fast as possible, so we definitely
need caching. Let's continue with our config and implement the steps
above:

{% raw %}

```text
        - restore_cache:  # restores saved mix cache
            keys:  # list of cache keys, in decreasing specificity
              - v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
              - v1-mix-cache-{{ .Branch }}
              - v1-mix-cache
        - restore_cache:  # restores saved build cache
            keys:
              - v1-build-cache-{{ .Branch }}
              - v1-build-cache
        - restore_cache:  # restores saved plt cache
            keys:
              - dialyzer-cache

        - run: mix do deps.get, compile # get updated dependencies & compile them

        - save_cache:  # generate and store cache so `restore_cache` works
            key: v1-mix-cache-{{ .Branch }}-{{ checksum "mix.lock" }}
            paths: "deps"
        - save_cache:  # make another less specific cache
            key: v1-mix-cache-{{ .Branch }}
            paths: "deps"
        - save_cache:  # you should really save one more cache just in case
            key: v1-mix-cache
            paths: "deps"
        - save_cache: # don't forget to save a *build* cache, too
            key: v1-build-cache-{{ .Branch }}
            paths: "_build"
        - save_cache: # and one more build cache for good measure
            key: v1-build-cache
            paths: "_build"

        - run: mix do format --check-formatted, credo --strict, security
        - run: mix do xref deprecated --include-siblings, xref unreachable --include-siblings, xref graph --format stats

        - run:  # special utility that stalls main process until DB is ready
            name: Wait for DB
            command: dockerize -wait tcp://localhost:5432 -timeout 1m

        - run: mix do ecto.migrations, ecto.load
        - run: mix test  # run all tests in project

        - run: mix dialyzer --halt-exit-status
        - save_cache:
            key: dialyzer-cache
            paths: "_build/test/dialyxir*.plt"

        - store_test_results:  # upload test results for display in Test Summary
            path: _build/test/lib/app/results.xml
```

{% endraw %}

Now you can start new builds by signing up into CircleCI as it will run
the configuration and steps from your config. Every commit in any branch
will run the build job and you will know if something is wrong with your
code.


## Deploying {#deploying}

However, having only one build job is not enough even for the simplest
CI process. Most often we need to make a staging/production release by
using [Distillery](https://github.com/bitwalker/distillery).

Let's continue filling up our configuration file by adding a new
`deploy` job:

```text
    deploy:
      docker:
        - image: circleci/elixir:1.6
          environment:  # environment variables for primary container
            SHELL: /bin/bash
            MIX_ENV: staging
      steps:
        - checkout  # check out source code to working directory

        - run: mix local.hex --force  # install Hex locally (without prompt)
        - run: mix local.rebar --force  # fetch a copy of rebar (without prompt)

        - run: mix do deps.get, compile # get updated dependencies & compile them

        # set MIX_ENV to prod or staging value according to the source branch
        - run:
            name: Update MIX_ENV environment variable
            command: |
              echo "export MIX_ENV=$(if [ '$CIRCLE_BRANCH' '==' 'master' ]; then echo 'prod'; else echo 'staging'; fi)" >> $BASH_ENV
              source $BASH_ENV

        - run: cd deps/argon2_elixir && make clean && make && cd -
        - run: MIX_ENV=staging mix release --env $MIX_ENV

        - run: tar -zcvf $CIRCLE_SHA1.tar.gz bin appspec.yml VERSION _build/$MIX_ENV/rel/app/releases/$(cat VERSION)/app.tar.gz
```

This will be enough to create a separate deploy job that will run on a
separate Docker image. However, we will need to run it only on develop
and master branches in order to upload staging/production releases
accordingly. We can achieve this by using CircleCI workflow and
providing a simple configuration at the bottom of our config file:

```text
  workflows:
    version: 2
    build-and-deploy:
      jobs:
        - build
        - deploy:
            requires:
              - build
            filters:
              branches:
                only:
                  - develop
                  - master
```

After that you are free to upload the built release to any server or any
platform you want. You can use Edeliver, Ansible, Chef, Docker - it's up
to you.


## Conclusion {#conclusion}

As you can see above, it's not so hard to build and deploy Elixir
applications with CircleCI 2.0. This platform is flexible and fast
enough to make your continious integration bright and shiny.

If you want to discover even more on the topic then let's read
[CircleCI 2.0 documentation](https://circleci.com/docs/2.0/) and
[Elixir Language
Guide](https://circleci.com/docs/2.0/language-elixir/).

Happy hacking, everyone!
