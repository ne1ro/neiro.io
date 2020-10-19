---
layout: post
title: Query Object in Ruby on Rails
tags: [programming, ruby, rails, oop, query, db]
---

Database queries are common when you develop web applications. *Ruby on Rails*
 and it's *ActiveRecord* liberates you from writing tons of boilerplate SQL code and results in creation of elegant, eloquent queries in plain Ruby.

![](https://cdn-images-1.medium.com/max/1600/1*-oIlwIWlt0BDN4b5a9rRCQ.png)

But plenty of immense possibilities that Ruby and ActiveRecord provide,
unfortunately, remain unused. I bet that often you see a lot of enormous scopes
in Ruby on Rails models, endless chains of queries in controllers and even bulky
chunks of raw SQL.

{% highlight ruby %}
  @articles = Article
              .includes(:user)
              .order("created_at DESC")
              .where("text IS NOT NULL")
              .page(page)

  @articles = Articles
              .connection
              .select_all(%Q{SELECT  articles.* FROM articles
                          WHERE (text IS NOT NULL)  ORDER BY
                          created_at DESC LIMIT 5 OFFSET 0})
{% endhighlight %}
*Bad cases of using ActiveRecord queries*

These poor practices may create obstacles and become a reason of developer’s
headaches in the real-world web applications.

### Typical DB queries application problems:

* Big pieces of queries code in controllers/models/services mess up your code
* It is hard to understand complex database requests
* Inserts of raw SQL are non-consistent and often mix with ActiveRecord queries
* Testing one separate query in isolation is very problematic
* It is difficult to compose, extend or inherit queries
* Often Single Responsibility Principle gets violated

### Solution:

These problems can be solved by using *Query Object* pattern — a common
technique that isolates your complex queries.

*Query Object* in ideal case is a separate class that contains one specific
query that implements just one business logic rule.

### Implementation:

For most of the cases *Query Object* is PORO that accepts relation in
constructor and defines queries named like an *ActiveRecord* common methods:

{% highlight ruby %}
  # app/models/article.rb
  class Article < ActiveRecord::Base
    scope :by_title, ->(direction) { order title: direction }
    scope :by_date, ->(direction) { order created_at: direction }
    scope :by_author, ->(direction) { order "users.full_name #{direction}" }
  end

  # app/queries/ordered_articles_query.rb
  class OrderedArticlesQuery
    SORT_OPTIONS = %w(by_date by_title by_author).freeze

    def initialize(params = {}, relation = Article.includes(:user))
      @relation = relation
      @params = params
    end

    def all
      @relation.public_send(sort_by, direction)
    end

    private

    def sort_by
      @params[:sort].presence_in(SORT_OPTIONS) || :by_date
    end

    def direction
      @params[:direction] == "asc" ? :asc : :desc
    end
  end

  # app/controllers/articles_controller.rb
  class ArticlesController
    def index
      @articles = OrderedArticlesQuery.new(sort_query_params).all.page(params[:page])
    end

    private

    def sort_query_params
      params.slice(:sort_by, :direction)
    end
  end
{% endhighlight %}
*Query Object implementation and usage in controller*

#### HEREDOC syntax for raw SQL:

For the cases where you desperately need to use raw SQL code try to isolate it
using Ruby’s *HEREDOC syntax:*

{% highlight ruby %}
  class PopularArticlesQuery
    POPULAR_TRESHOLD = 5
   
    def initialize(subscriptions = Subscription.all)
      @subscriptions = subscriptions
    end
   
    def all
      @subscriptions.where(query)
    end
   
    private
   
    def query
      <<-SQL
        articles.comments_count >= #{POPULAR_TRESHOLD}
        AND articles.content IS NOT NULL
        AND articles.status = #{Article::STATUSES[:published]}
        ORDER BY articles.comments_count DESC
      SQL
    end
  end
{% endhighlight %}

*HEREDOC syntax example for raw SQL inserts*

#### Extending scope:

If your scope relates to existing *QueryObject*, you can easily extend its
relation instead of cluttering up your models.
[ActiveRecord::QueryMethods.extending](http://apidock.com/rails/ActiveRecord/QueryMethods/extending)
method will help you:

{% highlight ruby %}
  class OrderedArticlesQuery
    SORT_OPTIONS = %w(by_date by_title by_author).freeze
   
    def initialize(params = {}, relation = Article.includes(:user))
      @relation = relation.extending(Scopes)
   
      @params = params
    end
   
    def all
      @relation.public_send(sort_by, direction)
    end
   
    private
   
    def sort_by
      @params[:sort].presence_in(SORT_OPTIONS) || :by_date
    end
   
    def direction
      @params[:direction] == "asc" ? :asc : :desc
    end
   
    # Group additional scope methods in module in order to extend relation
    module Scopes
      def by_title(direction)
        order(title: direction)
      end
   
      def by_date(direction)
        order(created_at: direction)
      end
   
      def by_author
        order("users.full_name #{direction}")
      end
    end
  end
{% endhighlight %}

*Extending scope for Query Objects relations*

### Composing Query Objects:

*Query Objects* should be devised to support composition with other *Query
Objects* and other ActiveRecord relations. In the example below two composed
Query Objects represent one SQL query:

{% highlight ruby %}
  class FeaturedQuery
    def initialize(relation = Article.all)
      @relation = relation
    end
   
    def all
      @relation.where(featured: true).where("views_count > ?", 100)
    end
  end

  class ArticlesController
    def index
      @articles = FeaturedArticlesQuery.new(sorted_articles).all
      #  SELECT  "articles".* FROM "articles" WHERE "articles"."featured" = $1
      # AND (views_count > 100) ORDER BY "articles"."created_at" DESC LIMIT 10 OFFSET 0  [["featured", "t"]]
    end
   
    private
   
    def sorted_articles
      SortedArticlesQuery.new(sort_query_params).all
    end
   
    def sort_query_params
      { sort: :by_title, direction: :desc }
    end
  end
{% endhighlight %}

*Composing two Query Objects*

### Inheritance of Query Objects:

If you have similar queries you may want them to be inherited to reduce
repetition and follow DRY principle:

{% highlight ruby %}
  class ArticlesQuery
    TEXT_LENGTH = 3
   
    def initialize(comments = Comment.all)
      @comments = comments
    end
   
    def all
      comments
        .where("user_id IS NOT NULL")
        .where("LENGTH(content) #{condition}")
    end
   
    def condition
      "> #{TEXT_LENGTH}"
    end
  end
   
  class LongArticlesQuery < ArticlesQuery
    TEXT_LENGTH = 5
   
    def condition
      ">= #{TEXT_LENGTH}"
    end
  end
{% endhighlight %}

*Inheritance of Query Objects*

### Testing Query Objects:

Query Objects should be designed to be pleasant for testing. In most cases you
just need to test core methods defined in query for their results:

{% highlight ruby %}
  require "rails_helper"
   
  describe LongArticlesQuery do
    describe "#all" do
      subject(:all) { described_class.new.all }
    
      before do
        create :article, text: "abc"
        create :article, text: "this is long article"
      end
       
      it "returns one short comment" do
        expect(all.size).to eq(1)
      end
    end
  end
{% endhighlight %}

*Testing Query Objects*

### Summary:

#### Good Query Object:

* Follows *Single Responsibility Principle*
* Can be easily tested in isolation
* Can be combined/extended with another Query Object
* Can be effortlessly reused in any other parts of an application
* Returns *ActiveRecord::Relation*, not *Array*
* Represents only database query, not business logic or action
* Methods of Query Object are named like *ActiveRecord* methods (*all, last,
count, etc*)

#### Use Query Objects when:

* You need to reuse one query in multiple places of application
* You need to extend, compose or inherit queries and their relations
* You need to write a lot of raw SQL, but don’t want to mess up your code
* Your query is too complex / vast for just one method or scope
* Your query causes *feature envy*

#### Don’t use Query Objects when:

* Your query is simple enough for just one method or scope
* You don’t need to extend, compose or inherit your query
* Your query is unique and you don’t want to make it reusable


I hope this article will help you to build awesome queries in your applications.
Good luck and happy coding!
