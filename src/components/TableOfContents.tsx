"use client";

import type { TOCItem } from "@/lib/types";
import { useEffect, useState } from "react";

interface TableOfContentsProps {
    items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                }
            },
            { rootMargin: "-80px 0px -80% 0px" }
        );

        items.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav className="bg-surface/50 border border-border rounded-2xl p-4 space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <span className="w-1 h-4 gradient-primary rounded-full" />
                On this page
            </h3>
            {items.map((item) => (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block text-sm py-1 transition-colors border-l-2 ${
                        activeId === item.id
                            ? "border-primary text-primary font-medium"
                            : "border-transparent text-muted hover:text-foreground hover:border-border"
                    }`}
                    style={{ paddingLeft: `${(item.level - 2) * 12 + 12}px` }}
                    onClick={(e) => {
                        e.preventDefault();
                        document
                            .getElementById(item.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    {item.text}
                </a>
            ))}
        </nav>
    );
}
