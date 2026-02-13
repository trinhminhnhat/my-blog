"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import { POSTS_PER_PAGE } from "@/lib/types";
import PostCard from "./PostCard";

interface PostListClientProps {
    allPosts: PostMeta[];
    allTags: string[];
}

export default function PostListClient({
    allPosts,
    allTags,
}: PostListClientProps) {
    const [page, setPage] = useState(1);
    const [tagFilter, setTagFilter] = useState<string | null>(null);

    const filteredPosts = useMemo(() => {
        if (!tagFilter) return allPosts;
        return allPosts.filter((p) => p.frontmatter.tags.includes(tagFilter));
    }, [allPosts, tagFilter]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const start = (page - 1) * POSTS_PER_PAGE;
    const posts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

    const handleTagClick = (tag: string) => {
        if (tagFilter === tag) {
            setTagFilter(null);
        } else {
            setTagFilter(tag);
        }
        setPage(1);
    };

    return (
        <>
            {/* Tags */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 gradient-primary rounded-full" />
                    Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                        <button
                            key={tag}
                            onClick={() => handleTagClick(tag)}
                            className={`text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                                tagFilter === tag
                                    ? "gradient-primary text-white shadow-md shadow-primary/25"
                                    : "bg-primary/8 text-muted hover:bg-primary/15 hover:text-primary"
                            }`}
                        >
                            #{tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 gradient-primary rounded-full" />
                    {tagFilter
                        ? `Posts tagged "${tagFilter}"`
                        : "Recent Posts"}
                </h2>
                {tagFilter && (
                    <button
                        onClick={() => {
                            setTagFilter(null);
                            setPage(1);
                        }}
                        className="text-sm text-primary hover:underline cursor-pointer"
                    >
                        Clear filter
                    </button>
                )}
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard
                        key={`${post.category}/${post.subcategory}/${post.slug}`}
                        post={post}
                    />
                ))}
            </div>
            {posts.length === 0 && (
                <p className="text-muted text-center py-12">No posts found.</p>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                        <button
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-sm transition-all cursor-pointer"
                        >
                            ← Prev
                        </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                                    p === page
                                        ? "gradient-primary text-white shadow-md shadow-primary/25"
                                        : "border border-primary/20 hover:bg-primary/10 hover:border-primary/40"
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                    {page < totalPages && (
                        <button
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-sm transition-all cursor-pointer"
                        >
                            Next →
                        </button>
                    )}
                </nav>
            )}
        </>
    );
}
