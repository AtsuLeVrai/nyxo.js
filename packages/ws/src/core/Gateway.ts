import { EventEmitter } from "eventemitter3";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayEvents, GatewayOptions } from "../types/gateway";
import { GatewayConnection } from "./GatewayConnection";
import { ShardManager } from "./ShardManager";

export class Gateway extends EventEmitter<GatewayEvents> {
    public readonly shardManager: ShardManager;

    private readonly connection: GatewayConnection;

    public constructor(token: string, options: GatewayOptions) {
        super();
        this.connection = new GatewayConnection(this, token, options);
        this.shardManager = new ShardManager(this, token, options);
    }

    public async connect(): Promise<void> {
        try {
            this.connection.connect();
            await this.shardManager.initialize();
        } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        this.connection.send(op, data);
    }

    public disconnect(): void {
        this.connection.disconnect();
        this.cleanup();
    }

    private cleanup(): void {
        this.emit("debug", "[WS] Cleaning up...");
        this.connection.cleanup();
        this.shardManager.cleanup();
    }
}
