+++
title = "Bitemporality, or how to change the past"
author = ["neiro"]
date = 2022-12-21T13:20:00+01:00
tags = ["bitemporality", "architecture", "databases"]
draft = false
+++

_The article was originally posted on [MarleySpoon Dev Blog](https://dev.to/marleyspoon/bitemporality-or-how-to-change-the-past-3k4f)_

We can definitely see the whole history of humanity as a chain of _events_:
tiny events, big events, huge events, crucial events – some of them were negligible and some, on the contrary, predefined the next link in the chain and changed the way our world looks now.

However, the more details we dig out about our history, the more white spots we erase, the more surprising and even contradictious things we see – things that sometimes can completely refute our views and assumptions. Things that we thought and believed to be **facts** can be invalidated – and we will need to **alter the past**.

Every kind of record system is not perfect and can contain errors. But what if we wanted to build a system that is resilient to such errors? What if we wanted to change the past but keep the history as a track of facts?


## Updates in place {#updates-in-place}

Throughout almost all the existence of computers and computer science, resources were the biggest limitation and one of the most complex issues.

Our progress allowed us to switch from bytes to kilobytes, from kilobytes to mega and gigabytes. Modern PCs, smartphones, and cloud systems can easily handle virtually unlimited amounts of data.

**The storage**, which was physically enormous at the beginning of the computer era and started with devices taking over the halls and rooms, moved to CDs, floppy disks and hard drives – so we could even carry movies, tons of photos and music in our pockets. The storage, which always seemed to be the problem, became the smallest of our headaches when it came to building software.

Nonetheless, the habit _(the bad one)_ we inherited from the dawn of the computer era is still there and arguably is one of the biggest developer's headaches – **mutability**. Before the progress in the storage capacity, we were very careful with how we consumed the RAM and disk space, and that forced us to mutate variables and data instead of persisting them in the immutable way, i.e. saving a new record instead of updating an existing one.

That habit is still haunting us, even though functional programming languages and [the immutability approach](https://en.wikipedia.org/wiki/Immutable_object) are on the rise, we still _(mostly)_ update our records in place – as that is the way most popular databases are built.


### An audit system {#an-audit-system}

How can we design a record tracking system using a common mutable DB? Let's say we use PostgreSQL and define a simple `audits` table:

| Company      | Issues found | Auditor | Date       |
|--------------|--------------|---------|------------|
| BullSheepInc | 180          | Joe     | 15.09.2021 |
| OverHypeD    | 420          | Max     | 14.02.2022 |
| BullSheepInc | 0            | Max     | 15.02.2022 |

However, one and a half months ago we've discovered that Max forgot to write down the records for BullSheepInc — and as the column has default of `0`, we were unaware of the change for quite some time. Now, if we want to fix it, we have to **overwrite** the existing record:

| Company      | Issues found | Auditor | Date       |
|--------------|--------------|---------|------------|
| BullSheepInc | 180          | Joe     | 15.09.2021 |
| OverHypeD    | 420          | Max     | 14.02.2022 |
| BullSheepInc | **101**      | Max     | 01.04.2022 |

The drawbacks of such an approach are clearly visible: we've lost track of the changes and forgot about the mistake. As our reports were already sent, there won't be any punishment for BullSheepInc.


## Temporality {#temporality}

The next step from mutability to our goal of designing a perfect track record system will be to **persist changes as facts**, instead of updating data in place.
  In order to build a truly immutable system we want to disallow overriding records in our audit system. Instead, we will be storing any kind of data change as a
separate row in the database:

| Company      | Issues found | Auditor | Date       |
|--------------|--------------|---------|------------|
| BullSheepInc | 180          | Joe     | 15.09.2021 |
| OverHypeD    | 420          | Max     | 14.02.2022 |
| BullSheepInc | **0**        | Max     | 15.02.2022 |
| BullSheepInc | **101**      | Max     | 01.04.2022 |

It looks like this option worked out better for us; now we see that the inventory record change was tracked and we've actually discovered some issues.
We could stop there and pretend we've built the most advanced audit system, but that would be too far away from being the truth, as soon we've got yet another request ...


## Retroactive changes {#retroactive-changes}

Once our employees started seeing not just audit records but also data fixes, John has recalled that it was actually him who did the counting, and the amount of found issues was actually _99_ instead of _101_.
We've got a serious problem now as the new record doesn't fit into our data model:

| Company      | Issues found | Auditor  | Date       |
|--------------|--------------|----------|------------|
| BullSheepInc | 180          | Joe      | 15.09.2021 |
| OverHypeD    | 420          | Max      | 14.02.2022 |
| BullSheepInc | 0            | Max      | 15.02.2022 |
| BullSheepInc | **101**      | **Max**  | 01.04.2022 |
| BullSheepInc | **99**       | **John** | 01.05.2022 |

Which record is really _valid_ now? Should we trust Max or John? How should we define what was the error and **how it was corrected** ?
That's where the concept of **bitemporality** comes to the rescue.


## Bitemporality {#bitemporality}

In the example above, we have only one time column: the record, or _transaction date_.
Bitemporality assumes adding another time dimension — the so-called **valid time** or effective time — along the **transaction time** for tracking **when the change really happened**.

**Transaction time** represents the time when the record was inserted into the data storage. This can be quite useful for audit purposes, tracking changes and event sourcing.
**Valid time** represents when the change became _valid_ and happened in the real world.

If we follow these definitions we can say that _transaction_ time is the time we _thought_ the data was correct at that point in time — and it was _actually_ correct on the **valid** time:

> On the 15th of February, we’ve thought Max has not found any issues.
> On the 1st of April, Max corrected the number of issues to be 101.
> On May 1st, we’ve discovered that John actually found 99 issues.
> In reality, we want the actual amount of issues recorded to be 99 as of 15th of February.

In a bitemporal system transaction time is immutable and can be only increased while valid time can be any past or future timestamp.
Let's see how we can redesign the audit system using these two time dimensions:


### The perfect audit system™ {#the-perfect-audit-system}

Now that we know how to utilise transaction and valid dates, we can change our records by writing the record time as _transaction date_ and
time when it became valid as _valid time_:

| Company      | Issues found | Auditor | Transaction date | Valid date |
|--------------|--------------|---------|------------------|------------|
| BullSheepInc | 180          | Joe     | 15.09.2021       | 15.09.2021 |
| OverHypeD    | 420          | Max     | 14.02.2022       | 14.02.2022 |
| BullSheepInc | 0            | Max     | 15.02.2022       | 15.02.2022 |
| BullSheepInc | 101          | Max     | 01.04.2022       | 15.02.2022 |
| BullSheepInc | 99           | John    | 01.05.2022       | 15.02.2022 |

Let's execute some queries to our database:

```ruby
module Audit
  # @returns [Hash] a hash with auditor, issues found and transaction date fields
  def get_record(company, valid_date = nil, transaction_date = nil)
    # calling the DB ...
  end
end

> Audit.get_record("BullSheepInc")
# {auditor: "John", issues_found: 99, transaction_date: "01.05.2022"}
> Audit.get_record("BullSheepInc", "15.09.2021")
# {auditor: "Joe", issues_found: 180, transaction_date: "15.09.2021"}
> Audit.get_record("BullSheepInc", "01.01.2021")
# nil - we didn't inspect the company as of 01.01.2021
> Audit.get_record("BullSheepInc", "15.02.2022", "01.04.2022")
# {auditor: "Max", issues_found: 101, transaction_date: "01.04.2022"}
```

As you can see, now we have the latest correct value returned by default,
but we can also fetch the record the record as it was on a given valid date in the past.


### Use-cases {#use-cases}

Bitemporality can be proven useful for any system where you have a track of the data and where it's _possible_ to have errors and recover them:

-   payrolls, payment systems
-   auditing
-   risk systems
-   blockchains
-   insurance
-   compliance &amp; privacy
-   temporal data management
-   event-based systems
-   distributed transactions


## Cross-time Database {#cross-time-database}

Supporting bitemporality in an existing database might be not a trivial task, especially when it comes to the traditional relational database where we all relations between tables should also take into account bitemporal columns.

At the moment, the most prominent open-source solution is [XTDB (or cross-time) database](https://xtdb.com) developed by [JUXT](https://juxt.pro) which has a lot of benefits compared to its competitors:

-   Bitemporal at its core
-   Supports retroactive corrections
-   Document&amp;graph based (ultimately a store of versioned documents)
-   [Datalog queries](https://en.wikipedia.org/wiki/Datalog) and SQL support
-   Data eviction (supports eviction of active and historical data to assist with technical compliance for information privacy regulations)
-   Distributed and scalable
-   Unbundled database (can be deployed on top of many existing technologies and databases like Kafka, JDBC, AWS S3)
-   Can be easily integrated into any existing JVM application or connected using its REST API

As we will explore more in the next articles, XTDB can be used as a ready solution for building immutable and bitemporal software.


## What's next? {#what-s-next}

As one can see, bitemporality can be a perfect match for cases where we build systems that are:

1.  Tracking the history of changes or how data was changing over time
2.  Can potentially have errors, corrections or data adjustments

If we take that concept as the cornerstone of such systems there will be way more chances they will be successful and
we will escape from mutability issues.

We can also recommend some more reading on the topic:

-   [Martin Fowler on Bitemporality](https://martinfowler.com/articles/bitemporal-history.html)
-   [XTDB — the open database with temporal graph query](https://xtdb.com/)
-   [Bitemporality concept in XTDB docs](https://docs.xtdb.com/concepts/bitemporality/)

In the upcoming article we will share our experience working with XTDB, connecting to it from an Elixir application and what we learned from it.

Happy Hacking and stay tuned!

Thanks [Carsten](https://dev.to/carpmeister) for the review!
