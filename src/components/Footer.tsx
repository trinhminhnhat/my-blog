import { Rss } from "lucide-react";
import { AUTHOR, SITE_TITLE } from "@/lib/types";

export default function Footer() {
    return (
        <footer className="mt-16 relative">
            <div className="h-0.5 gradient-primary" />
            <div className="border-t border-primary/10 bg-surface/30">
                <div className="w-full max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
                        <p>
                            © {new Date().getFullYear()}{" "}. Created by <a href="https://trinhminhnhat.com" target="_blank" className="text-primary">{AUTHOR}</a>
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="/rss.xml"
                                className="hover:text-primary flex items-center gap-1.5"
                            >
                                <Rss className="w-4 h-4" />
                                RSS
                            </a>
                            <a
                                href="/sitemap.xml"
                                className="hover:text-primary"
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
