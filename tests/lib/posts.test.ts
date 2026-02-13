import { describe, it, expect } from "vitest";
import {
    getAllPosts,
    getCategories,
    getPostsByCategory,
    getPostsBySubcategory,
    formatCategoryName,
    formatDate,
    extractTOC,
    paginatePosts,
    getAllTags,
} from "@/lib/posts";

describe("getCategories", () => {
    it("should return a category tree with technical and interviews", () => {
        const categories = getCategories();
        expect(categories).toHaveProperty("technical");
        expect(categories).toHaveProperty("interviews");
        expect(categories.technical).toContain("system-design");
        expect(categories.technical).toContain("aws");
        expect(categories.interviews).toContain("frontend");
        expect(categories.interviews).toContain("backend");
    });
});

describe("getAllPosts", () => {
    it("should return all 6 posts", () => {
        const posts = getAllPosts();
        expect(posts.length).toBe(6);
    });

    it("should sort posts by date descending", () => {
        const posts = getAllPosts();
        for (let i = 1; i < posts.length; i++) {
            const prev = new Date(posts[i - 1].frontmatter.date).getTime();
            const curr = new Date(posts[i].frontmatter.date).getTime();
            expect(prev).toBeGreaterThanOrEqual(curr);
        }
    });

    it("should have correct frontmatter fields", () => {
        const posts = getAllPosts();
        for (const post of posts) {
            expect(post.frontmatter.title).toBeTruthy();
            expect(post.frontmatter.date).toBeTruthy();
            expect(Array.isArray(post.frontmatter.tags)).toBe(true);
            expect(post.frontmatter.description).toBeTruthy();
            expect(post.slug).toBeTruthy();
            expect(post.category).toBeTruthy();
            expect(post.subcategory).toBeTruthy();
        }
    });
});

describe("getPostsByCategory", () => {
    it("should filter posts by technical category", () => {
        const posts = getPostsByCategory("technical");
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach((p) => expect(p.category).toBe("technical"));
    });

    it("should filter posts by interviews category", () => {
        const posts = getPostsByCategory("interviews");
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach((p) => expect(p.category).toBe("interviews"));
    });

    it("should return empty for non-existent category", () => {
        const posts = getPostsByCategory("non-existent");
        expect(posts.length).toBe(0);
    });
});

describe("getPostsBySubcategory", () => {
    it("should filter posts by category and subcategory", () => {
        const posts = getPostsBySubcategory("technical", "system-design");
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach((p) => {
            expect(p.category).toBe("technical");
            expect(p.subcategory).toBe("system-design");
        });
    });
});

describe("formatCategoryName", () => {
    it("should capitalize and replace hyphens", () => {
        expect(formatCategoryName("system-design")).toBe("System Design");
        expect(formatCategoryName("frontend")).toBe("Frontend");
        expect(formatCategoryName("aws")).toBe("Aws");
    });
});

describe("formatDate", () => {
    it("should format a date string to Vietnamese locale", () => {
        const result = formatDate("2026-02-10");
        expect(result).toBeTruthy();
        expect(typeof result).toBe("string");
    });
});

describe("extractTOC", () => {
    it("should extract headings from HTML content", () => {
        const html = `
            <h2 id="intro">Introduction</h2>
            <p>Some text</p>
            <h3 id="sub">Subsection</h3>
            <h2 id="conclusion">Conclusion</h2>
        `;
        const toc = extractTOC(html);
        expect(toc).toHaveLength(3);
        expect(toc[0]).toEqual({ id: "intro", text: "Introduction", level: 2 });
        expect(toc[1]).toEqual({ id: "sub", text: "Subsection", level: 3 });
        expect(toc[2]).toEqual({ id: "conclusion", text: "Conclusion", level: 2 });
    });

    it("should return empty array for content without headings", () => {
        const toc = extractTOC("<p>No headings here</p>");
        expect(toc).toHaveLength(0);
    });
});

describe("paginatePosts", () => {
    it("should paginate correctly", () => {
        const allPosts = getAllPosts();
        const { posts, totalPages } = paginatePosts(allPosts, 1, 5);
        expect(posts.length).toBeLessThanOrEqual(5);
        expect(totalPages).toBe(Math.ceil(allPosts.length / 5));
    });

    it("should return correct page", () => {
        const allPosts = getAllPosts();
        const page1 = paginatePosts(allPosts, 1, 5);
        const page2 = paginatePosts(allPosts, 2, 5);

        if (allPosts.length > 5) {
            expect(page2.posts.length).toBeGreaterThan(0);
            expect(page1.posts[0].slug).not.toBe(page2.posts[0].slug);
        }
    });
});

describe("getAllTags", () => {
    it("should return unique sorted tags", () => {
        const tags = getAllTags();
        expect(tags.length).toBeGreaterThan(0);
        for (let i = 1; i < tags.length; i++) {
            expect(tags[i] >= tags[i - 1]).toBe(true);
        }
        const uniqueTags = new Set(tags);
        expect(uniqueTags.size).toBe(tags.length);
    });
});
