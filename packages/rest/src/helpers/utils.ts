import { Gunzip } from "minizlib";
import type { Dispatcher } from "undici";

export async function decompressResponse(
    headers: Record<string, any>,
    body: Dispatcher.ResponseData["body"]
): Promise<string> {
    const responseBuffer = await body.arrayBuffer();

    if (headers["content-encoding"] === "gzip") {
        return new Promise((resolve, reject) => {
            const gunzip = new Gunzip({ level: 9 });
            const chunks: Buffer[] = [];

            gunzip.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            gunzip.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
            gunzip.on("error", reject);
            gunzip.end(Buffer.from(responseBuffer));
        });
    }

    return Buffer.from(responseBuffer).toString("utf8");
}
