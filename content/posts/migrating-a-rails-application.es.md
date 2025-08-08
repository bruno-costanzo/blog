---
title: "Una migración controlada para aplicaciones Rails"
date: 2025-08-08
draft: false
tags: ["rails", "ruby", "cloud", "guide"]
categories: ["programming"]
description: "Migrar una aplicación Rails es un proceso complejo. Este guía te ayudará a entender los pasos necesarios para garantizar un proceso claro."
author: "Bruno Costanzo"
image: "/blog/images/posts/migrating-a-rails-application.jpg"
keywords: ["rails", "ruby", "cloud", "web development"]
---

Cuando se trata de migrar una aplicación Rails es importante comprender bien los pasos necesarios para garantizar un proceso claro. Si no dedicamos un poco de tiempo a este análisis, es probable que en algún momento tengamos la sensación de estar pisando terreno no seguro. Cuando se trata de movimientos tectónicos como servidores y bases de datos, estas inseguridades pueden resultar directamente en un bloqueo: lo que está en juego no es un bug más o menos, sino la pérdida de información de nuestros usuarios.

## Duplicar la aplicación: el paso clave

Ya sea Heroku, AWS o cualquier servicio que estemos usando, un paso fundamental para migrar nuestra aplicación Rails es entender que la misma aplicación puede duplicarse en dos lugares distintos, sin alterar para nada el comportamiento de la original. Partir desde este punto nos da la confianza y seguridad para entender que podemos trabajar en nuestra migración tranquilos sin alterar la experiencia de los usuarios.

Dicho esto, podemos enumerar los pasos del proceso así:

## 1. Crear una nueva aplicación en otro servidor

Provisionar el nuevo entorno con el mismo stack que tenemos en la aplicación original. Para Rails esto significa PostgreSQL, Redis, Nginx y las dependencias del sistema que nuestra aplicación necesite (ImageMagick, libvips, Node.js, etc.). Si usamos Docker, hay que asegurarse de que el `Dockerfile` sea idéntico.

## 2. Instalar las dependencias necesarias del sistema

Las dependencias están documentadas en nuestro `Dockerfile` o `.buildpacks`. En Rails típicamente necesitamos: PostgreSQL client libraries, Redis tools, procesadores de imagen, Node.js para assets, y build tools para gemas nativas. Las gemas se van a instalar automáticamente con `bundle install` durante el deployment.

**Punto importante:** Las versiones de Ruby, Rails, PostgreSQL y Redis deben coincidir entre ambos servidores.

## 3. Configurar los secretos y las variables de entorno

Si nuestra aplicación Rails se conecta a servicios externos con API keys, tokens, Client IDs, podemos copiar la lista entera de secrets para que la nueva aplicación tenga los mismos accesos:

* `SECRET_KEY_BASE` (generar uno nuevo con `rails secret`)
* API keys y tokens de servicios externos (Stripe, SendGrid, AWS, etc.)
* URLs de Redis y otros servicios

**Consejo:** Usar un archivo `.env` para organizar todo y asegurarse de que `RAILS_ENV=production`.

## 4. Configuración extra en servicios externos

Hay algunos casos en que servicios externos (como Google OAuth) necesitan también una configuración extra en sus consolas, como el dominio de redireccionamiento. Esto puede ser útil para las pruebas, ya que lo último que vamos a migrar es el dominio, entonces registrar el dominio temporal de nuestro servidor puede ayudarnos.

**Servicios que requieren configuración:** Google OAuth, GitHub OAuth, Stripe webhooks, SendGrid domain authentication, CDNs.

## 5. Configurar los deployments a la nueva aplicación

Configurar nuestro sistema de deployment (Capistrano, GitHub Actions, etc.) para poder desplegar al nuevo servidor. Es importante que todavía no borremos la aplicación anterior, ya que todavía está vigente.

## 6. Configurar la base de datos

Si vamos a migrar también la base de datos, debemos crear una nueva base de datos en el servidor y establecerla como la URL de la base de datos de nuestra nueva aplicación. Si no pensamos migrar la base de datos, podemos simplemente establecer la misma URL de la base de datos en ambas aplicaciones para testing inicial.

**Configuración en `database.yml`:** Asegurarse de usar `DATABASE_URL` desde las variables de entorno y configurar el pool de conexiones apropiadamente.

## 7. Desplegar y verificar la aplicación

En este punto, ya podemos desplegar la aplicación al nuevo servidor y debería funcionar. Si tenemos una base de datos nueva, es probable que no tengamos ningún usuario ni información.

**Crear un health check endpoint** que verifique:

* Conexión a base de datos
* Conexión a Redis
* Servicios de almacenamiento (S3, etc.)
* Cualquier servicio crítico

ruby

```ruby
# Ejemplo simple en app/controllers/health_controller.rb
def check
  {
    database: ActiveRecord::Base.connection.execute('SELECT 1'),
    redis: Rails.cache.write('test', 'ok'),
    storage: ActiveStorage::Blob.service.exist?('test')
  }
end
```

## 8. Instalar certificados SSL

Configurar SSL con Let's Encrypt o nuestro proveedor preferido. Configurar Nginx para servir la aplicación Rails y manejar assets estáticos directamente.

## 9. Hacer un dump de la base de datos original e instalarlo en la nueva base de datos

Este es el paso más crítico:

1. **Hacer backup** de la base de datos original (`pg_dump`)
2. **Restaurar** en la nueva base de datos (`psql`)
3. **Ejecutar migraciones** pendientes (`rails db:migrate`)
4. **Verificar integridad** (conteos de registros, datos críticos)

En este punto, te recomiendo navegar por la aplicación y, si es posible, hacer algunas pruebas con un usuario que pertenezca al equipo de desarrollo.

## 10. Migrar el dominio y borrar la aplicación antigua.

Cambiar los registros DNS para que apunten al nuevo servidor. Una vez que todo esté funcionando como esperamos, podemos eliminar el repositorio remoto de la aplicación vieja y borrar el servidor o la aplicación del servicio externo que hayamos utilizado (ahorrando algo de dinero en el futuro).


## Principios clave que debemos recordar

**Duplicación antes que migración:** Siempre tener una copia funcionando antes de mover nada.

**Verificación en cada paso:** Cada fase debe ser verificable antes de continuar.

**Plan de rollback:** Tener siempre una forma rápida de volver atrás.

**No borrar nada:** Mantener la aplicación original hasta estar 100% seguro de que la nueva funciona perfectamente.

Esta estrategia nos da la tranquilidad de hacer una migración sin riesgo, sabiendo que siempre podemos volver al estado anterior si algo sale mal.
