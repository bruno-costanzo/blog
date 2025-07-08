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

This is a personal blog built with Hugo static site generator, deployed to GitHub Pages. The blog uses a custom fork of the Cactus theme and is written in Spanish.

## Common Development Commands

```bash
# Run local development server (includes drafts)
hugo server -D

# Run local development server (published posts only)
hugo server

# Build the site for production
hugo --minify

# Create a new blog post
hugo new posts/your-post-title.md

# Clean Hugo module cache
hugo mod clean
```

## Architecture & Structure

### Key Directories
- `content/posts/` - Blog posts in Markdown format with YAML frontmatter
- `themes/cactus/` - Custom fork of Cactus theme (Git submodule)
- `public/` - Generated static site output (gitignored)
- `.github/workflows/` - GitHub Actions for automated deployment

### Content Format
Blog posts use standard Hugo frontmatter:
```yaml
---
title: "Post Title"
date: YYYY-MM-DD
draft: true  # Set to false to publish
---
```

### Deployment
The site automatically deploys to GitHub Pages when changes are pushed to the main branch via the `.github/workflows/deploy.yml` workflow. The site is accessible at https://bruno-costanzo.github.io/blog/

### Theme Management
The Cactus theme is managed as a Git submodule pointing to a custom fork. To update the theme:
```bash
git submodule update --remote themes/cactus
```

## Configuration

Main configuration is in `config.toml`:
- Base URL: https://bruno-costanzo.github.io/blog/
- Language: Spanish (es)
- Analytics: Google Analytics 4 (G-H5GJBVQWGP)