import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    output: "export",
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
    sassOptions: {
        silenceDeprecations: ["import"],
    },
};

export default nextConfig;
