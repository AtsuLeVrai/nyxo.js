import type { MembershipState, Snowflake, TeamMemberStructure, TeamStructure, UserStructure } from "@nyxjs/core";
import type { PickWithMethods } from "../types/index.js";
import { User } from "./Users.js";

export class TeamMember {
    #membershipState: MembershipState | null = null;
    #role: string | null = null;
    #teamId: Snowflake | null = null;
    #user: PickWithMethods<User, "avatar" | "discriminator" | "id" | "username"> | null = null;

    constructor(data: Partial<TeamMemberStructure>) {
        this.patch(data);
    }

    get membershipState() {
        return this.#membershipState;
    }

    get role() {
        return this.#role;
    }

    get teamId() {
        return this.#teamId;
    }

    get user() {
        return this.#user;
    }

    patch(data: Partial<TeamMemberStructure>): void {
        if (!data) {
            return;
        }

        this.#membershipState = data.membership_state ?? this.#membershipState;
        this.#role = data.role ?? this.#role;
        this.#teamId = data.team_id ?? this.#teamId;

        if (data.user) {
            this.#user = new User(data.user);
        }
    }

    toJSON(): Partial<TeamMemberStructure> {
        return {
            membership_state: this.#membershipState ?? undefined,
            role: this.#role ?? undefined,
            team_id: this.#teamId ?? undefined,
            user: this.#user?.toJSON() as UserStructure,
        };
    }
}

export class Team {
    #icon: string | null = null;
    #id: Snowflake | null = null;
    #members: TeamMember[] = [];
    #name: string | null = null;
    #ownerUserId: Snowflake | null = null;

    constructor(data: Partial<TeamStructure>) {
        this.patch(data);
    }

    get icon() {
        return this.#icon;
    }

    get id() {
        return this.#id;
    }

    get members() {
        return [...this.#members];
    }

    get name() {
        return this.#name;
    }

    get ownerUserId() {
        return this.#ownerUserId;
    }

    patch(data: Partial<TeamStructure>): void {
        if (!data) {
            return;
        }

        this.#icon = data.icon ?? this.#icon;
        this.#id = data.id ?? this.#id;
        this.#name = data.name ?? this.#name;
        this.#ownerUserId = data.owner_user_id ?? this.#ownerUserId;

        if (data.members && Array.isArray(data.members)) {
            this.#members = data.members.map((member) => new TeamMember(member));
        }
    }

    toJSON(): Partial<TeamStructure> {
        return {
            icon: this.#icon,
            id: this.#id ?? undefined,
            members: this.#members.map((member) => member.toJSON()) as TeamMemberStructure[],
            name: this.#name ?? undefined,
            owner_user_id: this.#ownerUserId ?? undefined,
        };
    }
}
