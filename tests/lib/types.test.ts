import { describe, it, expect } from "vitest";
import type { PostMeta, CategoryTree, TOCItem } from "@/lib/types";
import { POSTS_PER_PAGE, SITE_TITLE, AUTHOR } from "@/lib/types";

describe("types and constants", () => {
    it("should have correct POSTS_PER_PAGE", () => {
        expect(POSTS_PER_PAGE).toBe(5);
    });

    it("should have correct SITE_TITLE", () => {
        expect(SITE_TITLE).toBe("Nhật's Blog");
    });

    it("should have correct AUTHOR", () => {
        expect(AUTHOR).toBe("Trịnh Minh Nhật");
    });

    it("PostMeta type should be usable", () => {
        const post: PostMeta = {
            slug: "test",
            category: "test-cat",
            subcategory: "test-sub",
            frontmatter: {
                title: "Test Post",
                date: "2026-01-01",
                tags: ["test"],
                description: "A test post",
            },
        };
        expect(post.slug).toBe("test");
        expect(post.frontmatter.tags).toContain("test");
    });

    it("CategoryTree type should be usable", () => {
        const tree: CategoryTree = {
            technical: ["system-design", "aws"],
            interviews: ["frontend", "backend"],
        };
        expect(tree.technical).toHaveLength(2);
        expect(tree.interviews).toContain("frontend");
    });

    it("TOCItem type should be usable", () => {
        const item: TOCItem = { id: "intro", text: "Introduction", level: 2 };
        expect(item.level).toBe(2);
    });
});
