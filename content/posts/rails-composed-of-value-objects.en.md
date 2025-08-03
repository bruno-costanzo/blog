---
title: "Objects That Don't Deserve an ID: Using Rails composed_of"
date: 2025-08-02
draft: false
tags: ["rails", "ruby", "design-patterns", "value-objects"]
categories: ["programming"]
description: "Learn how to use Rails' composed_of to model value objects that represent multiple attributes as a single conceptual unit, without the overhead of database tables or concerns."
author: "Bruno Costanzo"
image: "/blog/images/posts/rails-composed-of.png"
keywords: ["rails", "ruby", "composed_of", "value objects", "design patterns", "web development", "object-oriented programming"]
---

In the real world (and in code), there are entities that sit somewhere between a plain scalar and a full-fledged object. What do things like _80 kilograms_, _25 kilometers per hour_, or _25×25×50 cm_ really mean? They're clearly not scalars in the strict sense—they can't be reduced to a single value like _25_ or _"Buenos Aires"_. But they also share a key trait with scalars: they don't exist on their own in reality. _80 kilograms_ describes the weight of something, just as _25 km/h_ represents the speed of something. Dimensions describe a box, a piece of furniture, or a piano—but mean little on their own.

That's why these entities are hard to categorize. When we model them in code, it's easy to fall into awkward or incomplete representations. Fortunately, Rails gives us a powerful tool: the `composed_of` class method, which helps model these value combinations in a way that's both precise and expressive.

## When Should You Use `composed_of`?

There are two pretty intuitive signs that you might want to use `composed_of`. The first is when you notice a set of model attributes that are always used together and essentially form their own conceptual entity. For example, say your `Hotel` model has `latitude` and `longitude` attributes, and you always treat them as a single unit: a geographic coordinate.

Here's a common but flawed approach:

```ruby
class Hotel < ApplicationRecord
  def coordinates = [latitude, longitude]

  def distance_to(other_hotel)
    lat1, lon1 = latitude, longitude
    lat2, lon2 = other_hotel.latitude, other_hotel.longitude

    rad_per_deg = Math::PI / 180
    r_km = 6371 # average Earth radius in km
    dlat_rad = (lat2 - lat1) * rad_per_deg
    dlon_rad = (lon2 - lon1) * rad_per_deg
    lat1_rad, lat2_rad = lat1 * rad_per_deg, lat2 * rad_per_deg

    a = Math.sin(dlat_rad / 2)**2 +
        Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    r_km * c
  end
end
```

This works, but it lacks semantic clarity. It doesn't explicitly model the idea that `latitude` and `longitude` form a single concept. It also fails to encapsulate useful behaviors like validation or distance calculations. To clean this up, we might consider two alternate paths—both better, but not ideal.

## Creating a New Model

One approach is to create a separate `Coordinate` model that encapsulates this behavior. This makes validations easy and adds clarity.

```ruby
class Coordinate < ApplicationRecord
  EARTH_RADIUS_KM = 6371

  belongs_to :locatable, polymorphic: true

  validates :latitude, presence: true,
            numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
            numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

  def distance_to(other_coordinate)
    rad_per_deg = Math::PI / 180
    dlat_rad = (other_coordinate.latitude - latitude) * rad_per_deg
    dlon_rad = (other_coordinate.longitude - longitude) * rad_per_deg

    lat1_rad = latitude * rad_per_deg
    lat2_rad = other_coordinate.latitude * rad_per_deg

    a = Math.sin(dlat_rad / 2)**2 +
        Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    EARTH_RADIUS_KM * c
  end

  def to_a = [latitude, longitude]
end
```

This is a solid improvement, but it adds extra complexity. Every time you load a hotel, you also need to load its coordinate record to avoid N+1 queries.

## Using Concerns

Another option is to define a module (an `ActiveSupport::Concern`) that encapsulates the coordinate logic directly inside `Hotel`.

```ruby
module Geocodable
  extend ActiveSupport::Concern

  EARTH_RADIUS_KM = 6371

  included do
    validates :latitude, presence: true,
              numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
    validates :longitude, presence: true,
              numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  end

  def coordinates = [latitude, longitude]

  def distance_to(other)
    ...
  end
end
```

This is an improvement over a separate table. It allows for validation and lets you compare any two geocodable objects, whether they're Hotels or Theme Parks. But the coordinates are still just two loose attributes. There's no immutability, and nothing stops you from updating one without the other, which doesn't make sense for something that represents a single point.

This approach also suffers from namespace pollution: methods like `distance_to` now live right next to business logic like `hotel.name` or `hotel.check_availability`. It becomes harder to reason about what belongs to the domain of the hotel and what belongs to location logic. And since the methods are scattered, you lose the sense of coordinates as a cohesive concept.

## The Elegant Solution: `composed_of`

Thankfully, Rails gives us a clean, expressive way to model value objects with multiple attributes—without extra tables or namespace issues: `composed_of`.

```ruby
class Coordinate
  include ActiveModel::Validations

  attr_reader :latitude, :longitude

  EARTH_RADIUS_KM = 6371

  validates :latitude, presence: true,
            numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true,
            numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }

  def initialize(latitude, longitude)
    @latitude = latitude
    @longitude = longitude
  end

  def distance_to(other)
    rad_per_deg = Math::PI / 180
    dlat_rad = (other.latitude - latitude) * rad_per_deg
    dlon_rad = (other.longitude - longitude) * rad_per_deg

    lat1_rad = latitude * rad_per_deg
    lat2_rad = other.latitude * rad_per_deg

    a = Math.sin(dlat_rad / 2)**2 +
        Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlon_rad / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    EARTH_RADIUS_KM * c
  end
end

class Hotel < ApplicationRecord
  composed_of :coordinates,
              class_name: 'Coordinate',
              mapping: [%w(latitude latitude), %w(longitude longitude)],
              allow_nil: true,
              converter: Proc.new { |value|
                case value
                in Coordinate
                  value
                in [latitude, longitude]
                  Coordinate.new(latitude, longitude)
                in { latitude: latitude, longitude: longitude }
                  Coordinate.new(latitude, longitude)
                else
                  raise ArgumentError, "Cannot convert #{value.inspect} to Coordinate"
                end
              }

  validate :coordinates_must_be_valid

  def coordinates_must_be_valid
    return unless coordinates.present?
    return if coordinates.valid?

    coordinates.errors.full_messages.each do |message|
      errors.add(:coordinates, message)
    end
  end
end
```

### Examples

```ruby
hotel1 = Hotel.create!(name: "Hilton", coordinates: [40.7128, -74.0060])
hotel2 = Hotel.create!(name: "Marriott", coordinates: { latitude: 40.7580, longitude: -73.9855 })

distance = hotel1.coordinates.distance_to(hotel2.coordinates) # => 7.3 km
```

### Benefits of `composed_of`

- **Guaranteed immutability**: Rails treats the value object as atomic—updated as a whole or not at all.
- **Flexible, modern API**: Thanks to pattern matching, multiple input formats are cleanly supported.
- **Validations where they belong**: Coordinate rules live in `Coordinate`, not scattered across models.
- **Value-based comparison**: Rails compares by content, not object identity.
- **Zero extra config**: No migrations, no indexes, no associations to wire up.

## Conclusion

`composed_of` lets you model concepts that, while made up of multiple values, represent a single unit in your domain. It's the perfect fit for those "not-quite-an-object" values that don't deserve their ID, but do deserve something more than scalar values. Next time you spot a pair (or group) of attributes that always show up together, represent a unified concept, or carry logic of their own, consider using `composed_of`. You'll end up with code that's more expressive, more domain-correct, and easier to maintain.