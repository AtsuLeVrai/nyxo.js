import { WorkBenchEvent } from "../../env/index.js";
import { logger } from "../../utils/index.js";

export default new WorkBenchEvent("error", (_, error) => {
    logger.error(error.message);
});
