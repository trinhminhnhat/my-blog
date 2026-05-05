import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PostMeta } from "@/lib/types";

interface SeriesNavigationProps {
    posts: PostMeta[];
    currentSlug: string;
}

export default function SeriesNavigation({
    posts,
    currentSlug,
}: SeriesNavigationProps) {
    const currentIndex = posts.findIndex((p) => p.slug === currentSlug);
    const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
    const next =
        currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

    if (!prev && !next) return null;

    return (
        <nav className="mt-12 pt-8 border-t border-primary/15">
            <div className="grid grid-cols-2 gap-4">
                {/* Previous */}
                {prev ? (
                    <Link
                        href={`/post/${prev.category}/${prev.subcategory}/${prev.slug}`}
                        className="group flex flex-col gap-1 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                    >
                        <span className="flex items-center gap-1 text-xs text-muted group-hover:text-primary transition-colors">
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Previous
                        </span>
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {prev.frontmatter.title}
                        </span>
                        <span className="text-xs text-muted/60">
                            Part {currentIndex}
                        </span>
                    </Link>
                ) : (
                    <div />
                )}

                {/* Next */}
                {next ? (
                    <Link
                        href={`/post/${next.category}/${next.subcategory}/${next.slug}`}
                        className="group flex flex-col gap-1 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-right"
                    >
                        <span className="flex items-center justify-end gap-1 text-xs text-muted group-hover:text-primary transition-colors">
                            Next
                            <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            {next.frontmatter.title}
                        </span>
                        <span className="text-xs text-muted/60">
                            Part {currentIndex + 2}
                        </span>
                    </Link>
                ) : (
                    <div />
                )}
            </div>
        </nav>
    );
}
