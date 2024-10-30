import { type ClientOptions, EncodingTypes, GatewayIntents } from "nyx.js";

export const WorkBenchClientOptions: ClientOptions = {
    intents: GatewayIntents.All(),
    gateway: {
        encoding: EncodingTypes.Etf,
    },
};
