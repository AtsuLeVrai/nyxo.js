<div align="center">
  <h1>🌉 @nyxjs/gateway</h1>
  <h3>High-Performance Discord Gateway Client for Scalable Bots</h3>

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

`@nyxjs/gateway` is a robust WebSocket client for Discord's Gateway API, designed for reliability and scalability. It
handles complex operations like connection lifecycle management, heartbeats, sharding, and reconnection logic with type
safety at its core.

> [!NOTE]
> This package is part of the Nyx.js ecosystem but can be used independently with your own Discord bot implementations.

## ✨ Features

- **🔄 Robust Connection Management**
    - Automatic reconnection with intelligent backoff
    - Session resuming after disconnects
    - Smart handling of Discord close codes

- **🔀 Advanced Sharding**
    - Auto-scaling based on guild count
    - Proper rate limit handling
    - Dynamic guild distribution

- **⚡ Performance Optimized**
    - Support for ETF encoding
    - Multiple compression options (Zlib/Zstandard)
    - Efficient event handling

- **🔒 Type Safety**
    - Comprehensive TypeScript definitions
    - Strong event typing
    - Validation with Zod

## 📦 Installation

```bash
# Using npm
npm install @nyxjs/gateway

# Using pnpm (recommended)
pnpm add @nyxjs/gateway
```

### Optional Dependencies

```bash
pnpm add erlpack zlib-sync fzstd bufferutil
```

## 🔧 Basic Usage

```typescript
import {Gateway} from '@nyxjs/gateway';
import {Rest} from '@nyxjs/rest';
import {GatewayIntentsBits} from '@nyxjs/gateway';

// Create a REST client
const rest = new Rest({token: 'YOUR_BOT_TOKEN'});

// Create a Gateway client
const gateway = new Gateway(rest, {
    intents: [
        GatewayIntentsBits.Guilds,
        GatewayIntentsBits.GuildMessages,
        GatewayIntentsBits.MessageContent,
    ],
});

// Listen for Discord events
gateway.on('dispatch', (event, data) => {
    if (event === 'MESSAGE_CREATE') {
        console.log(`Message: ${data.content}`);
    }
});

// Handle connection events
gateway.on('connectionSuccess', (event) => {
    console.log(`Connected to gateway!`);
});

// Connect to Discord
gateway.connect()
    .then(() => console.log('Gateway ready!'))
    .catch(err => console.error('Failed to connect:', err));
```

## ⚙️ Configuration

```typescript
const gateway = new Gateway(rest, {
    // Required: Gateway intents
    intents: GatewayIntentsBits.Guilds | GatewayIntentsBits.GuildMessages,

    // Optional: Encoding format (default: 'json')
    encodingType: 'etf', // 'json' or 'etf'

    // Optional: Compression (default: none)
    compressionType: 'zlib-stream', // 'zlib-stream' or 'zstd-stream'

    // Optional: Initial presence
    presence: {
        status: 'online',
        activities: [{
            name: 'with Nyx.js',
            type: 0
        }],
        since: null,
        afk: false
    },

    // Advanced options also available for heartbeat and sharding
});
```

## 🔄 Event System

The Gateway emits various strongly-typed events:

```typescript
// Discord Gateway events
gateway.on('dispatch', (event, data) => {
    // All Discord events (MESSAGE_CREATE, GUILD_CREATE, etc.)
});

// Connection lifecycle
gateway.on('connectionSuccess', (event) => { /* ... */
});
gateway.on('reconnectionScheduled', (event) => { /* ... */
});

// Session events
gateway.on('sessionStart', (event) => { /* ... */
});
gateway.on('sessionResume', (event) => { /* ... */
});

// Shard events
gateway.on('shardCreate', (event) => { /* ... */
});
gateway.on('shardReady', (event) => { /* ... */
});

// Heartbeat events
gateway.on('heartbeatSent', (event) => { /* ... */
});
gateway.on('heartbeatTimeout', (event) => { /* ... */
});
```

## 🚄 Advanced Examples

### Manual Sharding

```typescript
const gateway = new Gateway(rest, {
    intents: [GatewayIntentsBits.Guilds],
    shard: {
        totalShards: 4,     // Total shards
        shardList: [0, 1],  // Only spawn shards 0 and 1 in this process
    }
});
```

### Voice Connections

```typescript
// Join a voice channel
gateway.updateVoiceState({
    guild_id: '123456789012345678',
    channel_id: '876543210987654321',
    self_mute: false,
    self_deaf: false
});
```

### Request Guild Members

```typescript
gateway.requestGuildMembers({
    guild_id: '123456789012345678',
    query: '',
    limit: 0,
    presences: true
});
```

## 📜 License

This package is [AGPL-3.0 licensed](LICENSE).