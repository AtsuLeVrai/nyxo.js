require("dotenv").config();
const process = require("node:process");
const timers = require("node:timers");
const nyxjs = require("nyx.js");

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
console.log(`Utilisation mémoire au démarrage: ${startMemoryUsage.toFixed(2)} MB`);

const startTime = performance.now();

const client = new nyxjs.Client(process.env.DISCORD_TOKEN, {
    intents: [
        nyxjs.GatewayIntents.Guilds,
        nyxjs.GatewayIntents.GuildMembers,
        nyxjs.GatewayIntents.GuildModeration,
        nyxjs.GatewayIntents.GuildEmojisAndStickers,
        nyxjs.GatewayIntents.GuildIntegrations,
        nyxjs.GatewayIntents.GuildWebhooks,
        nyxjs.GatewayIntents.GuildInvites,
        nyxjs.GatewayIntents.GuildVoiceStates,
        nyxjs.GatewayIntents.GuildPresences,
        nyxjs.GatewayIntents.GuildMessages,
        nyxjs.GatewayIntents.GuildMessageReactions,
        nyxjs.GatewayIntents.GuildMessageTyping,
        nyxjs.GatewayIntents.DirectMessages,
        nyxjs.GatewayIntents.DirectMessageReactions,
        nyxjs.GatewayIntents.DirectMessageTyping,
        nyxjs.GatewayIntents.MessageContent,
        nyxjs.GatewayIntents.GuildScheduledEvents,
        nyxjs.GatewayIntents.AutoModerationConfiguration,
        nyxjs.GatewayIntents.AutoModerationExecution,
        nyxjs.GatewayIntents.GuildMessagePolls,
        nyxjs.GatewayIntents.DirectMessagePolls,
    ],
    gateway: {
        shard: "auto",
    },
});

let isReady = false;

client.on("error", (error) => {
    console.error("Erreur:", error);
});

client.on("close", (event) => {
    console.log("Connexion fermée:", event);
});

client.on("warn", (warning) => {
    console.warn("Avertissement:", warning);
});

client.on("debug", (info) => {
    console.debug("Debug:", info);
});

client.on("ready", () => {
    const readyTime = performance.now();
    const connectionTime = readyTime - startTime;
    console.log(`Gateway prêt en ${connectionTime.toFixed(2)} ms`);

    const readyMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
    console.log(`Utilisation mémoire après connexion: ${readyMemoryUsage.toFixed(2)} MB`);
    console.log(`Augmentation de la mémoire: ${(readyMemoryUsage - startMemoryUsage).toFixed(2)} MB`);

    isReady = true;
});

console.log("Connexion de la gateway...");
client.connect().catch((error) => {
    console.error("Erreur lors de la connexion:", error);
    process.exit(1);
});

function logStats() {
    if (isReady) {
        const currentTime = performance.now();
        const uptime = (currentTime - startTime) / 1_000; // en secondes
        const currentMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;

        console.log(`\n--- Statistiques après ${uptime.toFixed(2)} secondes ---`);
        console.log(`Utilisation mémoire actuelle: ${currentMemoryUsage.toFixed(2)} MB`);
    }
}

const statsInterval = timers.setInterval(logStats, 10_000);

timers.setTimeout(() => {
    timers.clearInterval(statsInterval);
    logStats();
    console.log("\nFin du benchmark. Fermeture de la connexion...");
    process.exit(0);
}, 10_000);
