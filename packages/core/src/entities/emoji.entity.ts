import { z } from "zod";
import { Snowflake } from "../managers/index.js";
import { UserEntity } from "./user.entity.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/emoji#emoji-object}
 */
export const EmojiEntity = z
  .object({
    id: Snowflake.nullable(),
    name: z.string().nullable(),
    roles: z.array(Snowflake).optional(),
    user: z.lazy(() => UserEntity).optional(),
    require_colons: z.boolean().optional(),
    managed: z.boolean().optional(),
    animated: z.boolean().optional(),
    available: z.boolean().optional(),
  })
  .strict();

export type EmojiEntity = z.infer<typeof EmojiEntity>;
