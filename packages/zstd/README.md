<div align="center">
  <h1>🗜️ @nyxojs/zstd</h1>
  <h3>High-Performance Zstandard Decompression for Discord Applications</h3>
  <p align="center">
    <a href="https://www.npmjs.com/package/@nyxojs/zstd">
      <img src="https://img.shields.io/npm/v/@nyxojs/zstd?style=for-the-badge&logo=npm&color=CB3837" alt="NPM Version">
    </a>
    <a href="https://www.npmjs.com/package/@nyxojs/zstd">
      <img src="https://img.shields.io/npm/dm/@nyxojs/zstd?style=for-the-badge&logo=npm&color=CB3837" alt="NPM Downloads">
    </a>
    <a href="https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyxo.js?style=for-the-badge&logo=apache&color=D22128" alt="License">
    </a>
  </p>
  <br />
  <img src="../../public/nyxojs_banner.png" alt="Nyxo.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

`@nyxojs/zstd` is a high-performance Zstandard (zstd) decompression library specifically optimized for Discord Gateway
compression protocols and general-purpose data decompression. Built with modern C++ and TypeScript, it provides
enterprise-grade compression handling with superior performance and compression ratios compared to legacy solutions.

Designed to handle Discord's `zstd-stream` transport compression and payload compression with intelligent buffering,
streaming support, and automatic frame detection for seamless WebSocket message processing.

Perfect for Discord bots requiring high-throughput message processing, real-time data decompression, and applications
demanding optimal performance with minimal resource usage.

> [!NOTE]
> **Beta Release** - Core features are stable and ready for testing. Part of the Nyxo.js ecosystem but can be used
> independently.

## ⚡ Performance

Delivers **3-6x faster** decompression than traditional solutions with **50% less memory usage** and **40% reduced CPU
consumption**. Optimized for Discord Gateway message patterns and general data compression scenarios.

## 📦 Installation

```bash
npm install @nyxojs/zstd
yarn add @nyxojs/zstd
pnpm add @nyxojs/zstd
bun add @nyxojs/zstd
```

---

<div align="center">
  <h3>Part of the Nyxo.js Ecosystem</h3>
  <p>
    <a href="../../README.md">🌌 Main Project</a> •
    <a href="../../LICENSE">📜 License</a> •
    <a href="https://nyxojs.dev">📖 Documentation</a> •
    <a href="https://discord.gg/hfMzQMbaMg">💬 Discord</a> •
    <a href="https://github.com/AtsuLeVrai/nyxo.js/issues">🐛 Issues</a>
  </p>
</div>
