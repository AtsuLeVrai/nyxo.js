import { EventEmitter } from "eventemitter3";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayEvents, GatewayOptions } from "../types/gateway";
import { GatewayConnection } from "./GatewayConnection";
import { ShardManager } from "./ShardManager";

const connection = Symbol("connection");
const shardManager = Symbol("shardManager");

export class Gateway extends EventEmitter<GatewayEvents> {
    private readonly [connection]: GatewayConnection;

    private readonly [shardManager]: ShardManager;

    public constructor(token: string, options: Readonly<GatewayOptions>) {
        super();
        this.emit("debug", "[Gateway] Initializing Gateway");
        if (typeof token !== "string" || token.length === 0) {
            throw new Error("Invalid token");
        }

        this.emit("debug", "[Gateway] Creating GatewayConnection");
        this[connection] = new GatewayConnection(this, token, options);

        this.emit("debug", "[Gateway] Creating ShardManager");
        this[shardManager] = new ShardManager(this, token, options);

        this.emit("debug", "[Gateway] Gateway initialized successfully");
    }

    public get shardManager(): Readonly<ShardManager> {
        return this[shardManager];
    }

    public async connect(): Promise<void> {
        this.emit("debug", "[Gateway] Attempting to connect");
        try {
            this.emit("debug", "[Gateway] Connecting to GatewayConnection");
            await this[connection].connect();

            this.emit("debug", "[Gateway] Initializing ShardManager");
            await this[shardManager].initialize();

            this.emit("debug", "[Gateway] Connection and initialization successful");
        } catch (error) {
            this.emit(
                "debug",
                `[Gateway] Error during connection: ${error instanceof Error ? error.message : String(error)}`
            );
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        this.emit("debug", `[Gateway] Sending operation ${op}`);
        this[connection].send(op, data);
    }

    public disconnect(): void {
        this.emit("debug", "[Gateway] Disconnecting");
        this[connection].disconnect();
        this.cleanup();
    }

    private cleanup(): void {
        this.emit("debug", "[Gateway] Starting cleanup process");
        this[connection].cleanup();
        this.emit("debug", "[Gateway] GatewayConnection cleanup complete");
        this[shardManager].cleanup();
        this.emit("debug", "[Gateway] ShardManager cleanup complete");
        this.emit("debug", "[Gateway] Cleanup process finished");
    }
}
