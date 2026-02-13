import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getCategories,
    getPostsByCategory,
    formatCategoryName,
} from "@/lib/posts";
import CategorySidebar from "@/components/CategorySidebar";
import PaginatedPosts from "@/components/PaginatedPosts";

export function generateStaticParams() {
    const categories = getCategories();
    return Object.keys(categories).map((category) => ({ category }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    return { title: formatCategoryName(category) };
}

export default async function CategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;
    const categories = getCategories();

    if (!categories[category]) notFound();

    const allPosts = getPostsByCategory(category);
    const subcategories = categories[category];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <CategorySidebar
                        categories={categories}
                        currentCategory={category}
                    />
                </div>
            </aside>

            <div>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted mb-6">
                    <Link href="/" className="hover:text-primary transition-colors">
                        Home
                    </Link>
                    <span className="text-primary/40">/</span>
                    <span className="text-foreground font-medium">
                        {formatCategoryName(category)}
                    </span>
                </nav>

                <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 gradient-primary rounded-full" />
                    {formatCategoryName(category)}
                </h1>

                {/* Subcategories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {subcategories.map((sub) => {
                        const subPosts = allPosts.filter(
                            (p) => p.subcategory === sub
                        );
                        return (
                            <Link
                                key={sub}
                                href={`/category/${category}/${sub}`}
                                className="group card p-5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                        {formatCategoryName(sub)}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted">
                                    {subPosts.length} post
                                    {subPosts.length !== 1 ? "s" : ""}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* All Posts in Category */}
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 gradient-primary rounded-full" />
                    All Posts
                </h2>
                <PaginatedPosts allPosts={allPosts} />
            </div>
        </div>
    );
}
