import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import type { Post, PostMeta, CategoryTree, TOCItem } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getCategories(): CategoryTree {
    const tree: CategoryTree = {};

    if (!fs.existsSync(CONTENT_DIR)) return tree;

    const categories = fs
        .readdirSync(CONTENT_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    for (const cat of categories) {
        const catPath = path.join(CONTENT_DIR, cat);
        const subcategories = fs
            .readdirSync(catPath, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        tree[cat] = subcategories;
    }

    return tree;
}

export function getAllPosts(): PostMeta[] {
    const categories = getCategories();
    const posts: PostMeta[] = [];

    for (const [category, subcategories] of Object.entries(categories)) {
        for (const subcategory of subcategories) {
            const subDir = path.join(CONTENT_DIR, category, subcategory);
            if (!fs.existsSync(subDir)) continue;

            const files = fs
                .readdirSync(subDir)
                .filter((f) => f.endsWith(".md"));

            for (const file of files) {
                const filePath = path.join(subDir, file);
                const fileContent = fs.readFileSync(filePath, "utf-8");
                const { data } = matter(fileContent);

                posts.push({
                    slug: file.replace(/\.md$/, ""),
                    category,
                    subcategory,
                    frontmatter: {
                        title: data.title || "",
                        date: data.date || "",
                        tags: data.tags || [],
                        description: data.description || "",
                    },
                });
            }
        }
    }

    return posts.sort(
        (a, b) =>
            new Date(b.frontmatter.date).getTime() -
            new Date(a.frontmatter.date).getTime()
    );
}

export function getPostsByCategory(category: string): PostMeta[] {
    return getAllPosts().filter((p) => p.category === category);
}

export function getPostsBySubcategory(
    category: string,
    subcategory: string
): PostMeta[] {
    return getAllPosts().filter(
        (p) => p.category === category && p.subcategory === subcategory
    );
}

export async function getPostBySlug(
    category: string,
    subcategory: string,
    slug: string
): Promise<Post | null> {
    const filePath = path.join(
        CONTENT_DIR,
        category,
        subcategory,
        `${slug}.md`
    );

    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: "wrap" })
        .use(rehypeHighlight)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(content);

    return {
        slug,
        category,
        subcategory,
        frontmatter: {
            title: data.title || "",
            date: data.date || "",
            tags: data.tags || [],
            description: data.description || "",
        },
        content: result.toString(),
    };
}

export function extractTOC(htmlContent: string): TOCItem[] {
    const headingRegex = /<h([2-4])\s+id="([^"]*)"[^>]*>(.*?)<\/h[2-4]>/g;
    const toc: TOCItem[] = [];
    let match;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
        const text = match[3].replace(/<[^>]*>/g, "");
        toc.push({
            id: match[2],
            text,
            level: parseInt(match[1]),
        });
    }

    return toc;
}

export function paginatePosts(
    posts: PostMeta[],
    page: number,
    perPage: number
): { posts: PostMeta[]; totalPages: number } {
    const totalPages = Math.ceil(posts.length / perPage);
    const start = (page - 1) * perPage;
    return {
        posts: posts.slice(start, start + perPage),
        totalPages,
    };
}

export function getAllTags(): string[] {
    const posts = getAllPosts();
    const tagSet = new Set<string>();
    posts.forEach((p) => p.frontmatter.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
}

export { formatDate, formatCategoryName } from "./utils";
