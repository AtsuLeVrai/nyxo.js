require("dotenv").config();
const process = require("node:process");
const timers = require("node:timers");
const discordjs = require("discord.js");

if (!process.env.DISCORD_TOKEN) {
    throw new Error("no discord token");
}

const startMemoryUsage = process.memoryUsage().heapUsed / 1_024 / 1_024;
console.log(`Utilisation mémoire au démarrage: ${startMemoryUsage.toFixed(2)} MB`);

const startTime = performance.now();

const client = new discordjs.Client({
    shards: "auto",
    intents: [
        discordjs.GatewayIntentBits.Guilds,
        discordjs.GatewayIntentBits.GuildMembers,
        discordjs.GatewayIntentBits.GuildModeration,
        discordjs.GatewayIntentBits.GuildEmojisAndStickers,
        discordjs.GatewayIntentBits.GuildIntegrations,
        discordjs.GatewayIntentBits.GuildWebhooks,
        discordjs.GatewayIntentBits.GuildInvites,
        discordjs.GatewayIntentBits.GuildVoiceStates,
        discordjs.GatewayIntentBits.GuildPresences,
        discordjs.GatewayIntentBits.GuildMessages,
        discordjs.GatewayIntentBits.GuildMessageReactions,
        discordjs.GatewayIntentBits.GuildMessageTyping,
        discordjs.GatewayIntentBits.DirectMessages,
        discordjs.GatewayIntentBits.DirectMessageReactions,
        discordjs.GatewayIntentBits.DirectMessageTyping,
        discordjs.GatewayIntentBits.MessageContent,
        discordjs.GatewayIntentBits.GuildScheduledEvents,
        discordjs.GatewayIntentBits.AutoModerationConfiguration,
        discordjs.GatewayIntentBits.AutoModerationExecution,
    ],
    partials: [
        discordjs.Partials.User,
        discordjs.Partials.Channel,
        discordjs.Partials.GuildMember,
        discordjs.Partials.Message,
        discordjs.Partials.Reaction,
        discordjs.Partials.GuildScheduledEvent,
        discordjs.Partials.ThreadMember,
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
