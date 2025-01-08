import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-membership-state-enum}
 */
export enum MembershipState {
  Invited = 1,
  Accepted = 2,
}

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-member-object}
 */
export const TeamMemberEntity = z
  .object({
    membership_state: z.nativeEnum(MembershipState),
    team_id: Snowflake,
    user: UserEntity.partial(),
    role: z.union([
      z.literal("admin"),
      z.literal("developer"),
      z.literal("read_only"),
    ]),
  })
  .strict();

export type TeamMemberEntity = z.infer<typeof TeamMemberEntity>;

/**
 * @see {@link https://discord.com/developers/docs/topics/teams#data-models-team-object}
 */
export const TeamEntity = z
  .object({
    icon: z.string().nullable(),
    id: Snowflake,
    members: z.array(TeamMemberEntity),
    name: z.string(),
    owner_user_id: Snowflake,
  })
  .strict();

export type TeamEntity = z.infer<typeof TeamEntity>;
