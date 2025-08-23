# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

1. **Always explain what you're doing**: The user's priority is learning. Before and after each action, explain:
   - What you're about to do and why
   - What the command/code does
   - What the results mean
   - Any important concepts or best practices involved

2. **Keep solutions simple and professional**:
   - Use established design patterns when applicable
   - Favor simplicity over complexity
   - Follow industry best practices
   - Explain the reasoning behind architectural decisions

## Project Overview

This is a multilingual personal blog built with Hugo static site generator, deployed to GitHub Pages. The blog supports both Spanish (primary) and English, uses a custom fork of the Cactus theme, and includes SEO optimizations and social media card support.

## Common Development Commands

```bash
# Run local development server (includes drafts)
hugo server -D

# Run local development server (published posts only)
hugo server

# Build the site for production with cleanup
rm -rf public/ && hugo --minify --gc --cleanDestinationDir

# Create a new blog post (Spanish)
hugo new posts/your-post-title.es.md

# Create a new blog post (English)
hugo new posts/your-post-title.en.md

# Clean Hugo module cache
hugo mod clean

# Update theme submodule
git submodule update --remote themes/cactus
```

## Architecture & Structure

### Key Directories
- `content/posts/` - Blog posts in Markdown with language suffixes (.es.md, .en.md)
- `content/` - Root content with about, contact, and projects pages for each language
- `themes/cactus/` - Custom fork of Cactus theme (Git submodule from https://github.com/bruno-costanzo/hugo-theme-cactus.git)
- `static/images/posts/` - Post images for featured images and social cards
- `static/css/` - Custom CSS overrides
- `layouts/` - Custom layout overrides (SEO, social cards, featured images)
- `public/` - Generated static site output (gitignored)
- `.github/workflows/` - GitHub Actions for automated deployment

### Content Format
Blog posts require comprehensive frontmatter for SEO and social media optimization:
```yaml
---
title: "Post Title"
date: YYYY-MM-DD
draft: false
description: "Concise description (max 160 chars for SEO)"
author: "Bruno Costanzo"
image: "/blog/images/posts/post-image.jpg"  # 1200x630px recommended
categories: ["programming"]
tags: ["rails", "ruby", "development"]
keywords: ["keyword1", "keyword2", "keyword3"]
---
```

### Multilingual Support
- Primary language: Spanish (es)
- Secondary language: English (en)
- Posts require language suffix: `.es.md` or `.en.md`
- URL structure: `/es/posts/` and `/en/posts/`
- Each language has its own menu configuration in `config.toml`

### Deployment
The site automatically deploys to GitHub Pages when changes are pushed to the main branch via the `.github/workflows/deploy.yml` workflow. The workflow:
1. Checks out the repository with submodules
2. Installs Hugo extended version
3. Builds the site with `hugo --minify`
4. Uploads the `public/` directory as artifacts
5. Deploys to GitHub Pages

The site is accessible at https://bruno-costanzo.github.io/blog/

### Theme Management
The Cactus theme is managed as a Git submodule pointing to a custom fork at https://github.com/bruno-costanzo/hugo-theme-cactus.git. The submodule is automatically initialized during the GitHub Actions deployment process.

## Configuration

Main configuration is in `config.toml`:
- Base URL: https://bruno-costanzo.github.io/blog/
- Languages: Spanish (primary, es) and English (en)
- Analytics: Google Analytics 4 (G-H5GJBVQWGP)
- Theme: cactus (custom fork)
- Build version tracking via `params.buildVersion`

### SEO & Social Media
The site includes comprehensive SEO and social media optimizations:
- Open Graph tags for Facebook/LinkedIn
- Twitter Cards with large image support
- Schema.org structured data for rich snippets
- Custom meta tags and canonical URLs
- Featured images displayed at post headers

Image requirements for social sharing:
- Recommended size: 1200x630px (1.91:1 ratio)
- Location: `static/images/posts/`
- Format: JPG for photos, PNG for graphics
- Max file size: 500KB

## Important Notes

- Hugo extended version required for SCSS compilation
- The `public/` directory is gitignored and regenerated on each build
- Theme modifications should be made in the forked repository at https://github.com/bruno-costanzo/hugo-theme-cactus.git
- Posts should include all frontmatter fields for optimal SEO
- Test social media cards using platform debuggers after deployment