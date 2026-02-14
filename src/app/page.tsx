import Link from "next/link";
import { Folder } from "lucide-react";
import { getAllPosts, getCategories, formatCategoryName } from "@/lib/posts";
import { AUTHOR } from "@/lib/types";
import CategorySidebar from "@/components/CategorySidebar";
import PaginatedPosts from "@/components/PaginatedPosts";

export default function HomePage() {
    const categories = getCategories();
    const allPosts = getAllPosts();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block">
                <div className="sticky top-24">
                    <CategorySidebar categories={categories} />
                </div>
            </aside>

            {/* Main Content */}
            <div>
                {/* Hero */}
                <section className="mb-10 relative overflow-hidden rounded-2xl gradient-primary-subtle border border-primary/15 p-8 md:p-10">
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/5 translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                        <h1 className="text-3xl md:text-4xl text-center font-bold mb-3">
                            Welcome to{" "}
                            <span className="gradient-text">
                                Nhật&apos;s Blog
                            </span>
                        </h1>
                        <p className="text-muted text-lg max-w-2xl text-center mx-auto">
                            Share knowledge about technology, programming expertise, and personal experiences in the IT industry. Let's learn and grow together! 🥰
                        </p>
                    </div>
                </section>

                {/* Category Cards */}
                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 gradient-primary rounded-full" />
                        Categories
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(categories).map(([cat, subs]) => (
                            <Link
                                key={cat}
                                href={`/category/${cat}`}
                                className="group card p-5 relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20">
                                        <Folder className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="font-semibold group-hover:text-primary">
                                        {formatCategoryName(cat)}
                                    </h3>
                                </div>
                                <p className="text-sm text-muted mb-2">
                                    {subs.length} subcategor
                                    {subs.length === 1 ? "y" : "ies"}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {subs.map((sub) => (
                                        <span
                                            key={sub}
                                            className="text-xs bg-primary/8 text-primary/80 px-2 py-0.5 rounded-full"
                                        >
                                            {formatCategoryName(sub)}
                                        </span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Posts Section */}
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 gradient-primary rounded-full" />
                        All Posts
                    </h2>
                    <PaginatedPosts allPosts={allPosts} />
                </section>
            </div>
        </div>
    );
}
