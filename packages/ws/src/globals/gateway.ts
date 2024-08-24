import { Buffer } from "node:buffer";
import { clearInterval, clearTimeout, setInterval } from "node:timers";
import { URL } from "node:url";
import { TextDecoder } from "node:util";
import type { ApiVersions, GatewayCloseCodes, Integer } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import { Rest } from "@nyxjs/rest";
import { decompress } from "@skhaz/zstd";
import { pack, unpack } from "erlpack";
import { EventEmitter } from "eventemitter3";
import type { ZlibOptions } from "minizlib";
import { Inflate } from "minizlib";
import WebSocket from "ws";
import type { HelloEventFields } from "../events/hello";
import type { GatewaySendEvents } from "./events";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#payload-structure}
 */
export type GatewayPayload = {
	/**
	 * Event data
	 */
	d: unknown;
	/**
	 * Gateway opcode, which indicates the payload type
	 */
	op: GatewayOpcodes;
	/**
	 * Sequence number of event used for resuming sessions and heartbeating
	 */
	s: Integer | null;
	/**
	 * Event name
	 */
	t: string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayUrlQuery = {
	/**
	 * The optional transport compression of gateway packets zlib-stream or zstd-stream
	 */
	compress?: "zlib-stream" | "zstd-stream";
	/**
	 * The encoding of received gateway packets json or etf
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

const ZlibInflateOptions: ZlibOptions = {
	level: 9,
	encoding: "utf8",
	flush: 2,
	finishFlush: 2,
};

export class Gateway extends EventEmitter<GatewayEvents> {
	private ws: WebSocket | null = null;

	private heartbeatInterval: NodeJS.Timeout | null = null;

	private sequence: Integer | null = null;

	private reconnectTimeout: NodeJS.Timeout | null = null;

	private zlibInflate = new Inflate(ZlibInflateOptions);

	private textDecoder = new TextDecoder();

	public constructor(private token: string, private readonly options: GatewayUrlQuery) {
		super();
	}

	private get rest(): Rest {
		return new Rest(this.token);
	}

	private get wsUrl(): string {
		const query = new URL("wss://gateway.discord.gg/");
		query.searchParams.set("v", this.options.v.toString());
		query.searchParams.set("encoding", this.options.encoding);
		if (this.options.compress) {
			query.searchParams.set("compress", this.options.compress);
		}

		return query.toString();
	}

	public async connect(): Promise<void> {
		if (this.ws) {
			this.ws.close();
		}

		try {
			this.ws = new WebSocket(this.wsUrl);

			this.ws.on("open", this.onOpen.bind(this));
			this.ws.on("message", this.onMessage.bind(this));
			this.ws.on("close", this.onClose.bind(this));
			this.ws.on("error", this.onError.bind(this));
		} catch {
			this.emit("error", new Error("Failed to establish a WebSocket connection"));
		}
	}

	public send<T extends keyof GatewaySendEvents>(op: T, data: GatewaySendEvents[T]): void {
		if (!this.ws) {
			return;
		}

		const payload: GatewayPayload = {
			d: data,
			op,
			s: this.sequence,
			t: null,
		};

		const encoded = this.encodeMessage(payload);
		this.ws.send(encoded);
	}

	public setToken(token: string): void {
		this.emit("debug", "[WS] Setting gateway token...");
		this.token = token;
		this.rest.setToken(token);
	}

	public setCompress(compress: GatewayUrlQuery["compress"]): void {
		if (this.options.compress) {
			this.emit("debug", `[WS] Setting gateway compression to: ${compress}...`);
			this.options.compress = compress;
		}
	}

	public setEncoding(encoding: GatewayUrlQuery["encoding"]): void {
		this.emit("debug", `[WS] Setting gateway encoding to: ${encoding}...`);
		this.options.encoding = encoding;
	}

	public setVersion(version: GatewayUrlQuery["v"]): void {
		this.emit("debug", `[WS] Setting gateway version to: ${version}...`);
		this.options.v = version;
	}

	public disconnect(): void {
		this.emit("debug", "[WS] Disconnecting from the gateway...");
		if (this.ws) {
			this.ws.close();
		}

		this.cleanup();
	}

	private onOpen(): void {
		this.emit("debug", "[WS] Connected to the gateway...");
	}

	private async onMessage(data: WebSocket.RawData): Promise<void> {
		let decompressedData: string;

		try {
			if (this.options.compress === "zlib-stream" && Buffer.isBuffer(data)) {
				decompressedData = await this.decompressZlib(data);
			} else if (this.options.compress === "zstd-stream" && Buffer.isBuffer(data)) {
				decompressedData = await this.decompressZstd(data);
			} else {
				decompressedData = this.decodeRawData(data);
			}

			const decoded = this.decodeMessage(decompressedData);
			this.handleMessage(decoded);
		} catch {
			this.emit("error", new Error("Failed to process WebSocket message"));
		}
	}

	private async decompressZlib(data: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			let decompressedData = Buffer.alloc(0);

			this.zlibInflate.on("data", (chunk) => {
				decompressedData = Buffer.concat([decompressedData, chunk]);
			});

			this.zlibInflate.on("end", () => {
				resolve(this.textDecoder.decode(decompressedData));
			});

			this.zlibInflate.on("error", (error) => {
				if (error instanceof Error) {
					reject(error);
				} else {
					reject(new Error(`An unknown error occurred: ${error}`));
				}
			});

			if (Buffer.isBuffer(data)) {
				this.zlibInflate.write(data);
				this.zlibInflate.flush();
			} else {
				reject(new Error("Invalid input: data must be a Buffer"));
			}
		});
	}

	private async decompressZstd(data: Buffer): Promise<string> {
		try {
			const decompressedBuffer = await decompress(data);
			return this.textDecoder.decode(decompressedBuffer);
		} catch (error) {
			this.emit("error", new Error("Failed to decompress Zstd data"));
			throw error;
		}
	}

	private decodeRawData(data: WebSocket.RawData): string {
		if (Buffer.isBuffer(data)) {
			return this.textDecoder.decode(data);
		} else if (Array.isArray(data)) {
			return this.textDecoder.decode(Buffer.concat(data));
		} else {
			return this.textDecoder.decode(data);
		}
	}

	private decodeMessage(data: Buffer | string): any {
		if (this.options.encoding === "json") {
			return JSON.parse(data.toString());
		} else if (this.options.encoding === "etf") {
			return unpack(data as Buffer);
		} else {
			throw new Error("Unsupported encoding type");
		}
	}

	private encodeMessage(data: any): Buffer | string {
		if (this.options.encoding === "json") {
			return JSON.stringify(data);
		} else if (this.options.encoding === "etf") {
			return pack(data);
		} else {
			throw new Error("Unsupported encoding type");
		}
	}

	private handleMessage(message: string): void {
		let payload: GatewayPayload;
		try {
			payload = JSON.parse(message);
		} catch {
			this.emit("error", new Error("[WS] Failed to parse gateway payload..."));
			return;
		}

		this.sequence = payload.s ?? this.sequence;

		switch (payload.op) {
			case GatewayOpcodes.Hello: {
				const hello = payload.d as HelloEventFields;
				this.setupHeartbeat(hello.heartbeat_interval);
				break;
			}

			default: {
				this.emit("warn", `[WS] Received an unhandled gateway event: ${payload.op}...`);
				break;
			}
		}
	}

	private setupHeartbeat(interval: number): void {
		this.emit("debug", `[WS] Setting up heartbeat with interval: ${interval}ms...`);
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}

		this.heartbeatInterval = setInterval(() => {
			this.send(GatewayOpcodes.Heartbeat, this.sequence);
		}, interval);
	}

	private onClose(code: GatewayCloseCodes, reason: Buffer): void {
		this.emit("close", code, reason.toString());
		this.cleanup();
	}

	private onError(error: Error): void {
		this.emit("error", error);
	}

	private cleanup(): void {
		this.emit("debug", "[WS] Cleaning up...");
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}

		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
		}

		this.zlibInflate.close();
		this.ws = null;
		this.heartbeatInterval = null;
		this.sequence = null;
	}
}
