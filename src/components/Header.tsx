"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { formatCategoryName } from "@/lib/utils";
import type { CategoryTree } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";
import SearchDialog from "./SearchDialog";

interface HeaderProps {
    categories: CategoryTree;
}

export default function Header({ categories }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-[0_1px_8px_rgba(56,189,248,0.08)]">
            <div className="h-0.5 gradient-primary" />
            <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity"
                >
                    Nhật&apos;s Blog
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        href="/"
                        className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary"
                    >
                        Home
                    </Link>
                    {Object.entries(categories).map(([cat, subs]) => (
                        <div key={cat} className="relative group">
                            <Link
                                href={`/category/${cat}`}
                                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary"
                            >
                                {formatCategoryName(cat)}
                            </Link>
                            {subs.length > 0 && (
                                <div className="absolute top-full left-0 pt-2 hidden group-hover:block">
                                    <div className="bg-background border border-primary/20 rounded-xl shadow-xl py-2 min-w-[200px] overflow-hidden">
                                        <div className="h-0.5 gradient-primary" />
                                        {subs.map((sub) => (
                                            <Link
                                                key={sub}
                                                href={`/category/${cat}/${sub}`}
                                                className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary"
                                            >
                                                {formatCategoryName(sub)}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <SearchDialog />
                    <ThemeToggle />
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-surface-hover"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-primary/20 bg-background">
                    <nav className="px-4 py-3 space-y-1">
                        <Link
                            href="/"
                            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary"
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </Link>
                        {Object.entries(categories).map(([cat, subs]) => (
                            <div key={cat}>
                                <Link
                                    href={`/category/${cat}`}
                                    className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {formatCategoryName(cat)}
                                </Link>
                                {subs.map((sub) => (
                                    <Link
                                        key={sub}
                                        href={`/category/${cat}/${sub}`}
                                        className="block px-6 py-1.5 text-sm text-muted hover:text-primary"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {formatCategoryName(sub)}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
