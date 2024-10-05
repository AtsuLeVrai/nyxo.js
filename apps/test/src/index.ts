import process from "node:process";
import { ApiVersions } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const rest = new Rest(process.env.DISCORD_TOKEN, {
    auth_type: "Bot",
    version: ApiVersions.V10,
});

const gateway = new Gateway(process.env.DISCORD_TOKEN, rest, {
    intents: 513,
    v: ApiVersions.V10,
    encoding: EncodingTypes.Etf,
    compress: CompressTypes.ZlibStream,
    shard: "auto",
});

gateway.on("ERROR", (error) => {
    console.error("Error:", error);
});

gateway.on("CLOSE", (event) => {
    console.log("Close:", event);
});

gateway.on("WARN", (warning) => {
    console.warn("Warn:", warning);
});

gateway.on("DEBUG", (info) => {
    console.debug("Debug:", info);
});

// gateway.on("DISPATCH", console.log);

void gateway.connect();
