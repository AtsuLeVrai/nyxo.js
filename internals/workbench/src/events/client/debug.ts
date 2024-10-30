import { WorkBenchEvent } from "../../env/index.js";

export default new WorkBenchEvent("debug", (_, message) => {
    console.debug(`[DEBUG]`, message);
});
