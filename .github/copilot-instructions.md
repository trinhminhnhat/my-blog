# Copilot Instructions

## Build, Test, and Lint

```bash
npm run dev          # Start development server
npm run build        # Build for production (Next.js + RSS + Pagefind search)
npm run lint         # Run ESLint

npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npx vitest run tests/lib/posts.test.ts           # Run a single test file
npx vitest run -t "should return all 6 posts"    # Run a single test by name
```

## Architecture

This is a **statically exported Next.js blog** (`output: "export"`) with a two-level category structure:

```
content/
  {category}/
    {subcategory}/
      {slug}.md
```

### URL Routing
- `/` - Homepage with paginated posts
- `/category/{category}` - Posts in a category
- `/category/{category}/{subcategory}` - Posts in a subcategory
- `/post/{category}/{subcategory}/{slug}` - Individual post

### Key Files
- `src/lib/posts.ts` - Core content loading and markdown processing (remark/rehype pipeline)
- `src/lib/types.ts` - Shared TypeScript types and site constants (`SITE_TITLE`, `SITE_URL`, etc.)
- `scripts/new-post.mjs` - Interactive CLI to create new posts: `npm run new-post`
- `scripts/generate-rss.mjs` - RSS generation (runs automatically during build)

### Markdown Processing
Posts use gray-matter for frontmatter and a unified/remark/rehype pipeline:
- `remark-gfm` for GitHub Flavored Markdown
- `rehype-highlight` for syntax highlighting
- `rehype-slug` + `rehype-autolink-headings` for heading anchors

## Conventions

### Post Frontmatter
All posts require this frontmatter structure:
```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
description: "Brief description"
---
```

### Creating New Posts
Use the helper script instead of creating files manually:
```bash
npm run new-post
# Or with arguments:
npm run new-post technical system-design my-new-post
```

### Path Aliases
Use `@/` for imports from `src/`:
```typescript
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
```

### Static Generation
All pages use `generateStaticParams()` for static generation. The site has no server-side rendering - everything is pre-built.
