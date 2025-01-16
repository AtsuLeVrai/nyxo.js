import type { StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import type { FileInput } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface ListStickerPacksResponseEntity {
  sticker_packs: StickerPackEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export const CreateGuildStickerEntity = z.object({
  name: z.string().min(2).max(30),
  description: z.string().min(2).max(100),
  tags: z.string().max(200),
  file: z.custom<FileInput>(),
});

export type CreateGuildStickerEntity = z.infer<typeof CreateGuildStickerEntity>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export const ModifyGuildStickerEntity = z.object({
  name: z.string().min(2).max(30).optional(),
  description: z.string().min(2).max(100).nullish(),
  tags: z.string().max(200).optional(),
});

export type ModifyGuildStickerEntity = z.infer<typeof ModifyGuildStickerEntity>;
