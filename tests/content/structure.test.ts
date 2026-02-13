import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

describe("content directory structure", () => {
    it("should have content directory", () => {
        expect(fs.existsSync(CONTENT_DIR)).toBe(true);
    });

    it("should have category directories", () => {
        const categories = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
        const dirs = categories.filter((d) => d.isDirectory()).map((d) => d.name);
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

        const intDir = path.join(CONTENT_DIR, "interviews");
        const intSubs = fs
            .readdirSync(intDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name);
        expect(intSubs).toContain("frontend");
        expect(intSubs).toContain("backend");
    });

    it("should have markdown files in each subcategory", () => {
        const checkDir = (dir: string) => {
            const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
            expect(files.length).toBeGreaterThan(0);
        };

        checkDir(path.join(CONTENT_DIR, "technical", "system-design"));
        checkDir(path.join(CONTENT_DIR, "technical", "aws"));
        checkDir(path.join(CONTENT_DIR, "interviews", "frontend"));
        checkDir(path.join(CONTENT_DIR, "interviews", "backend"));
    });

    it("all markdown files should have valid frontmatter", () => {
        const matter = require("gray-matter");

        const walkDir = (dir: string): string[] => {
            const files: string[] = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    files.push(...walkDir(fullPath));
                } else if (entry.name.endsWith(".md")) {
                    files.push(fullPath);
                }
            }
            return files;
        };

        const mdFiles = walkDir(CONTENT_DIR);
        expect(mdFiles.length).toBe(6);

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
