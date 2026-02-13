"use client";

import { useEffect, useRef, useState } from "react";

export default function SearchDialog() {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") {
                setOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (open && containerRef.current) {
            const loadPagefind = async () => {
                try {
                    const mod = await Function(
                        'return import("/pagefind/pagefind-ui.js")'
                    )();
                    if (containerRef.current) {
                        containerRef.current.innerHTML = "";
                        new mod.PagefindUI({
                            element: containerRef.current,
                            showSubResults: true,
                            showImages: false,
                        });
                        const input =
                            containerRef.current.querySelector<HTMLInputElement>(
                                ".pagefind-ui__search-input"
                            );
                        input?.focus();
                    }
                } catch {
                    if (containerRef.current) {
                        containerRef.current.innerHTML =
                            '<p class="text-muted text-sm p-4">Search index not found. Run <code>npm run build</code> first to generate the search index.</p>';
                    }
                }
            };
            loadPagefind();
        }
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/20 text-sm text-muted hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-surface rounded border border-border">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl mx-4 bg-background border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 max-h-[60vh] overflow-y-auto">
                        <div className="h-0.5 gradient-primary rounded-t-2xl" />
                        <div ref={containerRef} className="p-4" />
                    </div>
                </div>
            )}
        </>
    );
}
