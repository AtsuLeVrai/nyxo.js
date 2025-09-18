import { describe, expect, it } from "vitest";
import { Cdn } from "./cdn.js";

describe("CDN Utilities", () => {
  describe("constants", () => {
    it("should have correct CDN base URLs", () => {
      expect(Cdn.CDN_URL).toBe("https://cdn.discordapp.com/");
      expect(Cdn.MEDIA_PROXY_URL).toBe("https://media.discordapp.net/");
    });

    it("should have correct Discord epoch", () => {
      expect(Cdn.DISCORD_EPOCH).toBe(1420070400000n);
    });

    it("should have animated hash pattern regex", () => {
      expect(Cdn.ANIMATED_HASH_PATTERN.test("a_123456789")).toBe(true);
      expect(Cdn.ANIMATED_HASH_PATTERN.test("123456789")).toBe(false);
    });

    it("should have correct default avatar counts", () => {
      expect(Cdn.DEFAULT_AVATARS.legacy).toBe(5);
      expect(Cdn.DEFAULT_AVATARS.new).toBe(6);
    });
  });

  describe("getOptimalFormat", () => {
    it("should return specified format when provided", () => {
      expect(Cdn.getOptimalFormat("hash", { format: "webp" })).toBe("webp");
      expect(Cdn.getOptimalFormat("a_hash", { format: "png" })).toBe("png");
    });

    it("should detect animated hashes and return gif", () => {
      expect(Cdn.getOptimalFormat("a_123456789")).toBe("gif");
      expect(Cdn.getOptimalFormat("a_animated_hash")).toBe("gif");
    });

    it("should return png for static hashes", () => {
      expect(Cdn.getOptimalFormat("123456789")).toBe("png");
      expect(Cdn.getOptimalFormat("static_hash")).toBe("png");
    });

    it("should respect animated option override", () => {
      expect(Cdn.getOptimalFormat("static_hash", { animated: true })).toBe("gif");
      expect(Cdn.getOptimalFormat("a_hash", { animated: false })).toBe("gif");
    });

    it("should prioritize format over animation detection", () => {
      expect(Cdn.getOptimalFormat("a_hash", { format: "webp" })).toBe("webp");
      expect(Cdn.getOptimalFormat("static", { format: "gif" })).toBe("gif");
    });
  });

  describe("buildUrl", () => {
    it("should build basic CDN URL", () => {
      const url = Cdn.buildUrl("emojis/123.png");
      expect(url).toBe("https://cdn.discordapp.com/emojis/123.png");
    });

    it("should build media proxy URL when requested", () => {
      const url = Cdn.buildUrl("stickers/123.gif", undefined, true);
      expect(url).toBe("https://media.discordapp.net/stickers/123.gif");
    });

    it("should add size parameter when provided", () => {
      const url = Cdn.buildUrl("avatars/123/456.png", 512);
      expect(url).toBe("https://cdn.discordapp.com/avatars/123/456.png?size=512");
    });

    it("should handle size parameter with media proxy", () => {
      const url = Cdn.buildUrl("stickers/123.gif", 256, true);
      expect(url).toBe("https://media.discordapp.net/stickers/123.gif?size=256");
    });

    it("should not add size parameter when undefined", () => {
      const url = Cdn.buildUrl("emojis/123.png", undefined);
      expect(url).toBe("https://cdn.discordapp.com/emojis/123.png");
    });

    it("should handle complex paths", () => {
      const url = Cdn.buildUrl("guilds/123/users/456/avatars/789.gif", 1024);
      expect(url).toBe("https://cdn.discordapp.com/guilds/123/users/456/avatars/789.gif?size=1024");
    });
  });

  describe("getEmojiUrl", () => {
    it("should generate basic emoji URL with PNG format", () => {
      const url = Cdn.getEmojiUrl("123456789");
      expect(url).toBe("https://cdn.discordapp.com/emojis/123456789.png");
    });

    it("should use specified format", () => {
      const url = Cdn.getEmojiUrl("123456789", { format: "gif" });
      expect(url).toBe("https://cdn.discordapp.com/emojis/123456789.gif");
    });

    it("should add size parameter", () => {
      const url = Cdn.getEmojiUrl("123456789", { size: 128 });
      expect(url).toBe("https://cdn.discordapp.com/emojis/123456789.png?size=128");
    });

    it("should handle webp format", () => {
      const url = Cdn.getEmojiUrl("123456789", { format: "webp", size: 64 });
      expect(url).toBe("https://cdn.discordapp.com/emojis/123456789.webp?size=64");
    });
  });

  describe("getGuildIconUrl", () => {
    const guildId = "123456789";
    const staticHash = "abcdef123";
    const animatedHash = "a_abcdef123";

    it("should generate static guild icon URL", () => {
      const url = Cdn.getGuildIconUrl(guildId, staticHash);
      expect(url).toBe("https://cdn.discordapp.com/icons/123456789/abcdef123.png");
    });

    it("should detect animated hash and use gif", () => {
      const url = Cdn.getGuildIconUrl(guildId, animatedHash);
      expect(url).toBe("https://cdn.discordapp.com/icons/123456789/a_abcdef123.gif");
    });

    it("should respect format override", () => {
      const url = Cdn.getGuildIconUrl(guildId, animatedHash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/icons/123456789/a_abcdef123.webp");
    });

    it("should add size parameter", () => {
      const url = Cdn.getGuildIconUrl(guildId, staticHash, { size: 256 });
      expect(url).toBe("https://cdn.discordapp.com/icons/123456789/abcdef123.png?size=256");
    });

    it("should handle animated option override", () => {
      const url = Cdn.getGuildIconUrl(guildId, staticHash, { animated: true });
      expect(url).toBe("https://cdn.discordapp.com/icons/123456789/abcdef123.gif");
    });
  });

  describe("guildSplash", () => {
    const guildId = "123456789";
    const hash = "splash_hash";

    it("should generate guild splash URL with PNG", () => {
      const url = Cdn.guildSplash(guildId, hash);
      expect(url).toBe("https://cdn.discordapp.com/splashes/123456789/splash_hash.png");
    });

    it("should use specified format", () => {
      const url = Cdn.guildSplash(guildId, hash, { format: "jpeg" });
      expect(url).toBe("https://cdn.discordapp.com/splashes/123456789/splash_hash.jpeg");
    });

    it("should add size parameter", () => {
      const url = Cdn.guildSplash(guildId, hash, { size: 1024 });
      expect(url).toBe("https://cdn.discordapp.com/splashes/123456789/splash_hash.png?size=1024");
    });
  });

  describe("guildDiscoverySplash", () => {
    const guildId = "123456789";
    const hash = "discovery_hash";

    it("should generate discovery splash URL", () => {
      const url = Cdn.guildDiscoverySplash(guildId, hash);
      expect(url).toBe(
        "https://cdn.discordapp.com/discovery-splashes/123456789/discovery_hash.png",
      );
    });

    it("should use webp format", () => {
      const url = Cdn.guildDiscoverySplash(guildId, hash, { format: "webp" });
      expect(url).toBe(
        "https://cdn.discordapp.com/discovery-splashes/123456789/discovery_hash.webp",
      );
    });
  });

  describe("guildBanner", () => {
    const guildId = "123456789";
    const staticHash = "banner_hash";
    const animatedHash = "a_banner_hash";

    it("should generate static banner URL", () => {
      const url = Cdn.guildBanner(guildId, staticHash);
      expect(url).toBe("https://cdn.discordapp.com/banners/123456789/banner_hash.png");
    });

    it("should detect animated banner", () => {
      const url = Cdn.guildBanner(guildId, animatedHash);
      expect(url).toBe("https://cdn.discordapp.com/banners/123456789/a_banner_hash.gif");
    });

    it("should add size parameter", () => {
      const url = Cdn.guildBanner(guildId, staticHash, { size: 512 });
      expect(url).toBe("https://cdn.discordapp.com/banners/123456789/banner_hash.png?size=512");
    });
  });

  describe("userBanner", () => {
    const userId = "987654321";
    const staticHash = "user_banner";
    const animatedHash = "a_user_banner";

    it("should generate static user banner URL", () => {
      const url = Cdn.userBanner(userId, staticHash);
      expect(url).toBe("https://cdn.discordapp.com/banners/987654321/user_banner.png");
    });

    it("should detect animated user banner", () => {
      const url = Cdn.userBanner(userId, animatedHash);
      expect(url).toBe("https://cdn.discordapp.com/banners/987654321/a_user_banner.gif");
    });

    it("should use specified format", () => {
      const url = Cdn.userBanner(userId, animatedHash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/banners/987654321/a_user_banner.webp");
    });
  });

  describe("getDefaultAvatarByDiscriminator", () => {
    it("should generate default avatar URL from string discriminator", () => {
      const url = Cdn.getDefaultAvatarByDiscriminator("0001");
      expect(url).toBe("https://cdn.discordapp.com/embed/avatars/1.png");
    });

    it("should generate default avatar URL from numeric discriminator", () => {
      const url = Cdn.getDefaultAvatarByDiscriminator(1337);
      expect(url).toBe("https://cdn.discordapp.com/embed/avatars/2.png"); // 1337 % 5 = 2
    });

    it("should handle edge case discriminators", () => {
      expect(Cdn.getDefaultAvatarByDiscriminator("0000")).toBe(
        "https://cdn.discordapp.com/embed/avatars/0.png",
      );
      expect(Cdn.getDefaultAvatarByDiscriminator(9999)).toBe(
        "https://cdn.discordapp.com/embed/avatars/4.png",
      ); // 9999 % 5 = 4
    });

    it("should cycle through legacy avatar count", () => {
      for (let i = 0; i < 10; i++) {
        const url = Cdn.getDefaultAvatarByDiscriminator(i);
        const expectedIndex = i % 5;
        expect(url).toBe(`https://cdn.discordapp.com/embed/avatars/${expectedIndex}.png`);
      }
    });
  });

  describe("getDefaultAvatarByUserId", () => {
    it("should generate default avatar from user ID", () => {
      const userId = "123456789012345678";
      const url = Cdn.getDefaultAvatarByUserId(userId);
      expect(url).toMatch(/https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png/);
    });

    it("should be deterministic for same user ID", () => {
      const userId = "123456789012345678";
      const url1 = Cdn.getDefaultAvatarByUserId(userId);
      const url2 = Cdn.getDefaultAvatarByUserId(userId);
      expect(url1).toBe(url2);
    });

    it("should cycle through new avatar count", () => {
      // Test with known snowflake patterns
      const testIds = [
        "123456789012345678",
        "234567890123456789",
        "345678901234567890",
        "456789012345678901",
        "567890123456789012",
        "678901234567890123",
        "789012345678901234",
      ];

      const urls = testIds.map((id) => Cdn.getDefaultAvatarByUserId(id));

      // Each URL should be valid
      for (const url of urls) {
        expect(url).toMatch(/https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png/);
      }
    });

    it("should use snowflake timestamp bits", () => {
      // Test with edge case snowflakes
      const minSnowflake = "0000000000000000000";
      const maxSnowflake = "9223372036854775807"; // Max safe integer as string

      expect(Cdn.getDefaultAvatarByUserId(minSnowflake)).toMatch(/\/embed\/avatars\/[0-5]\.png$/);
      expect(Cdn.getDefaultAvatarByUserId(maxSnowflake)).toMatch(/\/embed\/avatars\/[0-5]\.png$/);
    });
  });

  describe("getUserAvatarUrl", () => {
    const userId = "123456789";
    const staticHash = "avatar_hash";
    const animatedHash = "a_avatar_hash";

    it("should generate static avatar URL", () => {
      const url = Cdn.getUserAvatarUrl(userId, staticHash);
      expect(url).toBe("https://cdn.discordapp.com/avatars/123456789/avatar_hash.png");
    });

    it("should detect animated avatar", () => {
      const url = Cdn.getUserAvatarUrl(userId, animatedHash);
      expect(url).toBe("https://cdn.discordapp.com/avatars/123456789/a_avatar_hash.gif");
    });

    it("should use specified format and size", () => {
      const url = Cdn.getUserAvatarUrl(userId, staticHash, { format: "webp", size: 128 });
      expect(url).toBe("https://cdn.discordapp.com/avatars/123456789/avatar_hash.webp?size=128");
    });
  });

  describe("guildMemberAvatar", () => {
    const guildId = "123456789";
    const userId = "987654321";
    const hash = "member_avatar";

    it("should generate guild member avatar URL", () => {
      const url = Cdn.guildMemberAvatar(guildId, userId, hash);
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/member_avatar.png",
      );
    });

    it("should handle animated member avatar", () => {
      const animatedHash = "a_member_avatar";
      const url = Cdn.guildMemberAvatar(guildId, userId, animatedHash);
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/a_member_avatar.gif",
      );
    });

    it("should add size parameter", () => {
      const url = Cdn.guildMemberAvatar(guildId, userId, hash, { size: 256 });
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/member_avatar.png?size=256",
      );
    });
  });

  describe("avatarDecoration", () => {
    it("should generate avatar decoration URL", () => {
      const url = Cdn.avatarDecoration("decoration_id");
      expect(url).toBe("https://cdn.discordapp.com/avatar-decoration-presets/decoration_id.png");
    });

    it("should handle complex asset IDs", () => {
      const url = Cdn.avatarDecoration("a_2f5891b5e6eeb096bc05bcd2b7707ddc");
      expect(url).toBe(
        "https://cdn.discordapp.com/avatar-decoration-presets/a_2f5891b5e6eeb096bc05bcd2b7707ddc.png",
      );
    });
  });

  describe("applicationIcon", () => {
    const appId = "123456789";
    const hash = "app_icon_hash";

    it("should generate application icon URL", () => {
      const url = Cdn.applicationIcon(appId, hash);
      expect(url).toBe("https://cdn.discordapp.com/app-icons/123456789/app_icon_hash.png");
    });

    it("should use specified format", () => {
      const url = Cdn.applicationIcon(appId, hash, { format: "jpeg" });
      expect(url).toBe("https://cdn.discordapp.com/app-icons/123456789/app_icon_hash.jpeg");
    });

    it("should add size parameter", () => {
      const url = Cdn.applicationIcon(appId, hash, { size: 512 });
      expect(url).toBe("https://cdn.discordapp.com/app-icons/123456789/app_icon_hash.png?size=512");
    });
  });

  describe("applicationCover", () => {
    const appId = "123456789";
    const hash = "cover_hash";

    it("should generate application cover URL", () => {
      const url = Cdn.applicationCover(appId, hash);
      expect(url).toBe("https://cdn.discordapp.com/app-icons/123456789/cover_hash.png");
    });

    it("should use webp format", () => {
      const url = Cdn.applicationCover(appId, hash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/app-icons/123456789/cover_hash.webp");
    });
  });

  describe("applicationAsset", () => {
    const appId = "123456789";
    const assetId = "asset_123";

    it("should generate application asset URL", () => {
      const url = Cdn.applicationAsset(appId, assetId);
      expect(url).toBe("https://cdn.discordapp.com/app-assets/123456789/asset_123.png");
    });

    it("should use specified format and size", () => {
      const url = Cdn.applicationAsset(appId, assetId, { format: "webp", size: 256 });
      expect(url).toBe("https://cdn.discordapp.com/app-assets/123456789/asset_123.webp?size=256");
    });
  });

  describe("achievementIcon", () => {
    const appId = "123456789";
    const achievementId = "achievement_1";
    const iconHash = "icon_hash";

    it("should generate achievement icon URL", () => {
      const url = Cdn.achievementIcon(appId, achievementId, iconHash);
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/achievements/achievement_1/icons/icon_hash.png",
      );
    });

    it("should use specified format", () => {
      const url = Cdn.achievementIcon(appId, achievementId, iconHash, { format: "jpeg" });
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/achievements/achievement_1/icons/icon_hash.jpeg",
      );
    });

    it("should add size parameter", () => {
      const url = Cdn.achievementIcon(appId, achievementId, iconHash, { size: 128 });
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/achievements/achievement_1/icons/icon_hash.png?size=128",
      );
    });
  });

  describe("storePageAsset", () => {
    const appId = "123456789";
    const assetId = "store_asset";

    it("should generate store page asset URL", () => {
      const url = Cdn.storePageAsset(appId, assetId);
      expect(url).toBe("https://cdn.discordapp.com/app-assets/123456789/store/store_asset.png");
    });

    it("should use specified format", () => {
      const url = Cdn.storePageAsset(appId, assetId, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/app-assets/123456789/store/store_asset.webp");
    });
  });

  describe("stickerPackBanner", () => {
    const bannerId = "banner_123";

    it("should generate sticker pack banner URL", () => {
      const url = Cdn.stickerPackBanner(bannerId);
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/710982414301790216/store/banner_123.png",
      );
    });

    it("should use specified format", () => {
      const url = Cdn.stickerPackBanner(bannerId, { format: "jpeg" });
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/710982414301790216/store/banner_123.jpeg",
      );
    });

    it("should add size parameter", () => {
      const url = Cdn.stickerPackBanner(bannerId, { size: 1024 });
      expect(url).toBe(
        "https://cdn.discordapp.com/app-assets/710982414301790216/store/banner_123.png?size=1024",
      );
    });
  });

  describe("teamIcon", () => {
    const teamId = "123456789";
    const hash = "team_hash";

    it("should generate team icon URL", () => {
      const url = Cdn.teamIcon(teamId, hash);
      expect(url).toBe("https://cdn.discordapp.com/team-icons/123456789/team_hash.png");
    });

    it("should use specified format", () => {
      const url = Cdn.teamIcon(teamId, hash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/team-icons/123456789/team_hash.webp");
    });

    it("should add size parameter", () => {
      const url = Cdn.teamIcon(teamId, hash, { size: 256 });
      expect(url).toBe("https://cdn.discordapp.com/team-icons/123456789/team_hash.png?size=256");
    });
  });

  describe("sticker", () => {
    const stickerId = "123456789";

    it("should generate static sticker URL with PNG", () => {
      const url = Cdn.sticker(stickerId);
      expect(url).toBe("https://cdn.discordapp.com/stickers/123456789.png");
    });

    it("should use media proxy for GIF stickers by default", () => {
      const url = Cdn.sticker(stickerId, { format: "gif" });
      expect(url).toBe("https://media.discordapp.net/stickers/123456789.gif");
    });

    it("should force CDN for GIF when media proxy disabled", () => {
      const url = Cdn.sticker(stickerId, { format: "gif", useMediaProxy: false });
      expect(url).toBe("https://cdn.discordapp.com/stickers/123456789.gif");
    });

    it("should use JSON format for Lottie stickers", () => {
      const url = Cdn.sticker(stickerId, { format: "json" });
      expect(url).toBe("https://cdn.discordapp.com/stickers/123456789.json");
    });

    it("should add size parameter", () => {
      const url = Cdn.sticker(stickerId, { size: 128 });
      expect(url).toBe("https://cdn.discordapp.com/stickers/123456789.png?size=128");
    });

    it("should handle media proxy with size", () => {
      const url = Cdn.sticker(stickerId, { format: "gif", size: 256 });
      expect(url).toBe("https://media.discordapp.net/stickers/123456789.gif?size=256");
    });
  });

  describe("roleIcon", () => {
    const roleId = "123456789";
    const hash = "role_hash";

    it("should generate role icon URL", () => {
      const url = Cdn.roleIcon(roleId, hash);
      expect(url).toBe("https://cdn.discordapp.com/role-icons/123456789/role_hash.png");
    });

    it("should use specified format", () => {
      const url = Cdn.roleIcon(roleId, hash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/role-icons/123456789/role_hash.webp");
    });

    it("should add size parameter", () => {
      const url = Cdn.roleIcon(roleId, hash, { size: 64 });
      expect(url).toBe("https://cdn.discordapp.com/role-icons/123456789/role_hash.png?size=64");
    });
  });

  describe("guildScheduledEventCover", () => {
    const eventId = "123456789";
    const hash = "event_cover";

    it("should generate event cover URL", () => {
      const url = Cdn.guildScheduledEventCover(eventId, hash);
      expect(url).toBe("https://cdn.discordapp.com/guild-events/123456789/event_cover.png");
    });

    it("should use specified format", () => {
      const url = Cdn.guildScheduledEventCover(eventId, hash, { format: "jpeg" });
      expect(url).toBe("https://cdn.discordapp.com/guild-events/123456789/event_cover.jpeg");
    });

    it("should add size parameter", () => {
      const url = Cdn.guildScheduledEventCover(eventId, hash, { size: 512 });
      expect(url).toBe(
        "https://cdn.discordapp.com/guild-events/123456789/event_cover.png?size=512",
      );
    });
  });

  describe("guildMemberBanner", () => {
    const guildId = "123456789";
    const userId = "987654321";
    const staticHash = "member_banner";
    const animatedHash = "a_member_banner";

    it("should generate static member banner URL", () => {
      const url = Cdn.guildMemberBanner(guildId, userId, staticHash);
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/member_banner.png",
      );
    });

    it("should detect animated member banner", () => {
      const url = Cdn.guildMemberBanner(guildId, userId, animatedHash);
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/a_member_banner.gif",
      );
    });

    it("should use specified format and size", () => {
      const url = Cdn.guildMemberBanner(guildId, userId, staticHash, {
        format: "webp",
        size: 1024,
      });
      expect(url).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/member_banner.webp?size=1024",
      );
    });
  });

  describe("guildTagBadge", () => {
    const guildId = "123456789";
    const badgeHash = "badge_hash";

    it("should generate guild tag badge URL", () => {
      const url = Cdn.guildTagBadge(guildId, badgeHash);
      expect(url).toBe("https://cdn.discordapp.com/guild-tag-badges/123456789/badge_hash.png");
    });

    it("should use specified format", () => {
      const url = Cdn.guildTagBadge(guildId, badgeHash, { format: "webp" });
      expect(url).toBe("https://cdn.discordapp.com/guild-tag-badges/123456789/badge_hash.webp");
    });

    it("should add size parameter", () => {
      const url = Cdn.guildTagBadge(guildId, badgeHash, { size: 128 });
      expect(url).toBe(
        "https://cdn.discordapp.com/guild-tag-badges/123456789/badge_hash.png?size=128",
      );
    });
  });

  describe("attachment", () => {
    const channelId = "123456789";
    const attachmentId = "987654321";

    it("should generate attachment URL with simple filename", () => {
      const url = Cdn.attachment(channelId, attachmentId, "image.png");
      expect(url).toBe("https://cdn.discordapp.com/attachments/123456789/987654321/image.png");
    });

    it("should encode special characters in filename", () => {
      const url = Cdn.attachment(channelId, attachmentId, "my file (1).png");
      expect(url).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/my%20file%20(1).png",
      );
    });

    it("should handle unicode characters", () => {
      const url = Cdn.attachment(channelId, attachmentId, "画像.png");
      expect(url).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/%E7%94%BB%E5%83%8F.png",
      );
    });

    it("should add size parameter for image attachments", () => {
      const url = Cdn.attachment(channelId, attachmentId, "image.jpg", { size: 512 });
      expect(url).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/image.jpg?size=512",
      );
    });

    it("should handle complex filenames", () => {
      const filename = "My Document [2023-12-01] #final.pdf";
      const url = Cdn.attachment(channelId, attachmentId, filename);
      expect(url).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/My%20Document%20%5B2023-12-01%5D%20%23final.pdf",
      );
    });
  });

  describe("edge cases and validation", () => {
    it("should handle empty string parameters", () => {
      expect(() => Cdn.getEmojiUrl("")).not.toThrow();
      expect(() => Cdn.getUserAvatarUrl("", "")).not.toThrow();
    });

    it("should handle very long IDs", () => {
      const longId = "123456789012345678901234567890";
      const url = Cdn.getEmojiUrl(longId);
      expect(url).toBe(`https://cdn.discordapp.com/emojis/${longId}.png`);
    });

    it("should handle all valid image sizes", () => {
      const validSizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

      for (const size of validSizes) {
        const url = Cdn.getEmojiUrl("123", { size: size as any });
        expect(url).toBe(`https://cdn.discordapp.com/emojis/123.png?size=${size}`);
      }
    });

    it("should handle all supported formats", () => {
      const formats = ["png", "jpeg", "webp", "gif", "json"] as const;

      for (const format of formats) {
        if (format !== "json") {
          const url = Cdn.getEmojiUrl("123", { format: format as any });
          expect(url).toBe(`https://cdn.discordapp.com/emojis/123.${format}`);
        }
      }
    });

    it("should handle animated hash patterns correctly", () => {
      const animatedPatterns = ["a_123456789", "a_abcdef123456", "a_", "a_1"];

      const staticPatterns = ["123456789", "abcdef123456", "static_hash", "_a_123", "aa_123"];

      for (const pattern of animatedPatterns) {
        expect(Cdn.ANIMATED_HASH_PATTERN.test(pattern)).toBe(true);
      }

      for (const pattern of staticPatterns) {
        expect(Cdn.ANIMATED_HASH_PATTERN.test(pattern)).toBe(false);
      }
    });
  });

  describe("type safety", () => {
    it("should return correctly typed URLs", () => {
      const emojiUrl = Cdn.getEmojiUrl("123");
      const guildIconUrl = Cdn.getGuildIconUrl("123", "456");
      const attachmentUrl = Cdn.attachment("123", "456", "file.txt");

      expect(typeof emojiUrl).toBe("string");
      expect(typeof guildIconUrl).toBe("string");
      expect(typeof attachmentUrl).toBe("string");

      expect(emojiUrl.startsWith("https://cdn.discordapp.com/emojis/")).toBe(true);
      expect(guildIconUrl.startsWith("https://cdn.discordapp.com/icons/")).toBe(true);
      expect(attachmentUrl.startsWith("https://cdn.discordapp.com/attachments/")).toBe(true);
    });

    it("should handle all CDN options", () => {
      const options = {
        size: 256 as const,
        format: "webp" as const,
        animated: true,
        useMediaProxy: false,
      };

      expect(() => Cdn.getUserAvatarUrl("123", "456", options)).not.toThrow();
      // @ts-expect-error
      expect(() => Cdn.sticker("123", options)).not.toThrow();
    });
  });

  describe("integration tests", () => {
    it("should work with real Discord asset patterns", () => {
      // Real Discord emoji ID pattern
      const emojiId = "123456789012345678";
      const emojiUrl = Cdn.getEmojiUrl(emojiId, { format: "gif", size: 128 });
      expect(emojiUrl).toBe("https://cdn.discordapp.com/emojis/123456789012345678.gif?size=128");

      // Real Discord user ID and avatar hash
      const userId = "987654321098765432";
      const avatarHash = "a_1234567890abcdef1234567890abcdef";
      const avatarUrl = Cdn.getUserAvatarUrl(userId, avatarHash);
      expect(avatarUrl).toBe(
        "https://cdn.discordapp.com/avatars/987654321098765432/a_1234567890abcdef1234567890abcdef.gif",
      );
    });

    it("should generate consistent URLs for same inputs", () => {
      const userId = "123456789";
      const hash = "abcdef123";

      const url1 = Cdn.getUserAvatarUrl(userId, hash);
      const url2 = Cdn.getUserAvatarUrl(userId, hash);

      expect(url1).toBe(url2);
    });

    it("should handle Discord API response scenarios", () => {
      // Scenario: User with no custom avatar (uses default)
      const userId = "123456789";
      const defaultUrl = Cdn.getDefaultAvatarByUserId(userId);
      expect(defaultUrl).toMatch(/embed\/avatars\/[0-5]\.png$/);

      // Scenario: Guild with animated icon
      const guildId = "987654321";
      const animatedHash = "a_animated_guild_icon";
      const guildUrl = Cdn.getGuildIconUrl(guildId, animatedHash);
      expect(guildUrl).toContain(".gif");

      // Scenario: Message attachment with special filename
      const attachmentUrl = Cdn.attachment(
        "111",
        "222",
        "Screenshot 2023-12-01 at 10.30.45 AM.png",
      );
      expect(attachmentUrl).toContain("Screenshot%202023-12-01%20at%2010.30.45%20AM.png");
    });

    it("should optimize for Discord CDN performance", () => {
      // Animated stickers prefer media proxy
      const animatedStickerUrl = Cdn.sticker("123", { format: "gif" });
      expect(animatedStickerUrl).toContain("media.discordapp.net");

      // Static assets use main CDN
      const staticIconUrl = Cdn.getGuildIconUrl("123", "static_hash");
      expect(staticIconUrl).toContain("cdn.discordapp.com");

      // Size parameter for optimized loading
      const optimizedUrl = Cdn.getUserAvatarUrl("123", "hash", { size: 128 });
      expect(optimizedUrl).toContain("size=128");
    });
  });
});
