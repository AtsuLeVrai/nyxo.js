import type { VoiceConnection } from "../core/index.js";
import {
  type DaveMlsCommitWelcomeData,
  type DaveMlsExternalSenderData,
  type DaveMlsProposalsData,
  type DaveProtocolEpochData,
  type DaveProtocolTransitionData,
  VoiceConnectionState,
  type VoiceHelloData,
  VoiceOpcodes,
  type VoicePayloadEntity,
  type VoiceReadyData,
  type VoiceServerInfo,
  type VoiceSessionDescriptionData,
  type VoiceSpeakingData,
} from "../types/index.js";

const NON_RESUMABLE_CODES = [
  4004, // Authentication failed
  4006, // Session no longer valid
  4011, // Server not found
  4012, // Unknown protocol
  4014, // Disconnected
  4015, // Voice server crashed
  4016, // Unknown encryption mode
];

export class VoiceOperationHandler {
  readonly #connection: VoiceConnection;

  constructor(connection: VoiceConnection) {
    this.#connection = connection;
  }

  handlePayload(payload: VoicePayloadEntity): void {
    this.#connection.emit(
      "debug",
      `Handling voice operation: ${JSON.stringify(payload)}`,
    );

    switch (payload.op) {
      case VoiceOpcodes.Ready:
        this.#handleReady(payload.d as VoiceReadyData);
        break;

      case VoiceOpcodes.SessionDescription:
        this.#handleSessionDescription(
          payload.d as VoiceSessionDescriptionData,
        );
        break;

      case VoiceOpcodes.Speaking:
        this.#handleSpeaking(payload.d as VoiceSpeakingData);
        break;

      case VoiceOpcodes.HeartbeatAck:
        this.#connection.heartbeat.ackHeartbeat(payload.d as number);
        break;

      case VoiceOpcodes.Hello:
        this.#handleHello(payload.d as VoiceHelloData);
        break;

      case VoiceOpcodes.Resumed:
        this.#handleResumed();
        break;

      case VoiceOpcodes.ClientDisconnect:
        this.#handleClientDisconnect(payload.d as { user_id: string });
        break;

      // DAVE Protocol Handlers
      case VoiceOpcodes.DaveProtocolExecute:
        this.#handleDaveProtocolExecute(
          payload.d as DaveProtocolTransitionData,
        );
        break;

      case VoiceOpcodes.DaveProtocolPrepareEpoch:
        this.#handleDaveProtocolPrepareEpoch(
          payload.d as DaveProtocolEpochData,
        );
        break;

      case VoiceOpcodes.DaveMlsExternalSenderPackage:
        this.#handleDaveMlsExternalSender(
          payload.d as DaveMlsExternalSenderData,
        );
        break;

      case VoiceOpcodes.DaveMlsProposals:
        this.#handleDaveMlsProposals(payload.d as DaveMlsProposalsData);
        break;

      case VoiceOpcodes.DaveMlsCommitWelcome:
        this.#handleDaveMlsCommitWelcome(payload.d as DaveMlsCommitWelcomeData);
        break;

      default:
        this.#connection.emit(
          "debug",
          `Unhandled voice operation: ${payload.op}`,
        );
    }
  }

  async handleClose(code: number, reason: string): Promise<void> {
    this.#connection.emit(
      "debug",
      `Voice WebSocket closed with code ${code}: ${reason}`,
    );
    this.#connection.heartbeat.destroy();

    if (code === 1000 || NON_RESUMABLE_CODES.includes(code)) {
      this.#connection.setState(VoiceConnectionState.Disconnected);
      this.#connection.destroy();
      return;
    }

    try {
      this.#connection.setState(VoiceConnectionState.Connecting);
      await this.#connection.connect();
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to reconnect after close", { cause: error }),
      );
      this.#connection.destroy();
    }
  }

  #handleReady(data: VoiceReadyData): void {
    try {
      this.#connection.setSsrc(data.ssrc);
      this.#connection.setUdpInfo({
        ip: data.ip,
        port: data.port,
        ssrc: data.ssrc,
        modes: data.modes,
      });

      this.#connection.initializeUdp().catch((error) => {
        this.#connection.emit(
          "error",
          new Error("Failed to initialize UDP", { cause: error }),
        );
      });

      this.#connection.setState(VoiceConnectionState.Ready);
      this.#connection.emit("ready", data);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle ready state", { cause: error }),
      );
      this.#connection.destroy();
    }
  }

  #handleSessionDescription(data: VoiceSessionDescriptionData): void {
    try {
      this.#connection.encryption.initialize(
        Buffer.from(data.secret_key),
        data.mode,
      );

      this.#connection.setSessionInfo(data);
      this.#connection.emit("sessionDescription", data);
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle session description", { cause: error }),
      );
      this.#connection.destroy();
    }
  }

  #handleSpeaking(data: VoiceSpeakingData): void {
    if (data.user_id) {
      this.#connection.setUserSpeaking(data.user_id, {
        speaking: data.speaking,
        ssrc: data.ssrc,
        delay: data.delay,
      });
    }

    this.#connection.emit("speaking", data);
  }

  #handleHello(data: VoiceHelloData): void {
    try {
      this.#connection.heartbeat.start(data.heartbeat_interval);

      if (this.#connection.canResume()) {
        this.#sendResume();
      } else {
        this.#sendIdentify();
      }
    } catch (error) {
      this.#connection.emit(
        "error",
        new Error("Failed to handle hello", { cause: error }),
      );
      this.#connection.destroy();
    }
  }

  #handleResumed(): void {
    this.#connection.setState(VoiceConnectionState.Ready);
    this.#connection.emit("resumed");
  }

  #handleClientDisconnect(data: { user_id: string }): void {
    this.#connection.cleanupUser(data.user_id);
    this.#connection.emit("clientDisconnect", data);
  }

  // DAVE Protocol Handlers
  #handleDaveProtocolExecute(data: DaveProtocolTransitionData): void {
    this.#connection.emit("daveProtocolExecute", data);
  }

  #handleDaveProtocolPrepareEpoch(data: DaveProtocolEpochData): void {
    this.#connection.emit("daveProtocolPrepareEpoch", data);
  }

  #handleDaveMlsExternalSender(data: DaveMlsExternalSenderData): void {
    this.#connection.emit("daveMlsExternalSender", data);
  }

  #handleDaveMlsProposals(data: DaveMlsProposalsData): void {
    this.#connection.emit("daveMlsProposals", data);
  }

  #handleDaveMlsCommitWelcome(data: DaveMlsCommitWelcomeData): void {
    this.#connection.emit("daveMlsCommitWelcome", data);
  }

  #sendIdentify(): void {
    const serverInfo = this.#connection.serverInfo as VoiceServerInfo;
    this.#connection.send(VoiceOpcodes.Identify, {
      server_id: serverInfo.server_id,
      user_id: serverInfo.user_id,
      session_id: serverInfo.session_id,
      token: serverInfo.token,
    });
  }

  #sendResume(): void {
    const serverInfo = this.#connection.serverInfo as VoiceServerInfo;
    this.#connection.send(VoiceOpcodes.Resume, {
      server_id: serverInfo.server_id,
      session_id: serverInfo.session_id,
      token: serverInfo.token,
      seq_ack: this.#connection.sequence,
    });
  }
}
