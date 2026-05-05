import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

describe("content directory structure", () => {
    it("should have content directory", () => {
        expect(fs.existsSync(CONTENT_DIR)).toBe(true);
    });

    it("should have category directories", () => {
        const categories = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
        const dirs = categories
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        expect(dirs).toContain("technical");
        expect(dirs).toContain("interviews");
    });

    it("should have subcategory directories", () => {
        const techDir = path.join(CONTENT_DIR, "technical");
        const techSubs = fs
            .readdirSync(techDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        expect(techSubs).toContain("system-design");
        expect(techSubs).toContain("aws");
        expect(techSubs).toContain("fundamentals");

        const intDir = path.join(CONTENT_DIR, "interviews");
        const intSubs = fs
            .readdirSync(intDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        expect(intSubs).toContain("frontend");
        expect(intSubs).toContain("backend");
    });

    it("should have markdown files in each subcategory", () => {
        const countPosts = (dir: string): number => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            let count = 0;
            for (const entry of entries) {
                if (entry.isFile() && entry.name.endsWith(".md")) count++;
                else if (entry.isDirectory()) {
                    const indexPath = path.join(dir, entry.name, "index.md");
                    if (fs.existsSync(indexPath)) count++;
                }
            }
            return count;
        };

        expect(
            countPosts(path.join(CONTENT_DIR, "technical", "system-design"))
        ).toBeGreaterThan(0);
        expect(
            countPosts(path.join(CONTENT_DIR, "technical", "aws"))
        ).toBeGreaterThan(0);
        expect(
            countPosts(path.join(CONTENT_DIR, "interviews", "frontend"))
        ).toBeGreaterThan(0);
        expect(
            countPosts(path.join(CONTENT_DIR, "interviews", "backend"))
        ).toBeGreaterThan(0);
        expect(
            countPosts(path.join(CONTENT_DIR, "technical", "fundamentals"))
        ).toBeGreaterThan(0);
    });

    it("all markdown files should have valid frontmatter", () => {
        // Collect only post files (slug.md or slug/index.md), not nested index.md inside index.md dirs
        const collectPosts = (dir: string, depth = 0): string[] => {
            const files: string[] = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && depth < 2) {
                    files.push(...collectPosts(fullPath, depth + 1));
                } else if (entry.isDirectory() && depth === 2) {
                    // slug directory: look for index.md
                    const indexPath = path.join(fullPath, "index.md");
                    if (fs.existsSync(indexPath)) files.push(indexPath);
                } else if (
                    entry.isFile() &&
                    entry.name.endsWith(".md") &&
                    depth === 2
                ) {
                    files.push(fullPath);
                }
            }
            return files;
        };

        const mdFiles = collectPosts(CONTENT_DIR);
        expect(mdFiles.length).toBeGreaterThanOrEqual(6);

        for (const file of mdFiles) {
            const content = fs.readFileSync(file, "utf-8");
            const { data } = matter(content);
            expect(data.title).toBeTruthy();
            expect(data.date).toBeTruthy();
            expect(Array.isArray(data.tags)).toBe(true);
            expect(data.description).toBeTruthy();
        }
    });
});
