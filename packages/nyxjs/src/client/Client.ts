import type { ClientOptions } from "../types/Client";
import { BaseClient } from "./BaseClient";

export class Client extends BaseClient {
    public constructor(token: string, options: ClientOptions) {
        super(token, options);
    }
}
