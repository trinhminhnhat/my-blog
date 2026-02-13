import { getAllPosts, getCategories } from "@/lib/posts";
import { SITE_URL } from "@/lib/types";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();
    const categories = getCategories();

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${SITE_URL}/post/${post.category}/${post.subcategory}/${post.slug}`,
        lastModified: new Date(post.frontmatter.date),
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const categoryUrls: MetadataRoute.Sitemap = Object.entries(categories).flatMap(
        ([cat, subs]) => [
            {
                url: `${SITE_URL}/category/${cat}`,
                changeFrequency: "weekly" as const,
                priority: 0.6,
            },
            ...subs.map((sub) => ({
                url: `${SITE_URL}/category/${cat}/${sub}`,
                changeFrequency: "weekly" as const,
                priority: 0.5,
            })),
        ]
    );

    return [
        {
            url: SITE_URL,
            changeFrequency: "daily",
            priority: 1,
        },
        ...categoryUrls,
        ...postUrls,
    ];
}
