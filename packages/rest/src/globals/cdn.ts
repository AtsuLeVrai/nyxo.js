import { URL } from "node:url";
import type { Integer, Snowflake } from "@nyxjs/core";
import EventEmitter from "eventemitter3";
import type { UserStructure } from "../structures/users";

/**
 * @see {@link https://discord.com/developers/docs/reference#image-formatting-image-formats}
 */
export type ImageFormats = "gif" | "jpeg" | "jpg" | "json" | "png" | "webp";

export type CDNEvents = {
	DEBUG: [message: string];
	ERROR: [error: Error];
};

export class CDN extends EventEmitter<CDNEvents> {
	public baseUrl = new URL("https://cdn.discordapp.com/");

	public mediaUrl = new URL("https://media.discordapp.net/");

	public constructor() {
		super();
	}

	public customEmoji(emojiId: Snowflake, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		const url = new URL(`emojis/${emojiId}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildIcon(guildId: Snowflake, guildIcon: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(guildIcon, format)) {
			return "";
		}

		const url = new URL(`icons/${guildId}/${guildIcon}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildSplash(guildId: Snowflake, guildSplash: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`splashes/${guildId}/${guildSplash}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildDiscoverySplash(guildId: Snowflake, guildDiscoverySplash: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`discovery-splashes/${guildId}/${guildDiscoverySplash}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildBanner(guildId: Snowflake, guildBanner: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(guildBanner, format)) {
			return "";
		}

		const url = new URL(`banners/${guildId}/${guildBanner}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public userBanner(userId: Snowflake, userBanner: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(userBanner, format)) {
			return "";
		}

		const url = new URL(`banners/${userId}/${userBanner}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public defaultUserAvatar(user: Pick<UserStructure, "discriminator" | "id">): string {
		const hash = user.discriminator === "0" ? (Number(user.id) >> 22) % 6 : Number(user.discriminator) % 5;
		return new URL(`embed/avatars/${hash}.png`, this.baseUrl).toString();
	}

	public userAvatar(userId: Snowflake, userAvatar: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(userAvatar, format)) {
			return "";
		}

		const url = new URL(`avatars/${userId}/${userAvatar}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildMemberAvatar(guildId: Snowflake, userId: Snowflake, memberAvatar: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(memberAvatar, format)) {
			return "";
		}

		const url = new URL(`guilds/${guildId}/users/${userId}/avatars/${memberAvatar}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public avatarDecoration(decoration: string, size?: Integer): string {
		const url = new URL(`avatar-decoration-presets/${decoration}.png`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public applicationIcon(applicationId: Snowflake, icon: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-icons/${applicationId}/${icon}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public applicationCover(applicationId: Snowflake, cover: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-icons/${applicationId}/${cover}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public applicationAsset(applicationId: Snowflake, assetId: Snowflake, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-assets/${applicationId}/${assetId}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public achievementIcon(applicationId: Snowflake, achievementId: Snowflake, icon: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-assets/${applicationId}/achievements/${achievementId}/icons/${icon}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public storePageAsset(applicationId: Snowflake, assetId: Snowflake, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-assets/${applicationId}/store/${assetId}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public stickerPackBanner(applicationId: Snowflake, assetId: Snowflake, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`app-assets/${applicationId}/store/${assetId}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public teamIcon(teamId: Snowflake, icon: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`team-icons/${teamId}/${icon}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public sticker(stickerId: Snowflake, format: Exclude<ImageFormats, "jpeg" | "jpg" | "webp"> = "png"): string {
		return new URL(`stickers/${stickerId}.${format}`, this.mediaUrl).toString();
	}

	public roleIcon(roleId: Snowflake, icon: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`role-icons/${roleId}/${icon}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildScheduledEventCover(eventId: Snowflake, cover: string, format: Exclude<ImageFormats, "gif" | "json"> = "png", size?: Integer): string {
		const url = new URL(`guild-events/${eventId}/${cover}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	public guildMemberBanner(guildId: Snowflake, userId: Snowflake, banner: string, format: Exclude<ImageFormats, "json"> = "png", size?: Integer): string {
		if (!this.validateIconFormat(banner, format)) {
			return "";
		}

		const url = new URL(`guilds/${guildId}/users/${userId}/banners/${banner}.${format}`, this.baseUrl);
		if (size) {
			url.searchParams.append("size", size.toString());
		}

		return url.toString();
	}

	private validateIconFormat(hash: string, format: string): boolean {
		if (this.isAnimatedHash(hash) && format !== "gif") {
			return this.emit("DEBUG", `You have the potential to use a gif format for the hash: ${hash}`);
		} else if (format === "gif" && !this.isAnimatedHash(hash)) {
			return this.emit("ERROR", new Error(`Invalid hash: ${hash} for gif`));
		}

		return true;
	}

	private isAnimatedHash(hash: string): boolean {
		return hash.startsWith("a_");
	}
}

new CDN().customEmoji("323", "gif");

