---
title: "Database Design Patterns for Scalable Systems"
date: "2026-02-05"
tags: ["database", "system-design", "scalability"]
description: "Explore essential database design patterns including sharding, replication, and CQRS for building scalable systems."
---

## Introduction

Database design is crucial for system scalability. This post covers essential patterns that help you design databases capable of handling millions of users.

## Sharding Strategies

### Horizontal Sharding

Distributing rows across multiple database instances:

```typescript
function getShardKey(userId: string, totalShards: number): number {
    const hash = userId
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % totalShards;
}

// Route query to correct shard
const shardId = getShardKey(userId, 4);
const db = shardConnections[shardId];
const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### Vertical Sharding

Splitting tables into different databases based on feature domains:

- **User DB**: users, profiles, preferences
- **Order DB**: orders, order_items, payments
- **Product DB**: products, categories, inventory

## Replication Patterns

### Primary-Replica

```
Primary (Write) ──► Replica 1 (Read)
                 ──► Replica 2 (Read)
                 ──► Replica 3 (Read)
```

### Multi-Primary

Useful for geo-distributed writes, but requires conflict resolution.

## CQRS Pattern

Command Query Responsibility Segregation separates read and write models:

```typescript
// Write Model (Command)
interface CreateOrderCommand {
    userId: string;
    items: OrderItem[];
    shippingAddress: Address;
}

async function handleCreateOrder(cmd: CreateOrderCommand): Promise<void> {
    const order = Order.create(cmd);
    await orderRepository.save(order);
    await eventBus.publish('OrderCreated', order);
}

// Read Model (Query)
interface OrderSummaryQuery {
    userId: string;
    page: number;
}

async function handleOrderSummary(query: OrderSummaryQuery) {
    return readDb.query(
        'SELECT * FROM order_summaries WHERE user_id = ? LIMIT 10 OFFSET ?',
        [query.userId, (query.page - 1) * 10]
    );
}
```

## Indexing Strategies

| Index Type | Use Case | Trade-off |
|-----------|----------|-----------|
| B-Tree | Range queries | Write overhead |
| Hash | Exact match | No range support |
| Full-text | Search queries | Storage cost |
| Composite | Multi-column | Order matters |

## Connection Pooling

Always use connection pooling in production:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

## Conclusion

Choose the right database pattern based on your read/write ratio, data size, and consistency requirements. Often, a combination of these patterns works best for complex systems.
