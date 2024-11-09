<div align="center" style="padding: 30px;">
  <h1 style="font-size: 3em; font-weight: bold;">@nyxjs/source Monorepo</h1>
  <img src="./assets/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="margin-top: 20px; border-radius: 8px;">
</div>

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)
[![Powered by TurboRepo](https://img.shields.io/badge/Powered_by-TurboRepo-60a5fa?style=flat&logo=turborepo)](https://turborepo.dev/)
[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL_3.0-60a5fa?style=flat)](https://www.gnu.org/licenses/agpl-3.0.html)

Welcome to the **@nyxjs/source** monorepo! This repository is the central hub for all Nyx.js packages and tools,
designed to empower developers with a high-performance, modular TypeScript ecosystem for building next-generation
Discord bots.

---

## 🏗️ Repository Structure

The monorepo is organized into various packages, each fulfilling a critical role in the overall architecture of Nyx.js.

### Packages

- `core`: The core functionality of Nyx.js, providing the fundamental components that power the rest of the system.
- `create`: A CLI tool for generating new Nyx.js projects with ease, including templates and configurations.
- `gateway`: Handles WebSocket connections and shard management for efficient communication with the Discord API.
- `nyxjs`: The core package that ties all components together and serves as the main entry point for Nyx.js.
- `panel` **_(not currently under development)_**: An administrative panel built with Next.js to monitor statistics like
  the number of guilds, members, and
  commands.
- `plugins` **_(not currently under development)_**: A set of optional plugins that extend the functionality of Nyx.js
  with additional features.
- `rest`: Manages RESTful API requests to Discord, with rate limiting and caching strategies for optimal
  performance.
- `voice` **_(not currently under development)_**: Enables voice connections and interactions, allowing bots to join
  voice channels and manage audio
  streams.

---

## 🚀 Getting Started

### Installation

To get started with the **@nyxjs/source** monorepo, you'll need to have the following prerequisites installed:

- **Node.js** (v18 or higher)
- **TypeScript** (v5.x or higher)
- **pnpm** for package management

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

- `pnpm run dev` – Starts the development mode for the entire monorepo.
- `pnpm run start` – Starts the production mode for the entire monorepo.
- `pnpm run build` – Builds all the packages in the monorepo.
- `pnpm run clean` – Cleans the build artifacts from the monorepo.
- `pnpm run format` – Formats the codebase using Biome.

---

## 🌟 Contributing

We welcome contributions to **@nyxjs/source**! If you'd like to contribute:

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
