<div align="center">
  <h1>🌌 Nyxo.js</h1>
  <h3>The Enterprise-Grade TypeScript Framework for Discord Bot Development</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyxo.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://biomejs.com/">
      <img src="https://img.shields.io/badge/biome-Check-60a5fa?style=for-the-badge&logo=biome&color=60a5fa" alt="Biome Check">
    </a>
    <a href="https://discord.gg/hfMzQMbaMg">
        <img src="https://img.shields.io/discord/1301585513651634236?color=5865F2&label=Discord&logo=discord&style=for-the-badge" alt="Discord">
    </a>
  </p>

  <br />
  <img src="./public/nyxojs_banner.png" alt="nyxo.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

**Nyxo.js** is a next-generation Discord bot framework that combines enterprise-grade features with developer-friendly
design. Built from the ground up with TypeScript, it offers unmatched type safety, modular architecture, and advanced
performance optimizations.

Unlike other Discord libraries, Nyxo.js is designed for **scalable applications** that demand reliability,
maintainability, and professional-grade features.

## 🌙 Why "Nyxo.js"?

The name **Nyxo** is inspired by **Nyx**, the Greek goddess of the night, symbolizing mystery, power, and elegance.  
The suffix **-o** adds a modern and dynamic touch, reflecting the framework's ambition: to provide a powerful, smooth,
and innovative solution for building Discord bots with TypeScript.

Thus, **Nyxo.js** embodies both the depth and sophistication of the night and the modernity of a tool designed for
today's developers.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> Nyxo.js is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions as we
> work towards v1.0.

## 🏆 Performance Benchmarks

Nyxo.js delivers competitive performance with enterprise features:

| Library        | Memory (Stable) | Startup Time | Architecture   | Use Case                  |
|----------------|-----------------|--------------|----------------|---------------------------|
| **Eris**       | 54MB            | 480ms        | Minimal        | Simple bots               |
| **Discord.js** | 66MB            | 590ms        | Standard       | General purpose           |
| **Oceanic.js** | 62MB            | 706ms        | Modern         | Modern development        |
| **Nyxo.js**    | 75MB            | 626ms        | **Enterprise** | **Scalable applications** |

*Benchmarks conducted with identical configuration (Intent 513, minimal setup)*

## ✨ Key Features

### 🏗️ **Enterprise Architecture**

- **Modular Design** - Separate packages for Gateway, REST, Store, and Core
- **Dependency Injection** - Clean separation of concerns
- **Event-driven** - Robust event system with type-safe handlers
- **Memory Management** - Advanced caching with LRU eviction and TTL

### ⚡ **Advanced Performance**

- **Zstandard Compression** - Same technology used by Discord's infrastructure
- **ETF Encoding** - Binary format for 20-30% smaller payloads
- **Intelligent Rate Limiting** - Proactive rate limit management
- **Connection Pooling** - Optimized HTTP client with persistent connections

### 🛡️ **Type Safety & DX**

- **100% TypeScript** - Full type coverage with strict checking
- **Zod Validation** - Runtime type validation for configuration
- **Comprehensive Documentation** - TSDoc comments throughout
- **Modern Standards** - ESM modules, latest Node.js features

## 📦 Installation

```bash
npm install nyxo.js
# or
yarn add nyxo.js
# or
pnpm add nyxo.js
```

## 🚀 Quick Start

### Basic Bot

```typescript
import {Client, GatewayIntentsBits} from 'nyxo.js';

const client = new Client({
    token: process.env.DISCORD_TOKEN!,
    intents: [
        GatewayIntentsBits.Guilds,
        GatewayIntentsBits.GuildMessages,
    ],
});

client.once('ready', (ready) => {
    console.log(`🤖 Logged in as ${ready.user.username}!`);
});

client.on('messageCreate', (message) => {
    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    }
});

await client.gateway.connect();
```

### Advanced Configuration

