import { GatewayCloseCodes } from "@nyxjs/core";

type Class<T = any> = new (...args: any[]) => T;

type ReturnTypes = Class | bigint | boolean | number | object | string | symbol | undefined;

type ClientEventMappingStructure = {
    [client_event_name: string]: {
        audit_log_event_name?: string;
        gateway_event_name?: string;
        return?: ReturnTypes[];
    };
};

const ClientEventMapping: ClientEventMappingStructure = {
    close: {
        gateway_event_name: "CLOSE",
        return: [GatewayCloseCodes, String],
    },
    debug: {
        gateway_event_name: "DEBUG",
        return: [String],
    },
    error: {
        gateway_event_name: "ERROR",
        return: [Error],
    },
    warn: {
        gateway_event_name: "WARN",
        return: [String],
    },
};

export type ClientEvents = {
    close: [code: GatewayCloseCodes, reason: string];
    debug: [message: string];
    error: [error: Error];
    warn: [message: string];
};

export class ClientEventManager {}
