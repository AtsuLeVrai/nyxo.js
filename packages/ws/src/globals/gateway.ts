import type { Buffer } from "node:buffer";
import { URL } from "node:url";
import type { ApiVersions, GatewayCloseCodes, Integer } from "@nyxjs/core";
import { GatewayRoutes, Rest } from "@nyxjs/rest";
import { EventEmitter } from "eventemitter3";
import WebSocket from "ws";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayUrlQuery = {
	/**
	 * The optional transport compression of gateway packets	zlib-stream or zstd-stream
	 */
	compress?: "zlib-stream" | "zstd-stream";
	/**
	 * The encoding of received gateway packets	json or etf
	 */
	encoding: "etf" | "json";
	/**
	 * API version
	 */
	v: ApiVersions;
};

export type GatewayEvents = {
	close: [code: GatewayCloseCodes, reason: string];
	debug: [message: string];
	error: [error: Error];
	warn: [warning: string];
};

export class Gateway extends EventEmitter<GatewayEvents> {
	private ws: WebSocket | null = null;

	private heartbeatInterval: NodeJS.Timeout | null = null;

	private sequence: Integer | null = null;

	public constructor(private token: string, private readonly options: GatewayUrlQuery) {
		super();
	}

	private get rest(): Rest {
		return new Rest(this.token);
	}

	public async connect(): Promise<void> {
		if (this.ws) {
			this.ws.close();
		}

		this.ws = new WebSocket(await this.wsUrl());

		this.ws.on("open", this.onOpen.bind(this));
		this.ws.on("message", this.onMessage.bind(this));
		this.ws.on("close", this.onClose.bind(this));
		this.ws.on("error", this.onError.bind(this));
	}

	public setToken(token: string): void {
		this.token = token;
		this.rest.setToken(token);
	}

	public setCompress(compress: GatewayUrlQuery["compress"]): void {
		if (this.options.compress) {
			this.options.compress = compress;
		}
	}

	public setEncoding(encoding: GatewayUrlQuery["encoding"]): void {
		this.options.encoding = encoding;
	}

	public setVersion(version: GatewayUrlQuery["v"]): void {
		this.options.v = version;
	}

	private onOpen(): void {
		this.emit("debug", "[WS] Connected to the gateway...");
	}

	private onMessage(data: WebSocket.RawData, isBinary: boolean): void {}

	private onClose(code: GatewayCloseCodes, reason: Buffer): void {
		this.emit("close", code, reason.toString());
	}

	private onError(error: Error): void {
		this.emit("error", error);
	}

	private async wsUrl(): Promise<string> {
		const { url } = await this.rest.request(GatewayRoutes.getGateway());
		const query = new URL(url);
		query.searchParams.set("v", this.options.v.toString());
		query.searchParams.set("encoding", this.options.encoding);
		if (this.options.compress) {
			query.searchParams.set("compress", this.options.compress);
		}

		return query.toString();
	}
}
