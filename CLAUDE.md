# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (Next.js + RSS generation + Pagefind indexing)
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run new-post     # Interactive CLI to create a new blog post
```

## Architecture

This is a **statically-generated blog** (`output: "export"`) built with Next.js App Router. All pages are pre-built to `/out` at build time — there is no SSR or API routes.

### Routing

```
/                                          → Home (hero, categories, paginated posts)
/category/[category]                       → Category listing
/category/[category]/[subcategory]         → Subcategory listing
/post/[category]/[subcategory]/[slug]      → Individual post
```

Each dynamic route uses `generateStaticParams()` to enumerate all pages at build time.

### Content

Blog posts are Markdown files with YAML frontmatter stored under `content/[category]/[subcategory]/[slug].md`. Required frontmatter fields: `title`, `date`, `tags`, `description`.

All content is read from the filesystem at build time via `src/lib/posts.ts`, which exposes `getAllPosts()`, `getPostsByCategory()`, and `getPostBySlug()`.

Markdown processing pipeline: gray-matter → remark-gfm → remark-rehype → rehype-slug → rehype-autolink-headings → rehype-highlight → HTML string.

### Key files

- `src/lib/posts.ts` — all content fetching and markdown processing
- `src/lib/types.ts` — shared TypeScript interfaces and constants (categories, etc.)
- `src/components/PaginatedPosts.tsx` — client component handling search, tag filtering, and sorting
- `src/components/SearchDialog.tsx` — Pagefind-powered search modal (Cmd/Ctrl+K)
- `scripts/new-post.mjs` — post creation CLI
- `scripts/generate-rss.mjs` — RSS feed generator (runs after `next build`)

### Search

Search is powered by **Pagefind**, which generates a static index in `/out/pagefind/` as the last step of `npm run build`. Search is not available in `npm run dev` unless you manually run `npx pagefind --site out` after a build.

### Styling

Tailwind CSS v4 with the `@theme` syntax in `src/app/globals.css`. Dark mode uses CSS variables toggled via localStorage. Interactive components (sidebars, search, pagination) are `"use client"` components.
