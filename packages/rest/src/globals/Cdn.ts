import { URL } from "node:url";
import type { Integer, Snowflake } from "@nyxjs/core";
import { ImageFormats } from "@nyxjs/core";

type ImageFormat =
	| ImageFormats.GIF
	| ImageFormats.JPEG
	| ImageFormats.Lottie
	| ImageFormats.PNG
	| ImageFormats.WebP;

export class Cdn {
	private static baseUrl = new URL("https://cdn.discordapp.com/");

	public static customEmoji(
		emojiId: Snowflake,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`emojis/${emojiId}`, format, size);
	}

	public static guildIcon(
		guildId: Snowflake,
		icon: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`icons/${guildId}/${icon}`, format, size);
	}

	public static guildSplash(
		guildId: Snowflake,
		splash: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`splashes/${guildId}/${splash}`, format, size);
	}

	public static guildDiscoverySplash(
		guildId: Snowflake,
		splash: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`discovery-splashes/${guildId}/${splash}`,
			format,
			size,
		);
	}

	public static guildBanner(
		guildId: Snowflake,
		banner: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`banners/${guildId}/${banner}`, format, size);
	}

	public static userBanner(
		userId: Snowflake,
		banner: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`banners/${userId}/${banner}`, format, size);
	}

	public static defaultUserAvatar(userId: Snowflake): string {
		const hash = this.calculateDefaultAvatarHash(userId);
		return this.createUrl(`embed/avatars/${hash}`, ImageFormats.PNG);
	}

	public static userAvatar(
		userId: Snowflake,
		avatar: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`avatars/${userId}/${avatar}`, format, size);
	}

	public static guildMemberAvatar(
		guildId: Snowflake,
		userId: Snowflake,
		avatar: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`guilds/${guildId}/users/${userId}/avatars/${avatar}`,
			format,
			size,
		);
	}

	public static avatarDecoration(avatarDecorationDataAsset: string): string {
		return this.createUrl(
			`avatar-decoration-presets/${avatarDecorationDataAsset}`,
			ImageFormats.PNG,
		);
	}

	public static applicationIcon(
		applicationId: Snowflake,
		icon: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`app-icons/${applicationId}/${icon}`, format, size);
	}

	public static applicationCover(
		applicationId: Snowflake,
		coverImage: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`app-icons/${applicationId}/${coverImage}`,
			format,
			size,
		);
	}

	public static applicationAsset(
		applicationId: Snowflake,
		assetId: Snowflake,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`app-assets/${applicationId}/${assetId}`,
			format,
			size,
		);
	}

	public static achievementIcon(
		applicationId: Snowflake,
		achievementId: Snowflake,
		iconHash: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`app-assets/${applicationId}/achievements/${achievementId}/icons/${iconHash}`,
			format,
			size,
		);
	}

	public static storePageAsset(
		applicationId: Snowflake,
		assetId: Snowflake,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`app-assets/${applicationId}/store/${assetId}`,
			format,
			size,
		);
	}

	public static stickerPackBanner(
		applicationId: Snowflake,
		stickerPackBannerAssetId: Snowflake,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`app-assets/${applicationId}/store/${stickerPackBannerAssetId}`,
			format,
			size,
		);
	}

	public static teamIcon(
		teamId: Snowflake,
		teamIcon: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`team-icons/${teamId}/${teamIcon}`, format, size);
	}

	public static sticker(
		stickerId: Snowflake,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`stickers/${stickerId}`,
			format,
			undefined,
			"media.discordapp.net",
		);
	}

	public static roleIcon(
		roleId: Snowflake,
		roleIcon: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(`role-icons/${roleId}/${roleIcon}`, format, size);
	}

	public static guildScheduledEventCover(
		guildId: Snowflake,
		scheduledEventId: Snowflake,
		scheduledEventCoverImage: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`guild-events/${guildId}/${scheduledEventId}/${scheduledEventCoverImage}`,
			format,
			size,
		);
	}

	public static guildMemberBanner(
		guildId: Snowflake,
		userId: Snowflake,
		banner: string,
		size?: Integer,
		format: ImageFormat = ImageFormats.PNG,
	): string {
		return this.createUrl(
			`guilds/${guildId}/users/${userId}/banners/${banner}`,
			format,
			size,
		);
	}

	private static createUrl(
		path: string,
		format: ImageFormat,
		size?: Integer,
		hostname = "cdn.discordapp.com",
	): string {
		this.validateSize(size);
		this.validateGifFormat(path, format, size);

		const url = new URL(this.baseUrl);
		url.hostname = hostname;
		url.pathname += `${path}.${format}`;

		if (size && format !== ImageFormats.GIF) {
			url.searchParams.set("size", size.toString());
		}

		return url.toString();
	}

	private static validateSize(size?: number): void {
		if (size && (size < 16 || size > 4_096)) {
			throw new Error("Size must be between 16 and 4096.");
		}
	}

	private static validateGifFormat(
		path: string,
		format: ImageFormat,
		size?: Integer,
	): void {
		if (
			format === ImageFormats.GIF &&
			!this.isHashGif(path.split("/").pop() ?? "")
		) {
			throw new Error("The asset is not a gif.");
		}

		if (format === ImageFormats.GIF && size !== undefined) {
			throw new Error("GIFs do not support resizing.");
		}
	}

	private static isHashGif(hash: string): boolean {
		return hash.startsWith("a_");
	}

	private static calculateDefaultAvatarHash(userId: Snowflake): string {
		if (userId.length === 17) {
			return ((BigInt(userId) >> 22n) % 6n).toString();
		} else {
			return (Number.parseInt(userId.slice(-4), 10) % 5).toString();
		}
	}
}