```typescript
import {Client, GatewayIntentsBits} from 'nyxo.js';

const client = new Client({
    token: process.env.DISCORD_TOKEN!,
    intents: [
        GatewayIntentsBits.Guilds,
        GatewayIntentsBits.GuildMembers,
        GatewayIntentsBits.GuildModeration,
        GatewayIntentsBits.GuildExpressions,
        GatewayIntentsBits.GuildIntegrations,
        GatewayIntentsBits.GuildWebhooks,
        GatewayIntentsBits.GuildInvites,
        GatewayIntentsBits.GuildVoiceStates,
        GatewayIntentsBits.GuildPresences,
        GatewayIntentsBits.GuildMessages,
        GatewayIntentsBits.GuildMessageReactions,
        GatewayIntentsBits.GuildMessageTyping,
        GatewayIntentsBits.DirectMessages,
        GatewayIntentsBits.DirectMessageReactions,
        GatewayIntentsBits.DirectMessageTyping,
        GatewayIntentsBits.MessageContent,
        GatewayIntentsBits.GuildScheduledEvents,
        GatewayIntentsBits.AutoModerationConfiguration,
        GatewayIntentsBits.AutoModerationExecution,
        GatewayIntentsBits.GuildMessagePolls,
        GatewayIntentsBits.DirectMessagePolls,
    ],

    // Enterprise features
    compressionType: 'zstd-stream',
    encodingType: 'etf',

    // Advanced caching
    cache: {
        guilds: {maxSize: 1000, ttl: 3600000},
        users: {maxSize: 10000, ttl: 1800000},
        messages: {maxSize: 5000, ttl: 300000},
    },

    // Rate limiting
    rateLimit: {
        maxGlobalRequestsPerSecond: 50,
        safetyMargin: 100,
    },

    // Retry configuration
    retry: {
        maxRetries: 3,
        baseDelay: 1000,
    },
});
```

## 🏛️ Architecture

Nyxo.js follows a modular architecture for maximum flexibility:

```
packages/
├── builders/           # Embed, components and other builders
├── core/           # Shared utilities and types
├── gateway/        # WebSocket connection and events
├── nyxojs/         # Main client package
├── rest/           # HTTP client and API routes
└── store/          # Advanced caching system
```

### Key Components

- **Gateway Manager** - Handles WebSocket connections, heartbeats, and event dispatching
- **REST Client** - Manages HTTP requests with rate limiting and retries
- **Cache System** - Intelligent caching with multiple eviction strategies
- **Type System** - Comprehensive TypeScript definitions for Discord API

## 🔄 Comparison with Other Libraries

| Feature               | Discord.js | Eris        | Oceanic.js | **Nyxo.js**       |
|-----------------------|------------|-------------|------------|-------------------|
| **TypeScript**        | ✅          | ❌           | ✅          | ✅ **Native**      |
| **Memory Usage**      | Good       | Excellent   | Good       | **Good**          |
| **Performance**       | Good       | Excellent   | Good       | **Very Good**     |
| **Architecture**      | Monolithic | Simple      | Modular    | **Enterprise**    |
| **Advanced Features** | Basic      | Minimal     | Standard   | **Comprehensive** |
| **Documentation**     | Excellent  | Good        | Good       | **Excellent**     |
| **Learning Curve**    | Easy       | Medium      | Easy       | **Medium**        |
| **Use Case**          | General    | Performance | Modern     | **Enterprise**    |

## 📚 Documentation

- 📖 **[Getting Started Guide](./docs/getting-started.md)**
- 🔧 **[Configuration Reference](./docs/configuration.md)**
- 🏗️ **[Architecture Overview](./docs/architecture.md)**
- 📡 **[Gateway Guide](./docs/gateway.md)**
- 🌐 **[REST API Guide](./docs/rest.md)**
- 💾 **[Caching System](./docs/caching.md)**
- 🎯 **[Performance Tuning](./docs/performance.md)**

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/AtsuLeVrai/nyxo.js
cd nyxo.js
pnpm install -r
pnpm run build:dev
```

## 🎉 Community

- 💬 **[Discord Server](https://discord.gg/hfMzQMbaMg)** - Join our community
- 🐛 **[Issues](https://github.com/AtsuLeVrai/nyxo.js/issues)** - Report bugs and request features

## 🙏 Acknowledgments

Nyxo.js draws inspiration from the innovative features and design patterns of various Discord libraries including
Discord.js, Eris, Oceanic.js, and others, combining the best aspects of each to create a comprehensive
enterprise-grade solution.

## 📜 License

Nyxo.js is [Apache 2.0 licensed](LICENSE).

---

<div align="center">
  <h3>🌟 Star this repository if you find Nyxo.js useful!</h3>
  <p>
    Built with ❤️ by the Nyxo.js team
  </p>
</div>