import { readdir } from "node:fs/promises";
import { Client, type ClientEvents, type ClientOptions } from "nyx.js";
import type { WorkBenchEvent } from "./env/index.js";

export class ClientWorkBench extends Client {
    commands: Map<string, object> = new Map();

    constructor(token: string, options: ClientOptions) {
        super(token, options);
    }

    async start(): Promise<void> {
        await Promise.all([this.#initEvent()]);
        await this.connect();
    }

    async #initEvent(): Promise<void> {
        const dirs = await readdir(new URL("./events", import.meta.url), {
            withFileTypes: true,
        });

        for (const dir of dirs) {
            if (!dir.isDirectory()) {
                continue;
            }

            const files = await readdir(new URL(`./events/${dir.name}`, import.meta.url));

            for (const file of files) {
                if (!file.endsWith(".ts")) {
                    continue;
                }

                const event: WorkBenchEvent<keyof ClientEvents> = (
                    await import(new URL(`./events/${dir.name}/${file}`, import.meta.url).pathname)
                ).default;

                this.on(event.event, (...args) => event.listener(this, ...args));
            }
        }
    }
}
