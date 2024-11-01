import { WorkBenchEvent } from "../../env/index.js";
import { logger } from "../../utils/index.js";

export default new WorkBenchEvent("guildCreate", (_, guild) => {
    logger.info(`Joined guild ${guild.id}`);
});
