---
title: "Top React Interview Questions 2026"
date: "2026-02-12"
tags: ["react", "frontend", "interview", "javascript"]
description: "Essential React interview questions and answers covering hooks, performance optimization, and modern patterns."
---

## React Fundamentals

### 1. What is the Virtual DOM?

The Virtual DOM is a lightweight JavaScript representation of the actual DOM. React uses it to determine the minimal set of changes needed to update the real DOM efficiently.

```
State Change → New Virtual DOM → Diff with Previous → Minimal DOM Updates
```

### 2. Explain React Hooks

Hooks let you use state and lifecycle features in functional components:

```tsx
import { useState, useEffect, useCallback } from 'react';

function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        setUser(data);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) return <div>Loading...</div>;
    return <div>{user?.name}</div>;
}
```

## Performance Optimization

### 3. How to prevent unnecessary re-renders?

- **React.memo** - Memoize components
- **useMemo** - Memoize expensive computations
- **useCallback** - Memoize function references

```tsx
const ExpensiveList = React.memo(({ items }: { items: Item[] }) => {
    const sortedItems = useMemo(
        () => items.sort((a, b) => a.name.localeCompare(b.name)),
        [items]
    );

    return (
        <ul>
            {sortedItems.map(item => (
                <li key={item.id}>{item.name}</li>
            ))}
        </ul>
    );
});
```

### 4. What is Code Splitting?

```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    );
}
```

## Advanced Patterns

### 5. Custom Hooks

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        const valueToStore =
            value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
    };

    return [storedValue, setValue] as const;
}
```

### 6. Error Boundaries

```tsx
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}
```

## Key Takeaways

1. Understand the **reconciliation algorithm**
2. Know when to use **useEffect vs useLayoutEffect**
3. Master **state management** patterns (Context, Zustand, Redux)
4. Learn **Server Components** in Next.js
5. Practice building **custom hooks**
