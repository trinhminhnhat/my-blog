"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Search, AlertCircle, FileText } from "lucide-react";

/* ---------- types ---------- */

interface SearchResult {
    url: string;
    title: string;
    excerpt: string; // HTML with <mark> tags
    sub_results: { url: string; title: string; excerpt: string }[];
}

type Pagefind = {
    debouncedSearch: (
        query: string,
        options?: Record<string, unknown>,
        ms?: number
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => Promise<{ results: { data: () => Promise<any> }[] } | null>;
};

/* ---------- helpers ---------- */

const subscribe = () => () => {};
const MAX_RESULTS = 8;

/* ---------- component ---------- */

export default function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const inputRef = useRef<HTMLInputElement>(null);
    const pagefindRef = useRef<Pagefind | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );

    /* -- close handler -- */
    const close = useCallback(() => {
        setOpen(false);
        setQuery("");
        setResults([]);
        setActiveIndex(0);
    }, []);

    /* -- global keyboard shortcut (Cmd/Ctrl+K, ESC) -- */
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [close]);

    /* -- lock body scroll when open -- */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    /* -- load pagefind.js on first open -- */
    useEffect(() => {
        if (!open) return;

        if (pagefindRef.current) {
            // Already loaded — just focus
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        setLoading(true);

        setError(false);

        (async () => {
            try {
                // Build a runtime-only URL so Next.js/Turbopack won't resolve it at compile time
                const url = "/pagefind/pagefind.js";
                const pf: Pagefind = await import(/* webpackIgnore: true */ url);
                pagefindRef.current = pf;
                setLoading(false);
                setTimeout(() => inputRef.current?.focus(), 50);
            } catch {
                setLoading(false);
                setError(true);
            }
        })();
    }, [open]);

    /* -- search when query changes -- */
    useEffect(() => {
        const pf = pagefindRef.current;
        if (!pf || !query.trim()) {
            setResults([]);
            setActiveIndex(0);
            return;
        }

        let cancelled = false;
        setSearching(true);

        (async () => {
            try {
                const response = await pf.debouncedSearch(query, {}, 150);
                if (cancelled || !response) return;

                const slice = response.results.slice(0, MAX_RESULTS);
                const data = await Promise.all(slice.map((r) => r.data()));

                if (cancelled) return;

                const mapped: SearchResult[] = data.map((d) => ({
                    url: d.url,
                    title: d.meta?.title || d.url,
                    excerpt: d.excerpt || "",
                    sub_results: (d.sub_results || []).slice(0, 3),
                }));

                setResults(mapped);
                setActiveIndex(0);
            } catch {
                // Search cancelled or failed — ignore
            } finally {
                if (!cancelled) setSearching(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [query]);

    /* -- keyboard navigation inside dialog -- */
    const onInputKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
            } else if (e.key === "Enter" && results.length > 0) {
                e.preventDefault();
                const target = results[activeIndex];
                if (target) {
                    close();
                    window.location.href = target.url;
                }
            }
        },
        [results, activeIndex, close]
    );

    /* -- scroll active item into view -- */
    useEffect(() => {
        const container = resultsRef.current;
        if (!container) return;
        const active = container.querySelector("[data-active='true']");
        active?.scrollIntoView({ block: "nearest" });
    }, [activeIndex]);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="group relative flex items-center gap-2.5 px-4 py-2 rounded-xl border border-border text-sm text-muted
                         hover:border-primary hover:text-primary
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary
                         transition-all duration-200"
            >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Search...</span>
                <kbd
                    className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold
                              bg-surface rounded border border-border text-muted/70
                              group-hover:border-primary/30 group-hover:text-primary transition-colors"
                >
                    <span className="text-[9px]">⌘</span>K
                </kbd>
            </button>

            {mounted &&
                open &&
                createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm animate-fade-in"
                            onClick={close}
                        />

                        {/* Dialog */}
                        <div className="fixed inset-0 z-100 flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-4 pointer-events-none">
                            <div className="search-dialog relative w-full max-w-xl bg-surface rounded-2xl border border-border pointer-events-auto flex flex-col max-h-[80vh] animate-slide-up overflow-hidden">
                                {/* Loading state */}
                                {loading && (
                                    <div className="flex items-center gap-3 px-4 py-4">
                                        <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin shrink-0" />
                                        <span className="text-sm text-muted">
                                            Loading search…
                                        </span>
                                    </div>
                                )}

                                {/* Error state */}
                                {error && (
                                    <div className="flex flex-col items-center justify-center py-12 px-8 text-center gap-3">
                                        <AlertCircle className="w-8 h-8 text-muted/40" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground mb-1">
                                                Search index not found
                                            </p>
                                            <p className="text-xs text-muted">
                                                Run{" "}
                                                <code className="px-1.5 py-0.5 bg-surface-hover rounded text-primary font-mono">
                                                    npm run build
                                                </code>{" "}
                                                to generate it
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Search input */}
                                {!loading && !error && (
                                    <>
                                        <div className="flex items-center gap-3 px-4 border-b border-border">
                                            <Search className="w-4 h-4 text-muted shrink-0" />
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={query}
                                                onChange={(e) =>
                                                    setQuery(e.target.value)
                                                }
                                                onKeyDown={onInputKeyDown}
                                                placeholder="Search posts..."
                                                className="flex-1 bg-transparent py-3.5 text-[15px] text-foreground placeholder:text-muted/50 outline-none"
                                                autoComplete="off"
                                                spellCheck={false}
                                            />
                                            {query && (
                                                <button
                                                    onClick={() => {
                                                        setQuery("");
                                                        inputRef.current?.focus();
                                                    }}
                                                    className="text-muted/40 hover:text-muted transition-colors text-xs px-1.5 py-0.5 rounded hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                                >
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        {/* Results area */}
                                        <div
                                            ref={resultsRef}
                                            className="overflow-y-auto overscroll-contain max-h-[55vh]"
                                        >
                                            {/* Searching indicator */}
                                            {searching &&
                                                results.length === 0 && (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin" />
                                                    </div>
                                                )}

                                            {/* No results */}
                                            {!searching &&
                                                query.trim() &&
                                                results.length === 0 && (
                                                    <div className="text-center py-10 px-6">
                                                        <p className="text-sm text-muted">
                                                            No results for{" "}
                                                            <span className="font-medium text-foreground">
                                                                &ldquo;
                                                                {query}
                                                                &rdquo;
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}

                                            {/* Results list */}
                                            {results.length > 0 && (
                                                <ul className="p-2">
                                                    {results.map(
                                                        (result, i) => (
                                                            <li
                                                                key={result.url}
                                                                data-active={
                                                                    i ===
                                                                    activeIndex
                                                                }
                                                                onMouseEnter={() =>
                                                                    setActiveIndex(
                                                                        i
                                                                    )
                                                                }
                                                                onClick={() => {
                                                                    close();
                                                                    window.location.href =
                                                                        result.url;
                                                                }}
                                                                className={`search-result group flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-100 ${
                                                                    i ===
                                                                    activeIndex
                                                                        ? "bg-surface-hover"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <FileText
                                                                    className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                                                                        i ===
                                                                        activeIndex
                                                                            ? "text-primary"
                                                                            : "text-muted/30"
                                                                    }`}
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p
                                                                        className={`text-sm font-semibold truncate transition-colors ${
                                                                            i ===
                                                                            activeIndex
                                                                                ? "text-primary"
                                                                                : "text-foreground"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            result.title
                                                                        }
                                                                    </p>
                                                                    <p
                                                                        className="search-excerpt text-xs text-muted/70 mt-0.5 line-clamp-1"
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: result.excerpt,
                                                                        }}
                                                                    />
                                                                    {result
                                                                        .sub_results
                                                                        .length >
                                                                        0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                                                            {result.sub_results.map(
                                                                                (
                                                                                    sub
                                                                                ) => (
                                                                                    <a
                                                                                        key={
                                                                                            sub.url
                                                                                        }
                                                                                        href={
                                                                                            sub.url
                                                                                        }
                                                                                        onClick={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation();
                                                                                            close();
                                                                                        }}
                                                                                        className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-primary/80 bg-primary/5 border border-primary/10 rounded hover:bg-primary/10 transition-colors truncate max-w-[180px]"
                                                                                    >
                                                                                        {
                                                                                            sub.title
                                                                                        }
                                                                                    </a>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Footer hints */}
                                        <div className="flex items-center justify-end gap-4 px-4 py-2 border-t border-border">
                                            <span className="text-[11px] text-muted/50 flex items-center gap-1">
                                                <kbd className="px-1.5 py-0.5 bg-surface-hover rounded border border-border text-[10px] font-medium text-muted">
                                                    ↑↓
                                                </kbd>
                                                navigate
                                            </span>
                                            <span className="text-[11px] text-muted/50 flex items-center gap-1">
                                                <kbd className="px-1.5 py-0.5 bg-surface-hover rounded border border-border text-[10px] font-medium text-muted">
                                                    ↵
                                                </kbd>
                                                open
                                            </span>
                                            <span className="text-[11px] text-muted/50 flex items-center gap-1">
                                                <kbd className="px-1.5 py-0.5 bg-surface-hover rounded border border-border text-[10px] font-medium text-muted">
                                                    ESC
                                                </kbd>
                                                close
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </>
    );
}
