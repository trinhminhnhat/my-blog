---
title: "Message Queues and Event-Driven Architecture"
date: "2026-02-25"
tags: ["message-queue", "kafka", "rabbitmq", "system-design", "async"]
description: "Learn how message queues enable asynchronous communication and decoupling in distributed systems using Kafka and RabbitMQ."
series: "System Design Fundamentals"
series_order: 6
---

## Why Message Queues?

Message queues enable asynchronous communication between services, improving resilience and decoupling producers from consumers.

## Popular Solutions

### Apache Kafka

Distributed streaming platform built for high throughput. Uses a log-based approach where messages are retained even after consumption.

### RabbitMQ

Traditional message broker implementing AMQP. Supports various exchange types: direct, topic, fanout, and headers.

## Key Concepts

- **Producer**: Sends messages to the queue
- **Consumer**: Reads and processes messages
- **Topic/Queue**: Named channel for messages
- **Dead Letter Queue (DLQ)**: Holds messages that couldn't be processed
