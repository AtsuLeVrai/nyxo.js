<div align="center">
  <h1>🗜️ @nyxojs/zlib</h1>
  <h3>Enterprise-Grade Zlib Decompression for Discord Gateway Applications</h3>

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

`@nyxojs/zlib` is a high-performance zlib decompression library specifically optimized for Discord Gateway
compression protocols. Built with modern C++ and TypeScript, it provides enterprise-grade compression handling for
Discord applications requiring real-time message decompression with superior performance compared to legacy solutions.

Designed to handle Discord's `zlib-stream` transport compression and payload compression with intelligent buffering,
shared contexts, and automatic suffix detection for seamless WebSocket message processing.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application
> requiring high-performance zlib decompression.

## ⚠️ Project Status

> [!IMPORTANT]
> **Current Status: Beta Development**  
> This project is in active development. The core functionality is stable and ready for testing, but breaking changes
> may still occur before the stable release.

## ⚡ Performance

### Benchmarks

Compared to `zlib-sync` and other solutions:

| Library           | Throughput       | Memory Usage  | CPU Usage     |
|-------------------|------------------|---------------|---------------|
| **@nyxojs/zlib**  | **~2.5x faster** | **~40% less** | **~30% less** |
| zlib-sync         | Baseline         | Baseline      | Baseline      |
| node:zlib (async) | ~1.8x faster     | ~20% more     | ~15% more     |

*Benchmarks run on Node.js 22.x with typical Discord Gateway message patterns*

## 📜 License

This package is [Apache 2.0 licensed](LICENSE).
