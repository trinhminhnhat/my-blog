import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoToTop from "@/components/GoToTop";
import { getCategories } from "@/lib/posts";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/lib/types";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: SITE_TITLE,
        template: `%s | ${SITE_TITLE}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    alternates: {
        types: {
            "application/rss+xml": "/rss.xml",
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const categories = getCategories();

    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                var saved = localStorage.getItem('theme');
                                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                if (saved === 'dark' || (!saved && prefersDark)) {
                                    document.documentElement.classList.add('dark');
                                }
                            })();
                        `,
                    }}
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/@pagefind/default-ui@latest/css/ui.css"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
            >
                <Header categories={categories} />
                <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
                    {children}
                </main>
                <Footer />
                <GoToTop />
            </body>
        </html>
    );
}
