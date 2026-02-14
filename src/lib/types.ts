export interface PostFrontmatter {
    title: string;
    date: string;
    tags: string[];
    description: string;
}

export interface Post {
    slug: string;
    category: string;
    subcategory: string;
    frontmatter: PostFrontmatter;
    content: string;
}

export interface PostMeta {
    slug: string;
    category: string;
    subcategory: string;
    frontmatter: PostFrontmatter;
}

export interface CategoryTree {
    [category: string]: string[];
}

export interface TOCItem {
    id: string;
    text: string;
    level: number;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
}

export const POSTS_PER_PAGE = 5;
export const SITE_TITLE = "Nhật's Blog";
export const SITE_DESCRIPTION = "A blog about technology, programming, and IT industry insights by Trịnh Minh Nhật.";
export const SITE_URL = "https://blog.trinhminhnhat.com";
export const AUTHOR = "Trịnh Minh Nhật";
