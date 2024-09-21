import { ApiVersions } from "@nyxjs/core";
import { EncodingTypes, Gateway } from "@nyxjs/ws";

const token = "";

const rest = new Gateway(token, {
    encoding: EncodingTypes.Etf,
    intents: 513,
    v: ApiVersions.V10,
});
rest.on("debug", console.log);
rest.on("error", console.log);
rest.on("warn", console.log);
rest.on("close", console.log);
