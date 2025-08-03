---
title: "Objetos que no merecen un ID: Usando composed_of en Rails"
date: 2025-08-02
draft: false
tags: ["rails", "ruby", "patrones-de-diseño", "value-objects"]
categories: ["programación"]
description: "Aprende cómo usar composed_of de Rails para modelar objetos de valor que representan múltiples atributos como una única unidad conceptual, sin la sobrecarga de tablas de base de datos o concerns."
author: "Bruno Costanzo"
image: "/blog/images/posts/rails-composed-of.png"
keywords: ["rails", "ruby", "composed_of", "value objects", "patrones de diseño", "desarrollo web", "programación orientada a objetos"]
---

En el mundo real (y en el código), hay entidades que se sitúan en algún lugar entre un escalar simple y un objeto completo. ¿Qué significan realmente cosas como _80 kilogramos_, _25 kilómetros por hora_ o _25×25×50 cm_? Claramente no son escalares en el sentido estricto—no pueden reducirse a un valor único como _25_ o _"Buenos Aires"_. Pero también comparten un rasgo clave con los escalares: no existen por sí solos en la realidad. _80 kilogramos_ describe el peso de algo, así como _25 km/h_ representa la velocidad de algo. Las dimensiones describen una caja, un mueble o un piano—pero significan poco por sí solas.

Por eso estas entidades son difíciles de categorizar. Cuando las modelamos en código, es fácil caer en representaciones incómodas o incompletas. Afortunadamente, Rails nos brinda una herramienta poderosa: el método de clase `composed_of`, que ayuda a modelar estas combinaciones de valores de una manera que es tanto precisa como expresiva.

## ¿Cuándo deberías usar `composed_of`?

Hay dos señales bastante intuitivas de que podrías querer usar `composed_of`. La primera es cuando notas un conjunto de atributos del modelo que siempre se usan juntos y esencialmente forman su propia entidad conceptual. Por ejemplo, digamos que tu modelo `Hotel` tiene atributos `latitude` y `longitude`, y siempre los tratas como una unidad única: una coordenada geográfica.

Aquí hay un enfoque común pero defectuoso:

```ruby
class Hotel < ApplicationRecord
  def coordinates = [latitude, longitude]

  def distance_to(other_hotel)
    lat1, lon1 = latitude, longitude
    lat2, lon2 = other_hotel.latitude, other_hotel.longitude

    rad_per_deg = Math::PI / 180
    r_km = 6371 # radio promedio de la Tierra en km
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

Esto funciona, pero carece de claridad semántica. No modela explícitamente la idea de que `latitude` y `longitude` forman un concepto único. También falla en encapsular comportamientos útiles como validación o cálculos de distancia. Para limpiar esto, podríamos considerar dos caminos alternativos—ambos mejores, pero no ideales.

## Creando un nuevo modelo

Un enfoque es crear un modelo `Coordinate` separado que encapsule este comportamiento. Esto facilita las validaciones y añade claridad.

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

Esta es una mejora sólida, pero añade complejidad extra. Cada vez que cargas un hotel, también necesitas cargar su registro de coordenadas para evitar consultas N+1.

## Usando Concerns

Otra opción es definir un módulo (un `ActiveSupport::Concern`) que encapsule la lógica de coordenadas directamente dentro de `Hotel`.

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

Esta es una mejora sobre una tabla separada. Permite la validación y te permite comparar cualquier dos objetos geocodificables, ya sean Hoteles o Parques Temáticos. Pero las coordenadas siguen siendo solo dos atributos sueltos. No hay inmutabilidad, y nada te impide actualizar uno sin el otro, lo cual no tiene sentido para algo que representa un punto único.

Este enfoque también sufre de contaminación del espacio de nombres: métodos como `distance_to` ahora viven justo al lado de la lógica de negocio como `hotel.name` o `hotel.check_availability`. Se vuelve más difícil razonar sobre qué pertenece al dominio del hotel y qué pertenece a la lógica de ubicación. Y como los métodos están dispersos, pierdes el sentido de las coordenadas como un concepto cohesivo.

## La solución elegante: `composed_of`

Afortunadamente, Rails nos da una forma limpia y expresiva de modelar objetos de valor con múltiples atributos—sin tablas adicionales o problemas de espacio de nombres: `composed_of`.

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
                  raise ArgumentError, "No se puede convertir #{value.inspect} a Coordinate"
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

### Ejemplos

```ruby
hotel1 = Hotel.create!(name: "Hilton", coordinates: [40.7128, -74.0060])
hotel2 = Hotel.create!(name: "Marriott", coordinates: { latitude: 40.7580, longitude: -73.9855 })

distance = hotel1.coordinates.distance_to(hotel2.coordinates) # => 7.3 km
```

### Beneficios de `composed_of`

- **Inmutabilidad garantizada**: Rails trata el objeto de valor como atómico—actualizado como un todo o no actualizado.
- **API flexible y moderna**: Gracias al pattern matching, se soportan múltiples formatos de entrada de manera limpia.
- **Validaciones donde pertenecen**: Las reglas de Coordinate viven en `Coordinate`, no dispersas entre modelos.
- **Comparación basada en valores**: Rails compara por contenido, no por identidad de objeto.
- **Cero configuración extra**: Sin migraciones, sin índices, sin asociaciones que conectar.

## Conclusión

`composed_of` te permite modelar conceptos que, aunque están formados por múltiples valores, representan una unidad única en tu dominio. Es el ajuste perfecto para esos valores "no-exactamente-un-objeto" que no merecen su ID, pero sí merecen algo más que valores escalares. La próxima vez que detectes un par (o grupo) de atributos que siempre aparecen juntos, representan un concepto unificado o llevan su propia lógica, considera usar `composed_of`. Terminarás con código que es más expresivo, más correcto en términos de dominio y más fácil de mantener.
