---
name: new-blog-post
description: Create a new blog post for this Next.js blog. Use this skill whenever the user wants to write a new post, create content, start a new article, add a blog entry, or mentions creating/adding something to the blog. Also triggers when the user asks about post structure, frontmatter, or content organization. Even if the user just says "tạo bài viết mới" or "viết bài mới", use this skill.
---

# New Blog Post

This skill creates a new Markdown blog post for the statically-generated Next.js blog at `/home/nhattm/projects/my-blog`.

## Content Structure

Posts are stored at: `content/[category]/[subcategory]/[slug]/index.md`

The URL for the post will be: `/post/[category]/[subcategory]/[slug]`

Required frontmatter fields:
- `title`: Display title (string)
- `date`: Publication date in `YYYY-MM-DD` format
- `tags`: Array of tag strings
- `description`: Short summary used for SEO and post previews

## Step-by-step Process

### 1. Show existing structure

Before asking the user for inputs, always show what already exists so they can stay consistent:

```bash
ls content/
```

For each category, also show subcategories:
```bash
ls content/[category]/
```

### 2. Gather inputs

Collect the following from the user (extract from their message if already provided, otherwise ask):

| Field | Description | Example |
|-------|-------------|---------|
| **category** | Top-level topic folder | `technical`, `interviews` |
| **subcategory** | Sub-topic folder inside category | `system-design`, `frontend` |
| **slug** | URL-safe identifier, kebab-case | `my-new-post` |
| **title** | Full display title | `My New Post` |
| **description** | 1-2 sentence summary | `A guide to...` |
| **tags** | Comma-separated keywords | `react, typescript, hooks` |

**Validation rules** (same as the script):
- `category`, `subcategory`, `slug` must only contain `[a-zA-Z0-9_-]` — strip everything else.
- If the user provides a new category or subcategory, confirm before creating it.

### 3. Check for conflicts

Before writing, verify the target file does not already exist:
```
content/[category]/[subcategory]/[slug]/index.md
```

If it exists, tell the user and ask whether they want to open the existing file instead.

### 4. Create the post

Use the `Write` tool to create `content/[category]/[subcategory]/[slug]/index.md` with this template:

```markdown
---
title: "[title]"
date: "[YYYY-MM-DD]"
tags: [[tag1, tag2, ...]]
description: "[description]"
---

## Introduction

Write your content here...
```

- Use today's date for `date`.
- Format tags as: `["tag1", "tag2"]` (quoted strings inside the YAML array).

### 5. Confirm and guide next steps

After creating the file, tell the user:
- **File path**: the exact path created
- **Category path**: `[category] → [subcategory]`
- **Images**: Place image files in the same directory (`content/[category]/[subcategory]/[slug]/`) and reference them in Markdown as `![alt text](./image-name.png)`
- **Preview**: Run `npm run dev` to see the post locally

## Example

User says: "Tạo bài viết mới về Redis caching trong technical/system-design, slug là redis-caching"

You would:
1. Check `content/technical/system-design/` exists
2. Ask for title, description, tags if not provided
3. Create `content/technical/system-design/redis-caching/index.md`
4. Confirm creation with next steps
