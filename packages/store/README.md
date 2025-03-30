<div align="center">
  <h1>🗄️ @nyxjs/store</h1>
  <h3>High-Performance Data Management for Discord Applications</h3>

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

`@nyxjs/store` is a versatile in-memory data store for Discord applications, optimized for caching and managing
ephemeral data. It extends JavaScript's native Map with advanced features like automatic data expiration, intelligent
eviction strategies, and powerful querying capabilities.

> [!NOTE]
> This package is part of the Nyx.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ✨ Features

- **🔍 Enhanced Map Functionality**
    - Type-safe implementation extending JavaScript's native Map
    - Deep object merging and property manipulation
    - Advanced filtering and querying

- **⏱️ Automatic Data Lifecycle**
    - Configurable TTL (Time-To-Live) per item or globally
    - Automatic cleanup of expired data
    - Multiple eviction strategies (LRU, FIFO)

- **🚀 Optimized Performance**
    - O(1) lookups and insertions
    - Memory-efficient with customizable size limits
    - Designed for frequent read/write operations

- **🧰 Powerful Object Manipulation**
    - Deep merge objects with a single operation
    - Selectively remove object properties with path support
    - Query objects with pattern matching

## 📦 Installation

```bash
# Using npm
npm install @nyxjs/store

# Using pnpm (recommended)
pnpm add @nyxjs/store
```

## 🔧 Basic Usage

```typescript
import {Store} from '@nyxjs/store';

// Create a simple store
const userStore = new Store<string, any>();

// Add users to the store
userStore.set('user1', {
    id: '123456789',
    username: 'JohnDoe',
    permissions: ['READ', 'WRITE']
});

// Get a user from the store
const user = userStore.get('user1');
console.log(user.username); // JohnDoe

// Update a user with deep merging
userStore.add('user1', {
    displayName: 'John',
    permissions: ['ADMIN'] // Will be merged with existing permissions
});

// Find users by criteria
const adminUser = userStore.find({permissions: 'ADMIN'});
```

## ⚙️ Configuration

```typescript
// Create a store with TTL and size limits
const cacheStore = new Store<string, any>(null, {
    // Maximum number of items before eviction
    maxSize: 1000,

    // Default TTL for items in milliseconds (30 minutes)
    ttl: 30 * 60 * 1000,

    // Eviction strategy when maxSize is reached
    evictionStrategy: 'lru' // 'lru' or 'fifo'
});

// Add an item with a custom TTL (5 minutes)
cacheStore.setWithTtl('session', {token: 'abc123'}, 5 * 60 * 1000);
```

## 🔄 Core Methods

### Adding and Updating Data

```typescript
// Set a simple key-value pair
store.set('key', value);

// Add a value with automatic deep merging for objects
store.add('user', {name: 'John'});
store.add('user', {email: 'john@example.com'});
// Result: { name: 'John', email: 'john@example.com' }

// Remove specific properties (supports nested paths)
store.remove('user', 'email');
store.remove('user', ['address.street', 'address.city']);

// Set a value with custom expiration
store.setWithTtl('tempData', data, 60 * 1000); // Expires in 1 minute
```

### Querying Data

```typescript
// Find the first matching item
const admin = store.find({role: 'admin'});

// Find using a function predicate
const seniorUser = store.find(user => user.age > 30);

// Filter to get all matching items
const admins = store.filter({role: 'admin'});

// Transform values with map
const usernames = store.map(user => user.username);

// Sort items
const sortedUsers = store.sort((a, b) => a.age - b.age);

// Paginate results
const page1 = store.slice(0, 10);  // First page, 10 items
const page2 = store.slice(1, 10);  // Second page, 10 items
```

## 🚄 Advanced Examples

### Caching Discord Guild Members

```typescript
// Create a store for guild members with 1-hour TTL
const memberCache = new Store<string, any>(null, {
    ttl: 60 * 60 * 1000,
    maxSize: 10000,
    evictionStrategy: 'lru'
});

// Cache a member
memberCache.set(memberId, {
    id: memberId,
    username: 'User123',
    roles: ['123456', '789012'],
    joinedAt: new Date().toISOString(),
    lastActivity: Date.now()
});

// Update member's activity time without changing other properties
memberCache.add(memberId, {
    lastActivity: Date.now()
});

// Find members with specific role
const moderators = memberCache.filter({roles: 'mod-role-id'});

// Find members who joined in the last week
const newMembers = memberCache.filter(member => {
    const joinedDate = new Date(member.joinedAt);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return joinedDate > weekAgo;
});
```

### Command Cooldowns

```typescript
// Create a cooldown store with short TTL
const cooldowns = new Store<string, { until: number }>(null, {
    ttl: 60 * 1000  // Auto-cleanup after 1 minute
});

// Check if command is on cooldown
function isOnCooldown(userId: string, commandName: string): boolean {
    const key = `${userId}:${commandName}`;
    const entry = cooldowns.get(key);

    if (!entry) return false;
    return Date.now() < entry.until;
}

// Set a command cooldown (10 seconds)
function setCooldown(userId: string, commandName: string): void {
    const key = `${userId}:${commandName}`;
    cooldowns.set(key, {until: Date.now() + 10000});
}
```

### Managing Temporary User Settings

```typescript
// Store for temporary user settings
const userSettings = new Store<string, any>();

// Update user settings with deep merging
userSettings.add('user123', {
    preferences: {
        theme: 'dark',
        notifications: {
            mentions: true
        }
    }
});

// Later, update nested settings without overwriting
userSettings.add('user123', {
    preferences: {
        notifications: {
            directMessages: true
        }
    }
});

// Remove specific settings
userSettings.remove('user123', 'preferences.notifications.mentions');
```

## 📜 License

This package is [AGPL-3.0 licensed](LICENSE).