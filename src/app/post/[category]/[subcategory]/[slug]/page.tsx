import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getPostBySlug,
    getCategories,
    getAllPosts,
    formatCategoryName,
    formatDate,
    extractTOC,
} from "@/lib/posts";
import { Calendar, User } from "lucide-react";
import { AUTHOR } from "@/lib/types";
import CategorySidebar from "@/components/CategorySidebar";
import TableOfContents from "@/components/TableOfContents";

export function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((p) => ({
        category: p.category,
        subcategory: p.subcategory,
        slug: p.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string; subcategory: string; slug: string }>;
}) {
    const { category, subcategory, slug } = await params;
    const post = await getPostBySlug(category, subcategory, slug);
    if (!post) return { title: "Not Found" };
    return {
        title: post.frontmatter.title,
        description: post.frontmatter.description,
    };
}

export default async function PostPage({
    params,
}: {
    params: Promise<{ category: string; subcategory: string; slug: string }>;
}) {
    const { category, subcategory, slug } = await params;
    const post = await getPostBySlug(category, subcategory, slug);

    if (!post) notFound();

    const categories = getCategories();
    const toc = extractTOC(post.content);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_200px] gap-8">
            {/* Left Sidebar - Categories */}
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <CategorySidebar
                        categories={categories}
                        currentCategory={category}
                        currentSubcategory={subcategory}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <article className="min-w-0" data-pagefind-body>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap">
                    <Link href="/" className="hover:text-primary">
                        Home
                    </Link>
                    <span className="text-primary/40">/</span>
                    <Link
                        href={`/category/${category}`}
                        className="hover:text-primary"
                    >
                        {formatCategoryName(category)}
                    </Link>
                    <span className="text-primary/40">/</span>
                    <Link
                        href={`/category/${category}/${subcategory}`}
                        className="hover:text-primary"
                    >
                        {formatCategoryName(subcategory)}
                    </Link>
                    <span className="text-primary/40">/</span>
                    <span className="text-foreground font-medium truncate">
                        {post.frontmatter.title}
                    </span>
                </nav>

                {/* Post Header */}
                <header className="mb-8 pb-8 border-b border-primary/15">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        {post.frontmatter.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-muted flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary/60" />
                            {formatDate(post.frontmatter.date)}
                        </span>
                        <span className="text-primary/30">•</span>
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4 text-primary/60" />
                            {AUTHOR}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.frontmatter.tags.map((tag) => (
                            <Link
                                key={tag}
                                href={`/?tag=${tag}`}
                                className="text-xs bg-primary/10 text-primary font-medium px-2.5 py-1 rounded-full hover:bg-primary/20"
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>
                    {post.frontmatter.description && (
                        <p className="mt-5 text-muted text-lg border-l-4 border-primary pl-4 gradient-primary-subtle py-3 pr-4 rounded-r-lg">
                            {post.frontmatter.description}
                        </p>
                    )}
                </header>

                {/* Post Content */}
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>

            {/* Right Sidebar - TOC */}
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <TableOfContents items={toc} />
                </div>
            </aside>
        </div>
    );
}
