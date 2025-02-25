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
    console.log("Joining voice channel...");
    this.#pendingConnections.set(guildId, {});

    this.#gateway.updateVoiceState({
      guild_id: guildId,
      channel_id: channelId,
      self_mute: false,
      self_deaf: false,
    });
  }

  async playAudio(guildId: string, input: string): Promise<void> {
    const connection = this.#connections.get(guildId);
    if (!connection) {
      throw new Error("No voice connection found");
    }

    console.log(`[Voice Debug] Starting playback of: ${input}`);

    if (!connection.hasValidSession) {
      console.log("[Voice Debug] Waiting for session...");
      await new Promise<void>((resolve) => {
        connection.once("sessionDescription", () => {
          resolve();
        });
      });
    }

    if (!connection.ssrc) {
      throw new Error("Voice connection not properly initialized (no SSRC)");
    }

    const audioStream =
      typeof input === "string" ? createReadStream(input) : input;
    console.log("[Voice Debug] Created input stream");

    const transformedStream = connection.audio.createAudioResource(
      audioStream,
      {
        type: AudioType.Ffmpeg,
        volume: 1,
        bitrate: 128000,
      },
    );
    console.log("[Voice Debug] Created transformed stream");

    console.log("Input stream format:", audioStream);
    console.log("Transformed stream format:", transformedStream);

    let packetCount = 0;
    return new Promise((resolve, reject) => {
      transformedStream.on("data", (chunk: Buffer) => {
        try {
          packetCount++;
          if (packetCount % 100 === 0) {
            console.log(`[Voice Debug] Sent ${packetCount} packets`);
          }
          connection.sendAudioPacket(chunk);
        } catch (error) {
          console.error("[Voice Debug] Error sending packet:", error);
          reject(error);
        }
      });

      transformedStream.on("end", () => {
        console.log(`[Voice Debug] Stream ended after ${packetCount} packets`);
        resolve();
      });

      transformedStream.on("error", (error) => {
        console.error("[Voice Debug] Stream error:", error);
        connection.stopSpeaking();
        reject(error);
      });
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

  destroy(): void {
    for (const connection of this.#connections.values()) {
      connection.destroy();
    }
    this.#connections.clear();
    this.#pendingConnections.clear();
  }

  async #tryConnection(guildId: string): Promise<void> {
    const pending = this.#pendingConnections.get(guildId);

    if (!(pending?.state && pending.server && pending.server.endpoint)) {
      return;
    }

    try {
      console.log("Attempting to establish voice connection...");

      const connection = new VoiceConnection({
        endpoint: pending.server.endpoint,
        token: pending.server.token,
        sessionId: pending.state.session_id,
        guildId: guildId,
        userId: "1011252785989308526",
        version: VoiceGatewayVersion.V8,
      });

      connection.on("debug", (...args) => {
        console.log("[VOICE - DEBUG]", ...args);
      });

      connection.on("error", (...args) => {
        console.log("[VOICE - ERROR]", ...args);
      });

      connection.on("resumed", (...args) => {
        console.log("[VOICE - RESUMED]", ...args);
      });

      connection.on("sessionDescription", (...args) => {
        console.log("[VOICE - SESSION DESCRIPTION]", ...args);
      });

      connection.on("ready", (...args) => {
        console.log("[VOICE - READY]", ...args);
      });

      connection.on("ipDiscovered", (...args) => {
        console.log("[VOICE - IP DISCOVERED]", ...args);
      });

      connection.on("ipTimeout", (...args) => {
        console.log("[VOICE - IP TIMEOUT]", ...args);
      });

      connection.on("ipRetrying", (...args) => {
        console.log("[VOICE - IP RETRYING]", ...args);
      });

      connection.on("speaking", (...args) => {
        console.log("[VOICE - SPEAKING]", ...args);
      });

      await connection.connect();
      this.#connections.set(guildId, connection);
      this.#pendingConnections.delete(guildId);
    } catch (error) {
      console.error("Failed to establish voice connection:", error);
      this.#pendingConnections.delete(guildId);
      throw error;
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
    const pending = this.#pendingConnections.get(data.guild_id);
    if (pending) {
      pending.server = data;
      await this.#tryConnection(data.guild_id);
    }
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
    }
  }
}
