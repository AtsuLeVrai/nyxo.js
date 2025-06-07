<div align="center">
  <h1>⚙️ @nyxojs/core</h1>
  <h3>Comprehensive Discord API Types, Enums, and Utilities</h3>

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

`@nyxojs/core` is the foundational package of the Nyxo.js ecosystem, providing comprehensive TypeScript definitions,
enums, and utilities for Discord API interactions. Built with type safety and developer experience in mind, it offers
complete API coverage with intelligent utilities for common Discord operations like permission management, snowflake
manipulation, and markdown formatting.

Perfect for building type-safe Discord applications, handling complex permission systems, working with Discord's unique
ID format, and creating rich formatted content.

> [!NOTE]
> This package is part of the Nyxo.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ⚠️ Project Status

> [!NOTE]
> **Current Status: Beta Release**  
> @nyxojs/core is now in beta! Core features are stable and ready for testing. We welcome feedback and contributions as
> we work towards v1.0.

## ✨ Key Features

### 🏗️ **Complete Discord API Definitions**

- **Comprehensive Entities** - Full TypeScript definitions for all Discord objects
- **Discriminated Unions** - Type-safe channel types with proper discrimination
- **API Version Support** - Complete support for Discord API v10
- **Zero Assumptions** - Accurate representations of Discord's actual data structures

### 🎯 **Advanced Permission System**

- **BitField Utilities** - High-performance 64-bit permission management
- **Type-Safe Operations** - Bitwise operations with full TypeScript support
- **Fluent API** - Chainable methods for readable permission logic
- **Memory Efficient** - Optimized for large-scale permission calculations

### 🔢 **Snowflake Manipulation**

- **Complete Deconstruction** - Extract timestamp, worker ID, process ID, and increment
- **Generation Tools** - Create snowflakes for testing and development
- **Time Operations** - Compare, sort, and analyze creation times
- **Validation** - Robust snowflake format validation

### 📝 **Discord Markdown Support**

- **Full Formatting** - Bold, italic, code blocks, spoilers, and more
- **Type-Safe Returns** - Template literal types for compile-time validation
- **Mention Helpers** - User, channel, role, and slash command mentions
- **Timestamp Formatting** - Discord's timestamp styles with proper types

### 🛠️ **Developer Utilities**

- **Emoji Resolution** - Parse and manipulate Discord emoji formats
- **Optional Dependencies** - Graceful handling of optional packages
- **Sleep Functions** - Async-friendly delay utilities
- **Locale Support** - Complete internationalization enum coverage

### 🌐 **Internationalization**

- **Complete Locale Coverage** - All Discord-supported languages and regions
- **OAuth2 Scopes** - Comprehensive permission scope definitions
- **API Enums** - Version management and endpoint specifications
- **Standards Compliance** - ISO language codes and Discord conventions

## 📦 Installation

```bash
npm install @nyxojs/core
# or
yarn add @nyxojs/core
# or
pnpm add @nyxojs/core
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