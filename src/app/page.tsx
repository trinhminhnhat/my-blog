import Link from "next/link";
import { getAllPosts, getCategories, formatCategoryName, getAllTags } from "@/lib/posts";
import { AUTHOR } from "@/lib/types";
import CategorySidebar from "@/components/CategorySidebar";
import PostListClient from "@/components/PostListClient";

export default function HomePage() {
    const categories = getCategories();
    const allPosts = getAllPosts();
    const allTags = getAllTags();

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
                        <h1 className="text-3xl md:text-4xl font-bold mb-3">
                            Welcome to{" "}
                            <span className="gradient-text">
                                Nhật&apos;s Blog
                            </span>
                        </h1>
                        <p className="text-muted text-lg max-w-2xl">
                            Chia sẻ kiến thức về công nghệ, phỏng vấn và nhiều hơn
                            nữa. By {AUTHOR}.
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
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
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

                {/* Posts Section with client-side pagination & filtering */}
                <section>
                    <PostListClient allPosts={allPosts} allTags={allTags} />
                </section>
            </div>
        </div>
    );
}
