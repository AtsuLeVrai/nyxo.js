import { WorkBenchEvent } from "../../env/index.js";
import { logger } from "../../utils/index.js";

export default new WorkBenchEvent("ready", (client) => {
    logger.info(`Logged in as ${client.user?.username}`);
});
