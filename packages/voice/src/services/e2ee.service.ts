import { E2EEUtil, ULEBUtil } from "../utils/index.js";

export interface MLSCredential {
  userId: string;
  displayName?: string;
}

export class E2EEService {
  #identityKeyPair: { publicKey: Buffer; privateKey: Buffer } | null = null;
  #mlsGroup: unknown = null; // Would be an actual MLS group implementation
  #localUserInfo: MLSCredential | null = null;
  #externalSenderKey: Buffer | null = null;
  #epoch = 0;
  #initialized = false;
  #protocolVersion = 0;
  #destroyed = false;
  #userSecrets = new Map<string, Map<number, Map<number, Buffer>>>();
  #pendingTransitions = new Map<string, { version: number; epoch: number }>();
  #frameGenerationCounters = new Map<
    string,
    Map<number, { generation: number; nonce: number }>
  >();

  get isInitialized(): boolean {
    return this.#initialized;
  }

  get currentProtocolVersion(): number {
    return this.#protocolVersion;
  }

  get identityPublicKey(): Buffer | null {
    return this.#identityKeyPair?.publicKey || null;
  }

  initialize(userId: string, displayName?: string): void {
    if (this.#destroyed) {
      throw new Error("E2EEService has been destroyed");
    }

    // Generate identity keypair if not already available
    if (!this.#identityKeyPair) {
      this.#identityKeyPair = E2EEUtil.generateMLSKeyPair();
    }

    // Store user info
    this.#localUserInfo = {
      userId,
      displayName,
    };

