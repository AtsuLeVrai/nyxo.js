import { Logger } from "@nyxjs/logger";
import type { Gateway } from "../Gateway.js";
import type { GatewayError } from "../GatewayError.js";

export abstract class BaseManager {
    protected readonly gateway: Gateway;

    constructor(gateway: Gateway) {
        this.gateway = gateway;
    }

    protected error(error: GatewayError): void {
        this.gateway.emit(
            "error",
            Logger.error(error.message, {
                component: this.constructor.name,
                code: error.code,
                details: error.details,
                stack: error.stack,
            }),
        );
    }

    protected debug(message: string, details?: Record<string, unknown>): void {
        this.gateway.emit(
            "debug",
            Logger.debug(message, {
                component: this.constructor.name,
                details,
            }),
        );
    }

    protected warn(message: string, details?: Record<string, unknown>): void {
        this.gateway.emit(
            "warn",
            Logger.warn(message, {
                component: this.constructor.name,
                details,
            }),
        );
    }
}
