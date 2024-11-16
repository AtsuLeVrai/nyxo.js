<div align="center" style="padding: 30px;">
  <h1 style="font-size: 3em; font-weight: bold;">@nyxjs/source Monorepo</h1>
  <img src="./assets/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="margin-top: 20px; border-radius: 8px;">
</div>

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-27272a?style=for-the-badge&logo=biome)](https://biomejs.dev/)
[![Powered by TurboRepo](https://img.shields.io/badge/Powered_by-TurboRepo-3f3f46?style=for-the-badge&logo=turborepo)](https://turborepo.dev/)
[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL_3.0-52525b?style=for-the-badge)](https://www.gnu.org/licenses/agpl-3.0.html)
[![Typescript](https://img.shields.io/badge/TypeScript-Ready-71717a?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

Welcome to the `@nyxjs/source` monorepo! This repository is the central hub for all Nyx.js packages and tools,
designed to empower developers with a high-performance, modular TypeScript ecosystem for building next-generation
Discord bots.

---

## 🏗️ Repository Structure

The monorepo is organized into various packages, each fulfilling a critical role in the overall architecture of Nyx.js.

#### ✅ Currently Under Development

- `core`: The fundamental component of Nyx.js, providing the essential elements that power the rest of the system.
- `gateway`: Handles WebSocket connections and shard management for efficient communication with the Discord API.
- `logger`: Advanced logging system for application tracking and debugging.
- `nyxjs`: The main package that connects all components and serves as the entry point for Nyx.js.
- `rest`: Manages REST API requests to Discord, with rate limiting and caching strategies.

#### ⏳ Future Development

- `create`: A CLI tool for easily generating new Nyx.js projects, including templates and configurations.
- `database`: A unified database manager supporting multiple database engines.
- `panel`: An administrative panel built with Next.js to monitor statistics (guilds, members, commands).
- `plugins`: A set of optional plugins to extend Nyx.js functionality.
- `store`: Optimized in-memory data and cache management system.
- `voice`: Enables voice connections and interactions, allowing bots to join voice channels.

#### 💭 Proposed Future Packages

- `i18n`: Internationalization and localization system.
- `testing`: Tools and utilities for automated testing.

---

## 🚀 Getting Started

### Installation

To get started with the **@nyxjs/source** monorepo, you'll need to have the following prerequisites installed:

- **Node.js** (v18 or higher)
- **pnpm** for package management
- **node-gyp** for native module compilation

To setup the monorepo, run:

```bash
git clone https://github.com/3tatsu/nyx.js.git
```

Next, navigate to the cloned repository and run the following commands:

```bash
cd nyx.js
pnpm run setup
```

---

## 🛠️ Development Workflow

This monorepo is managed with **TurboRepo** for high-performance builds and efficient package management.

### Key Commands

#### Setup & Development

- `pnpm run setup` - Installs all dependencies and builds packages
- `pnpm run dev` - Starts development mode for all packages
- `pnpm run start` - Runs all packages in production mode
- `pnpm run build` - Builds all packages

#### Code Quality & Formatting

- `pnpm run format` - Formats code using Biome
- `pnpm run lint` - Runs linting checks
- `pnpm run check` - Performs all static checks
- `pnpm run validate` - Runs all validation checks

#### Testing

- `pnpm run test` - Runs all tests
- `pnpm run test:watch` - Runs tests in watch mode
- `pnpm run test:bench` - Runs benchmark tests
- `pnpm run test:coverage` - Runs tests with coverage reports

#### Type Checking & Cleaning

- `pnpm run type-check` - Runs TypeScript type checking
- `pnpm run clean` - Removes all build artifacts

Each command can be run individually on packages using the workspace syntax:

```bash
pnpm run check --filter=@nyxjs/core
```

For development, the most commonly used commands are `setup`, `dev`, and `build`.

---

## 🌟 Contributing

We welcome contributions to `@nyxjs/source`! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Submit a pull request with detailed explanations of your changes.

Please refer to our [CONTRIBUTING.md](./.github/CONTRIBUTING.md) for more information on the contribution process.

---

## 🔐 Security

If you discover any security-related issues, please report them promptly by following the instructions in
our [SECURITY.md](./.github/SECURITY.md).

---

## 📄 License

This project is licensed under the MIT License. For more details, please check the [LICENSE](./LICENSE) file.

---

For more details and documentation, visit our [official website](https://nyxjs.dev).
