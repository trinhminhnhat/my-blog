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
                        <div className="search-dialog relative w-full max-w-2xl bg-surface rounded-2xl border border-border overflow-hidden pointer-events-auto flex flex-col max-h-[75vh] animate-slide-up shadow-2xl">
                            <div className="h-1 bg-linear-to-r from-primary-dark via-primary to-primary-light" />

                            <div className="relative flex items-center justify-between px-6 py-4 border-b border-border bg-linear-to-r from-transparent via-primary/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Search className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-foreground">
                                            Search Posts
                                        </h2>
                                        <p className="text-xs text-muted mt-0.5">
                                            Find articles, tutorials, and guides
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold
                                                  bg-surface-hover rounded-lg border border-border shadow-sm">
                                        <span className="text-[9px]">ESC</span>
                                    </kbd>
                                    <button
                                        onClick={close}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                                 text-muted hover:text-foreground hover:bg-surface-hover
                                                 transition-all duration-200 hover:rotate-90"
                                        aria-label="Close search"
                                    >
                                        <X className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto relative">
                                {loading && (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="relative">
                                            <div className="w-14 h-14 border-3 border-border/30 rounded-full" />
                                            <div className="w-14 h-14 border-3 border-border border-t-primary rounded-full animate-spin absolute inset-0" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-foreground mb-1">Loading search index</p>
                                            <p className="text-xs text-muted">Please wait a moment...</p>
                                        </div>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-primary-subtle border-2 border-primary/20 flex items-center justify-center mb-5">
                                            <Search className="w-10 h-10 text-primary" />
                                        </div>
                                        <h3 className="text-foreground font-bold text-lg mb-2">Search Index Not Found</h3>
                                        <p className="text-muted text-sm mb-5 max-w-md leading-relaxed">
                                            The search functionality requires building the site first.
                                            Run the build command to generate the search index.
                                        </p>
                                        <div className="px-5 py-3 bg-surface-hover border-2 border-primary/20 rounded-xl">
                                            <code className="text-sm text-primary font-mono font-bold">npm run build</code>
                                        </div>
                                    </div>
                                )}
                                <div
                                    ref={containerRef}
                                    className={`search-container px-6 pb-6 pt-5 ${loading || error ? "hidden" : ""}`}
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
