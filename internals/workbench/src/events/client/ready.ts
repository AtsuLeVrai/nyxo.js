import { WorkBenchEvent } from "../../env/index.js";

export default new WorkBenchEvent("ready", (_, ready) => {
    console.log(`Logged in as ${ready.user?.username}`);
});
