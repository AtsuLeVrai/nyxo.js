<div align="center">
  <h1>🌉 @nyxojs/gateway</h1>
  <h3>High-Performance Discord Gateway Client for Real-Time Communication and Scalable Bots</h3>

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

`@nyxojs/gateway` is a robust, enterprise-grade Discord Gateway client designed for scalable real-time applications.
Built with reliability and performance in mind, it provides intelligent connection management, advanced sharding
capabilities, and comprehensive error recovery for high-throughput Discord bots serving millions of users.

Perfect for bots that require rock-solid WebSocket connections, efficient event processing, automatic failover
capabilities, and horizontal scaling through intelligent sharding strategies.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> @nyxojs/gateway is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions
> as we work towards v1.0.

## ✨ Key Features

### 🔄 **Intelligent Connection Management**

- **Automatic Reconnection** - Smart retry logic with exponential backoff
- **Session Resumption** - Seamless recovery without data loss
- **Connection Health Monitoring** - Real-time latency and status tracking
- **Graceful Degradation** - Handles Discord outages and rate limits

### 💓 **Advanced Heartbeat System**

- **Precise Timing** - Maintains connections with Discord's exact intervals
- **Latency Measurement** - Real-time ping monitoring and connection quality
- **Missed Heartbeat Detection** - Automatic recovery from zombied connections
- **Jitter Prevention** - Prevents thundering herd effects during startup

### 🧩 **Enterprise Sharding**

- **Automatic Shard Management** - Distributes guilds across multiple connections
- **Load Balancing** - Intelligent guild distribution for optimal performance
- **Independent Shard Health** - Per-shard monitoring and recovery
- **Rate Limit Coordination** - Bucket-based identify operations

### 🗜️ **Bandwidth Optimization**

- **Multiple Compression Algorithms** - Zlib and Zstandard support
- **Encoding Flexibility** - JSON and ETF (Erlang Term Format) support
- **Payload Validation** - Size limits and format verification
- **Memory Efficient** - Streaming compression with buffer pooling

### 🛡️ **Robust Error Handling**

- **Categorized Recovery** - Different strategies for different error types
- **State Machine Architecture** - Prevents invalid state transitions
- **Event Correlation** - Track errors across the connection lifecycle
- **Comprehensive Logging** - Detailed event emission for monitoring

### ⚡ **High Performance**

- **Event-Driven Architecture** - Non-blocking event processing
- **Memory Management** - Automatic cleanup and resource disposal
- **Configurable Caching** - Balance memory usage with performance
- **Zero-Copy Operations** - Efficient buffer handling for high throughput

## 📦 Installation

```bash
npm install @nyxojs/gateway
# or
yarn add @nyxojs/gateway
# or
pnpm add @nyxojs/gateway
```

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