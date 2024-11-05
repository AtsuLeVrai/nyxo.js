import { WorkBenchEvent } from "../../env/index.js";
import { logger } from "../../utils/index.js";

export default new WorkBenchEvent("guildUpdate", (_, oldGuild, newGuild) => {
    logger.info(`Guild updated: ${JSON.stringify(oldGuild, null, 2)} -> ${JSON.stringify(newGuild, null, 2)}`);
});
