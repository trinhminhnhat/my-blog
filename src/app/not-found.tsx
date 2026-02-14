import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            {/* 404 Number */}
            <div className="relative mb-6">
                <h1 className="text-[8rem] md:text-[10rem] font-black leading-none gradient-text select-none">
                    404
                </h1>
                <div className="absolute inset-0 gradient-primary opacity-10 blur-3xl rounded-full" />
            </div>

            {/* Message */}
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Page Not Found
            </h2>
            <p className="text-muted text-lg max-w-md mb-8">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>

            {/* Action */}
            <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
            >
                <Home className="w-4 h-4" />
                Back to Home
            </Link>
        </div>
    );
}
