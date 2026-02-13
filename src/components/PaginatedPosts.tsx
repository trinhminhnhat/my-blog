"use client";

import { useState, useMemo } from "react";
import type { PostMeta } from "@/lib/types";
import { POSTS_PER_PAGE } from "@/lib/types";
import PostCard from "./PostCard";

interface PaginatedPostsProps {
    allPosts: PostMeta[];
}

export default function PaginatedPosts({ allPosts }: PaginatedPostsProps) {
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
    const start = (page - 1) * POSTS_PER_PAGE;
    const posts = allPosts.slice(start, start + POSTS_PER_PAGE);

    return (
        <>
            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard
                        key={`${post.category}/${post.subcategory}/${post.slug}`}
                        post={post}
                    />
                ))}
            </div>
            {posts.length === 0 && (
                <p className="text-muted text-center py-12">
                    No posts found.
                </p>
            )}
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
