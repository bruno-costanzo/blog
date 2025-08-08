---
title: "A controlled migration for Rails applications"
date: 2025-08-08
draft: false
tags: ["rails", "ruby", "cloud", "guide"]
categories: ["programming"]
description: "Migrating a Rails application is a complex task. This guide will help you understand the necessary steps to guarantee a clear process."
author: "Bruno Costanzo"
image: "/blog/images/posts/migrating-a-rails-application.jpg"
keywords: ["rails", "ruby", "cloud", "web development"]
---

When it comes to migrating a Rails application, it's important to understand the necessary steps to guarantee a clear process. If we don't dedicate some time to this analysis, it's likely that at some point we'll have the feeling of stepping on unsafe ground. When dealing with tectonic movements like servers and databases, these insecurities can result directly in a blockage: what's at stake is not one more or less bug, but the loss of our users' information.

## Duplicating the application: the key step

Whether it's Heroku, AWS, or any service we're using, a fundamental step to migrate our Rails application is to understand that the same application can be duplicated in two different places, without altering the behavior of the original at all. Starting from this point gives us the confidence and security to understand that we can work on our migration calmly without altering the users' experience.

That said, we can enumerate the process steps like this:

## 1. Create a new application on another server

Provision the new environment with the same stack we have in the original application. For Rails, this means PostgreSQL, Redis, Nginx, and the system dependencies our application needs (ImageMagick, libvips, Node.js, etc.). If we use Docker, we need to make sure the `Dockerfile` is identical.

## 2. Install the necessary system dependencies

The dependencies are documented in our `Dockerfile` or `.buildpacks`. In Rails, we typically need: PostgreSQL client libraries, Redis tools, image processors, Node.js for assets, and build tools for native gems. The gems will be installed automatically with `bundle install` during deployment.

**Important point:** The versions of Ruby, Rails, PostgreSQL, and Redis must match between both servers.

## 3. Configure secrets and environment variables

If our Rails application connects to external services with API keys, tokens, Client IDs, we can copy the entire list of secrets so that the new application has the same access:

* `SECRET_KEY_BASE` (generate a new one with `rails secret`)
* API keys and tokens from external services (Stripe, SendGrid, AWS, etc.)
* Redis URLs and other services

**Tip:** Use a `.env` file to organize everything and make sure `RAILS_ENV=production`.

## 4. Extra configuration in external services

There are some cases where external services (like Google OAuth) also need extra configuration in their consoles, like the redirect domain. This can be useful for testing, since the last thing we're going to migrate is the domain, so registering our server's temporary domain can help us.

**Services that require configuration:** Google OAuth, GitHub OAuth, Stripe webhooks, SendGrid domain authentication, CDNs.

## 5. Configure deployments to the new application

Configure our deployment system (Capistrano, GitHub Actions, etc.) to be able to deploy to the new server. It's important that we still don't delete the previous application, since it's still active.

## 6. Configure the database

If we're going to migrate the database as well, we must create a new database on the server and set it as the database URL for our new application. If we don't plan to migrate the database, we can simply set the same database URL in both applications for initial testing.

**Configuration in `database.yml`:** Make sure to use `DATABASE_URL` from environment variables and configure the connection pool appropriately.

## 7. Deploy and verify the application

At this point, we can already deploy the application to the new server and it should work. If we have a new database, we probably won't have any users or information.

**Create a health check endpoint** that verifies:

* Database connection
* Redis connection
* Storage services (S3, etc.)
* Any critical service

ruby

```ruby
# Simple example in app/controllers/health_controller.rb
def check
  {
    database: ActiveRecord::Base.connection.execute('SELECT 1'),
    redis: Rails.cache.write('test', 'ok'),
    storage: ActiveStorage::Blob.service.exist?('test')
  }
end
```

## 8. Install SSL certificates

Configure SSL with Let's Encrypt or our preferred provider. Configure Nginx to serve the Rails application and handle static assets directly.

## 9. Make a dump of the original database and install it in the new database

This is the most critical step:

1. **Make backup** of the original database (`pg_dump`)
2. **Restore** in the new database (`psql`)
3. **Run pending migrations** (`rails db:migrate`)
4. **Verify integrity** (record counts, critical data)

At this point, I recommend browsing the application and, if possible, doing some tests with a user who belongs to the development team.

## 10. Migrate the domain and delete the old application

Change the DNS records to point to the new server. Once everything is working as expected, we can remove the remote repository of the old application and delete the server or application from the external service we used (saving some money in the future).

## Key principles we must remember

**Duplication before migration:** Always have a working copy before moving anything.

**Verification at each step:** Each phase must be verifiable before continuing.

**Rollback plan:** Always have a quick way to go back.

**Don't delete anything:** Keep the original application until we're 100% sure the new one works perfectly.

This strategy gives us the peace of mind to undertake a risk-free migration, knowing that we can always revert to our previous state if something goes wrong.
