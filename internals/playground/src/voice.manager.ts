import { createReadStream } from "node:fs";
import type { VoiceStateEntity } from "@nyxjs/core";
import type {
  Gateway,
  GatewayReceiveEvents,
  VoiceServerUpdateEntity,
} from "@nyxjs/gateway";
import { Store } from "@nyxjs/store";
import { AudioType, VoiceConnection, VoiceGatewayVersion } from "@nyxjs/voice";

export class VoiceManager {
  #connections = new Store<string, VoiceConnection>();
  #pendingConnections = new Store<
    string,
    {
      state?: VoiceStateEntity;
      server?: VoiceServerUpdateEntity;
    }
  >();

  #gateway: Gateway;

  constructor(gateway: Gateway) {
    this.#gateway = gateway;
    this.#gateway.on("dispatch", this.#handleDispatch.bind(this));
  }

  joinVoiceChannel(guildId: string, channelId: string): void {
    this.#pendingConnections.set(guildId, {});

    this.#gateway.updateVoiceState({
      guild_id: guildId,
      channel_id: channelId,
      self_mute: false,
      self_deaf: false,
    });
  }

  leaveVoiceChannel(guildId: string): void {
    const connection = this.#connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.#connections.delete(guildId);
      this.#pendingConnections.delete(guildId);

      this.#gateway.updateVoiceState({
        guild_id: guildId,
        channel_id: null,
        self_mute: false,
        self_deaf: false,
      });
    }
  }

  async playAudio(guildId: string, input: string): Promise<void> {
    const connection = this.#connections.get(guildId);
    if (!connection) {
      throw new Error("No voice connection found");
    }

    const inputStream = createReadStream(input);

    const audioStream = connection.audio.createAudioResource(inputStream, {
      type: AudioType.Ffmpeg,
      bitrate: 128000,
      volume: 1,
    });

    connection.setSpeaking(true);

    audioStream.on("data", (chunk: Buffer) => {
      try {
        connection.sendAudioPacket(chunk);
      } catch (error) {
        console.error("Failed to send audio packet:", error);
      }
    });

    audioStream.on("end", () => {
      console.log("Audio stream ended");
      connection.stopSpeaking();
    });

    audioStream.on("error", (error) => {
      console.error("Audio stream error:", error);
      connection.stopSpeaking();
    });

    return new Promise((resolve, reject) => {
      audioStream.on("end", resolve);
      audioStream.on("error", reject);
    });
  }

  destroy(): void {
    for (const connection of this.#connections.values()) {
      connection.destroy();
    }
    this.#connections.clear();
    this.#pendingConnections.clear();
  }

  async #handleDispatch<K extends keyof GatewayReceiveEvents>(
    t: K,
    d: GatewayReceiveEvents[K],
  ): Promise<void> {
    switch (t) {
      case "VOICE_STATE_UPDATE":
        await this.#handleVoiceStateUpdate(d as VoiceStateEntity);
        break;
      case "VOICE_SERVER_UPDATE":
        await this.#handleVoiceServerUpdate(d as VoiceServerUpdateEntity);
        break;

      default:
        break;
    }
  }

  async #handleVoiceStateUpdate(data: VoiceStateEntity): Promise<void> {
    const guildId = data.guild_id;
    if (!guildId) {
      return;
    }

    const pending = this.#pendingConnections.get(guildId);

    if (pending) {
      pending.state = data;
      await this.#tryConnection(guildId);
    }
  }

  async #handleVoiceServerUpdate(data: VoiceServerUpdateEntity): Promise<void> {
    const guildId = data.guild_id;
    const pending = this.#pendingConnections.get(guildId);

    if (pending) {
      pending.server = data;
      await this.#tryConnection(guildId);
    }
  }

  async #tryConnection(guildId: string): Promise<void> {
    const pending = this.#pendingConnections.get(guildId);

    if (!(pending?.state && pending.server && pending.server.endpoint)) {
      return;
    }

    try {
      const connection = new VoiceConnection({
        endpoint: pending.server.endpoint,
        token: pending.server.token,
        sessionId: pending.state.session_id,
        guildId: guildId,
        userId: "1011252785989308526",
        version: VoiceGatewayVersion.V8,
      });

      await connection.connect();
      this.#connections.set(guildId, connection);
      this.#pendingConnections.delete(guildId);

      connection.on("error", (...args) => {
        console.error("Voice connection error:", ...args);
      });

      connection.on("debug", (...args) => {
        console.log("Voice connection debug:", ...args);
      });

      connection.on("ready", (...args) => {
        console.log("Voice connection ready!", ...args);
      });
    } catch (error) {
      console.error("Failed to connect to voice:", error);
      this.#pendingConnections.delete(guildId);
    }
  }
}
