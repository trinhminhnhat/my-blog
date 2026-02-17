"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

const subscribe = () => () => {};

export default function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    const close = useCallback(() => {
        setOpen(false);
    }, []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        if (!open || !containerRef.current) return;

        setError(false);
        const container = containerRef.current;

        const init = () => {
            container.innerHTML = "";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new (window as any).PagefindUI({
                element: container,
                showSubResults: true,
                showImages: false,
                autofocus: true,
                translations: {
                    placeholder: "Search posts...",
                    zero_results: "No results found for [SEARCH_TERM]",
                },
            });
            setLoading(false);
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).PagefindUI) {
            init();
            return;
        }

        setLoading(true);
        const script = document.createElement("script");
        script.src = "/pagefind/pagefind-ui.js";
        script.onload = init;
        script.onerror = () => {
            setLoading(false);
            setError(true);
        };
        document.head.appendChild(script);
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border text-sm text-muted
                         hover:border-primary hover:text-primary
                         transition-all duration-200"
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Search...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold
                              bg-surface rounded border border-border text-muted/70
                              group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    <span className="text-[9px]">⌘</span>K
                </kbd>
            </button>

            {mounted && open && createPortal(
                <>
                    <div
                        className="fixed inset-0 z-100 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
                        onClick={close}
                    />
                    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4 pointer-events-none">
                        <div className="search-dialog relative w-full max-w-2xl bg-surface rounded-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[75vh] animate-slide-up">
                            <div className="h-1 bg-primary" />

                            <div className="relative flex items-center justify-between px-6 py-4 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Search className="w-5 h-5 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">
                                        Search Posts
                                    </span>
                                </div>
                                <button
                                    onClick={close}
                                    className="group flex items-center gap-2 px-2 py-1 rounded-lg
                                             text-muted hover:text-foreground hover:bg-surface-hover
                                             transition-colors"
                                    aria-label="Close search"
                                >
                                    <kbd className="px-2 py-0.5 text-[10px] font-semibold bg-surface rounded border border-border">
                                        ESC
                                    </kbd>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto relative">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                                        <div className="w-12 h-12 border-3 border-border border-t-primary rounded-full animate-spin" />
                                        <p className="text-sm text-muted">Loading search index...</p>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                                        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-muted" />
                                        </div>
                                        <h3 className="text-foreground font-semibold text-base mb-2">Search Index Not Found</h3>
                                        <p className="text-muted text-sm mb-4 max-w-md">
                                            The search functionality requires building the site first.
                                        </p>
                                        <div className="px-4 py-2 bg-surface border border-border rounded-lg">
                                            <code className="text-xs text-primary font-mono font-semibold">npm run build</code>
                                        </div>
                                    </div>
                                )}
                                <div
                                    ref={containerRef}
                                    className={`search-container px-6 py-4 ${loading || error ? "hidden" : ""}`}
                                />
                            </div>
                        </div>
                    </div>
                </>,
                document.body
            )}
        </>
    );
}
