import type { StickerPackEntity } from "@nyxjs/core";
import { z } from "zod";
import { FileHandler, type FileInput } from "../handlers/index.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#list-sticker-packs-response-structure}
 */
export interface ListStickerPacksResponseEntity {
  sticker_packs: StickerPackEntity[];
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export const CreateGuildStickerSchema = z.object({
  name: z.string().min(2).max(30),
  description: z.string().min(2).max(100),
  tags: z.string().max(200),
  file: z
    .custom<FileInput>(FileHandler.isValidSingleInput)
    .transform(FileHandler.toDataUri),
});

export type CreateGuildStickerSchema = z.input<typeof CreateGuildStickerSchema>;

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export const ModifyGuildStickerSchema = z.object({
  name: z.string().min(2).max(30).optional(),
  description: z.string().min(2).max(100).nullish(),
  tags: z.string().max(200).optional(),
});

export type ModifyGuildStickerSchema = z.input<typeof ModifyGuildStickerSchema>;
