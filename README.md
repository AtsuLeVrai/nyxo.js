<div align="center">
  <h1>🌌 Nyxo.js</h1>
  <h3>Ultra-Fast Discord Library for TypeScript</h3>
  
  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyxo.js/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-24+-green.svg?style=for-the-badge&logo=node.js" alt="Node.js">
    </a>
  </p>
  <br />
</div>

---

## 📢 Project Status: Archived

> **Development Paused - October 2025**

After **700+ commits** and **5 complete refactors** over several years, this project is being paused indefinitely.

### Why?

This project was an **incredible learning journey** that pushed my TypeScript skills to their absolute limits:
- ✅ Enterprise-grade architecture
- ✅ Zero memory leaks
- ✅ Native C++ addons for compression
- ✅ Advanced type safety
- ✅ Production-ready patterns

**But here's the truth:** After years of development, I realized I was building this more out of obligation than passion. The codebase became too complex, too verbose, and the goal posts kept moving with each refactor.

**This isn't a failure.** This is me choosing mental health over perfectionism.

### 🏆 The Legacy Branch

If you want to see what "enterprise-grade Discord library" really means, check out the **[legacy-enterprise](https://github.com/AtsuLeVrai/nyxo.js/tree/legacy-enterprise)** branch. 

It represents the most polished, complete, and professional iteration of this project. Consider it the "final form" before I decided to step back.

---

## 💭 What I Learned

This project taught me more about software engineering than any course or book ever could:

**Technical Skills:**
- Advanced TypeScript patterns (conditional types, template literals, discriminated unions)
- Native addon development (C++ ↔ TypeScript bindings)
- WebSocket protocols and Discord Gateway internals
- Memory management and performance optimization
- Zero-overhead abstractions

**Life Skills:**
- When to let go of a project
- The difference between "perfect" and "done"
- That learning happens even in "unfinished" projects
- Technical skill ≠ motivation to finish

---

## 🎯 Philosophy (That I Actually Achieved)

Nyxo.js was designed around three core principles:

### 1. **Bare Metal Performance**
- Zero-overhead event system with raw Discord payloads
- Native C++ compression (zlib, zstd) for maximum speed
- No automatic caching - you control memory usage
- Direct API access without abstraction layers

### 2. **Total Developer Control**
- You decide what to cache and how
- Explicit error handling, no magic
- Full access to Discord's internals
- Predictable behavior at every level

### 3. **Production Ready**
- Built-in rate limiting with intelligent bucket management
- Circuit breakers for resilience
- Automatic reconnection with exponential backoff
- Comprehensive TypeScript definitions

---

## 🚀 What Actually Works

Despite being unfinished, significant portions are production-ready:

- ✅ **Gateway Connection** - Full WebSocket implementation with heartbeat
- ✅ **Native Compression** - zlib-stream and zstd-stream via C++ addons
- ✅ **Rate Limiting** - Smart bucket management and 429 handling
- ✅ **REST API** - Complete route definitions with TypeScript types
- ✅ **Shard Manager** - Multi-shard support with automatic distribution
- ✅ **Type Safety** - 100% of Discord API v10 typed

---

## 📚 Use This For Learning

If you're building your own Discord library or want to understand how they work:

**Don't copy-paste.** Understand the patterns, then build your own.

---

## 🙏 Thank You

To everyone who starred, contributed ideas, or showed interest in this project: **thank you**.

This project might be paused, but the knowledge gained is permanent.

---

## 📜 License

Nyxo.js is [Apache 2.0 licensed](LICENSE).

Feel free to learn from the code, fork it, or use patterns in your own projects.

---

<div align="center">
  <h3>💙 Sometimes the journey matters more than the destination</h3>
  <p>
    <b>AtsuLeVrai</b> - October 2025
  </p>
  <p>
    <i>"After 700 commits, I learned when to stop."</i>
  </p>
</div>