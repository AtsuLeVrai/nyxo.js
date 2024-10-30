import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "dotenv";
import { BenchmarkManager } from "./BenchmarkManager.js";

config();

if (!process.env["DISCORD_TOKEN"]) {
    throw new Error("no discord token");
}

const client = new Client({
    shards: "auto",
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
    ],
});

const benchmark = new BenchmarkManager();

client.on("error", (error) => {
    console.error("Error:", error);
    benchmark.incrementErrorCount();
});

client.on("close", (event) => {
    console.log("Connection closed:", event);
    benchmark.incrementEventCount();
});

client.on("warn", (warning) => {
    console.warn("Warning:", warning);
    benchmark.incrementEventCount();
});

client.on("debug", (info) => {
    console.debug("Debug:", info);
    benchmark.incrementEventCount();
});

client.on("ready", async () => {
    benchmark.setReadyTime();
    console.log("Gateway connected");
    await benchmark.captureMetrics();
});

console.log("Starting benchmark...");
const BENCHMARK_DURATION = 10000;

benchmark.setConnectStartTime();
client.login().catch((error) => {
    console.error("Connection error:", error);
    process.exit(1);
});

const metricsInterval = setInterval(async () => {
    await benchmark.captureMetrics();
}, 1000);

setTimeout(() => {
    clearInterval(metricsInterval);
    console.log(benchmark.generateReport());
    void client.destroy();
    process.exit(0);
}, BENCHMARK_DURATION);
