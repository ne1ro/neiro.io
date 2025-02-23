+++
title = "Taming the time: how to run XTDB in production"
author = ["neiro"]
description = "How to build, deploy and run XTDB in production"
date = 2023-07-19T15:45:00+02:00
tags = ["bitemporality", "databases", "elixir", "xtdb", "clojure", "docker", "devops"]
draft = false
+++

---

[The article was originally published in MarleySpoon DevBlog](https://dev.to/marleyspoon/taming-time-how-to-run-xtdb-in-production-2lgd)


## What is XTDB {#what-is-xtdb}

[In the previous articles](https://dev.to/ne1ro/series/22497), we explored the concept of bitemporality and discussed how to get started with XTDB, a bitemporal immutable database. Now, let's dive into the technical details of deploying XTDB and running it in production. This blog post aims to provide valuable insights and considerations to keep in mind during this process.


### XTDB 1 {#xtdb-1}

Before we proceed, it's important to note that the experiences shared in this article are based on working with XTDB version 1.21.
It's worth mentioning that your experience may vary, especially with the introduction of [XTDB 2.0](https://www.xtdb.com/v2) and subsequent versions.


## Deploying XTDB {#deploying-xtdb}

Deploying XTDB in a production environment offers several options, each with its advantages and considerations:

-   run as a part of your JVM application
-   run separately, but on the same server together with your application
-   run on a standalone node or in a separate container
-   run a cluster of XTDB nodes

To achieve a resilient and scalable setup, I recommend running a cluster of XTDB nodes, with each node deployed as a separate Docker container managed by Kubernetes. This allows easy orchestration, automatic scaling, and simplified management of the XTDB cluster.


### Containerised XTDB {#containerised-xtdb}

In this section, we will explore how to build and run a Docker container with a custom configured XTDB application _(Clojure project)_ in a Kubernetes cluster. However, in case you don't need to have a custom build and can simply use a [standalone Docker image](https://hub.docker.com/r/juxt/xtdb-standalone-rocksdb), you can skip right to the "Authentication" section.


#### Uberjar {#uberjar}

If we want to run the XTDB in Docker the most fitting way to run it in a container would be to compile our preconfigured XT application into a single "uberjar" file.

This can be done by employing [Uberdeps](https://github.com/tonsky/uberdeps) in our Clojure project:

```clojure
; deps.edn
:aliases
 {:uberdeps {:replace-deps {uberdeps/uberdeps {:mvn/version "1.1.0"}}
             :replace-paths []
             :main-opts ["-m" "uberdeps.uberjar"]}}
```

Once you have it installed, you can compile your project into a single Uberjar file:

```shell
clj -M:uberdeps
```


#### Dockerfile {#dockerfile}

We want our XTDB Docker image to be as lightweight as possible, so the best approach would be to have a multi-stage build image that builds and runs the Uberjar on the selected JVM image:

```dockerfile
# Build clojure uberjar
FROM clojure:openjdk-17-tools-deps-alpine AS BUILD

WORKDIR /xtdb
COPY . /xtdb
RUN apk add --no-cache libstdc++

RUN clojure -M:uberdeps

# Copy and run uberjar
FROM openjdk:17-alpine3.14
WORKDIR /usr/local/lib/xtdb

RUN apk --no-cache add bash libstdc++

COPY --from=BUILD /xtdb/resources /usr/local/lib/xtdb/resources
COPY --from=BUILD /xtdb/target .

ENV MALLOC_ARENA_MAX=2
CMD ["java", "-cp", "xtdb.jar", "clojure.main", "-m", "xtdb.core"]

EXPOSE 3000
```


#### Graceful shutdown {#graceful-shutdown}

Another requirement for running XT in Kubernetes is to gracefully shut down, e.g., on killing containers or Kubernetes deployment restart. To ensure that, we have to change our \`xtdb.clj\` file by adding a \`SIGTERM\` signal handler:

```clojure
;; Stop the system on SIGTERM
(with-handler :term
  (log/info "Caught SIGTERM, quitting")
  (.close @xt-node)
  (log/info "All components shut down")
  (System/exit 0))
```


### Authentication {#authentication}

Since we run our XTDB separately from our application containers, we might want to ensure that the requests from services to the database are properly authenticated.

In order to ensure that we need to change the way we start XTDB by providing JWKS ([JSON Web Token key set](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets)) as an environment variable to the XTDB node:

```clojure
; core.clj
(def config
  {:xtdb.http-server/server {:port 3000
                             :jwks (System/getenv "XTDB_JWKS")} ...
```

The next step is to send the compatible JWT token from your application requests:

```elixir
{"Authorization", "Bearer #{your_jwt}"}
```


### Kubernetes {#kubernetes}

As we've decided to go with the running XT nodes as Docker containers in a Kubernetes cluster, we need to prepare Kubernetes manifests for that purpose.

The simplest way to achieve that is to create a Kubernetes stateful set of multiple XT containers:

```yaml
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: xtdb
  labels:
    app.kubernetes.io/name: xtdb
spec:
  serviceName: xtdb-headless
  replicas: 3
  selector:
    matchLabels:
      app.kubernetes.io/name: xtdb
  template:
    metadata:
      labels:
      app.kubernetes.io/name: xtdb
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: xtdb
          image: $REGISTRY/xtdb:1.21.0
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          livenessProbe:
            tcpSocket:
              port: 3000
            periodSeconds: 10
            initialDelaySeconds: 120
            timeoutSeconds: 15
          readinessProbe:
            exec:
              command:
                - bash
                # custom readiness check script
                - scripts/readiness.sh
            initialDelaySeconds: 30
            periodSeconds: 15
          envFrom:
            - secretRef:
                name: xtdb-secrets
```

As for the configuration, you can create a configmap with environment variables required for configuring XTDB and a secrets resource for providing secrets to your XT nodes.


## Running XT in production {#running-xt-in-production}

XTDB is an _unbundled database_ which means that it has a lot of components that can be swapped or changed — and it might work with different technologies and other databases.

In general, it consists of 3 parts:

1.  Transaction log
2.  Document store
3.  Index store

We had an experience using PostgreSQL and JDBC adapter for our XTDB setup, as well as experimenting with Kafka for transaction log — and using RocksDB as an index storage.

However, there are many more other ways and modules to setup the database — you can find them in [the documentation.](https://docs.xtdb.com/administration/configuring/)


### JDBC {#jdbc}

The transaction log and document store are considered to be **golden stores** in XTDB — which means that they should be reliably persisted, unlike the index storage that can be rebuilt from scratch on node restart.

XT supports JDBC (Java Database Connectivity) which allows us to connect to various SQL databases like PostgreSQL, MySQL, SQLite, and others.
In our example, we were using PostgreSQL + JDBC for both transaction log and document store.

To use PostgreSQL and JDBC together, you have to provide these modules in your _deps.edn_ first:

```clojure
:deps {org.postgresql/postgresql {:mvn/version "42.2.18"}
        com.xtdb/xtdb-jdbc {:mvn/version "1.21.0"}
       ...
```

If you want to use environment variables for connecting to PostgreSQL from the XTDB deployment you can also pass them in **core.clj** file:

```clojure
(def db-spec
  {:host (System/getenv "POSTGRES_HOST")
   :port (get (System/getenv) "POSTGRES_PORT" "5432")
   :dbname (System/getenv "POSTGRES_DB")
   :user (System/getenv "POSTGRES_USER")
   :password (System/getenv "POSTGRES_PASSWORD")})

(def config
  {:xtdb.jdbc/connection-pool {:dialect {:xtdb/module 'xtdb.jdbc.psql/->dialect}
                               :pool-opts {:maximumPoolSize 10}
                               :db-spec db-spec}
   :xtdb/tx-log {:xtdb/module 'xtdb.jdbc/->tx-log
                 :connection-pool :xtdb.jdbc/connection-pool}
   :xtdb/document-store {:xtdb/module 'xtdb.jdbc/->document-store
                         :connection-pool :xtdb.jdbc/connection-pool}})
```

That way we can also re-use the same connection pool for both transaction and document store.


### Kafka {#kafka}

However, the recommended option (and also most often used in production) is to leverage Kafka for the transaction store.

During node restarts _(e.g. on new deployments)_ XTDB has to rebuild the transaction log from zero or the latest saved checkpoint, which means reading the whole transaction table in PostgreSQL — and in our experience, this process was slower than expected.

Kafka seems to be a better fit for the very purpose of the transaction log because:

-   it's basically a log of events
-   we only need to use just one partition and one topic
-   the transactions can be consumed very quickly

Thus, the most optimal and performant setup for us looked like:

-   using Kafka as a transaction log
-   using JDBC and relational database as a document store
-   using RocksDB as an index store

That way, we can ensure that the transactions can be created quickly, the log can be re-consumed fast, and the document storage is performant enough and resilient.


### Checkpoints {#checkpoints}

If we want to rebuild the query indices (e.g. on node restart), XT might need to replay the transaction log — which sometimes might be not so fast especially if you have a long history of changes.

As we run our XTDB in a cluster, it's vital that the readiness time — when the XT instance is ready to serve DB requests — is as low as possible.
Fortunately, XTDB has a solution for that problem called **checkpoints**.

Right now, there are three ways to persist the local query indices state:

-   local files (using Java's NIO file system)
-   AWS S3
-   GPC's cloud storage


#### AWS S3 {#aws-s3}

In our case, we've decided to go with the AWS setup in order to have a centralised and already configured storage for the checkpoints.
However, it also requires some additional dependencies to be installed:

```clojure
; deps.edn
 :deps {com.xtdb/xtdb-s3 {:mvn/version "1.21.0"}
        software.amazon.awssdk/aws-core {:mvn/version "2.10.91"}
```

Additional setup in the node configuration is also required.

As we've experienced some requests to S3 taking a long time, we've also decided to build a custom AWS S3 HTTP client:

```clojure
(defn- make-s3-client
  "Increases timeouts for AWS S3 HTTP calls"
  []
  (let [timeout (Duration/ofSeconds 30)
        http-client-builder (->
                             (NettyNioAsyncHttpClient/builder)
                             (.connectionAcquisitionTimeout timeout)
                             (.connectionTimeout timeout))]
    (-> (S3AsyncClient/builder)
        (.httpClientBuilder http-client-builder)
        .build)))

(def checkpoint-name (get (System/getenv) "CHECKPOINT_NAME" ""))

(def checkpoint-config
  ; Checkpoints are not enabled on a local machine where we don't have the env
  (if (str/blank? checkpoint-name)
    {}
    {:xtdb/module 'xtdb.checkpoint/->checkpointer
     :store
     {:xtdb/module 'xtdb.s3.checkpoint/->cp-store
      :bucket checkpoint-name
      :configurator (fn [_] (reify S3Configurator (makeClient [_this] (make-s3-client))))}
     :Keep-dir-on-close? false
     :approx-frequency (Duration/ofHours 2)}))
```

Once configured, XT will persist the current index state to S3 every 2 hours. One might want to adjust S3's bucket policy so it archives or removes the obsolete checkpoints files.


## Caveats {#caveats}


### Memory consumption {#memory-consumption}

JVM-based applications tend to consume quite a significant amount of memory budget — in our case, running XT with allowed 4GB of memory wasn't always enough so we've decided to increase the memory limits in Kubernetes up to 8 gigabytes.

Another consideration we've observed is that the vertical scaling works better for an XTDB cluster — unlike the horizontal scaling, where we need to wait until the new node restores from the checkpoints or processes the transactions log.


### RocksDB tuning {#rocksdb-tuning}

RocksDB is being used by XT as an index store, and as the result, it might consume quite a significant amount of resources.
In order to avoid possible issues with the memory budgeting, it's recommended to [set RocksDB block cache to 1/3 of available memory](https://github.com/facebook/rocksdb/wiki/Setup-Options-and-Basic-Tuning#block-cache-size) which can be done in XTDB configuration.


### Readiness probes {#readiness-probes}

Depending on your technology stack that you use for XTDB deployment, consuming the transaction log even with the checkpoints feature enabled can take some time — and even though the starting node is able to handle REST API requests, they won't be processed until the node finishes the consumption.

To avoid that, you might need to check the difference between the last submitted and last completed transactions, e.g. from a bash script:

```shell
#!/bin/bash
# scripts/readiness.sh: A script that compares the latest submitted and indexed transactions

set -e
THRESHOLD=1000

# Assumes that you have jq and curl installed
submitted_tx=`curl http://localhost:3000/_xtdb/latest-submitted-tx -H "Accept: application/json" -f | jq .txId`
completed_tx=`curl http://localhost:3000/_xtdb/latest-completed-tx -H "Accept: application/json" -f | jq .txId`
diff=$[submitted_tx - completed_tx]

if ((diff > THRESHOLD)); then
    echo "Node is not ready"
    exit 1
else
    echo "Node is ready"
fi
```


### Load balancing and XT cluster {#load-balancing-and-xt-cluster}

The index storage is not shared between XTDB nodes — so every node might have a slightly different data representation. To ensure integrity, we might need to use _await-tx_ or _sync_ functions whenever we submit a transaction.

However, when we use REST API in a distributed cluster of nodes, it might be that the load balancer that stands in front of the nodes distributes requests to the database randomly — and when we submit a transaction to one node, we can end up reading data from another, which might have not processed that transaction yet.

If we want to prevent such situation, we might need to implement sticky sessions or use [HTTP2](https://dev.to/marleyspoon/taming-the-time-how-to-install-develop-with-xtdb-2lbf#http2) connections between your applications and database nodes.


## Conclusion {#conclusion}

XTDB embraces the bitemporality concept and provides powerful capabilities of handling your data in an immutable way.

However, this also implies that during your journey with XT, you might face some technical challenges caused by its unbundled database concept — and resolve them by reasoning about the selected components, technology stack, and implications.

The new milestone in XTDB's development — [XTDB 2.0](https://www.xtdb.com/v2) — looks very promising for us as it has a more flexible and scalable architecture as well as the first-class SQL support — and can be used by PostgreSQL clients.

We look forward to trying out the new version and hope that you've enjoyed our series of articles about XT.

Happy hacking, and stay tuned!
