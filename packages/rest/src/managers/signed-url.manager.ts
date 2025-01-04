import { createHmac } from "node:crypto";
import type { SignedAttachmentParametersEntity } from "../types/index.js";

export class SignedUrlManager {
  static readonly URL_EXPIRY = 3600;
  readonly #signingKey: string;

  constructor(signingKey: string) {
    this.#signingKey = signingKey;
  }

  signUrl(url: string): string {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + SignedUrlManager.URL_EXPIRY;

    const params = this.createSignedParameters(path, expiry, now);

    parsedUrl.searchParams.set("ex", params.ex);
    parsedUrl.searchParams.set("is", params.is);
    parsedUrl.searchParams.set("hm", params.hm);

    return parsedUrl.toString();
  }

  createSignedParameters(
    path: string,
    expiryTimestamp: number,
    issuedTimestamp: number,
  ): SignedAttachmentParametersEntity {
    const ex = expiryTimestamp.toString(16);
    const is = issuedTimestamp.toString(16);

    const message = `${path}?ex=${ex}&is=${is}`;
    const hmac = createHmac("sha256", this.#signingKey)
      .update(message)
      .digest("hex");

    return {
      ex,
      is,
      hm: hmac,
    };
  }

  verifySignedUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const params = this.#extractSignedParameters(parsedUrl);

      if (!params) {
        return false;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiry = Number.parseInt(params.ex, 16);
      if (now > expiry) {
        return false;
      }

      const expectedParams = this.createSignedParameters(
        parsedUrl.pathname,
        expiry,
        Number.parseInt(params.is, 16),
      );

      return params.hm === expectedParams.hm;
    } catch {
      return false;
    }
  }

  refreshSignedUrl(url: string): string {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.delete("ex");
    parsedUrl.searchParams.delete("is");
    parsedUrl.searchParams.delete("hm");

    return this.signUrl(parsedUrl.toString());
  }

  #extractSignedParameters(url: URL): SignedAttachmentParametersEntity | null {
    const ex = url.searchParams.get("ex");
    const is = url.searchParams.get("is");
    const hm = url.searchParams.get("hm");

    if (!(ex && is && hm)) {
      return null;
    }

    return { ex, is, hm };
  }
}
