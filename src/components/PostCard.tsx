import Link from "next/link";
import type { PostMeta } from "@/lib/types";
import { formatDate, formatCategoryName } from "@/lib/utils";

interface PostCardProps {
    post: PostMeta;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <article className="group card p-5 relative overflow-hidden border-l-4 border-l-primary/40 hover:border-l-primary">
            <div className="flex items-center gap-2 text-xs text-muted mb-3">
                <Link
                    href={`/category/${post.category}`}
                    className="bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full hover:bg-primary/20"
                >
                    {formatCategoryName(post.category)}
                </Link>
                <span className="text-primary/40">/</span>
                <Link
                    href={`/category/${post.category}/${post.subcategory}`}
                    className="hover:text-primary"
                >
                    {formatCategoryName(post.subcategory)}
                </Link>
                <span className="ml-auto">
                    {formatDate(post.frontmatter.date)}
                </span>
            </div>
            <Link
                href={`/post/${post.category}/${post.subcategory}/${post.slug}`}
            >
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
                    {post.frontmatter.title}
                </h3>
            </Link>
            <p className="text-sm text-muted line-clamp-2 mb-3">
                {post.frontmatter.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
                {post.frontmatter.tags.map((tag) => (
                    <span
                        key={tag}
                        className="text-xs bg-primary/8 text-primary/70 px-2 py-0.5 rounded-full"
                    >
                        #{tag}
                    </span>
                ))}
            </div>
        </article>
    );
}
