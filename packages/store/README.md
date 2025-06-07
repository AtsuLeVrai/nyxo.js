<div align="center">
  <h1>🗄️ @nyxojs/store</h1>
  <h3>High-Performance Data Management for Discord Applications</h3>

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

`@nyxojs/store` is a high-performance, feature-rich in-memory data store designed for Discord applications. Built on top
of JavaScript's native Map, it provides advanced caching capabilities with TTL support, intelligent eviction strategies,
powerful querying, and comprehensive data manipulation methods.

Perfect for managing user data, guild configurations, message caches, and any ephemeral data that requires fast access
and automatic cleanup.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> @nyxojs/store is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions as
> we work towards v1.0.

## ✨ Key Features

### 🚀 **Performance & Memory Management**

- **LRU & FIFO Eviction** - Intelligent cache eviction strategies
- **TTL Support** - Automatic expiration with configurable sweep intervals
- **Memory Efficient** - Optimized for high-throughput Discord applications
- **Zero Dependencies** - Lightweight with minimal overhead

### 🔍 **Advanced Querying**

- **Pattern Matching** - Find data using object patterns or functions
- **Filtering & Sorting** - Create filtered views with custom comparators
- **Aggregation Methods** - Reduce, map, and transform data efficiently
- **Pagination Support** - Built-in slice methods for large datasets

### 🛠️ **Data Manipulation**

- **Deep Merging** - Intelligent object merging with conflict resolution
- **Property Removal** - Remove nested properties using dot notation
- **Bulk Operations** - Efficient batch insertions and updates
- **Immutable Operations** - Non-destructive transformations

### 🔧 **Developer Experience**

- **100% TypeScript** - Full type safety with comprehensive generics
- **Extensive API** - 40+ methods for data manipulation and querying
- **Method Chaining** - Fluent API design for readable code
- **Resource Management** - Automatic cleanup with Symbol.dispose support

## 📦 Installation

```bash
npm install @nyxojs/store
# or
yarn add @nyxojs/store
# or
pnpm add @nyxojs/store
```

## 🚀 Performance

`@nyxojs/store` is optimized for high-performance Discord applications:

- **O(1)** get, set, has, delete operations
- **O(1)** LRU eviction
- **O(n)** search and aggregation operations
- **Memory efficient** with automatic cleanup
- **Zero allocation** for basic operations

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](../../CONTRIBUTING.md) for details.

## 📜 License

This package is [Apache 2.0 licensed](../../LICENSE).

---

<div align="center">
  <h3>Part of the Nyxo.js Ecosystem</h3>
  <p>
    <a href="../../README.md">🌌 Main Project</a> •
    <a href="https://discord.gg/hfMzQMbaMg">💬 Discord</a> •
    <a href="https://github.com/AtsuLeVrai/nyxo.js/issues">🐛 Issues</a>
  </p>
</div>
```