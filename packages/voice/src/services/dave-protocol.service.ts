import type { VoiceConnection } from "../core/index.js";
import { E2eeManager, MlsManager } from "../managers/index.js";
import type {
  DaveProtocolState,
  DaveProtocolTransitionInfo,
  DaveProtocolVersion,
  E2eeFrame,
  MlsCommitData,
  MlsExternalSenderData,
  MlsProposalData,
} from "../types/index.js";

export class DaveProtocolService {
  readonly #mls: MlsManager;
  readonly #e2ee: E2eeManager;
  readonly #connection: VoiceConnection;
  readonly #state: DaveProtocolState;

  constructor(connection: VoiceConnection) {
    this.#connection = connection;
    this.#mls = new MlsManager();
    this.#e2ee = new E2eeManager();

    this.#state = {
      version: 0,
      enabled: false,
      group: null,
      pendingTransition: null,
      encryptionContext: null,
    };
  }

  initialize(version: DaveProtocolVersion): void {
    try {
      this.#state.version = version;
      this.#state.enabled = version > 0;

      if (this.#state.enabled) {
        this.#mls.initialize();
        this.#e2ee.initialize();
      }

      this.#connection.emit("daveStateChange", this.#state);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to initialize DAVE protocol", { cause: error }),
      );
    }
  }

  handlePrepareTransition(data: DaveProtocolTransitionInfo): void {
    try {
      this.#state.pendingTransition = data;

      if (data.epochId) {
        this.#prepareProtocolTransition(data);
      } else {
        this.#prepareDowngrade();
      }

      this.#connection.emit("transitionReady", data.transitionId);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to prepare transition", { cause: error }),
      );
    }
  }

  handleExternalSender(data: MlsExternalSenderData): void {
    try {
      this.#mls.setExternalSender(data);

      if (!this.#state.group) {
        this.#state.group = this.#mls.createInitialGroup();
        this.#connection.emit("daveStateChange", this.#state);
      }
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle external sender", { cause: error }),
      );
    }
  }

  handleProposals(data: MlsProposalData): void {
    try {
      this.#mls.handleProposals(data);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle proposals", { cause: error }),
      );
    }
  }

  handleCommit(data: MlsCommitData): void {
    try {
      const newGroup = this.#mls.handleCommit(data);
      this.#state.group = newGroup;

      this.#state.encryptionContext =
        this.#e2ee.updateEncryptionContext(newGroup);

      this.#connection.emit("daveStateChange", this.#state);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle commit", { cause: error }),
      );
    }
  }

  encryptFrame(frame: Buffer): E2eeFrame {
    if (!(this.#state.enabled && this.#state.encryptionContext)) {
      throw new Error("E2EE not enabled or encryption context not initialized");
    }
    return this.#e2ee.encryptFrame(frame, this.#state.encryptionContext);
  }

  decryptFrame(frame: E2eeFrame): Buffer {
    if (!(this.#state.enabled && this.#state.encryptionContext)) {
      throw new Error("E2EE not enabled or encryption context not initialized");
    }
    return this.#e2ee.decryptFrame(frame, this.#state.encryptionContext);
  }

  destroy(): void {
    this.#mls.destroy();
    this.#e2ee.destroy();
  }

  #prepareProtocolTransition(data: DaveProtocolTransitionInfo): void {
    if (!data.epochId) {
      throw new Error("Epoch ID required for protocol transition");
    }

    if (data.epochId === 1) {
      const keyPackage = this.#mls.generateKeyPackage();
      this.#state.group = {
        epoch: 0,
        keyPackage,
        externalSender: this.#mls.getExternalSender(),
      };
    } else {
      this.#mls.updateGroupProtocolVersion(data.epochId);
    }
  }

  #prepareDowngrade(): void {
    this.#state.enabled = false;
    this.#state.group = null;
    this.#state.encryptionContext = null;
    this.#e2ee.cleanup();
  }
}
