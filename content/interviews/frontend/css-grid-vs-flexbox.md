---
title: "CSS Grid vs Flexbox: When to Use What"
date: "2026-02-01"
tags: ["css", "frontend", "web-design", "layout"]
description: "A practical comparison of CSS Grid and Flexbox with real-world examples to help you choose the right layout tool."
---

## Overview

Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes:

- **Flexbox**: One-dimensional layouts (row OR column)
- **Grid**: Two-dimensional layouts (rows AND columns)

## Flexbox Examples

### Navigation Bar

```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
    list-style: none;
}
```

### Card with Footer Alignment

```css
.card {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.card-content {
    flex: 1;
}

.card-footer {
    margin-top: auto;
}
```

## CSS Grid Examples

### Dashboard Layout

```css
.dashboard {
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
        "sidebar header"
        "sidebar main";
    height: 100vh;
}

.sidebar { grid-area: sidebar; }
.header { grid-area: header; }
.main { grid-area: main; }
```

### Responsive Card Grid

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
}
```

## Comparison Table

| Feature | Flexbox | Grid |
|---------|---------|------|
| Dimension | 1D | 2D |
| Direction | Row or Column | Both |
| Content-first | Yes | No |
| Layout-first | No | Yes |
| Gap support | Yes | Yes |
| Overlap | No | Yes |
| Auto-placement | Limited | Powerful |

## When to Use What

### Use Flexbox When:
1. Aligning items in a **single direction**
2. Building **navigation bars**
3. **Centering** content
4. **Distributing space** between items

### Use Grid When:
1. Creating **page layouts**
2. Building **card grids**
3. **Overlapping** elements
4. **Complex responsive** layouts

## Combined Approach

The best approach is to use **both together**:

```css
/* Grid for the overall page layout */
.page {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    gap: 2rem;
}

/* Flexbox for individual component layout */
.card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

## Conclusion

Don't think of Flexbox and Grid as competing technologies. They complement each other perfectly. Use Grid for the macro layout and Flexbox for the micro layout within components.
