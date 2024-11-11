import {
    ApiVersions,
    type ApplicationStructure,
    type Integer,
    type UnavailableGuildStructure,
    type UserStructure,
} from "@nyxjs/core";
import type { ReadyEventFields } from "@nyxjs/gateway";
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface ReadySchema {
    readonly application: Pick<ApplicationStructure, "flags" | "id"> | null;
    readonly guilds: UnavailableGuildStructure[];
    readonly resumeGatewayUrl: string | null;
    readonly sessionId: string | null;
    readonly shard: [shardId: Integer, numShards: Integer] | null;
    readonly user?: User;
    readonly v: ApiVersions;
}

export class Ready extends Base<ReadyEventFields, ReadySchema> implements ReadySchema {
    #application: Pick<ApplicationStructure, "flags" | "id"> | null = null;
    #guilds: UnavailableGuildStructure[] = [];
    #resumeGatewayUrl: string | null = null;
    #sessionId: string | null = null;
    #shard: [shardId: Integer, numShards: Integer] | null = null;
    #user?: User;
    #v: ApiVersions = ApiVersions.V6;

    constructor(data: Partial<ReadyEventFields>) {
        super();
        this.patch(data);
    }

    get application(): Pick<ApplicationStructure, "flags" | "id"> | null {
        return this.#application;
    }

    get guilds(): UnavailableGuildStructure[] {
        return [...this.#guilds];
    }

    get resumeGatewayUrl(): string | null {
        return this.#resumeGatewayUrl;
    }

    get sessionId(): string | null {
        return this.#sessionId;
    }

    get shard(): [shardId: Integer, numShards: Integer] | null {
        return this.#shard;
    }

    get user(): User | undefined {
        return this.#user;
    }

    get v(): ApiVersions {
        return this.#v;
    }

    static from(data: Partial<ReadyEventFields>): Ready {
        return new Ready(data);
    }

    patch(data: Partial<ReadyEventFields>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#application = data.application ?? this.#application;

        if (Array.isArray(data.guilds)) {
            this.#guilds = [...data.guilds];
        }

        this.#resumeGatewayUrl = data.resume_gateway_url ?? this.#resumeGatewayUrl;
        this.#sessionId = data.session_id ?? this.#sessionId;

        if (Array.isArray(data.shard)) {
            this.#shard = [...data.shard] as [Integer, Integer];
        }

        this.#user = data.user ? User.from(data.user) : this.#user;
        this.#v = data.v ?? this.#v;
    }

    toJson(): Partial<ReadyEventFields> {
        return {
            application: this.#application ?? undefined,
            guilds: [...this.#guilds],
            resume_gateway_url: this.#resumeGatewayUrl ?? undefined,
            session_id: this.#sessionId ?? undefined,
            shard: this.#shard ?? undefined,
            user: this.#user?.toJson() as UserStructure,
            v: this.#v,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): ReadySchema {
        return {
            application: this.#application,
            guilds: [...this.#guilds],
            resumeGatewayUrl: this.#resumeGatewayUrl,
            sessionId: this.#sessionId,
            shard: this.#shard,
            user: this.#user,
            v: this.#v,
        };
    }

    clone(): Ready {
        return new Ready(this.toJson());
    }

    reset(): void {
        this.#application = null;
        this.#guilds = [];
        this.#resumeGatewayUrl = null;
        this.#sessionId = null;
        this.#shard = null;
        this.#user = undefined;
        this.#v = ApiVersions.V6;
    }

    equals(other: Ready): boolean {
        return Boolean(
            JSON.stringify(this.#application) === JSON.stringify(other.application) &&
                JSON.stringify(this.#guilds) === JSON.stringify(other.guilds) &&
                this.#resumeGatewayUrl === other.resumeGatewayUrl &&
                this.#sessionId === other.sessionId &&
                JSON.stringify(this.#shard) === JSON.stringify(other.shard) &&
                this.#user?.equals(other.user ?? {}) &&
                this.#v === other.v,
        );
    }
}
