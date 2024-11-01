import { WorkBenchEvent } from "../../env/index.js";
import { logger } from "../../utils/index.js";

export default new WorkBenchEvent("debug", (_, message) => {
    logger.debug(message);
});
