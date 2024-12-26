import type { StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import type { FileType } from "../types/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface ListStickerPacksResponseEntity {
  sticker_packs: StickerPackEntity[];
}

export const CreateGuildStickerSchema = z
  .object({
    name: z.string().min(2).max(30),
    description: z.string().min(2).max(100),
    tags: z.string().max(200),
    file: z.custom<FileType>(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export type CreateGuildStickerEntity = z.infer<typeof CreateGuildStickerSchema>;

export const ModifyGuildStickerSchema = z
  .object({
    name: z.string().min(2).max(30).optional(),
    description: z.string().min(2).max(100).optional().nullable(),
    tags: z.string().max(200).optional(),
  })
  .strict();

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type ModifyGuildStickerEntity = z.infer<typeof ModifyGuildStickerSchema>;
