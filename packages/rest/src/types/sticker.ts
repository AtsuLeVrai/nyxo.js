import type { StickerEntity } from "@nyxjs/core";
import type { FileEntity } from "./rest.js";

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#create-guild-sticker-form-params}
 */
export interface StickerCreateEntity
  extends Pick<StickerEntity, "name" | "description" | "tags"> {
  file: FileEntity;
}

/**
 * @see {@link https://discord.com/developers/docs/resources/sticker#modify-guild-sticker-json-params}
 */
export type StickerModifyEntity = Pick<
  StickerEntity,
  "name" | "description" | "tags"
>;
