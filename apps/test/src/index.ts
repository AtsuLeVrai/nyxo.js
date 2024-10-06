import process from "node:process";
import { ApiVersions, GatewayIntents } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const rest = new Rest(process.env.DISCORD_TOKEN, {
    version: ApiVersions.V10,
});

rest.on("ERROR", console.error);
rest.on("WARN", console.warn);
rest.on("DEBUG", console.debug);
rest.on("RATE_LIMIT", console.log);

const gateway = new Gateway(process.env.DISCORD_TOKEN, rest, {
    intents: [
        GatewayIntents.Guilds,
        GatewayIntents.GuildMembers,
        GatewayIntents.GuildModeration,
        GatewayIntents.GuildEmojisAndStickers,
        GatewayIntents.GuildIntegrations,
        GatewayIntents.GuildWebhooks,
        GatewayIntents.GuildInvites,
        GatewayIntents.GuildVoiceStates,
        GatewayIntents.GuildPresences,
        GatewayIntents.GuildMessages,
        GatewayIntents.GuildMessageReactions,
        GatewayIntents.GuildMessageTyping,
        GatewayIntents.DirectMessages,
        GatewayIntents.DirectMessageReactions,
        GatewayIntents.DirectMessageTyping,
        GatewayIntents.MessageContent,
        GatewayIntents.GuildScheduledEvents,
        GatewayIntents.AutoModerationConfiguration,
        GatewayIntents.AutoModerationExecution,
        GatewayIntents.GuildMessagePolls,
        GatewayIntents.DirectMessagePolls,
    ].reduce((acc, intent) => acc | intent, 0),
    v: ApiVersions.V10,
    encoding: EncodingTypes.Etf,
    compress: CompressTypes.ZlibStream,
    // shard: "auto",
});

gateway.on("ERROR", console.error);
gateway.on("CLOSE", console.log);
gateway.on("WARN", console.warn);
gateway.on("DEBUG", console.debug);
// gateway.on("DISPATCH", console.log);

void gateway.connect();
