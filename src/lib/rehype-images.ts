import fs from "fs";
import path from "path";
import type { Plugin } from "unified";
import type { Root, Element, Node } from "hast";
import { visit } from "unist-util-visit";

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

let manifestCache: Manifest | null = null;

function loadManifest(): Manifest {
    if (manifestCache) return manifestCache;

    const manifestPath = path.join(
        process.cwd(),
        "public",
        "images",
        "posts",
        "image-manifest.json"
    );

    if (!fs.existsSync(manifestPath)) {
        manifestCache = {};
        return manifestCache;
    }

    manifestCache = JSON.parse(
        fs.readFileSync(manifestPath, "utf-8")
    ) as Manifest;
    return manifestCache;
}

const rehypeImages: Plugin<[], Root> = () => {
    return (tree: Root) => {
        const manifest = loadManifest();

        visit(tree, "element", (node: Node, index, parent) => {
            const el = node as Element;
            if (el.tagName !== "img" || !parent || index === undefined) return;

            const src = el.properties?.src as string | undefined;
            if (!src) return;

            // Always add lazy loading
            el.properties = {
                ...el.properties,
                loading: "lazy",
                decoding: "async",
            };

            const entry = manifest[src];
            if (!entry || entry.variants.length === 0) return;

            // Add explicit dimensions to prevent layout shift
            el.properties.width = entry.width;
            el.properties.height = entry.height;

            // Build srcset from variants sorted by width
            const sorted = [...entry.variants].sort((a, b) => a.width - b.width);
            const srcset = sorted.map((v) => `${v.src} ${v.width}w`).join(", ");

            const sourceNode: Element = {
                type: "element",
                tagName: "source",
                properties: {
                    type: "image/webp",
                    srcSet: srcset,
                    sizes: "(max-width: 768px) 100vw, 720px",
                },
                children: [],
            };

            const pictureNode: Element = {
                type: "element",
                tagName: "picture",
                properties: {},
                children: [sourceNode, el],
            };

            (parent as Element).children[index] = pictureNode;
        });
    };
};

export default rehypeImages;
