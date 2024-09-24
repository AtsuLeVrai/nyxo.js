import { EventEmitter } from "eventemitter3";
import type { GatewaySendEvents } from "../types/events";
import type { GatewayEvents, GatewayOptions } from "../types/gateway";
import { GatewayConnection } from "./GatewayConnection";

const connection = Symbol("connection");

export class Gateway extends EventEmitter<GatewayEvents> {
    private readonly [connection]: GatewayConnection;

    public constructor(token: string, options: GatewayOptions) {
        super();
        this[connection] = new GatewayConnection(this, token, options);
    }

    public async connect(): Promise<void> {
        try {
            await this[connection].connect();
        } catch (error) {
            this.emit("error", error instanceof Error ? error : new Error(String(error)));
        }
    }

    public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
        this[connection].send(op, data);
    }

    public disconnect(): void {
        this[connection].disconnect();
    }
}
