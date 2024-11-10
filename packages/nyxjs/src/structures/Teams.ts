import type { MembershipState, Snowflake, TeamMemberStructure, TeamStructure, UserStructure } from "@nyxjs/core";
import type { PickWithMethods } from "../types/index.js";
import { Base } from "./Base.js";
import { User } from "./Users.js";

export interface TeamMemberSchema {
    readonly membershipState: MembershipState | null;
    readonly role: string | null;
    readonly teamId: Snowflake | null;
    readonly user: PickWithMethods<User, "avatar" | "discriminator" | "id" | "username"> | null;
}

export class TeamMember extends Base<TeamMemberStructure, TeamMemberSchema> {
    #membershipState: MembershipState | null = null;
    #role: string | null = null;
    #teamId: Snowflake | null = null;
    #user: PickWithMethods<User, "avatar" | "discriminator" | "id" | "username"> | null = null;

    constructor(data: Partial<TeamMemberStructure>) {
        super();
        this.patch(data);
    }

    get membershipState(): MembershipState | null {
        return this.#membershipState;
    }

    get role(): string | null {
        return this.#role;
    }

    get teamId(): Snowflake | null {
        return this.#teamId;
    }

    get user(): PickWithMethods<User, "avatar" | "discriminator" | "id" | "username"> | null {
        return this.#user;
    }

    static from(data: Partial<TeamMemberStructure>): TeamMember {
        return new TeamMember(data);
    }

    patch(data: Partial<TeamMemberStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#membershipState = data.membership_state ?? this.#membershipState;
        this.#role = data.role ?? this.#role;
        this.#teamId = data.team_id ?? this.#teamId;
        this.#user = data.user ? User.from(data.user) : this.#user;
    }

    toJson(): Partial<TeamMemberStructure> {
        return {
            membership_state: this.#membershipState ?? undefined,
            role: this.#role ?? undefined,
            team_id: this.#teamId ?? undefined,
            user: this.#user?.toJson() as UserStructure,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): TeamMemberSchema {
        return {
            membershipState: this.#membershipState,
            role: this.#role,
            teamId: this.#teamId,
            user: this.#user,
        };
    }

    clone(): TeamMember {
        return new TeamMember(this.toJson());
    }

    reset(): void {
        this.#membershipState = null;
        this.#role = null;
        this.#teamId = null;
        this.#user = null;
    }

    equals(other: Partial<TeamMember>): boolean {
        return Boolean(
            this.#membershipState === other.membershipState &&
                this.#role === other.role &&
                this.#teamId === other.teamId &&
                this.#user?.equals(other.user ?? this.#user),
        );
    }
}

export interface TeamSchema {
    readonly icon: string | null;
    readonly id: Snowflake | null;
    readonly members: TeamMember[];
    readonly name: string | null;
    readonly ownerUserId: Snowflake | null;
}

export class Team extends Base<TeamStructure, TeamSchema> {
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #members: TeamMember[] = [];
    #name: string | null = null;
    #ownerUserId: Snowflake | null = null;

    constructor(data: Partial<TeamStructure>) {
        super();
        this.patch(data);
    }

    get icon(): string | null {
        return this.#icon;
    }

    get id(): Snowflake | null {
        return this.#id;
    }

    get members(): TeamMember[] {
        return [...this.#members];
    }

    get name(): string | null {
        return this.#name;
    }

    get ownerUserId(): Snowflake | null {
        return this.#ownerUserId;
    }

    static from(data: Partial<TeamStructure>): Team {
        return new Team(data);
    }

    patch(data: Partial<TeamStructure>): void {
        if (!data || typeof data !== "object") {
            throw new TypeError(`Expected object, got ${typeof data}`);
        }

        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#ownerUserId = data.owner_user_id ?? this.#ownerUserId;

        if (data.members && Array.isArray(data.members)) {
            this.#members = data.members.map((member) => TeamMember.from(member));
        }
    }

    toJson(): Partial<TeamStructure> {
        return {
            icon: this.#icon ?? undefined,
            id: this.#id ?? undefined,
            members: this.#members.map((member) => member.toJson()) as TeamMemberStructure[],
            name: this.#name ?? undefined,
            owner_user_id: this.#ownerUserId ?? undefined,
        };
    }

    toString(): string {
        return JSON.stringify(this.toJson());
    }

    valueOf(): TeamSchema {
        return {
            icon: this.#icon,
            id: this.#id,
            members: this.#members,
            name: this.#name,
            ownerUserId: this.#ownerUserId,
        };
    }

    clone(): Team {
        return new Team(this.toJson());
    }

    reset(): void {
        this.#icon = null;
        this.#id = null;
        this.#members = [];
        this.#name = null;
        this.#ownerUserId = null;
    }

    equals(other: Partial<Team>): boolean {
        return Boolean(
            this.#icon === other.icon &&
                this.#id === other.id &&
                this.#members.length === other.members?.length &&
                this.#members.every((member, index) => member.equals(other.members?.[index] ?? member)) &&
                this.#name === other.name &&
                this.#ownerUserId === other.ownerUserId,
        );
    }
}
