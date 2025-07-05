# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nyxo.js is an enterprise-grade Discord bot framework built with TypeScript. It's designed as a modular ecosystem of packages that can be used together as a complete framework or independently as specialized libraries.

## Common Commands

### Development Setup
```bash
# Initial setup (required for first time)
pnpm run setup

# Install dependencies only
pnpm install -r

# Extract native library dependencies
pnpm run extract:libs

# Initialize git submodules
pnpm run submodules:init
```

### Building
```bash
# Development build (faster, includes source maps)
pnpm run build:dev

# Production build (optimized, no source maps)
pnpm run build:prod

# Build native dependencies (zlib, zstd)
pnpm run build:native

# Clean all build artifacts
pnpm run clean
```

### Testing
```bash
# Run all tests once
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run tests with UI
pnpm run test:ui

# Run benchmarks
pnpm run test:bench
```

### Linting and Type Checking
```bash
# Run Biome linter with auto-fix
pnpm run biome:check

# Type check all packages
pnpm run type-check
```

### Running Individual Tests
```bash
# Run specific test file
pnpm vitest packages/core/tests/snowflake.util.test.ts

# Run tests for specific package
pnpm vitest packages/core

# Run tests matching pattern
pnpm vitest --grep "snowflake"
```

## Architecture Overview

### Package Structure
The project is organized as a monorepo with specialized packages:

- **`packages/nyxojs`** - Main framework package that aggregates all other packages
- **`packages/core`** - Discord API types, entities, enums, and core utilities
- **`packages/gateway`** - Real-time WebSocket connection management with Discord
- **`packages/rest`** - HTTP client for Discord REST API with rate limiting
- **`packages/builders`** - Type-safe builders for Discord API objects (embeds, commands, etc.)
- **`packages/store`** - High-performance caching system with LRU eviction
- **`packages/zlib`** - Native zlib compression for gateway connections
- **`packages/zstd`** - Native zstd compression for gateway connections

### Key Architectural Patterns

1. **Modular Design**: Each package is self-contained and can be used independently
2. **Type Safety**: Heavy use of TypeScript with comprehensive type definitions
3. **Event-Driven**: Client class extends EventEmitter for real-time event handling
4. **Compression**: Native compression libraries for optimal gateway performance
5. **Validation**: Zod schemas for runtime type validation and configuration

### Core Client Architecture

The main `Client` class orchestrates all components:
- **REST client** for API requests with automatic rate limiting
- **Gateway client** for WebSocket connections with automatic reconnection
- **Cache manager** for efficient entity storage and retrieval
- **Event system** that transforms gateway events into high-level client events

### Native Dependencies

The project includes native Node.js modules for compression:
- `packages/zlib` - Compiled zlib for standard compression
- `packages/zstd` - Compiled zstd for superior compression performance

These require compilation and are extracted from the `libs/` directory during setup.

## Development Workflow

### Project Setup Flow
1. Clone repository with submodules: `git clone --recurse-submodules`
2. Run initial setup: `pnpm run setup`
3. This automatically runs: submodule init → extract native libs → install deps → dev build

### Testing Strategy
- Tests are located in `packages/*/tests/` directories
- Uses Vitest for fast, ESM-compatible testing
- Coverage reports generated in `./coverage/`
- Benchmarks available for performance-critical code

### Build System
- Uses Turbo for fast, parallel builds across packages
- Development builds include source maps and faster compilation
- Production builds are optimized with no source maps
- Native modules built separately with node-gyp

### Code Quality
- Biome for linting and formatting (configured in `biome.json`)
- Strict TypeScript configuration
- Husky pre-commit hooks for code quality
- ESLint-style rules with auto-fix capabilities

## Important Notes

### Memory Management
The example bot (`apps/bot/`) includes comprehensive memory monitoring and cleanup patterns. This is crucial for long-running Discord bots to prevent memory leaks.

### Compression Configuration
The framework supports multiple compression types:
- `zlib-stream` - Standard compression
- `zstd-stream` - Superior compression (recommended)
- Configure via client options: `compressionType: "zstd-stream"`

### Intent Management
Discord intents control what events your bot receives. The framework provides `GatewayIntentsBits` enum for type-safe intent configuration. Only enable intents you actually need to minimize memory usage.

### Error Handling
The framework includes comprehensive error handling patterns:
- Zod validation with pretty error messages
- Graceful shutdown handlers
- Automatic retry mechanisms for network operations
- Memory leak detection and cleanup

## Development Tips

- Use `pnpm run build:dev` during development for faster builds
- Run `pnpm run type-check` before committing to catch type errors
- The `apps/bot/` example demonstrates best practices for bot development
- Native dependencies are automatically extracted during setup - no manual compilation needed
- Use the store package for efficient caching of Discord entities
- All packages can be imported individually for lightweight applications