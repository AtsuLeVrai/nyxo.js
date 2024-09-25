import { config } from "dotenv";
import { ApiVersions, EncodingTypes, Gateway } from "nyx.js";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const gateway = new Gateway(process.env.DISCORD_TOKEN, {
    intents: 513,
    v: ApiVersions.V10,
    encoding: EncodingTypes.Json,
});

gateway.on("error", console.log);
gateway.on("close", console.log);
gateway.on("warn", console.log);
gateway.on("debug", console.log);
gateway.on("dispatch", console.log);

void gateway.connect();

// const client = new Client({
//     intents: [GatewayIntents.Guilds],
// });
//
// client.on("error", console.log);
// client.on("debug", console.log);
// client.on("warn", console.log);
//
// void client.connect(process.env.DISCORD_TOKEN);
