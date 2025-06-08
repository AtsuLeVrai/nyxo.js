<div align="center">
  <h1>🗜️ @nyxojs/zstd</h1>
  <h3>Enterprise-Grade Zstandard Decompression for Discord Gateway Applications</h3>

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

`@nyxojs/zstd` is a high-performance Zstandard (zstd) decompression library specifically optimized for Discord Gateway
compression protocols and general-purpose data decompression. Built with modern C++ and TypeScript, it provides 
enterprise-grade compression handling with superior performance and compression ratios compared to legacy solutions.

Designed to handle Discord's `zstd-stream` transport compression and payload compression with intelligent buffering,
streaming support, and automatic frame detection for seamless WebSocket message processing.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application
> requiring high-performance Zstandard decompression.

## ⚠️ Project Status

> [!IMPORTANT]
> **Current Status: Beta Development**  
> This project is in active development. The core functionality is stable and ready for testing, but breaking changes
> may still occur before the stable release.

## ⚡ Performance

### Benchmarks

Compared to `fzstd` and other solutions:

| Library           | Throughput       | Memory Usage  | CPU Usage     | Compression Ratio |
|-------------------|------------------|---------------|---------------|-------------------|
| **@nyxojs/zstd**  | **~3-6x faster** | **~50% less** | **~40% less** | **20-30% better** |
| fzstd             | Baseline         | Baseline      | Baseline      | Baseline          |
| node:zlib (async) | ~1.2x slower     | ~30% more     | ~25% more     | ~25% worse        |

*Benchmarks run on Node.js 22.x with typical Discord Gateway message patterns and general data compression scenarios*

## 📜 License

This package is [Apache 2.0 licensed](LICENSE).
