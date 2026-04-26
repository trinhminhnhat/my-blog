"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import type { PostMeta } from "@/lib/types";

const MAX_VISIBLE = 5;

interface SeriesBoxProps {
    seriesName: string;
    posts: PostMeta[];
    currentSlug: string;
}

export default function SeriesBox({
    seriesName,
    posts,
    currentSlug,
}: SeriesBoxProps) {
    const total = posts.length;
    const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
    const partNumber = currentIndex + 1;

    const needsCollapse = total > MAX_VISIBLE;

    // Auto-expand if current post would be hidden in the default window
    const [expanded, setExpanded] = useState(() => {
        if (!needsCollapse) return true;
        const half = Math.floor(MAX_VISIBLE / 2);
        let start = currentIndex - half;
        if (start < 0) start = 0;
        const end = Math.min(start + MAX_VISIBLE, total);
        const adjustedStart = Math.max(0, end - MAX_VISIBLE);
        return currentIndex < adjustedStart || currentIndex >= end;
    });

    const getWindow = () => {
        const half = Math.floor(MAX_VISIBLE / 2);
        let start = currentIndex - half;
        if (start < 0) start = 0;
        let end = start + MAX_VISIBLE;
        if (end > total) {
            end = total;
            start = Math.max(0, end - MAX_VISIBLE);
        }
        return { start, end };
    };

    const { start, end } = getWindow();
    const visiblePosts = expanded ? posts : posts.slice(start, end);
    const hiddenAbove = expanded ? 0 : start;
    const hiddenBelow = expanded ? 0 : total - end;

    return (
        <div className="bg-surface/50 border border-border rounded-2xl p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 gradient-primary rounded-full" />
                    <BookOpen className="w-4 h-4 text-primary/70" />
                    <span className="font-semibold text-sm">{seriesName}</span>
                </div>
                <span className="text-xs text-muted bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                    Part {partNumber} / {total}
                </span>
            </div>

            {/* Posts list */}
            <ol className="space-y-1">
                {/* "N more above" hint */}
                {hiddenAbove > 0 && (
                    <li className="text-xs text-muted pl-6 py-0.5">
                        ↑ {hiddenAbove} more above
                    </li>
                )}

                {visiblePosts.map((post) => {
                    const postIndex = posts.indexOf(post);
                    const isCurrent = post.slug === currentSlug;

                    return (
                        <li key={post.slug}>
                            {isCurrent ? (
                                <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-primary/10">
                                    <span className="text-xs text-primary font-bold w-5 shrink-0 text-center">
                                        {postIndex + 1}
                                    </span>
                                    <span className="text-sm text-primary font-medium flex-1 leading-snug">
                                        {post.frontmatter.title}
                                    </span>
                                    <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
                                </div>
                            ) : (
                                <Link
                                    href={`/post/${post.category}/${post.subcategory}/${post.slug}`}
                                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-primary/5 group"
                                >
                                    <span className="text-xs text-muted font-medium w-5 shrink-0 text-center">
                                        {postIndex + 1}
                                    </span>
                                    <span className="text-sm text-foreground/80 group-hover:text-primary flex-1 leading-snug">
                                        {post.frontmatter.title}
                                    </span>
                                </Link>
                            )}
                        </li>
                    );
                })}

                {/* "N more below" hint or show-all button */}
                {hiddenBelow > 0 && (
                    <li className="text-xs text-muted pl-6 py-0.5">
                        ↓ {hiddenBelow} more below
                    </li>
                )}
            </ol>

            {/* Toggle button */}
            {needsCollapse && (
                <button
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-2 w-full text-xs text-primary font-medium py-1.5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer"
                >
                    {expanded ? "Collapse" : `Show all ${total} parts`}
                </button>
            )}
        </div>
    );
}
