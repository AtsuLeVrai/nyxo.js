import { type ClientOptions, CompressTypes, EncodingTypes, GatewayIntents } from "nyx.js";

export const WorkBenchClientOptions: ClientOptions = {
    intents: GatewayIntents.all(),
    gateway: {
        encoding: EncodingTypes.Etf,
        compress: CompressTypes.ZlibStream,
    },
};
