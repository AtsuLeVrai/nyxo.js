import type { ClientOptions } from "nyx.js";
import { Client, Store } from "nyx.js";

export class ClientTest extends Client {
    public commands: Store<string, any>;

    public constructor(token: string, options: ClientOptions) {
        super(token, options);
        this.commands = new Store();
    }

    public connect() {
        this.on("debug", (message) => {
            console.log(`[DEBUG] ${message}`);
        });

        this.on("error", (error) => {
            console.error(`[ERROR] ${error.message}`);
        });

        this.on("ready", (ready) => {
            console.log(`[READY] Client is ready! ${JSON.stringify(ready)}`);
        });

        super.connect();
    }
}
