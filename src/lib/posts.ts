import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";
import rehypeImages from "./rehype-images";
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

            const entries = fs.readdirSync(subDir, { withFileTypes: true });

            for (const entry of entries) {
                let filePath: string;
                let slug: string;

                if (entry.isFile() && entry.name.endsWith(".md")) {
                    // Legacy format: slug.md
                    slug = entry.name.replace(/\.md$/, "");
                    filePath = path.join(subDir, entry.name);
                } else if (entry.isDirectory()) {
                    // New format: slug/index.md
                    const indexPath = path.join(subDir, entry.name, "index.md");
                    if (!fs.existsSync(indexPath)) continue;
                    slug = entry.name;
                    filePath = indexPath;
                } else {
                    continue;
                }

                const fileContent = fs.readFileSync(filePath, "utf-8");
                const { data } = matter(fileContent);

                posts.push({
                    slug,
                    category,
                    subcategory,
                    frontmatter: {
                        title: data.title || "",
                        date: data.date || "",
                        tags: data.tags || [],
                        description: data.description || "",
                        series: data.series,
                        series_order: data.series_order,
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

export function getPostsBySeries(seriesName: string): PostMeta[] {
    return getAllPosts()
        .filter((p) => p.frontmatter.series === seriesName)
        .sort((a, b) => {
            const orderA = a.frontmatter.series_order ?? Infinity;
            const orderB = b.frontmatter.series_order ?? Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return a.frontmatter.date.localeCompare(b.frontmatter.date);
        });
}

export async function getPostBySlug(
    category: string,
    subcategory: string,
    slug: string
): Promise<Post | null> {
    // Support both slug/index.md (new) and slug.md (legacy)
    const dirPath = path.join(
        CONTENT_DIR,
        category,
        subcategory,
        slug,
        "index.md"
    );
    const legacyPath = path.join(
        CONTENT_DIR,
        category,
        subcategory,
        `${slug}.md`
    );
    const filePath = fs.existsSync(dirPath) ? dirPath : legacyPath;

    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    // Base public path for images if post uses slug/index.md format
    const isDirectoryBased = fs.existsSync(dirPath);
    const imageBasePath = isDirectoryBased
        ? `/images/posts/${category}/${subcategory}/${slug}`
        : null;

    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        // Resolve relative image paths (./image.png → /images/posts/...)
        .use(() => (tree) => {
            if (!imageBasePath) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const visit = (node: any) => {
                if (node.type === "image" && node.url?.startsWith("./")) {
                    node.url = `${imageBasePath}/${node.url.slice(2)}`;
                }
                if (node.children) node.children.forEach(visit);
            };
            visit(tree);
        })
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeKatex)
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: "wrap" })
        .use(rehypeHighlight)
        .use(rehypeImages)
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
            series: data.series,
            series_order: data.series_order,
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
