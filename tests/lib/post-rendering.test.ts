import { describe, it, expect } from "vitest";
import { getPostBySlug, extractTOC } from "@/lib/posts";

describe("getPostBySlug", () => {
    it("should return a post with HTML content", async () => {
        const post = await getPostBySlug(
            "technical",
            "system-design",
            "microservices-architecture"
        );
        expect(post).not.toBeNull();
        expect(post!.frontmatter.title).toBe(
            "Microservices Architecture: A Comprehensive Guide"
        );
        expect(post!.content).toContain("<h2");
        expect(post!.content).toContain("id=");
    });

    it("should return null for non-existent post", async () => {
        const post = await getPostBySlug("technical", "aws", "non-existent");
        expect(post).toBeNull();
    });

    it("should correctly render code blocks", async () => {
        const post = await getPostBySlug(
            "technical",
            "system-design",
            "microservices-architecture"
        );
        expect(post!.content).toContain("<pre>");
        expect(post!.content).toContain("<code");
    });

    it("should render GFM tables", async () => {
        const post = await getPostBySlug(
            "technical",
            "system-design",
            "microservices-architecture"
        );
        expect(post!.content).toContain("<table>");
        expect(post!.content).toContain("<th>");
    });

    it("should generate slug IDs for headings", async () => {
        const post = await getPostBySlug(
            "technical",
            "system-design",
            "microservices-architecture"
        );
        const toc = extractTOC(post!.content);
        expect(toc.length).toBeGreaterThan(0);
        toc.forEach((item) => {
            expect(item.id).toBeTruthy();
            expect(item.text).toBeTruthy();
            expect(item.level).toBeGreaterThanOrEqual(2);
            expect(item.level).toBeLessThanOrEqual(4);
        });
    });
});
