require("dotenv").config();
const process = require("node:process");
const timers = require("node:timers");
const Eris = require("eris");

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
console.log(`Utilisation mémoire au démarrage: ${startMemoryUsage.toFixed(2)} MB`);

const startTime = performance.now();

const client = new Eris(process.env.DISCORD_TOKEN, {
    intents: [
        "guilds",
        "guildMembers",
        "guildModeration",
        "guildEmojisAndStickers",
        "guildIntegrations",
        "guildWebhooks",
        "guildInvites",
        "guildVoiceStates",
        "guildPresences",
        "guildMessages",
        "guildMessageReactions",
        "guildMessageTyping",
        "directMessages",
        "directMessageReactions",
        "directMessageTyping",
        "messageContent",
        "guildScheduledEvents",
        "autoModerationConfiguration",
        "autoModerationExecution",
    ],
    maxShards: "auto",
});

let isReady = false;

client.on("error", (error) => {
    console.error("Erreur:", error);
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
