import { Emitsy } from "@3tatsu/emitsy";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayEvents, GatewayOptions } from "../types/gateway";
import { GatewayConnection } from "./GatewayConnection";
import { ShardManager } from "./ShardManager";

export class Gateway extends Emitsy<GatewayEvents> {
    public readonly shardManager: ShardManager;

    private readonly connection: GatewayConnection;

    public constructor(
        private readonly token: string,
        private readonly options: GatewayOptions
    ) {
        super();
        this.connection = new GatewayConnection(this, this.token, this.options);
        this.shardManager = new ShardManager(this, this.token, this.options);
    }

    public async connect(): Promise<void> {
        this.connection.connect();
        await this.shardManager.initialize();
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        this.connection.send(op, data);
    }

    public disconnect(): void {
        this.connection.disconnect();
        this.cleanup();
    }

    private cleanup(): void {
        void this.emit("debug", "[WS] Cleaning up...");
        this.connection.cleanup();
        this.shardManager.cleanup();
    }
}
