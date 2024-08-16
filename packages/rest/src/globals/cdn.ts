import { URL } from "node:url";
import type { Integer, Snowflake } from "@nyxjs/core";
import { ImageFormats } from "@nyxjs/core";

export class Cdn {
	private static url = new URL("https://cdn.discordapp.com/");

	public static customEmoji(emojiId: Snowflake, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `emojis/${emojiId}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildIcon(guildId: Snowflake, icon: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(icon)) {
			throw new Error("The icon is not a gif.");
		}

		Cdn.url.pathname += `icons/${guildId}/${icon}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildSplash(guildId: Snowflake, splash: string, size?: Integer, formats: ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `splashes/${guildId}/${splash}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildDiscoverySplash(guildId: Snowflake, splash: string, size?: Integer, formats: ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `discovery-splashes/${guildId}/${splash}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildBanner(guildId: Snowflake, banner: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(banner)) {
			throw new Error("The banner is not a gif.");
		}

		Cdn.url.pathname += `banners/${guildId}/${banner}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static userBanner(userId: Snowflake, banner: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(banner)) {
			throw new Error("The banner is not a gif.");
		}

		Cdn.url.pathname += `banners/${userId}/${banner}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static defaultUserAvatar(userId: Snowflake): string {
		let hash: string;
		if (userId.length === 17) {
			hash = ((BigInt(userId) >> 22n) % 6n).toString();
		} else {
			hash = (Number.parseInt(userId.slice(-4), 10) % 5).toString();
		}

		Cdn.url.pathname += `embed/avatars/${hash}.${ImageFormats.PNG}`;
		return Cdn.url.toString();
	}

	public static userAvatar(userId: Snowflake, avatar: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(avatar)) {
			throw new Error("The avatar is not a gif.");
		}

		Cdn.url.pathname += `avatars/${userId}/${avatar}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildMemberAvatar(guildId: Snowflake, userId: Snowflake, avatar: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(avatar)) {
			throw new Error("The avatar is not a gif.");
		}

		Cdn.url.pathname += `guilds/${guildId}/users/${userId}/avatars/${avatar}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static avatarDecoration(avatarDecorationDataAsset: string): string {
		Cdn.url.pathname += `avatar-decoration-presets/${avatarDecorationDataAsset}.${ImageFormats.PNG}`;
		return Cdn.url.toString();
	}

	public static applicationIcon(applicationId: Snowflake, icon: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(icon)) {
			throw new Error("The icon is not a gif.");
		}

		Cdn.url.pathname += `app-icons/${applicationId}/${icon}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static applicationCover(applicationId: Snowflake, coverImage: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(coverImage)) {
			throw new Error("The cover image is not a gif.");
		}

		Cdn.url.pathname += `app-icons/${applicationId}/${coverImage}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static applicationAsset(applicationId: Snowflake, assetId: Snowflake, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `app-assets/${applicationId}/${assetId}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static achievementIcon(applicationId: Snowflake, achievementId: Snowflake, iconHash: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static storePageAsset(applicationId: Snowflake, assetId: Snowflake, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `app-assets/${applicationId}/store/${assetId}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static stickerPackBanner(applicationId: Snowflake, stickerPackBannerAssetId: Snowflake, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `app-assets/${applicationId}/store/${stickerPackBannerAssetId}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static teamIcon(teamId: Snowflake, teamIcon: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(teamIcon)) {
			throw new Error("The team icon is not a gif.");
		}

		Cdn.url.pathname += `team-icons/${teamId}/${teamIcon}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static sticker(stickerId: Snowflake, formats: ImageFormats.GIF | ImageFormats.Lottie | ImageFormats.PNG = ImageFormats.PNG): string {
		Cdn.url.hostname = "media.discordapp.net";
		Cdn.url.pathname += `stickers/${stickerId}.${formats}`;
		return Cdn.url.toString();
	}

	public static roleIcon(roleId: Snowflake, roleIcon: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(roleIcon)) {
			throw new Error("The role icon is not a gif.");
		}

		Cdn.url.pathname += `role-icons/${roleId}/${roleIcon}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildScheduledEventCover(guildId: Snowflake, scheduledEventId: Snowflake, scheduledEventCoverImage: string, size?: Integer, formats: ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		Cdn.url.pathname += `guild-events/${guildId}/${scheduledEventId}/${scheduledEventCoverImage}.${formats}`;
		if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	public static guildMemberBanner(guildId: Snowflake, userId: Snowflake, banner: string, size?: Integer, formats: ImageFormats.GIF | ImageFormats.JPEG | ImageFormats.PNG | ImageFormats.WebP = ImageFormats.PNG): string {
		Cdn.validateSize(size);
		if (formats === ImageFormats.GIF && !Cdn.isHashGif(banner)) {
			throw new Error("The banner is not a gif.");
		}

		Cdn.url.pathname += `guilds/${guildId}/users/${userId}/banners/${banner}.${formats}`;
		if (formats === ImageFormats.GIF && size) {
			throw new Error("GIFs do not support resizing.");
		} else if (size) {
			Cdn.url.searchParams.set("size", size.toString());
		}

		return Cdn.url.toString();
	}

	private static validateSize(size?: number): void {
		if (size && (size < 16 || size > 4_096)) {
			throw new Error("Size must be between 16 and 4096.");
		}
	}

	private static isHashGif(hash: string): boolean {
		return hash.startsWith("a_");
	}
}
