"use client";

import { useState } from "react";
import Link from "next/link";
import { Folder, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
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
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
        new Set(Object.keys(categories))
    );

    const allExpanded = expandedCategories.size === Object.keys(categories).length;

    const toggleAll = () => {
        if (allExpanded) {
            setExpandedCategories(new Set());
        } else {
            setExpandedCategories(new Set(Object.keys(categories)));
        }
    };

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
    };

    return (
        <nav className="bg-surface/50 border border-border rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                    <span className="w-1 h-4 gradient-primary rounded-full" />
                    Categories
                </h3>
                <button
                    onClick={toggleAll}
                    className="text-xs text-muted hover:text-primary flex items-center gap-1 cursor-pointer"
                    title={allExpanded ? "Collapse all" : "Expand all"}
                >
                    {allExpanded ? (
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronsDownUp className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
            {Object.entries(categories).map(([cat, subs]) => (
                <div key={cat} className="mb-1">
                    <div className="flex items-center gap-1">
                        {subs.length > 0 && (
                            <button
                                onClick={() => toggleCategory(cat)}
                                className="p-1 hover:bg-primary/10 rounded cursor-pointer shrink-0"
                            >
                                {expandedCategories.has(cat) ? (
                                    <ChevronDown className="w-3.5 h-3.5 text-muted" />
                                ) : (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted" />
                                )}
                            </button>
                        )}
                        <Link
                            href={`/category/${cat}`}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium flex-1 ${currentCategory === cat && !currentSubcategory
                                ? "bg-primary/15 text-primary shadow-sm"
                                : "hover:bg-primary/8 hover:text-primary"
                                }`}
                        >
                            <Folder
                                className={`w-4 h-4 shrink-0 ${currentCategory === cat ? "text-primary" : "text-muted"
                                    }`}
                            />
                            {formatCategoryName(cat)}
                        </Link>
                    </div>
                    {subs.length > 0 && expandedCategories.has(cat) && (
                        <div className="ml-6 mt-1 space-y-0.5 border-l-2 border-primary/20 pl-3">
                            {subs.map((sub) => (
                                <Link
                                    key={sub}
                                    href={`/category/${cat}/${sub}`}
                                    className={`block px-2 py-1.5 rounded text-sm ${currentCategory === cat &&
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
