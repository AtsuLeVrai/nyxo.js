import { WorkBenchEvent } from "../../env/index.js";

export default new WorkBenchEvent("warn", (_, message) => {
    console.warn(`[WARN]`, message);
});
