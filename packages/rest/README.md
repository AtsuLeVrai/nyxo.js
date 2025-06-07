<div align="center">
  <h1>🌐 @nyxojs/rest</h1>
  <h3>Enterprise-Grade Discord REST API Client with Advanced Rate Limiting</h3>

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

`@nyxojs/rest` is an enterprise-grade Discord REST API client designed for high-performance Discord applications. Built
with reliability and developer experience in mind, it provides intelligent rate limiting, automatic retries,
comprehensive file handling, and complete type safety for all Discord API interactions.

Perfect for bots that need reliable API communication, advanced rate limit management, file uploads, and comprehensive
error handling under heavy load.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> @nyxojs/rest is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions as
> we work towards v1.0.

## ✨ Key Features

### 🛡️ **Advanced Rate Limiting**

- **Intelligent Bucket Management** - Automatic rate limit tracking per endpoint
- **Proactive Prevention** - Prevent 429 errors before they happen
- **Global & Route-Specific** - Handle both global and per-route rate limits
- **CloudFlare Protection** - Built-in protection against CloudFlare bans

### 🔄 **Robust Retry System**

- **Exponential Backoff** - Smart retry delays with jitter
- **Categorized Errors** - Different strategies for different error types
- **Request Correlation** - Track retry attempts across request lifecycle
- **Comprehensive Logging** - Detailed retry event emission

### 📁 **Enterprise File Handling**

- **Security-First** - Deep content inspection and validation
- **Multiple Input Types** - Support for paths, buffers, streams, and data URIs
- **Discord Context Validation** - Size limits per Discord asset type
- **Memory Efficient** - Stream-based processing with timeout protection

### 🌐 **Complete CDN Support**

- **Type-Safe URLs** - Generate properly formatted Discord CDN URLs
- **Asset Management** - Support for all Discord asset types
- **Size & Format Control** - Automatic format detection and optimization
- **Media Proxy Support** - Enhanced performance for animated content

### 🔧 **Developer Experience**

- **100% TypeScript** - Complete type safety for all Discord API endpoints
- **Resource-Specific Routers** - Organized API access by Discord resource type
- **Event-Driven Architecture** - Monitor rate limits, retries, and performance
- **Connection Pooling** - Optimized HTTP connections with Undici

### ⚡ **Performance & Reliability**

- **Connection Pooling** - Efficient HTTP/1.1 and HTTP/2 support
- **Request Prioritization** - Smart queueing for critical requests
- **Memory Management** - Automatic cleanup and resource disposal
- **Comprehensive Monitoring** - Detailed metrics and event emission

## 📦 Installation

```bash
npm install @nyxojs/rest
# or
yarn add @nyxojs/rest
# or
pnpm add @nyxojs/rest
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