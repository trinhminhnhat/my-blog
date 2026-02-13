#!/usr/bin/env node

/**
 * Generates RSS feed after build.
 * Output: out/rss.xml
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import RSS from "rss";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUT_DIR = path.join(__dirname, "..", "out");

const SITE_TITLE = "Nhật's Blog";
const SITE_DESCRIPTION =
    "A blog about technology, interviews, and more";
const SITE_URL = "https://nhattm.dev";
const AUTHOR = "Trịnh Minh Nhật";

function getAllPosts() {
    const posts = [];

    if (!fs.existsSync(CONTENT_DIR)) return posts;

    const categories = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    for (const category of categories) {
        const catPath = path.join(CONTENT_DIR, category);
        const subcategories = fs
            .readdirSync(catPath, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);

        for (const subcategory of subcategories) {
            const subDir = path.join(catPath, subcategory);
            const files = fs
                .readdirSync(subDir)
                .filter((f) => f.endsWith(".md"));

            for (const file of files) {
                const filePath = path.join(subDir, file);
                const content = fs.readFileSync(filePath, "utf-8");
                const { data } = matter(content);
                posts.push({
                    slug: file.replace(/\.md$/, ""),
                    category,
                    subcategory,
                    ...data,
                });
            }
        }
    }

    return posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

function main() {
    const feed = new RSS({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site_url: SITE_URL,
        feed_url: `${SITE_URL}/rss.xml`,
        language: "vi",
        pubDate: new Date(),
        copyright: `© ${new Date().getFullYear()} ${AUTHOR}`,
    });

    const posts = getAllPosts();

    for (const post of posts) {
        feed.item({
            title: post.title,
            description: post.description || "",
            url: `${SITE_URL}/post/${post.category}/${post.subcategory}/${post.slug}`,
            date: new Date(post.date),
            categories: [post.category, post.subcategory],
            author: AUTHOR,
        });
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
        path.join(OUT_DIR, "rss.xml"),
        feed.xml({ indent: true }),
        "utf-8"
    );

    console.log(`✅ Generated RSS feed: out/rss.xml (${posts.length} posts)`);
}

main();
