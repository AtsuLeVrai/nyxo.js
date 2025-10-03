export interface HelloEntity {
  heartbeat_interval: number;
}

export interface ReadyEntity {
  v: ApiVersion;
  user: UserEntity;
  guilds: UnavailableGuildEntity[];
  session_id: string;
  resume_gateway_url: string;
  shard?: [number, number];
  application: Pick<ApplicationEntity, "id" | "flags">;
}

export interface SessionStartLimit {
  total: number;
  remaining: number;
  reset_after: number;
  max_concurrency: number;
}

export interface GatewayResponse {
  url: string;
}

export interface GatewayBotResponse extends GatewayResponse {
  shards: number;
  session_start_limit: SessionStartLimit;
}
