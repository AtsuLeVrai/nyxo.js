import type { DataUriScheme, RESTJSONErrorCodes } from "@nyxjs/core";
import EventEmitter from "eventemitter3";
import type { Dispatcher } from "undici";
import type { DiscordHeaders } from "./api";

/**
 * @see {@link https://discord.com/developers/docs/reference#signed-attachment-cdn-urls-attachment-cdn-url-parameters}
 */
export type AttachmentCDNUrlParameters = {
	/**
	 * Hex timestamp indicating when an attachment CDN URL will expire
	 */
	ex: string;
	/**
	 * Unique signature that remains valid until the URL's expiration
	 */
	hm: string;
	/**
	 * Hex timestamp indicating when the URL was issued
	 */
	is: string;
};

/**
 * @see {@link https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure}
 */
export type RateLimitResponse = {
	/**
	 * An error code for some limits
	 */
	code?: RESTJSONErrorCodes;
	/**
	 * A value indicating if you are being globally rate limited or not
	 */
	global: boolean;
	/**
	 * A message saying you are being rate limited.
	 */
	message: string;
	/**
	 * The number of seconds to wait before submitting another request.
	 */
	retry_after: number;
};

export type RESTMakeRequestOptions<T> = Dispatcher.DispatchOptions & {
	headers?: DiscordHeaders;
	returnType?: T;
};

export class REST extends EventEmitter {
	private baseUrl = new URL("https://discord.com/api/");

	public async makeRequest<T>(
		_options: RESTMakeRequestOptions<T>,
	): Promise<T> {}

	/**
	 * @see {@link https://discord.com/developers/docs/reference#image-data}
	 */
	public imageData(
		hash: string,
		type: "image/gif" | "image/jpeg" | "image/png",
	): DataUriScheme {
		if (this.isBase64(hash)) {
			return `data:${type};base64,${hash}`;
		}
		const buffer = Buffer.from(hash, "utf8");
		return `data:${type};base64,${buffer.toString("base64")}`;
	}

	private isBase64(str: string): boolean {
		try {
			return btoa(atob(str)) === str;
		} catch {
			return false;
		}
	}
}
