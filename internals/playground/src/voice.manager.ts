import { readFileSync } from "node:fs";
import type { VoiceStateEntity } from "@nyxjs/core";
import type {
  Gateway,
  GatewayReceiveEvents,
  VoiceServerUpdateEntity,
} from "@nyxjs/gateway";
import { Store } from "@nyxjs/store";
import {
  AudioType,
  VoiceConnection,
  VoiceGatewayVersion,
  VoiceSpeakingFlags,
} from "@nyxjs/voice";

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

    try {
      // Charger le fichier audio directement dans un Buffer
      const audioBuffer = readFileSync(input);
      console.log("[Voice Debug] Audio buffer size:", audioBuffer.length);

      // Indiquer que nous commençons à parler
      connection.setSpeaking(true, VoiceSpeakingFlags.Microphone);

      // Traiter l'audio et l'envoyer
      const transformedStream = connection.audio.createAudioResource(
        audioBuffer,
        {
          type: AudioType.Ffmpeg,
          volume: 1,
          bitrate: 128000,
        },
      );
      console.log("[Voice Debug] Created audio resource");

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
            connection.setSpeaking(false);
            reject(error);
          }
        });

        transformedStream.on("end", () => {
          console.log(
            `[Voice Debug] Stream ended after ${packetCount} packets`,
          );
          connection.stopSpeaking();
          resolve();
        });

        transformedStream.on("error", (error) => {
          console.error("[Voice Debug] Stream error:", error);
          connection.stopSpeaking();
          reject(error);
        });
      });
    } catch (error) {
      console.error("[Voice Debug] Error in playAudio:", error);
      connection.stopSpeaking();
      throw error;
    }
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
        userId: pending.state.user_id || "1011252785989308526", // Utiliser l'ID réel quand disponible
        version: VoiceGatewayVersion.V8,
        audioOptions: {
          sampleRate: 48000,
          channels: 2,
          frameSize: 960,
          bitrate: 128000,
        },
        ipDiscovery: {
          maxRetries: 3,
          timeout: 5000,
          retryDelay: 1000,
        },
      });

      connection.on("debug", (...args) => {
        console.log("[VOICE - DEBUG]", ...args);
      });

      connection.on("error", (error) => {
        console.error("[VOICE - ERROR]", error);
      });

      connection.on("resumed", () => {
        console.log("[VOICE - RESUMED]");
      });

      connection.on("sessionDescription", (_data) => {
        console.log("[VOICE - SESSION DESCRIPTION]", "Secret key received");
      });

      connection.on("ready", (data) => {
        console.log("[VOICE - READY]", `SSRC: ${data.ssrc}`);
      });

      connection.on("ipDiscovered", (ip, port) => {
        console.log("[VOICE - IP DISCOVERED]", ip, port);
      });

      connection.on("ipTimeout", () => {
        console.log("[VOICE - IP TIMEOUT]");
      });

      connection.on("ipRetrying", (count) => {
        console.log("[VOICE - IP RETRYING]", count);
      });

      connection.on("speaking", (data) => {
        console.log(
          "[VOICE - SPEAKING]",
          `SSRC: ${data.ssrc}, Speaking: ${data.speaking}`,
        );
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
