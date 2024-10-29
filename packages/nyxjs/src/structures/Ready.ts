import {
    ApiVersions,
    type ApplicationStructure,
    type Integer,
    type UnavailableGuildStructure,
    type UserStructure,
} from "@nyxjs/core";
import type { ReadyEventFields } from "@nyxjs/gateway";
import { User } from "./Users.js";

export class Ready {
    #application: Pick<ApplicationStructure, "flags" | "id"> | null = null;
    #guilds: UnavailableGuildStructure[] = [];
    #resumeGatewayUrl: string | null = null;
    #sessionId: string | null = null;
    #shard: [shardId: Integer, numShards: Integer] | null = null;
    #user?: User;
    #v: ApiVersions = ApiVersions.V6;

    constructor(data: Partial<ReadyEventFields>) {
        this.patch(data);
    }

    get application() {
        return this.#application;
    }

    get guilds() {
        return [...this.#guilds];
    }

    get resumeGatewayUrl() {
        return this.#resumeGatewayUrl;
    }

    get sessionId() {
        return this.#sessionId;
    }

    get shard() {
        return this.#shard;
    }

    get user() {
        return this.#user;
    }

    get v() {
        return this.#v;
    }

    patch(data: Partial<ReadyEventFields>): void {
        if (!data) {
            return;
        }

        this.#application = data.application ?? this.#application;

        if (Array.isArray(data.guilds)) {
            this.#guilds = [...data.guilds];
        }

        this.#resumeGatewayUrl = data.resume_gateway_url ?? this.#resumeGatewayUrl;
        this.#sessionId = data.session_id ?? this.#sessionId;

        if (Array.isArray(data.shard)) {
            this.#shard = [...data.shard];
        }

        if (data.user) {
            this.#user = new User(data.user);
        }

        this.#v = data.v ?? this.#v;
    }

    toJSON(): Partial<ReadyEventFields> {
        return {
            application: this.#application ?? undefined,
            guilds: this.#guilds,
            resume_gateway_url: this.#resumeGatewayUrl ?? undefined,
            session_id: this.#sessionId ?? undefined,
            shard: this.#shard ?? undefined,
            user: this.#user?.toJSON() as UserStructure,
            v: this.#v,
        };
    }
}
