import type {
    IntegrationAccountStructure,
    IntegrationApplicationStructure,
    IntegrationExpireBehaviors,
    IntegrationPlatformTypes,
    IntegrationStructure,
} from "@nyxjs/api-types";
import type { Integer, IsoO8601Timestamp, Oauth2Scopes, Snowflake } from "@nyxjs/core";
import { Base } from "./Base";
import { User } from "./Users";

export class IntegrationApplication extends Base<IntegrationApplicationStructure> {
    public bot?: User;

    public description!: string;

    public icon!: string | null;

    public id!: Snowflake;

    public name!: string;

    public constructor(data: Readonly<Partial<IntegrationApplicationStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<IntegrationApplicationStructure>>): void {
        if ("bot" in data) {
            if (data.bot === null) {
                this.bot = undefined;
            } else if (data.bot !== undefined) {
                this.bot = User.from(data.bot);
            }
        }

        if (data.description !== undefined) {
            this.description = data.description;
        }

        if (data.icon !== undefined) {
            this.icon = data.icon;
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }
    }
}

export class IntegrationAccount extends Base<IntegrationAccountStructure> {
    public id!: string;

    public name!: string;

    public constructor(data: Readonly<Partial<IntegrationAccountStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<IntegrationAccountStructure>>): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }
    }
}

export class Integration extends Base<IntegrationStructure> {
    public account!: IntegrationAccount;

    public application?: IntegrationApplication;

    public enableEmoticons?: boolean;

    public enabled!: boolean;

    public expireBehavior?: IntegrationExpireBehaviors;

    public expireGracePeriod?: Integer;

    public id!: Snowflake;

    public name!: string;

    public revoked?: boolean;

    public roleId?: Snowflake;

    public scopes?: Oauth2Scopes[];

    public subscriberCount?: Integer;

    public syncedAt?: IsoO8601Timestamp;

    public syncing?: boolean;

    public type!: IntegrationPlatformTypes;

    public user?: User;

    public constructor(data: Readonly<Partial<IntegrationStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<IntegrationStructure>>): void {
        if (data.account !== undefined) {
            this.account = IntegrationAccount.from(data.account);
        }

        if ("application" in data) {
            if (data.application === null) {
                this.application = undefined;
            } else if (data.application !== undefined) {
                this.application = IntegrationApplication.from(data.application);
            }
        }

        if ("enable_emoticons" in data) {
            if (data.enable_emoticons === null) {
                this.enableEmoticons = undefined;
            } else if (data.enable_emoticons !== undefined) {
                this.enableEmoticons = data.enable_emoticons;
            }
        }

        if (data.enabled !== undefined) {
            this.enabled = data.enabled;
        }

        if ("expire_behavior" in data) {
            if (data.expire_behavior === null) {
                this.expireBehavior = undefined;
            } else if (data.expire_behavior !== undefined) {
                this.expireBehavior = data.expire_behavior;
            }
        }

        if ("expire_grace_period" in data) {
            if (data.expire_grace_period === null) {
                this.expireGracePeriod = undefined;
            } else if (data.expire_grace_period !== undefined) {
                this.expireGracePeriod = data.expire_grace_period;
            }
        }

        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.name !== undefined) {
            this.name = data.name;
        }

        if ("revoked" in data) {
            if (data.revoked === null) {
                this.revoked = undefined;
            } else if (data.revoked !== undefined) {
                this.revoked = data.revoked;
            }
        }

        if ("role_id" in data) {
            if (data.role_id === null) {
                this.roleId = undefined;
            } else if (data.role_id !== undefined) {
                this.roleId = data.role_id;
            }
        }

        if ("scopes" in data) {
            if (data.scopes === null) {
                this.scopes = undefined;
            } else if (data.scopes !== undefined) {
                this.scopes = data.scopes;
            }
        }

        if ("subscriber_count" in data) {
            if (data.subscriber_count === null) {
                this.subscriberCount = undefined;
            } else if (data.subscriber_count !== undefined) {
                this.subscriberCount = data.subscriber_count;
            }
        }

        if ("synced_at" in data) {
            if (data.synced_at === null) {
                this.syncedAt = undefined;
            } else if (data.synced_at !== undefined) {
                this.syncedAt = data.synced_at;
            }
        }

        if ("syncing" in data) {
            if (data.syncing === null) {
                this.syncing = undefined;
            } else if (data.syncing !== undefined) {
                this.syncing = data.syncing;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("user" in data) {
            if (data.user === null) {
                this.user = undefined;
            } else if (data.user !== undefined) {
                this.user = User.from(data.user);
            }
        }
    }
}

export { IntegrationExpireBehaviors, IntegrationPlatformTypes } from "@nyxjs/api-types";