    this.#initialized = true;
  }

  encryptOpusFrame(
    opusFrame: Buffer,
    userId: string,
    ssrc: number,
  ): Uint8Array | null {
    if (!this.isInitialized || this.#destroyed) {
      return null;
    }

    try {
      // Get or create generation counter for this user+ssrc
      let userGenerationMap = this.#frameGenerationCounters.get(userId);
      if (!userGenerationMap) {
        userGenerationMap = new Map();
        this.#frameGenerationCounters.set(userId, userGenerationMap);
      }

      let generationInfo = userGenerationMap.get(ssrc);
      if (!generationInfo) {
        generationInfo = { generation: 0, nonce: 0 };
        userGenerationMap.set(ssrc, generationInfo);
      }

      // Get the frame key for this user+ssrc+generation
      const frameKey = this.#getFrameKey(
        userId,
        ssrc,
        generationInfo.generation,
      );
      if (!frameKey) {
        throw new Error(
          `No frame key available for ${userId}:${ssrc}:${generationInfo.generation}`,
        );
      }

      // Encrypt the frame
      const e2eeFrame = E2EEUtil.encryptOpusFrame(
        opusFrame,
        frameKey,
        generationInfo.nonce,
        generationInfo.generation,
      );

      // Increment nonce for next frame
      generationInfo.nonce++;
      if (generationInfo.nonce >= 0xffffffff) {
        // Wrap around and increment generation
        generationInfo.nonce = 0;
        generationInfo.generation++;
        // Note: New frame key will be needed for next generation
      }

      // Serialize the frame
      return E2EEUtil.serializeE2EEOpusFrame(e2eeFrame);
    } catch {
      return null;
    }
  }

  decryptOpusFrame(
    frameData: Uint8Array,
    userId: string,
    ssrc: number,
  ): Buffer | null {
    if (!this.isInitialized || this.#destroyed) {
      return null;
    }

    try {
      // Parse the E2EE frame
      const e2eeFrame = E2EEUtil.parseE2EEOpusFrame(frameData);
      if (!e2eeFrame) {
        return null;
      }

      // Decode the nonce to extract the generation
      const { value: nonceValue } = ULEBUtil.decodeULEB128(e2eeFrame.nonce);
      const generation = (nonceValue >> 24) & 0xff;

      // Get the frame key for this user+ssrc+generation
      const frameKey = this.#getFrameKey(userId, ssrc, generation);
      if (!frameKey) {
        throw new Error(
          `No frame key available for ${userId}:${ssrc}:${generation}`,
        );
      }

      // Decrypt the frame
      return E2EEUtil.decryptOpusFrame(e2eeFrame, frameKey);
    } catch {
      return null;
    }
  }

  prepareTransition(
    transitionId: string,
    protocolVersion: number,
    epochId: number,
  ): void {
    if (!this.isInitialized || this.#destroyed) {
      throw new Error("E2EEService not initialized");
    }

    // Store transition information
    this.#pendingTransitions.set(transitionId, {
      version: protocolVersion,
      epoch: epochId,
    });
  }

  executeTransition(transitionId: string): void {
    if (!this.isInitialized || this.#destroyed) {
      throw new Error("E2EEService not initialized");
    }

    // Get transition info
    const transition = this.#pendingTransitions.get(transitionId);
    if (!transition) {
      throw new Error(`Unknown transition ID: ${transitionId}`);
    }

    // Update protocol version and epoch
    this.#protocolVersion = transition.version;
    this.#epoch = transition.epoch;

    // Clean up completed transition
    this.#pendingTransitions.delete(transitionId);
  }

  setExternalSender(publicKey: Buffer, _credential: Buffer): void {
    if (!this.isInitialized || this.#destroyed) {
      throw new Error("E2EEService not initialized");
    }

    this.#externalSenderKey = publicKey;
  }

  generateKeyPackage(): Buffer {
    if (!this.isInitialized || this.#destroyed || !this.#identityKeyPair) {
      throw new Error("E2EEService not properly initialized");
    }

    // This would use actual MLS implementation to generate a key package
    // For now, return a placeholder buffer
    return Buffer.alloc(256);
  }

  processMLSWelcome(_welcomeData: Buffer, transitionId: string): void {
    if (!this.isInitialized || this.#destroyed) {
      throw new Error("E2EEService not initialized");
    }

    // In a real implementation, this would:
    // 1. Process the MLS welcome message
    // 2. Join the MLS group
    // 3. Extract secrets for current epoch

    // For now, just emit an event
    const _epochId = 1; // Placeholder
    // Mark transition as ready
    this.markTransitionReady(transitionId);
  }

  markTransitionReady(_transitionId: string): void {
    if (!this.isInitialized || this.#destroyed) {
      throw new Error("E2EEService not initialized");
    }

    // In a real implementation, this would notify other parts of the system
    // that this client is ready for the transition
  }

  destroy(): void {
    if (this.#destroyed) {
      return;
    }

    this.#destroyed = true;
    this.#initialized = false;
    this.#identityKeyPair = null;
    this.#mlsGroup = null;
    this.#localUserInfo = null;
    this.#externalSenderKey = null;
    this.#epoch = 0;
    this.#protocolVersion = 0;
    this.#userSecrets.clear();
    this.#pendingTransitions.clear();
    this.#frameGenerationCounters.clear();
  }

  #getFrameKey(
    userId: string,
    ssrc: number,
    generation: number,
  ): Buffer | null {
    // Check if we have a cached key
    const userSecrets = this.#userSecrets.get(userId);
    if (!userSecrets) {
      return null;
    }

    const ssrcSecrets = userSecrets.get(ssrc);
    if (!ssrcSecrets) {
      return null;
    }

    let frameKey = ssrcSecrets.get(generation);
    if (frameKey) {
      return frameKey;
    }

    // If we don't have a cached key but have MLS group, derive it
    if (this.#mlsGroup) {
      try {
        // This would use actual MLS implementation to derive the key
        // For now, use a placeholder implementation
        const groupSecret = Buffer.alloc(32); // Placeholder for MLS-derived secret

        // Derive the frame key
        frameKey = E2EEUtil.deriveFrameKey(
          groupSecret,
          userId,
          ssrc,
          generation,
        );

        // Cache the key
        ssrcSecrets.set(generation, frameKey);

        return frameKey;
      } catch {
        return null;
      }
    }

    return null;
  }
}
