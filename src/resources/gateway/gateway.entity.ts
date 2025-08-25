import type { ApiVersion } from "../../enum/index.js";
import type { ApplicationEntity } from "../application/index.js";
import type { UnavailableGuildEntity } from "../guild/index.js";
import type { UserEntity } from "../user/index.js";

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
