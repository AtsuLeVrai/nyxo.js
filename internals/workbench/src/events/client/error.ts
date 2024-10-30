import { WorkBenchEvent } from "../../env/index.js";

export default new WorkBenchEvent("error", (_, error) => {
    console.error(`[ERROR]`, error.message);
});
