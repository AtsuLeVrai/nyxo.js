import { Buffer } from "node:buffer";
import { clearInterval, setInterval } from "node:timers";
import { URL } from "node:url";
import type { GatewayCloseCodes, Integer } from "@nyxjs/core";
import { GatewayOpcodes } from "@nyxjs/core";
import type { ApiVersions } from "@nyxjs/rest";
import erlpack from "erlpack";
import EventEmitter from "eventemitter3";
import WebSocket from "ws";
import { Inflate } from "zlib-sync";
import type { HelloEventFields } from "../events/hello";
import type { IdentifyStructure } from "../events/identity";
import type { ReadyEventFields } from "../events/ready";
import type { AllEvents, ReceiveEvents, SendEvents } from "./events";

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway-events#payload-structure}
 */
export type GatewayPayload<T extends keyof AllEvents = keyof AllEvents> = {
	/**
	 * Event data
	 */
	d: AllEvents[T] | null;
	/**
	 * Gateway opcode, which indicates the payload type
	 */
	op: T extends keyof GatewayOpcodes ? GatewayOpcodes[T] : GatewayOpcodes;
	/**
	 * Sequence number of event used for resuming sessions and heartbeating
	 */
	s: Integer | null;
	/**
	 * Event name
	 */
	t: T extends keyof ReceiveEvents ? T : string | null;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/gateway#connecting-gateway-url-query-string-params}
 */
export type GatewayUrlQueryParams = {
	/**
	 * The compression of received Gateway packets
	 */
	compress?: "zlib-stream";
	/**
	 * The encoding of received Gateway packets
	 */
	encoding: "etf" | "json";
	/**
	 * The version of the Gateway to use
	 */
	v: ApiVersions;
};

export type GatewayEvents = {
	CLOSE: [code: GatewayCloseCodes, reason: string];
	DEBUG: [message: string];
	ERROR: [error: Error];
};

export class Gateway extends EventEmitter<GatewayEvents> {
	private ws: WebSocket | null = null;

	private heartbeatInterval: NodeJS.Timeout | null = null;

	private lastSequence: Integer | null = null;

	private sessionId: string | null = null;

	private zlibInflate = new Inflate({
		chunkSize: 1_024 * 1_024,
		to: "string",
	});

	public constructor(public identity: IdentifyStructure, public options: GatewayUrlQueryParams) {
		super();
	}

	public get url(): URL {
		const url = new URL("wss://gateway.discord.gg/");
		url.searchParams.append("v", this.options.v.toString());
		url.searchParams.append("encoding", this.options.encoding);

		if (this.options.compress) {
			url.searchParams.append("compress", this.options.compress);
		}

		return url;
	}

	public connect(): void {
		this.disconnect();
		this.emit("DEBUG", this.messageEvent(`Establishing WebSocket connection with url: ${this.url.toString()}`));
		this.ws = new WebSocket(this.url.toString(), { perMessageDeflate: false });
		this.ws.binaryType = "arraybuffer";
		this.ws.on("close", this.onClose.bind(this));
		this.ws.on("error", this.onError.bind(this));
		this.ws.on("message", this.onMessage.bind(this));
		this.ws.on("open", this.onOpen.bind(this));
		this.emit("DEBUG", this.messageEvent("WebSocket connection established..."));
	}

	public send<T extends keyof SendEvents>(opcode: T, data: SendEvents[T]): boolean {
		if (!this.ws) {
			return false;
		}

		const payload: GatewayPayload = {
			op: opcode,
			d: data,
			s: this.lastSequence,
			t: null,
		};

		this.emit("DEBUG", this.messageEvent(`Sending payload: ${JSON.stringify(payload)}`));

		const message = this.options.encoding === "json" ? JSON.stringify(payload) : this.options.encoding === "etf" ? erlpack.pack(payload) : null;

		if (message === null) {
			this.emit("ERROR", new Error(this.messageEvent("Invalid encoding")));
			return false;
		}

		this.ws.send(message);
		return true;
	}

	private handleMessage(data: GatewayPayload) {
		if (data.s) {
			this.lastSequence = data.s;
		}

		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (data.op) {
			case GatewayOpcodes.Dispatch: {
				if (data.t === "READY") {
					this.sessionId = (data.d as ReadyEventFields).session_id;
				}

				this.emit(data.t as string, data.d);
				break;
			}

			case GatewayOpcodes.Reconnect: {
				this.reconnect();
				break;
			}

			case GatewayOpcodes.InvalidSession: {
				this.reconnect();
				break;
			}

			case GatewayOpcodes.Hello: {
				this.startHeartbeat((data.d as HelloEventFields).heartbeat_interval);
				break;
			}

			case GatewayOpcodes.HeartbeatAck: {
				break;
			}
		}
	}

	private onClose(code: GatewayCloseCodes, reason: Buffer): void {
		this.emit("CLOSE", code, reason.toString());
	}

	private onError(error: Error): void {
		this.emit("ERROR", error);
	}

	private onMessage(data: WebSocket.RawData): void {
		try {
			const decompressed = this.decompressMessage(data);
			const message = this.decodeMessage(decompressed);
			this.handleMessage(message);
			this.emit("DEBUG", this.messageEvent(`Received message: ${JSON.stringify(message)}`));
		} catch (error) {
			this.emit("ERROR", new Error(`Failed to process message: ${(error as Error).message}`));
		}
	}

	private decompressMessage(data: WebSocket.RawData): Buffer {
		if (data instanceof Buffer || data instanceof ArrayBuffer) {
			this.zlibInflate.push(data instanceof Buffer ? data : Buffer.from(data), false);
			return Buffer.from(this.zlibInflate.result as Uint8Array);
		}

		return data as unknown as Buffer;
	}

	private decodeMessage(decompressed: Buffer): GatewayPayload {
		switch (this.options.encoding) {
			case "etf":
				return erlpack.unpack(decompressed);
			case "json":
				return JSON.parse(decompressed.toString());
			default:
				throw new Error("Invalid encoding specified");
		}
	}

	private onOpen(): void {
		this.send(GatewayOpcodes.Identify, this.identity);
	}

	private reconnect(): void {
		this.emit("DEBUG", this.messageEvent("Reconnecting..."));
		this.disconnect();
		this.connect();
	}

	private disconnect(): void {
		this.emit("DEBUG", this.messageEvent("Disconnecting..."));
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}

		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}

		this.lastSequence = null;
		this.sessionId = null;
	}

	private startHeartbeat(interval: Integer): void {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
		}

		this.heartbeatInterval = setInterval(() => {
			this.send(GatewayOpcodes.Heartbeat, this.lastSequence);
		}, interval);

		this.emit("DEBUG", this.messageEvent(`Heartbeat started with interval: ${interval}ms`));
	}

	private messageEvent(message: string): string {
		return `[WS: ${this.ws?.readyState}] ${message}`;
	}
}
