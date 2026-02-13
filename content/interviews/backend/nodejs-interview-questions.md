---
title: "Node.js Backend Interview Questions"
date: "2026-02-06"
tags: ["nodejs", "backend", "interview", "javascript"]
description: "Comprehensive guide to Node.js backend interview questions covering event loop, streams, clustering, and security."
---

## Core Concepts

### 1. Explain the Event Loop

The Node.js event loop is the mechanism that handles asynchronous operations:

```
   ┌───────────────────────────┐
┌─>│           timers          │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ (I/O callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ (incoming connections, data)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

### 2. Streams in Node.js

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';

const upperCase = new Transform({
    transform(chunk, encoding, callback) {
        this.push(chunk.toString().toUpperCase());
        callback();
    }
});

await pipeline(
    createReadStream('input.txt'),
    upperCase,
    createWriteStream('output.txt')
);
```

## Architecture

### 3. Clustering for Multi-Core

```typescript
import cluster from 'cluster';
import { cpus } from 'os';
import express from 'express';

if (cluster.isPrimary) {
    const numCPUs = cpus().length;
    console.log(`Primary ${process.pid} starting ${numCPUs} workers`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
    });
} else {
    const app = express();
    app.get('/', (req, res) => {
        res.json({ worker: process.pid });
    });
    app.listen(3000);
}
```

### 4. Middleware Pattern

```typescript
type Middleware = (req: Request, res: Response, next: () => void) => void;

function compose(middlewares: Middleware[]) {
    return (req: Request, res: Response) => {
        let index = 0;
        function next() {
            if (index < middlewares.length) {
                const mw = middlewares[index++];
                mw(req, res, next);
            }
        }
        next();
    };
}
```

## Security

### 5. Common Security Practices

| Practice | Implementation |
|----------|---------------|
| Input Validation | Zod, Joi schemas |
| Rate Limiting | express-rate-limit |
| CORS | cors middleware |
| Helmet | Security headers |
| SQL Injection | Parameterized queries |

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests',
});

app.use('/api/', limiter);
```

## Error Handling

### 6. Global Error Handler

```typescript
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});
```

## Key Takeaways

1. Master the **event loop** phases
2. Understand **streams** and **buffers**
3. Know **clustering** and **worker threads**
4. Implement proper **error handling**
5. Follow **security best practices**
