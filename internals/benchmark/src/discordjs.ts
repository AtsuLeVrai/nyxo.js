import { Client, GatewayIntentBits, Partials } from "discord.js";
import { config } from "dotenv";

config();

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
console.log(`Utilisation mémoire au démarrage: ${startMemoryUsage.toFixed(2)} MB`);

const startTime = performance.now();

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

client.once("ready", () => {
    const readyTime = performance.now();
    const connectionTime = readyTime - startTime;
    console.log(`Gateway prêt en ${connectionTime.toFixed(2)} ms`);

    const readyMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
    console.log(`Utilisation mémoire après connexion: ${readyMemoryUsage.toFixed(2)} MB`);
    console.log(`Augmentation de la mémoire: ${(readyMemoryUsage - startMemoryUsage).toFixed(2)} MB`);

    isReady = true;
});

console.log("Connexion de la gateway...");
client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error("Erreur lors de la connexion:", error);
    process.exit(1);
});

function logStats(): void {
    if (isReady) {
        const currentTime = performance.now();
        const uptime = (currentTime - startTime) / 1_000; // en secondes
        const currentMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;

        console.log(`\n--- Statistiques après ${uptime.toFixed(2)} secondes ---`);
        console.log(`Utilisation mémoire actuelle: ${currentMemoryUsage.toFixed(2)} MB`);
    }
}

const statsInterval = setInterval(logStats, 10_000);

setTimeout(() => {
    clearInterval(statsInterval);
    logStats();
    console.log("\nFin du benchmark. Fermeture de la connexion...");
    process.exit(0);
}, 10_000);
