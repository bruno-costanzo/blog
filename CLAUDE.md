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

# Update theme submodule
git submodule update --remote themes/cactus
```

## Architecture & Structure

### Key Directories
- `content/posts/` - Blog posts in Markdown format with YAML frontmatter
- `themes/cactus/` - Custom fork of Cactus theme (Git submodule from https://github.com/bruno-costanzo/hugo-theme-cactus.git)
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
- Language: Spanish (es)
- Analytics: Google Analytics 4 (G-H5GJBVQWGP)
- Theme: cactus

## Important Notes

- Hugo must be installed locally to run development commands
- The `public/` directory is gitignored and generated during build
- All content is written in Spanish
- The theme is a custom fork, so any theme modifications should be made in the forked repository