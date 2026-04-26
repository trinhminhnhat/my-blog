#!/usr/bin/env tsx

/**
 * Script to create a new blog post.
 *
 * Usage:
 *   npx tsx scripts/new-post.ts <category> <subcategory> <slug>
 *
 * Example:
 *   npx tsx scripts/new-post.ts technical system-design caching-strategies
 *   npx tsx scripts/new-post.ts interviews frontend typescript-tips
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

function ask(question: string): Promise<string> {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function main(): Promise<void> {
    let [category, subcategory, slug] = process.argv.slice(2);

    if (!category) {
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

    const seriesInput = await ask(
        "Series name (optional, press Enter to skip): "
    );
    const series = seriesInput.trim();
    let seriesOrder: number | undefined;
    if (series) {
        const orderInput = await ask("Series order (e.g., 1, 2, 3): ");
        const parsed = parseInt(orderInput.trim(), 10);
        if (!isNaN(parsed)) seriesOrder = parsed;
    }

    const today = new Date().toISOString().split("T")[0];

    const seriesFields = series
        ? `series: "${series}"\n${seriesOrder !== undefined ? `series_order: ${seriesOrder}\n` : ""}`
        : "";

    const frontmatter = `---
title: "${title}"
date: "${today}"
tags: [${tags.map((t) => `"${t}"`).join(", ")}]
description: "${description}"
${seriesFields}---

## Introduction

Write your content here...
`;

    const sanitize = (str: string): string =>
        str.replace(/[^a-zA-Z0-9_-]/g, "");
    const safeCategory = sanitize(category);
    const safeSubcategory = sanitize(subcategory);
    const safeSlug = sanitize(slug);

    const slugDir = path.join(
        CONTENT_DIR,
        safeCategory,
        safeSubcategory,
        safeSlug
    );
    const filePath = path.join(slugDir, "index.md");

    if (fs.existsSync(filePath)) {
        console.error(`\n❌ Post already exists: ${filePath}`);
        rl.close();
        process.exit(1);
    }

    fs.mkdirSync(slugDir, { recursive: true });
    fs.writeFileSync(filePath, frontmatter, "utf-8");

    console.log(`\n✅ Created: ${filePath}`);
    console.log(`📂 Category: ${safeCategory} → ${safeSubcategory}`);
    console.log(`🖼️  Images: place them in ${slugDir}`);
    console.log(`   Reference in markdown: ![alt](./your-image.png)`);
    console.log(`📝 Edit the file and run 'npm run dev' to see changes.`);

    rl.close();
}

main().catch((err) => {
    console.error(err);
    rl.close();
    process.exit(1);
});
