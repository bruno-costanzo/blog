# Guía de optimización SEO y Redes Sociales

## Configuración implementada

### 1. **SEO Mejorado**
- Meta tags completas (título, descripción, keywords, autor)
- Schema.org/JSON-LD para rich snippets en Google
- URLs canónicas
- Robots meta tags optimizados

### 2. **Open Graph (Facebook, LinkedIn)**
- Imágenes optimizadas para compartir
- Tipo de contenido (article/website)
- Fecha de publicación y modificación
- Autor y categorías

### 3. **Twitter Cards**
- Formato `summary_large_image` para mejor visualización
- Soporte para handle de Twitter (@usuario)

## Cómo usar las nuevas características

### En tus posts

Añade estos campos al frontmatter de tus posts:

```yaml
---
title: "Tu título del post"
date: 2025-01-15
draft: false
description: "Una descripción concisa de tu post (máximo 160 caracteres)"
author: "Bruno Costanzo"
image: "/images/posts/mi-post-imagen.jpg"
categories: ["programación", "tutoriales"]
tags: ["rails", "ruby", "desarrollo"]
keywords: ["palabra clave 1", "palabra clave 2", "palabra clave 3"]
---
```

### Imágenes para redes sociales y posts

1. **Tamaño recomendado**: 1200x630px (proporción 1.91:1)
2. **Ubicación**: Guarda las imágenes en `static/images/posts/`
3. **Formato**: Preferiblemente JPG para fotos, PNG para gráficos
4. **Tamaño de archivo**: Intenta mantenerlo bajo 500KB

**IMPORTANTE**: La imagen especificada en el campo `image:` del frontmatter ahora:
- Se muestra como imagen destacada al principio del post
- Se usa para las vistas previas en redes sociales
- Aparece con un efecto de hover y sombra

### Configuración global

En `config.toml`:
- `twitter`: Cambia "tu_usuario_twitter" por tu handle real
- `defaultImage`: Reemplaza `/images/default-social.png` con una imagen real de 1200x630px
- `keywords`: Ajusta las palabras clave globales según tu contenido

## Mejores prácticas

1. **Títulos**: Mantén los títulos entre 50-60 caracteres
2. **Descripciones**: Entre 120-160 caracteres, concisas y atractivas
3. **Imágenes**: Incluye texto en la imagen que resuma el contenido
4. **Keywords**: Usa 5-10 palabras clave relevantes por post

## Verificación

Después de publicar, verifica cómo se ven tus posts en:
- [Facebook Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Creación de nuevos posts

Usa el comando:
```bash
hugo new posts/mi-nuevo-post.md
```

Esto creará un post con todos los campos necesarios para SEO y redes sociales.