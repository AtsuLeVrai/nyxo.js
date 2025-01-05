export const ShardStatus = {
  idle: "idle",
  connecting: "connecting",
  connected: "connected",
  resuming: "resuming",
  disconnected: "disconnected",
  reconnecting: "reconnecting",
  handlingReady: "handling_ready",
  handlingGuildCreate: "handling_guild_create",
  error: "error",
} as const;

export type ShardStatus = (typeof ShardStatus)[keyof typeof ShardStatus];
