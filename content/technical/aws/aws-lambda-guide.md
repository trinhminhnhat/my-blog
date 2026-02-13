---
title: "AWS Lambda: Serverless Computing Guide"
date: "2026-02-08"
tags: ["aws", "lambda", "serverless", "cloud"]
description: "A complete guide to AWS Lambda, covering functions, triggers, best practices, and real-world use cases."
---

## What is AWS Lambda?

AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. You pay only for the compute time you consume.

## How Lambda Works

### Function Structure

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { name } = JSON.parse(event.body || '{}');

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Hello, ${name}!`,
        }),
    };
};
```

### Execution Model

1. Lambda receives an event trigger
2. A new execution environment is created (cold start) or reused (warm start)
3. Your function code executes
4. Lambda returns the response

## Common Triggers

- **API Gateway** - REST/HTTP APIs
- **S3** - File upload processing
- **DynamoDB Streams** - Database change events
- **SQS** - Message queue processing
- **CloudWatch Events** - Scheduled tasks

## Best Practices

### Minimize Cold Starts

```typescript
// Initialize outside handler for connection reuse
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamodb = new DynamoDB({});

export const handler = async (event: any) => {
    // Use the pre-initialized client
    const result = await dynamodb.getItem({
        TableName: 'users',
        Key: { id: { S: event.userId } },
    });
    return result.Item;
};
```

### Environment Variables

Use environment variables for configuration instead of hardcoding values:

```yaml
# serverless.yml
functions:
    processOrder:
        handler: src/handlers/order.handler
        environment:
            TABLE_NAME: ${self:custom.tableName}
            REGION: ${aws:region}
```

## Pricing

| Resource | Free Tier | Cost After |
|----------|-----------|------------|
| Requests | 1M/month | $0.20 per 1M |
| Duration | 400K GB-s | $0.0000166667/GB-s |
| Memory | 128MB-10GB | Included |

## Conclusion

AWS Lambda is a powerful tool for building scalable, event-driven applications. Understanding its execution model and following best practices will help you build efficient serverless architectures.
