import { performance } from "node:perf_hooks";
import process from "node:process";
import { clearInterval, setInterval, setTimeout } from "node:timers";
import { ApiVersions, GatewayIntents } from "@nyxjs/core";
import { CompressTypes, EncodingTypes, Gateway } from "@nyxjs/gateway";
import { Rest } from "@nyxjs/rest";
import { config } from "dotenv";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
console.log(`Utilisation mémoire au démarrage: ${startMemoryUsage.toFixed(2)} MB`);

const startTime = performance.now();

const rest = new Rest(process.env.DISCORD_TOKEN, {
    version: ApiVersions.V10,
});

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

let isReady = false;
let messagesReceived = 0;
let lastMessageTime = startTime;

gateway.on("ERROR", (error) => {
    console.error("Erreur:", error);
});

gateway.on("CLOSE", (event) => {
    console.log("Connexion fermée:", event);
});

gateway.on("WARN", (warning) => {
    console.warn("Avertissement:", warning);
});

gateway.on("DEBUG", (info) => {
    console.debug("Debug:", info);
});

gateway.on("DISPATCH", () => {
    messagesReceived++;
    lastMessageTime = performance.now();
});

gateway.on("DISPATCH", (event, ...data) => {
    if (event === "READY") {
        const readyTime = performance.now();
        const connectionTime = readyTime - startTime;
        console.log(`Gateway prêt en ${connectionTime.toFixed(2)} ms`);

        const readyMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
        console.log(`Utilisation mémoire après connexion: ${readyMemoryUsage.toFixed(2)} MB`);
        console.log(`Augmentation de la mémoire: ${(readyMemoryUsage - startMemoryUsage).toFixed(2)} MB`);

        isReady = true;
    }
});

console.log("Connexion de la gateway...");
gateway.connect().catch((error) => {
    console.error("Erreur lors de la connexion:", error);
    process.exit(1);
});

function logStats() {
    if (isReady) {
        const currentTime = performance.now();
        const uptime = (currentTime - startTime) / 1_000; // en secondes
        const currentMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
        const messageRate = messagesReceived / uptime;

        console.log(`\n--- Statistiques après ${uptime.toFixed(2)} secondes ---`);
        console.log(`Messages reçus: ${messagesReceived}`);
        console.log(`Taux de messages: ${messageRate.toFixed(2)} msg/s`);
        console.log(`Utilisation mémoire actuelle: ${currentMemoryUsage.toFixed(2)} MB`);
        console.log(`Temps depuis le dernier message: ${((currentTime - lastMessageTime) / 1_000).toFixed(2)} s`);
    }
}

const statsInterval = setInterval(logStats, 10_000);

setTimeout(() => {
    clearInterval(statsInterval);
    logStats();
    console.log("\nFin du benchmark. Fermeture de la connexion...");
    gateway.destroy();
    process.exit(0);
}, 10_000);
