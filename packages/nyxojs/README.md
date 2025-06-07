<div align="center">
  <h1>🌌 Nyxo.js</h1>
  <h3>Complete Next-Generation Discord Bot Framework with Type-Safe API, Auto-Caching, and Real-Time Gateway</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyxo.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?style=for-the-badge&logo=node.js" alt="Node.js">
    </a>
    <a href="https://discord.gg/hfMzQMbaMg">
      <img src="https://img.shields.io/discord/1301585513651634236?color=5865F2&label=Discord&logo=discord&style=for-the-badge" alt="Discord">
    </a>
  </p>

  <br />
  <img src="../../public/nyxojs_banner.png" alt="Nyxo.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

`Nyxo.js` is a cutting-edge Discord bot framework that redefines how developers build Discord applications. Designed
from
the ground up with TypeScript, it provides a comprehensive, modular, and type-safe ecosystem for creating sophisticated
Discord bots with enterprise-grade reliability and performance.

Built on a foundation of specialized packages that work seamlessly together, Nyxo.js offers everything from low-level
Gateway connections to high-level abstractions, giving developers the flexibility to use exactly what they need while
maintaining complete type safety throughout their application.

Perfect for building everything from simple utility bots to complex, large-scale Discord applications with advanced
features like sharding, caching strategies, and real-time event processing.

> [!NOTE]
> Nyxo.js is designed as a complete ecosystem of Discord development tools that can be used together as a framework or
> independently as specialized libraries.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> Nyxo.js is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions as we
> work towards v1.0.

## ✨ Key Features

### 🏗️ **Complete Framework Architecture**

- **Unified Client** - Single entry point managing all Discord API interactions
- **Modular Design** - Use the full framework or individual packages as needed
- **Event-Driven Architecture** - Sophisticated event handling with intelligent routing
- **Automatic Caching** - Smart caching system with configurable strategies per entity type

### 🛡️ **Enterprise-Grade Type Safety**

- **100% TypeScript** - Complete type safety from API calls to event handling
- **Intelligent IntelliSense** - Rich autocompletion for all Discord entities and methods
- **Compile-Time Validation** - Catch errors before runtime with strict typing
- **Decorator-Based Caching** - Type-safe entity caching with automatic management

### ⚡ **High-Performance Foundation**

- **Advanced Gateway Management** - Intelligent connection handling with automatic reconnection
- **Smart Rate Limiting** - Proactive rate limit management to prevent API throttling
- **Efficient Caching** - Configurable LRU/FIFO caching with TTL support and memory optimization
- **Sharding Support** - Built-in horizontal scaling for large bots (2500+ guilds)

### 🔧 **Developer Experience Excellence**

- **Fluent API Design** - Intuitive method chaining for readable and maintainable code
- **Rich Builders** - Type-safe builders for slash commands, embeds, components, and more
- **Comprehensive Events** - Detailed event system covering all Discord Gateway and REST events
- **Advanced Utilities** - Powerful utilities for permissions, snowflakes, markdown, and more

### 🌐 **Production-Ready Features**

- **Multiple Data Formats** - Support for JSON and ETF encoding with automatic optimization
- **Compression Support** - Bandwidth optimization with zlib and zstd compression
- **Error Handling** - Robust error handling with automatic retries and backoff strategies
- **Resource Management** - Automatic cleanup and memory management for long-running applications

### 📦 **Modular Package System**

- **@nyxojs/core** - TypeScript definitions and utilities
- **@nyxojs/rest** - Enterprise REST API client with advanced rate limiting
- **@nyxojs/gateway** - High-performance WebSocket client for real-time events
- **@nyxojs/builders** - Type-safe builders for Discord components
- **@nyxojs/store** - High-performance in-memory data store with advanced features

## 📦 Installation

```bash
npm install nyxojs
# or
yarn add nyxojs
# or
pnpm add nyxojs
```

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📜 License

This package is [Apache 2.0 licensed](../../LICENSE).

---

<div align="center">
  <h3>The Complete Discord Bot Framework</h3>
  <p>
    <a href="../../README.md">🌌 Main Project</a> •
    <a href="https://discord.gg/hfMzQMbaMg">💬 Discord</a> •
    <a href="https://github.com/AtsuLeVrai/nyxo.js/issues">🐛 Issues</a>
  </p>
</div>