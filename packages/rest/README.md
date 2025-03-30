<div align="center">
  <h1>🌐 @nyxjs/rest</h1>
  <h3>Type-Safe Discord REST API Client with Advanced Rate Limiting</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyx.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyx.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?style=for-the-badge&logo=node.js" alt="Node.js">
    </a>
  </p>

  <br />
  <img src="../../public/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

`@nyxjs/rest` is a powerful Discord REST API client with enterprise-grade reliability features. It provides complete
type safety, intelligent rate limit handling, automatic retries, and request prioritization to ensure smooth interaction
with Discord's API even under heavy load.

> [!NOTE]
> This package is part of the Nyx.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ✨ Features

- **🔒 Type-Safe API**
    - Complete TypeScript definitions for all Discord endpoints
    - Automatic validation of request and response data
    - Intelligent error handling with detailed diagnostics

- **⚖️ Advanced Rate Limiting**
    - Proactive bucket tracking and management
    - Global, resource-specific, and per-route limits
    - Intelligent retry strategies with backoff

- **🚦 Request Prioritization**
    - Smart queuing with configurable priorities
    - Critical operations (interactions, webhooks) prioritized
    - Concurrency control to prevent API abuse

- **🔁 Automatic Retries**
    - Exponential backoff with configurable limits
    - Intelligent retry decisions based on error types
    - Detailed retry analytics and reporting

- **🚂 Performance Optimized**
    - Connection pooling for efficient resource usage
    - File upload optimization and processing
    - Streaming support for large payloads

- **🌄 Rich CDN Utilities**
    - Type-safe methods for all Discord CDN resources
    - Automatic URL generation for avatars, emojis, etc.
    - Support for animated content and size options

## 📦 Installation

```bash
# Using npm
npm install @nyxjs/rest

# Using pnpm (recommended)
pnpm add @nyxjs/rest
```

### Optional Dependencies

```bash
# For optimized image processing
pnpm add sharp
```

## 🔧 Basic Usage

```typescript
import {Rest} from '@nyxjs/rest';

// Create a REST client
const rest = new Rest({
    token: 'YOUR_BOT_TOKEN',
    // Optional configuration
    retry: {
        maxRetries: 3,
    },
    queue: {
        enabled: true,
        concurrency: 5,
    }
});

// Make API requests
async function fetchUser(userId) {
    try {
        const user = await rest.users.getUser(userId);
        console.log(`Fetched user: ${user.username}`);
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
    }
}

// Send messages
async function sendMessage(channelId, content) {
    return rest.messages.createMessage(channelId, {
        content
    });
}
```

## ⚙️ Configuration

```typescript
const rest = new Rest({
    // Required: Bot token for authentication
    token: 'YOUR_BOT_TOKEN',

    // Optional: Authentication type
    authType: 'Bot', // 'Bot' or 'Bearer'

    // Optional: Discord API version
    version: 10,

    // Optional: User agent (follows Discord guidelines)
    userAgent: 'DiscordBot (https://github.com/yourusername/yourbot, 1.0.0)',

    // Optional: Rate limit handling configuration
    retry: {
        maxRetries: 5,
        maxTimeout: 30000,
        minTimeout: 500,
        timeoutFactor: 2,
        methods: new Set(['GET', 'PUT', 'DELETE', 'PATCH']),
        statusCodes: new Set([429, 500, 502, 503, 504]),
    },

    // Optional: Request queue configuration
    queue: {
        enabled: true,
        concurrency: 5,
        maxQueueSize: 100,
        priorities: {
            "POST:/interactions": 10, // Highest priority
            "GET:/users": 2,          // Lower priority
        },
        timeout: 60000, // Queue timeout in ms
    }
});
```

## 🌄 CDN Usage Examples

```typescript
import {Cdn} from '@nyxjs/rest';

// Get a user's avatar URL
const avatarUrl = Cdn.userAvatar(userId, avatarHash, {size: 512});

// Get an emoji URL
const emojiUrl = Cdn.emoji(emojiId, {format: 'png'});

// Get a guild icon URL
const guildIconUrl = Cdn.guildIcon(guildId, iconHash);

// Get an animated avatar with GIF format
const animatedAvatarUrl = Cdn.userAvatar(userId, avatarHash, {
    format: 'gif',
    animated: true
});

// Get a sticker URL
const stickerUrl = Cdn.sticker(stickerId, {
    format: 'png',
    size: 320
});
```

## 🚄 Advanced Examples

### Managing Files and Attachments

```typescript
import {Rest} from '@nyxjs/rest';
import {readFile} from 'node:fs/promises';

const rest = new Rest({token: 'YOUR_BOT_TOKEN'});

async function sendFileMessage(channelId, filePath, filename, content) {
    const fileBuffer = await readFile(filePath);

    return rest.messages.createMessage(channelId, {
        content,
        files: [{
            data: fileBuffer,
            name: filename
        }]
    });
}

// Sending multiple files
async function sendMultipleFiles(channelId) {
    return rest.messages.createMessage(channelId, {
        content: 'Here are your files!',
        files: [
            {data: await readFile('./image.png'), name: 'image.png'},
            {data: await readFile('./document.pdf'), name: 'document.pdf'}
        ]
    });
}
```

### Working with Webhooks

```typescript
import {Rest} from '@nyxjs/rest';

const rest = new Rest({token: 'YOUR_BOT_TOKEN'});

// Execute webhook with a message
async function sendWebhookMessage(webhookId, webhookToken, content) {
    return rest.webhooks.executeWebhook(webhookId, webhookToken, {
        content,
        username: 'Custom Webhook Name',
        avatar_url: 'https://example.com/avatar.png'
    });
}

// Edit a webhook message
async function editWebhookMessage(webhookId, webhookToken, messageId, newContent) {
    return rest.webhooks.editWebhookMessage(webhookId, webhookToken, messageId, {
        content: newContent
    });
}
```

### Efficient Guild Management

```typescript
import {Rest} from '@nyxjs/rest';

const rest = new Rest({token: 'YOUR_BOT_TOKEN'});

// Create a server ban with audit log reason
async function banUser(guildId, userId, reason, deleteMessageDays = 7) {
    return rest.guilds.createGuildBan(guildId, userId, {
        delete_message_days: deleteMessageDays
    }, reason);
}

// Fetch audit logs with filtering
async function fetchAuditLogs(guildId, options = {}) {
    return rest.auditLogs.getAuditLogs(guildId, {
        limit: 50,
        user_id: options.userId,
        action_type: options.actionType
    });
}
```

### Event Handling for Monitoring

```typescript
import {Rest} from '@nyxjs/rest';

const rest = new Rest({token: 'YOUR_BOT_TOKEN'});

// Listen for rate limit events
rest.on('rateLimitHit', (event) => {
    console.warn(`Rate limit hit: ${event.bucketId}, retry after ${event.resetAfter}s`);
});

// Monitor requests
rest.on('requestStart', (event) => {
    console.debug(`${event.method} ${event.path} started`);
});

rest.on('requestSuccess', (event) => {
    console.debug(`${event.method} ${event.path} completed in ${event.duration}ms`);
});

rest.on('requestFailure', (event) => {
    console.error(`${event.method} ${event.path} failed: ${event.error.message}`);
});

// Monitor retries
rest.on('retry', (event) => {
    console.info(`Retry attempt ${event.attempt}/${event.maxAttempts} for ${event.path}`);
});
```

## 📜 License

This package is [AGPL-3.0 licensed](LICENSE).