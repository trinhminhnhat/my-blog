import Link from "next/link";
import { formatCategoryName } from "@/lib/utils";
import type { CategoryTree } from "@/lib/types";

interface CategorySidebarProps {
    categories: CategoryTree;
    currentCategory?: string;
    currentSubcategory?: string;
}

export default function CategorySidebar({
    categories,
    currentCategory,
    currentSubcategory,
}: CategorySidebarProps) {
    return (
        <nav className="bg-surface/50 border border-border rounded-2xl p-4 space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <span className="w-1 h-4 gradient-primary rounded-full" />
                Categories
            </h3>
            {Object.entries(categories).map(([cat, subs]) => (
                <div key={cat} className="mb-1">
                    <Link
                        href={`/category/${cat}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            currentCategory === cat && !currentSubcategory
                                ? "bg-primary/15 text-primary shadow-sm"
                                : "hover:bg-primary/8 hover:text-primary"
                        }`}
                    >
                        <svg
                            className={`w-4 h-4 shrink-0 ${
                                currentCategory === cat ? "text-primary" : "text-muted"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                            />
                        </svg>
                        {formatCategoryName(cat)}
                    </Link>
                    {subs.length > 0 && (
                        <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                            {subs.map((sub) => (
                                <Link
                                    key={sub}
                                    href={`/category/${cat}/${sub}`}
                                    className={`block px-2 py-1.5 rounded text-sm transition-colors ${
                                        currentCategory === cat &&
                                        currentSubcategory === sub
                                            ? "text-primary font-medium bg-primary/8"
                                            : "text-muted hover:text-primary"
                                    }`}
                                >
                                    {formatCategoryName(sub)}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}
