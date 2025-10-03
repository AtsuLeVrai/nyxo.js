# Nyxo.js

**Ultra-Fast Bare Metal Discord Library for TypeScript**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/nyxo-labs/nyxo.js/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)

---

## Philosophy

Nyxo.js is designed for developers who demand **maximum performance** and **complete control** over their Discord
applications. Unlike traditional Discord libraries, Nyxo.js provides zero-overhead access to the Discord API with no
hidden abstractions or automatic caching.

**Core Principles:**

- **Bare Metal Performance**: Zero overhead, direct access to raw Discord payloads
- **Total User Control**: You decide what to cache, how to store state, and when to process events
- **No Magic**: Every operation is explicit and predictable
- **Production Ready**: Built-in rate limiting, circuit breakers, and automatic reconnection
- **Memory Efficient**: No classes consuming memory, only pure functions when needed

---

## Architecture

### Pure Event System

Raw Discord gateway events are delivered directly to your handlers with zero processing overhead. No wrapper classes, no
automatic caching, just the raw JSON payloads from Discord.

### Organized HTTP Routers

Clean, organized routers for Discord's REST API endpoints. Rate limiting and resilience patterns are handled
transparently while maintaining direct access to all Discord features.

### Utility Helpers

Pure functions for common operations like permission calculations, snowflake parsing, and data formatting. Use only what
you need, when you need it.

### Intelligent Gateway Management

Automatic WebSocket reconnection, heartbeat management, and session resumption with minimal configuration. The gateway
stays connected while giving you complete control over event handling.

---

## Key Features

### 🚀 Zero-Overhead Events

- Direct access to raw Discord payloads
- No wrapper classes or automatic processing
- Optional event filtering for maximum efficiency
- Predictable memory usage

### ⚡ HTTP Performance

- Advanced rate limiting with bucket management
- Circuit breaker patterns for resilience
- Automatic retry with exponential backoff
- Connection pooling for optimal throughput

### 🎯 Developer Experience

- Complete TypeScript coverage with strict null safety
- ESM-only modern architecture
- Comprehensive Discord API type definitions
- Minimal learning curve for Discord API veterans

### 🛡️ Production Hardened

- Battle-tested rate limiting algorithms
- Intelligent WebSocket reconnection
- Memory leak prevention
- Graceful error handling and recovery

---

## Use Cases

### High-Performance Bots

Perfect for bots handling thousands of guilds where every millisecond matters. No automatic caching means you can
implement exactly the caching strategy your application needs.

### Microservices

Ideal for Discord-integrated microservices where you need lightweight, focused functionality without the overhead of a
full-featured Discord client.

### Custom Applications

Built for developers who understand the Discord API and want direct access without layers of abstraction getting in the
way.

### Analytics and Monitoring

Excellent for applications that process large volumes of Discord events where performance and memory efficiency are
critical.

---

## Quick Start

### 1. Event-Driven Approach

Register pure event handlers that receive raw Discord payloads. You decide what to do with the data - cache it, process
it, or ignore it entirely.

### 2. HTTP Operations

Use organized routers to interact with Discord's REST API. Rate limiting and error handling are transparent, but you
maintain full control over request timing and data processing.

### 3. State Management

Implement your own caching and state management. Use Redis, SQLite, in-memory Maps, or any storage solution that fits
your needs.

### 4. Helper Functions

Leverage pure utility functions for common operations like permission checks, snowflake parsing, and data formatting.

---

## Performance Characteristics

### Memory Usage

- **Events**: Zero allocation overhead - raw payloads only
- **HTTP**: Connection pooling with configurable limits
- **Caching**: User-controlled - implement exactly what you need
- **Types**: Compile-time only - no runtime overhead

### Throughput

- **Events**: Handle thousands of events per second
- **HTTP**: Intelligent rate limiting prevents 429 errors
- **Gateway**: Automatic reconnection with exponential backoff
- **Scaling**: Shard management for large applications

---

## Advanced Features

### Rate Limiting

Sophisticated rate limiting that respects Discord's global and per-route limits. Automatic handling of 429 responses
with intelligent backoff strategies.

### Circuit Breakers

Built-in circuit breaker patterns prevent cascade failures and provide graceful degradation when Discord's API is
experiencing issues.

### Shard Management

Automatic shard calculation and management for large bots. Handle guild distribution and cross-shard communication with
ease.

### Type Safety

Comprehensive TypeScript definitions for all Discord API objects, ensuring type safety throughout your application.

---

## Comparison

| Feature                  | Nyxo.js                        | Traditional Libraries   |
|--------------------------|--------------------------------|-------------------------|
| **Memory Overhead**      | Zero                           | High (classes, caches)  |
| **Event Processing**     | Raw payloads                   | Wrapped objects         |
| **Caching Strategy**     | User-controlled                | Automatic               |
| **Performance**          | Maximum                        | Good                    |
| **Learning Curve**       | Discord API knowledge required | Abstracted              |
| **Flexibility**          | Complete control               | Limited by abstractions |
| **Production Readiness** | Built-in resilience            | Varies                  |

---

## Architecture Decisions

### Why No Automatic Caching?

Automatic caching creates memory pressure and forces architectural decisions on your application. Nyxo.js lets you
implement exactly the caching strategy your use case requires.

### Why Raw Events?

Processing Discord events into wrapper classes consumes CPU cycles and memory. Raw events give you maximum performance
and the flexibility to process only what you need.

### Why Routers Instead of Methods?

Organized routers provide better IntelliSense, clearer organization, and easier maintenance while preserving direct
access to all Discord API features.

### Why Pure Functions?

Pure helper functions have no state, consume no memory when not in use, and are easily testable and debuggable.

---

## Contributing

We welcome contributions that align with our performance-first philosophy. Please ensure all contributions maintain
zero-overhead principles and provide meaningful performance benefits.

### Development Principles

- Performance over convenience
- Explicit over implicit
- User control over automation
- Type safety throughout

---

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

---

## Support

- **Documentation**: Coming soon
- **Issues**: [GitHub Issues](https://github.com/nyxo-labs/nyxo.js/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nyxo-labs/nyxo.js/discussions)

---

*"Maximum performance, zero compromise. Built for developers who understand the Discord API and demand complete control
over their applications."*

**AtsuLeVrai** - 2025