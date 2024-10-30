import { WorkBenchEvent } from "../../env/index.js";

export default new WorkBenchEvent("guildCreate", (_, guild) => {
    console.log(`Joined guild ${guild.id}`);
});
