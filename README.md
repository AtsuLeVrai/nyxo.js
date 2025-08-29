# Nyxo.js

**High-Performance TypeScript Discord Library**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/nyxo-labs/nyxo.js/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange.svg)](https://github.com/nyxo-labs/nyxo.js)

---

## Overview

Nyxo.js is a TypeScript Discord library focused on memory efficiency and reliability for large-scale applications.

**Core Design:**

- Low memory footprint through intelligent caching
- Advanced rate limiting with circuit breaker protection
- Complete TypeScript coverage with strict null safety
- ESM-only modern architecture

---

## Current Status

**Active Reconstruction** - The project is being completely rebuilt from the ground up. The legacy enterprise
implementation has been archived to the `legacy-enterprise` branch.

**What's Working:**

- REST API foundation with rate limiting
- Intelligent caching system with LRU/TTL
- Circuit breaker resilience patterns
- TypeScript architecture and build system

**In Development:**

- Complete Discord API coverage
- WebSocket Gateway implementation
- Documentation and examples

---

## Installation

Not yet published. The library will be available on npm after the core rebuild is complete.

**Requirements:**

- Node.js 24+
- TypeScript 5.9+
- ESM support

---

## Architecture

Built for applications that need:

- Predictable memory usage at scale
- Reliable handling of Discord API rate limits
- Type-safe Discord API interactions
- Enterprise-grade error handling

**Not suitable for:**

- Simple Discord bots with basic needs
- Projects requiring immediate stability
- CommonJS environments

---

## Development

This is a focused single-developer project prioritizing architectural consistency and performance optimization.

**Contributing:**

- Performance feedback and testing welcome
- API design suggestions appreciated
- Documentation improvements accepted

---

## License

Apache License 2.0

---

## Links

- [Repository](https://github.com/nyxo-labs/nyxo.js)
- [Legacy Code](https://github.com/nyxo-labs/nyxo.js/tree/legacy-enterprise)
- [Issues](https://github.com/nyxo-labs/nyxo.js/issues)