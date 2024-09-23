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
        if (typeof token !== "string" || token.length === 0) {
            throw new Error("Invalid token");
        }

        this[connection] = new GatewayConnection(this, token, options);
        this[shardManager] = new ShardManager(this, token, options);
    }

    public get shardManager(): Readonly<ShardManager> {
        return this[shardManager];
    }

    public async connect(): Promise<void> {
        try {
            await this[connection].connect();
            await this[shardManager].initialize();
        } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        this[connection].send(op, data);
    }

    public disconnect(): void {
        this[connection].disconnect();
        this.cleanup();
    }

    private cleanup(): void {
        this.emit("debug", "[WS] Cleaning up...");
        this[connection].cleanup();
        this[shardManager].cleanup();
    }
}
