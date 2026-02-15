"use client";

import { useState, useMemo, useRef } from "react";
import { Search, X, ChevronUp, ChevronDown, Check, ChevronsUpDown } from "lucide-react";
import type { PostMeta } from "@/lib/types";
import { POSTS_PER_PAGE } from "@/lib/types";
import PostCard from "./PostCard";

interface PaginatedPostsProps {
    allPosts: PostMeta[];
}

export default function PaginatedPosts({ allPosts }: PaginatedPostsProps) {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"date" | "title" | "description">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [tagsExpanded, setTagsExpanded] = useState(false);
    const postsTopRef = useRef<HTMLDivElement>(null);

    const MAX_VISIBLE_TAGS = 10;

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        allPosts.forEach((p) => p.frontmatter.tags.forEach((t) => tags.add(t)));
        return Array.from(tags).sort();
    }, [allPosts]);

    const filteredPosts = useMemo(() => {
        let result = allPosts;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.frontmatter.title.toLowerCase().includes(q) ||
                    p.frontmatter.description.toLowerCase().includes(q)
            );
        }

        if (selectedTags.length > 0) {
            result = result.filter((p) =>
                selectedTags.every((t) => p.frontmatter.tags.includes(t))
            );
        }

        result = [...result].sort((a, b) => {
            let cmp = 0;
            if (sortBy === "date") {
                cmp = new Date(a.frontmatter.date).getTime() - new Date(b.frontmatter.date).getTime();
            } else if (sortBy === "title") {
                cmp = a.frontmatter.title.localeCompare(b.frontmatter.title);
            } else {
                cmp = a.frontmatter.description.localeCompare(b.frontmatter.description);
            }
            return sortOrder === "asc" ? cmp : -cmp;
        });

        return result;
    }, [allPosts, searchQuery, selectedTags, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const start = (page - 1) * POSTS_PER_PAGE;
    const posts = filteredPosts.slice(start, start + POSTS_PER_PAGE);

    const hasFilters = searchQuery.trim() !== "" || selectedTags.length > 0;

    const handleTagClick = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
        setPage(1);
    };

    const clearAll = () => {
        setSearchQuery("");
        setSelectedTags([]);
        setSortBy("date");
        setSortOrder("desc");
        setPage(1);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setTimeout(() => {
            postsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
    };

    return (
        <>
            {/* Filter Bar */}
            <div ref={postsTopRef} className="mb-6 space-y-3 scroll-mt-30">
                {/* Search + Sort row */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search posts..."
                            className="w-full pl-10 pr-8 py-2 rounded-lg border border-border bg-surface text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setPage(1);
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {(["title", "description", "date"] as const).map((field) => (
                            <button
                                key={field}
                                onClick={() => {
                                    if (sortBy === field) {
                                        setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                                    } else {
                                        setSortBy(field);
                                        setSortOrder(field === "date" ? "desc" : "asc");
                                    }
                                    setPage(1);
                                }}
                                className={`text-xs px-2 py-2 rounded-lg cursor-pointer inline-flex items-center gap-0.5 ${
                                    sortBy === field
                                        ? "gradient-primary text-white shadow-sm shadow-primary/25"
                                        : "border border-border text-muted hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                }`}
                            >
                                {field === "description" ? "Desc" : field.charAt(0).toUpperCase() + field.slice(1)}
                                {sortBy === field && (
                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                                <span className="w-1 h-4 gradient-primary rounded-full" />
                                Filter by tags
                                <span className="text-xs font-normal text-muted normal-case tracking-normal">
                                    ({allTags.length})
                                </span>
                                {selectedTags.length > 0 && (
                                    <span className="w-5 h-5 rounded-full gradient-primary text-white text-xs font-bold inline-flex items-center justify-center shadow-sm shadow-primary/25">
                                        {selectedTags.length}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-2">
                                {hasFilters && (
                                    <button
                                        onClick={clearAll}
                                        className="text-xs text-primary hover:underline cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                                {allTags.length > MAX_VISIBLE_TAGS && (
                                    <button
                                        onClick={() => setTagsExpanded(!tagsExpanded)}
                                        className="text-xs text-muted hover:text-primary cursor-pointer flex items-center gap-0.5"
                                    >
                                        <ChevronsUpDown className="w-3.5 h-3.5" />
                                        {tagsExpanded ? "Less" : "More"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Selected tags (always visible) */}
                        {!tagsExpanded && selectedTags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {selectedTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className="text-xs px-2.5 py-1 rounded-full cursor-pointer inline-flex items-center gap-1 gradient-primary text-white shadow-md shadow-primary/25"
                                    >
                                        #{tag}
                                        <X className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* All tags / collapsed tags */}
                        <div className="flex flex-wrap gap-1.5">
                            {(tagsExpanded ? allTags : allTags.filter((t) => selectedTags.includes(t) ? false : true).slice(0, MAX_VISIBLE_TAGS)).map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`text-xs px-2.5 py-1 rounded-full cursor-pointer inline-flex items-center gap-1 ${
                                        selectedTags.includes(tag)
                                            ? "gradient-primary text-white shadow-md shadow-primary/25"
                                            : "bg-primary/8 text-muted hover:bg-primary/15 hover:text-primary"
                                    }`}
                                >
                                    #{tag}
                                    {selectedTags.includes(tag) && (
                                        <Check className="w-3 h-3" />
                                    )}
                                </button>
                            ))}
                            {!tagsExpanded && allTags.length > MAX_VISIBLE_TAGS + selectedTags.length && (
                                <button
                                    onClick={() => setTagsExpanded(true)}
                                    className="text-xs px-2.5 py-1 rounded-full cursor-pointer border border-dashed border-primary/30 text-primary hover:bg-primary/8"
                                >
                                    +{allTags.length - MAX_VISIBLE_TAGS - selectedTags.filter((t) => allTags.indexOf(t) >= MAX_VISIBLE_TAGS).length} more
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Info */}
            {hasFilters && (
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted">
                        {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} found
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {posts.map((post) => (
                    <PostCard
                        key={`${post.category}/${post.subcategory}/${post.slug}`}
                        post={post}
                    />
                ))}
            </div>
            {posts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted mb-3">No posts found.</p>
                    {hasFilters && (
                        <button
                            onClick={clearAll}
                            className="text-sm text-primary hover:underline cursor-pointer"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
            {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            className="px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-sm cursor-pointer"
                        >
                            ← Prev
                        </button>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`px-3 py-2 rounded-lg text-sm cursor-pointer ${
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
                            onClick={() => handlePageChange(page + 1)}
                            className="px-3 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 hover:border-primary/40 text-sm cursor-pointer"
                        >
                            Next →
                        </button>
                    )}
                </nav>
            )}
        </>
    );
}
