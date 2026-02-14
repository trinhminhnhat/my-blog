import Link from "next/link";
import { notFound } from "next/navigation";
import {
    getCategories,
    getPostsBySubcategory,
    formatCategoryName,
} from "@/lib/posts";
import CategorySidebar from "@/components/CategorySidebar";
import PaginatedPosts from "@/components/PaginatedPosts";

export function generateStaticParams() {
    const categories = getCategories();
    const params: { category: string; subcategory: string }[] = [];

    for (const [cat, subs] of Object.entries(categories)) {
        for (const sub of subs) {
            params.push({ category: cat, subcategory: sub });
        }
    }

    return params;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ category: string; subcategory: string }>;
}) {
    const { category, subcategory } = await params;
    return {
        title: `${formatCategoryName(subcategory)} - ${formatCategoryName(category)}`,
    };
}

export default async function SubcategoryPage({
    params,
}: {
    params: Promise<{ category: string; subcategory: string }>;
}) {
    const { category, subcategory } = await params;
    const categories = getCategories();

    if (!categories[category] || !categories[category].includes(subcategory)) {
        notFound();
    }

    const allPosts = getPostsBySubcategory(category, subcategory);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <CategorySidebar
                        categories={categories}
                        currentCategory={category}
                        currentSubcategory={subcategory}
                    />
                </div>
            </aside>

            <div>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted mb-6">
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
                    <span className="text-foreground font-medium">
                        {formatCategoryName(subcategory)}
                    </span>
                </nav>

                <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-8 gradient-primary rounded-full" />
                    {formatCategoryName(subcategory)}
                </h1>

                <PaginatedPosts allPosts={allPosts} />
            </div>
        </div>
    );
}
