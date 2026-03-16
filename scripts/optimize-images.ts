#!/usr/bin/env tsx

/**
 * Build-time image optimization script.
 *
 * - Scans content/ for images colocated with index.md (slug/index.md format)
 * - Copies originals to public/images/posts/[category]/[subcategory]/[slug]/
 * - Generates WebP variants at widths: 640, 800, 1200 (skip if wider than original)
 * - Writes manifest: public/images/posts/image-manifest.json
 *
 * Usage: npx tsx scripts/optimize-images.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, "..", "content");
const PUBLIC_IMAGES_DIR = path.join(
    __dirname,
    "..",
    "public",
    "images",
    "posts"
);
const MANIFEST_PATH = path.join(PUBLIC_IMAGES_DIR, "image-manifest.json");

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif"]);
const WIDTHS = [640, 800, 1200];

interface ImageVariant {
    src: string;
    width: number;
}

interface ImageEntry {
    width: number;
    height: number;
    variants: ImageVariant[];
}

type Manifest = Record<string, ImageEntry>;

function isImageFile(filename: string): boolean {
    return IMAGE_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isNewerThan(srcPath: string, destPath: string): boolean {
    if (!fs.existsSync(destPath)) return true;
    return fs.statSync(srcPath).mtimeMs > fs.statSync(destPath).mtimeMs;
}

async function processImage(
    srcPath: string,
    destDir: string,
    publicPath: string
): Promise<{ key: string; value: ImageEntry }> {
    const filename = path.basename(srcPath);
    const ext = path.extname(filename).toLowerCase();
    const basename = path.basename(filename, ext);

    fs.mkdirSync(destDir, { recursive: true });

    // Copy original
    const destOriginal = path.join(destDir, filename);
    if (isNewerThan(srcPath, destOriginal)) {
        fs.copyFileSync(srcPath, destOriginal);
    }

    // Get dimensions
    const meta = await sharp(srcPath).metadata();
    const origWidth = meta.width ?? 0;
    const origHeight = meta.height ?? 0;

    const variants: ImageVariant[] = [];

    // Responsive WebP variants
    for (const w of WIDTHS) {
        if (w >= origWidth) continue;
        const variantFilename = `${basename}-${w}.webp`;
        const destVariant = path.join(destDir, variantFilename);
        if (isNewerThan(srcPath, destVariant)) {
            await sharp(srcPath).resize(w).webp({ quality: 80 }).toFile(destVariant);
        }
        variants.push({ src: `${publicPath}/${variantFilename}`, width: w });
    }

    // Full-size WebP
    const fullWebpFilename = `${basename}.webp`;
    const destFullWebp = path.join(destDir, fullWebpFilename);
    if (isNewerThan(srcPath, destFullWebp)) {
        await sharp(srcPath).webp({ quality: 80 }).toFile(destFullWebp);
    }
    variants.push({ src: `${publicPath}/${fullWebpFilename}`, width: origWidth });

    return {
        key: `${publicPath}/${filename}`,
        value: { width: origWidth, height: origHeight, variants },
    };
}

async function main(): Promise<void> {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.log("No content directory found, skipping image optimization.");
        return;
    }

    const manifest: Manifest = fs.existsSync(MANIFEST_PATH)
        ? (JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8")) as Manifest)
        : {};

    let processed = 0;

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
            const subPath = path.join(catPath, subcategory);
            const entries = fs
                .readdirSync(subPath, { withFileTypes: true })
                .filter((d) => d.isDirectory())
                .map((d) => d.name);

            for (const slug of entries) {
                const slugPath = path.join(subPath, slug);
                const imageFiles = fs.readdirSync(slugPath).filter(isImageFile);

                if (imageFiles.length === 0) continue;

                const destDir = path.join(
                    PUBLIC_IMAGES_DIR,
                    category,
                    subcategory,
                    slug
                );
                const publicPath = `/images/posts/${category}/${subcategory}/${slug}`;

                for (const file of imageFiles) {
                    const srcPath = path.join(slugPath, file);
                    const { key, value } = await processImage(
                        srcPath,
                        destDir,
                        publicPath
                    );
                    manifest[key] = value;
                    processed++;
                    console.log(`  ✓ ${key}`);
                }
            }
        }
    }

    fs.mkdirSync(PUBLIC_IMAGES_DIR, { recursive: true });
    fs.writeFileSync(
        MANIFEST_PATH,
        JSON.stringify(manifest, null, 2),
        "utf-8"
    );

    if (processed > 0) {
        console.log(
            `\n✅ Optimized ${processed} image(s). Manifest: public/images/posts/image-manifest.json`
        );
    } else {
        console.log("✅ No new images to optimize.");
    }
}

main().catch((err: unknown) => {
    console.error("Image optimization failed:", err);
    process.exit(1);
});
