import { AUTHOR, SITE_TITLE } from "@/lib/types";

export default function Footer() {
    return (
        <footer className="mt-16 relative">
            <div className="h-0.5 gradient-primary" />
            <div className="border-t border-primary/10 bg-surface/30">
                <div className="w-full max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
                        <p>
                            © {new Date().getFullYear()}{" "}
                            <span className="text-primary font-medium">{SITE_TITLE}</span>. By{" "}
                            {AUTHOR}.
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="/rss.xml"
                                className="hover:text-primary transition-colors flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                                    <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
                                </svg>
                                RSS
                            </a>
                            <a
                                href="/sitemap.xml"
                                className="hover:text-primary transition-colors"
                            >
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
