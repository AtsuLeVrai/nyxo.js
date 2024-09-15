import type { GatewayIntents, Integer } from "@nyxjs/core";
import { ApiVersions } from "@nyxjs/core";
import { EncodingTypes } from "@nyxjs/ws";
import { EventEmitter } from "eventemitter3";
import { ApplicationManager } from "../managers/ApplicationManager";
import { BitFieldManager } from "../managers/BitFieldManager";
import { ChannelManager } from "../managers/ChannelManager";
import { GuildManager } from "../managers/GuildManager";
import { InviteManager } from "../managers/InviteManager";
import { RestManager } from "../managers/RestManager";
import { SkuManager } from "../managers/SkuManager";
import { StageManager } from "../managers/StageManager";
import { UserManager } from "../managers/UserManager";
import { WebSocketManager } from "../managers/WebSocketManager";
import { WebhookManager } from "../managers/WebhookManager";
import type { ClientOptions } from "../types/Client";
import type { ClientEvents } from "../types/ClientEvents";

export class Client extends EventEmitter<ClientEvents> {
    public applications: ApplicationManager;

    public channels: ChannelManager;

    public guilds: GuildManager;

    public invites: InviteManager;

    public rest: RestManager;

    public skus: SkuManager;

    public stages: StageManager;

    public users: UserManager;

    public webhooks: WebhookManager;

    public ws: WebSocketManager;

    private defaultVersions = ApiVersions.V10;

    public constructor(
        public token: string,
        private readonly options: ClientOptions
    ) {
        super();
        this.applications = new ApplicationManager(this);
        this.channels = new ChannelManager(this);
        this.guilds = new GuildManager(this);
        this.invites = new InviteManager(this);
        this.rest = this.createRest();
        this.skus = new SkuManager(this);
        this.stages = new StageManager(this);
        this.users = new UserManager(this);
        this.webhooks = new WebhookManager(this);
        this.ws = this.createWs();
    }

    public connect(): void {
        this.rest.init();
        this.ws.init();
    }

    private calculateIntents(): Integer {
        return Number(BitFieldManager.resolve<GatewayIntents>(this.options.intents));
    }

    private createWs(): WebSocketManager {
        return new WebSocketManager(this, this.token, {
            intents: this.calculateIntents(),
            presence: this.options.presence,
            shard: this.options.shard,
            v: this.options.version ?? this.defaultVersions,
            compress: this.options.ws?.compress,
            encoding: this.options.ws?.encoding ?? EncodingTypes.Json,
            large_threshold: this.options.ws?.large_threshold,
        });
    }

    private createRest(): RestManager {
        return new RestManager(this, this.token, {
            version: this.options.version ?? this.defaultVersions,
            cache_life_time: this.options.rest?.cache_life_time,
            user_agent: this.options.rest?.user_agent,
            auth_type: this.options.rest?.auth_type,
        });
    }
}
