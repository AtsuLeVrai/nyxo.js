<div align="center">
  <h1>🎤 @nyxjs/voice</h1>
  <h3>Efficient Voice Gateway and Audio Management for Nyx.js</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyx.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyx.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?style=for-the-badge&logo=node.js" alt="Node.js">
    </a>
  </p>

  <br />
  <img src="../../public/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

`@nyxjs/voice` is an advanced TypeScript implementation for Discord voice gateway interactions, providing a
comprehensive and type-safe solution for voice and audio management in Discord bots.

## 🔬 Technical Challenges

Implementing a robust Discord voice module requires deep expertise in:

- **WebSocket Communication**
    - Complex voice gateway protocol (version 8+)
    - Heartbeat and connection management
    - WebSocket resuming and buffering

- **UDP Voice Transmission**
    - NAT traversal and IP discovery
    - RTP packet structuring
    - Voice data encryption (multiple modes)

- **Audio Processing**
    - Opus codec handling
    - Voice encryption (xsalsa20_poly1305, AES-GCM)
    - End-to-End Encryption (E2EE) support

## 🚧 Key Development Areas

### Urgent Implementation Needs

- [ ] Voice Gateway Protocol (v8+)
    - Comprehensive WebSocket connection management
    - Heartbeat and resuming mechanisms
    - Protocol version handling

- [ ] UDP Voice Transmission
    - IP discovery implementation
    - RTP packet encryption
    - Multiple encryption mode support

- [ ] Audio Codec Integration
    - Opus codec encoding/decoding
    - Sample rate and channel management

- [ ] End-to-End Encryption (E2EE)
    - DAVE protocol implementation
    - MLS group management
    - Frame-level encryption support

## 🎯 Specific Challenges

1. **Complex Protocol Negotiation**
    - Handle multiple voice gateway versions
    - Implement version 8+ specific features
    - Support end-to-end encryption transitions

2. **Encryption Complexity**
    - Implement multiple encryption modes
    - Support transport and frame-level encryption
    - Handle key derivation and nonce management

3. **Network Resilience**
    - UDP hole punching
    - NAT traversal
    - Connection resuming

## 🤝 Contribution Opportunities

We're seeking contributors with expertise in:

- Discord voice gateway internals
- WebRTC and UDP networking
- Audio streaming technologies
- Cryptography and encryption protocols
- TypeScript and advanced type programming
-

## ⚠️ Project Status

> [!IMPORTANT]
> **Current Status: Seeking Specialized Contributors**  
> This package requires deep technical expertise to implement correctly.
> Not suitable for production use until major milestones are completed.

## 📜 License

This package is [AGPL-3.0 licensed](LICENSE).