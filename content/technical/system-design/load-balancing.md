---
title: "Load Balancing: Distributing Traffic at Scale"
date: "2026-02-20"
tags: ["load-balancing", "system-design", "scalability", "networking"]
description: "Understand load balancing algorithms and strategies for distributing traffic across multiple servers to achieve high availability."
series: "System Design Fundamentals"
series_order: 5
---

## What is Load Balancing?

Load balancing distributes incoming network traffic across multiple servers to ensure no single server bears too much demand.

## Algorithms

- **Round Robin**: Requests are distributed sequentially across the pool
- **Least Connections**: Routes to the server with the fewest active connections
- **IP Hash**: Client IP determines which server receives the request

## Layer 4 vs Layer 7

- **L4 (Transport)**: Routes based on IP and TCP data
- **L7 (Application)**: Routes based on content (URL, headers, cookies)
