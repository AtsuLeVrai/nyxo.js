<div align="center">
  <h1>🌌 Nyx.js</h1>
  <h3>A Next-Gen TypeScript Framework for Scalable Discord Bots</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyx.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyx.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://github.com/AtsuLeVrai/nyx.js/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/AtsuLeVrai/nyx.js/ci.yml?style=for-the-badge&logo=github" alt="CI">
    </a>
    <a href="https://biomejs.com/">
      <img src="https://img.shields.io/badge/biome-Check-60a5fa?style=for-the-badge&logo=biome&color=60a5fa" alt="Biome Check">
    </a>
  </p>

  <br />
  <img src="./public/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="border-radius: 8px;">
</div>

---

## 🚀 Why Nyx.js?

Nyx.js is a modern, modular monorepo framework designed to streamline Discord bot development. Built with
**TypeScript-first** principles and cutting-edge tools like Turborepo and Biome, it offers:

- 🔥 **Blazing Performance**: Optimized for low-latency interactions and high-throughput workloads.
- 🧩 **Modular Architecture**: Choose only the components you need (`@nyxjs/core`, `@nyxjs/gateway`, etc.).
- 🤖 **Full Discord API Coverage**: REST, WebSocket, and advanced event handling out-of-the-box.
- 🛡️ **Enterprise-Grade Reliability**: Built-in error recovery, rate limiting, and TypeScript type-safety.

---

## ⚠️ Project Status

> [!IMPORTANT]
> **Nyx.js is undergoing a major architectural overhaul** to address scalability and maintainability challenges in the
> previous version.  
> **Key improvements in v1**:
> - Rewritten core with dependency injection
> - Improved WebSocket sharding
> - Enhanced TypeScript generics for better DX
> - Unified configuration system

**Stability**: Alpha (not recommended for production yet)  
**Progress**: 60% complete ([track milestones here](https://github.com/AtsuLeVrai/nyx.js/milestones))

---

## 📦 Ecosystem

| Package                                | Version                                                                                                                                               | Description                                                                 |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [**@nyxjs/core**](packages/core)       | [![npm](https://img.shields.io/npm/v/@nyxjs/core?color=CB3837&label=%20&style=flat-square&logo=npm)](https://www.npmjs.com/package/@nyxjs/core)       | Foundation layer with DI container, lifecycle management, and plugin system |
| [**@nyxjs/gateway**](packages/gateway) | [![npm](https://img.shields.io/npm/v/@nyxjs/gateway?color=CB3837&label=%20&style=flat-square&logo=npm)](https://www.npmjs.com/package/@nyxjs/gateway) | Real-time event processing with automatic sharding and reconnection         |
| [**@nyxjs/rest**](packages/rest)       | [![npm](https://img.shields.io/npm/v/@nyxjs/rest?color=CB3837&label=%20&style=flat-square&logo=npm)](https://www.npmjs.com/package/@nyxjs/rest)       | Type-safe Discord REST API wrapper with rate limiting and cache control     |
| [**@nyxjs/store**](packages/store)     | [![npm](https://img.shields.io/npm/v/@nyxjs/store?color=CB3837&label=%20&style=flat-square&logo=npm)](https://www.npmjs.com/package/@nyxjs/store)     | Unified state management for guilds, users, and channels                    |

---

## 🚂 Quick Start

### Prerequisites

- Node.js **v22+**
- pnpm **v10+**
- Node-gyp dependencies
  (check [node-gyp installation guide](https://github.com/nodejs/node-gyp?tab=readme-ov-file#installation))
- C++ compiler (for Windows users,
  install [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/?q=build+tools#build-tools-for-visual-studio-2022))

```bash
# 1. Clone repository
git clone https://github.com/AtsuLeVrai/nyx.js.git
cd nyx.js

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm run build

# 4. Start a development bot (example), don't forget to set your bot token
cd internals/playground
pnpm run start
```

---

## 📚 Documentation [WIP]

> [!WARNING]
> Documentation is being rewritten alongside the v1 development.  
> For early adopters, see our [interim documentation](https://github.com/AtsuLeVrai/nyx.js/wiki/V2-Migration-Guide).

---

## 💡 Contributing

We welcome contributions! Please follow these steps:

1. Read [Contributing Guidelines](.github/CONTRIBUTING.md)
2. Fork the repository
3. Create a feature branch (`feat/your-feature`)
4. Commit changes (follow [Conventional Commits](https://www.conventionalcommits.org/))
5. Open a Pull Request

**Priority Areas**:

- WebSocket optimization
- TypeScript type enhancements
- Unit test coverage
- Documentation examples

---

## 🌐 Community

Get help and stay updated:

- [Discord Server](https://discord.gg/bWb5ZjBs8t) - Real-time discussions
- [GitHub Discussions](https://github.com/AtsuLeVrai/nyx.js/discussions) - Q&A and ideas

---

## 📜 License

Nyx.js is [AGPL-3.0 licensed](LICENSE). Commercial licensing available upon request.

---

<div align="center">
  <sub>Built with ❤️ by open-source contributors</sub>
</div>