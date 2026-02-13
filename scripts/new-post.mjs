#!/usr/bin/env node

/**
 * Script to create a new blog post.
 *
 * Usage:
 *   node scripts/new-post.mjs <category> <subcategory> <slug>
 *
 * Example:
 *   node scripts/new-post.mjs technical system-design caching-strategies
 *   node scripts/new-post.mjs interviews frontend typescript-tips
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
    let [category, subcategory, slug] = process.argv.slice(2);

    if (!category) {
        // List existing categories
        const existing = fs.existsSync(CONTENT_DIR)
            ? fs
                  .readdirSync(CONTENT_DIR, { withFileTypes: true })
                  .filter((d) => d.isDirectory())
                  .map((d) => d.name)
            : [];

        if (existing.length > 0) {
            console.log("\nExisting categories:", existing.join(", "));
        }
        category = await ask("Category (e.g., technical): ");
    }

    if (!subcategory) {
        const catDir = path.join(CONTENT_DIR, category);
        const existing = fs.existsSync(catDir)
            ? fs
                  .readdirSync(catDir, { withFileTypes: true })
                  .filter((d) => d.isDirectory())
                  .map((d) => d.name)
            : [];

        if (existing.length > 0) {
            console.log("\nExisting subcategories:", existing.join(", "));
        }
        subcategory = await ask("Subcategory (e.g., system-design): ");
    }

    if (!slug) {
        slug = await ask("Post slug (e.g., my-new-post): ");
    }

    const title = await ask("Title: ");
    const description = await ask("Description: ");
    const tagsInput = await ask("Tags (comma-separated): ");
    const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

    const today = new Date().toISOString().split("T")[0];

    const frontmatter = `---
title: "${title}"
date: "${today}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
description: "${description}"
---

## Introduction

Write your content here...
`;

    // Sanitize inputs for path traversal protection
    const sanitize = (str) => str.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeCategory = sanitize(category);
    const safeSubcategory = sanitize(subcategory);
    const safeSlug = sanitize(slug);

    const dir = path.join(CONTENT_DIR, safeCategory, safeSubcategory);
    const filePath = path.join(dir, `${safeSlug}.md`);

    if (fs.existsSync(filePath)) {
        console.error(`\n❌ File already exists: ${filePath}`);
        rl.close();
        process.exit(1);
    }

    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, frontmatter, "utf-8");

    console.log(`\n✅ Created: ${filePath}`);
    console.log(
        `📂 Category: ${safeCategory} → ${safeSubcategory}`
    );
    console.log(`📝 Edit the file and run 'npm run dev' to see changes.`);

    rl.close();
}

main().catch((err) => {
    console.error(err);
    rl.close();
    process.exit(1);
});
