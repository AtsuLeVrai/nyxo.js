import { describe, expect, it } from "vitest";
import {
  type AttachmentUrl,
  Cdn,
  type EmojiUrl,
  type GuildIconUrl,
  type ImageSize,
  type UserAvatarUrl,
} from "./cdn.js";

describe("Cdn", () => {
  describe("constants", () => {
    it("should have correct BASE_URL", () => {
      expect(Cdn.BASE_URL).toBe("https://cdn.discordapp.com/");
    });

    it("should have correct MEDIA_PROXY_URL", () => {
      expect(Cdn.MEDIA_PROXY_URL).toBe("https://media.discordapp.net/");
    });

    it("should have correct ANIMATED_HASH regex", () => {
      expect(Cdn.ANIMATED_HASH.test("a_hash123")).toBe(true);
      expect(Cdn.ANIMATED_HASH.test("hash123")).toBe(false);
    });
  });

  describe("getFormatFromHash", () => {
    it("should return provided format when specified", () => {
      const result = Cdn.getFormatFromHash("test_hash", { format: "webp" });
      expect(result).toBe("webp");
    });

    it("should return 'gif' for animated hash when no format specified", () => {
      const result = Cdn.getFormatFromHash("a_test_hash", {});
      expect(result).toBe("gif");
    });

    it("should return 'gif' when animated option is true", () => {
      const result = Cdn.getFormatFromHash("test_hash", { animated: true });
      expect(result).toBe("gif");
    });

    it("should return 'png' for non-animated hash", () => {
      const result = Cdn.getFormatFromHash("test_hash", {});
      expect(result).toBe("png");
    });

    it("should prioritize format option over animated detection", () => {
      const result = Cdn.getFormatFromHash("a_test_hash", { format: "png" });
      expect(result).toBe("png");
    });
  });

  describe("buildUrl", () => {
    it("should build basic URL without size", () => {
      const result = Cdn.buildUrl("test/path");
      expect(result).toBe("https://cdn.discordapp.com/test/path");
    });

    it("should build URL with size parameter", () => {
      const result = Cdn.buildUrl("test/path", 256);
      expect(result).toBe("https://cdn.discordapp.com/test/path?size=256");
    });

    it("should use media proxy when specified", () => {
      const result = Cdn.buildUrl("test/path", undefined, true);
      expect(result).toBe("https://media.discordapp.net/test/path");
    });

    it("should use media proxy with size", () => {
      const result = Cdn.buildUrl("test/path", 512, true);
      expect(result).toBe("https://media.discordapp.net/test/path?size=512");
    });

    it("should handle all valid image sizes", () => {
      const sizes: ImageSize[] = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096];
      sizes.forEach((size) => {
        const result = Cdn.buildUrl("test/path", size);
        expect(result).toBe(`https://cdn.discordapp.com/test/path?size=${size}`);
      });
    });
  });

  describe("emoji", () => {
    it("should generate emoji URL with default format", () => {
      const result = Cdn.emoji("123456789");
      expect(result).toBe("https://cdn.discordapp.com/emojis/123456789.png");
    });

    it("should generate emoji URL with custom format", () => {
      const result = Cdn.emoji("123456789", { format: "gif" });
      expect(result).toBe("https://cdn.discordapp.com/emojis/123456789.gif");
    });

    it("should generate emoji URL with size", () => {
      const result = Cdn.emoji("123456789", { size: 64 });
      expect(result).toBe("https://cdn.discordapp.com/emojis/123456789.png?size=64");
    });

    it("should generate emoji URL with both format and size", () => {
      const result = Cdn.emoji("123456789", { format: "webp", size: 128 });
      expect(result).toBe("https://cdn.discordapp.com/emojis/123456789.webp?size=128");
    });
  });

  describe("guildIcon", () => {
    it("should generate guild icon URL with non-animated hash", () => {
      const result = Cdn.guildIcon("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/icons/123456789/hash123.png");
    });

    it("should generate guild icon URL with animated hash", () => {
      const result = Cdn.guildIcon("123456789", "a_hash123");
      expect(result).toBe("https://cdn.discordapp.com/icons/123456789/a_hash123.gif");
    });

    it("should generate guild icon URL with custom format", () => {
      const result = Cdn.guildIcon("123456789", "hash123", { format: "webp" });
      expect(result).toBe("https://cdn.discordapp.com/icons/123456789/hash123.webp");
    });

    it("should generate guild icon URL with size", () => {
      const result = Cdn.guildIcon("123456789", "hash123", { size: 256 });
      expect(result).toBe("https://cdn.discordapp.com/icons/123456789/hash123.png?size=256");
    });

    it("should handle animated option override", () => {
      const result = Cdn.guildIcon("123456789", "hash123", { animated: true });
      expect(result).toBe("https://cdn.discordapp.com/icons/123456789/hash123.gif");
    });
  });

  describe("guildSplash", () => {
    it("should generate guild splash URL with default format", () => {
      const result = Cdn.guildSplash("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/splashes/123456789/hash123.png");
    });

    it("should generate guild splash URL with custom format", () => {
      const result = Cdn.guildSplash("123456789", "hash123", { format: "jpeg" });
      expect(result).toBe("https://cdn.discordapp.com/splashes/123456789/hash123.jpeg");
    });

    it("should generate guild splash URL with size", () => {
      const result = Cdn.guildSplash("123456789", "hash123", { size: 1024 });
      expect(result).toBe("https://cdn.discordapp.com/splashes/123456789/hash123.png?size=1024");
    });
  });

  describe("guildDiscoverySplash", () => {
    it("should generate guild discovery splash URL", () => {
      const result = Cdn.guildDiscoverySplash("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/discovery-splashes/123456789/hash123.png");
    });

    it("should generate guild discovery splash URL with options", () => {
      const result = Cdn.guildDiscoverySplash("123456789", "hash123", {
        format: "webp",
        size: 512,
      });
      expect(result).toBe(
        "https://cdn.discordapp.com/discovery-splashes/123456789/hash123.webp?size=512",
      );
    });
  });

  describe("guildBanner", () => {
    it("should generate guild banner URL with non-animated hash", () => {
      const result = Cdn.guildBanner("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/banners/123456789/hash123.png");
    });

    it("should generate guild banner URL with animated hash", () => {
      const result = Cdn.guildBanner("123456789", "a_hash123");
      expect(result).toBe("https://cdn.discordapp.com/banners/123456789/a_hash123.gif");
    });
  });

  describe("userBanner", () => {
    it("should generate user banner URL with non-animated hash", () => {
      const result = Cdn.userBanner("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/banners/123456789/hash123.png");
    });

    it("should generate user banner URL with animated hash", () => {
      const result = Cdn.userBanner("123456789", "a_hash123");
      expect(result).toBe("https://cdn.discordapp.com/banners/123456789/a_hash123.gif");
    });
  });

  describe("defaultUserAvatar", () => {
    it("should generate default user avatar URL with string discriminator", () => {
      const result = Cdn.defaultUserAvatar("1234");
      expect(result).toBe("https://cdn.discordapp.com/embed/avatars/4.png");
    });

    it("should generate default user avatar URL with number discriminator", () => {
      const result = Cdn.defaultUserAvatar(7);
      expect(result).toBe("https://cdn.discordapp.com/embed/avatars/2.png");
    });

    it("should handle discriminator modulo 5", () => {
      expect(Cdn.defaultUserAvatar("0")).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
      expect(Cdn.defaultUserAvatar("5")).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
      expect(Cdn.defaultUserAvatar("10")).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
    });
  });

  describe("defaultUserAvatarSystem", () => {
    it("should generate default user avatar URL using user ID", () => {
      const result = Cdn.defaultUserAvatarSystem("123456789012345678");
      expect(result).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
    });

    it("should handle different user IDs", () => {
      const result1 = Cdn.defaultUserAvatarSystem("100000000000000000");
      const result2 = Cdn.defaultUserAvatarSystem("200000000000000000");
      expect(result1).toMatch(/\/embed\/avatars\/[0-5]\.png$/);
      expect(result2).toMatch(/\/embed\/avatars\/[0-5]\.png$/);
    });
  });

  describe("userAvatar", () => {
    it("should generate user avatar URL with non-animated hash", () => {
      const result = Cdn.userAvatar("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/avatars/123456789/hash123.png");
    });

    it("should generate user avatar URL with animated hash", () => {
      const result = Cdn.userAvatar("123456789", "a_hash123");
      expect(result).toBe("https://cdn.discordapp.com/avatars/123456789/a_hash123.gif");
    });

    it("should generate user avatar URL with options", () => {
      const result = Cdn.userAvatar("123456789", "hash123", { format: "webp", size: 128 });
      expect(result).toBe("https://cdn.discordapp.com/avatars/123456789/hash123.webp?size=128");
    });
  });

  describe("guildMemberAvatar", () => {
    it("should generate guild member avatar URL", () => {
      const result = Cdn.guildMemberAvatar("123456789", "987654321", "hash123");
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/hash123.png",
      );
    });

    it("should generate guild member avatar URL with animated hash", () => {
      const result = Cdn.guildMemberAvatar("123456789", "987654321", "a_hash123");
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/a_hash123.gif",
      );
    });

    it("should generate guild member avatar URL with options", () => {
      const result = Cdn.guildMemberAvatar("123456789", "987654321", "hash123", {
        format: "jpeg",
        size: 64,
      });
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/avatars/hash123.jpeg?size=64",
      );
    });
  });

  describe("avatarDecoration", () => {
    it("should generate avatar decoration URL", () => {
      const result = Cdn.avatarDecoration("123456789");
      expect(result).toBe("https://cdn.discordapp.com/avatar-decoration-presets/123456789.png");
    });
  });

  describe("applicationIcon", () => {
    it("should generate application icon URL", () => {
      const result = Cdn.applicationIcon("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/app-icons/123456789/hash123.png");
    });

    it("should generate application icon URL with options", () => {
      const result = Cdn.applicationIcon("123456789", "hash123", { format: "webp", size: 256 });
      expect(result).toBe("https://cdn.discordapp.com/app-icons/123456789/hash123.webp?size=256");
    });
  });

  describe("applicationCover", () => {
    it("should generate application cover URL", () => {
      const result = Cdn.applicationCover("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/app-icons/123456789/hash123.png");
    });

    it("should generate application cover URL with options", () => {
      const result = Cdn.applicationCover("123456789", "hash123", { format: "jpeg", size: 1024 });
      expect(result).toBe("https://cdn.discordapp.com/app-icons/123456789/hash123.jpeg?size=1024");
    });
  });

  describe("applicationAsset", () => {
    it("should generate application asset URL", () => {
      const result = Cdn.applicationAsset("123456789", "asset123");
      expect(result).toBe("https://cdn.discordapp.com/app-assets/123456789/asset123.png");
    });

    it("should generate application asset URL with options", () => {
      const result = Cdn.applicationAsset("123456789", "asset123", { format: "webp", size: 512 });
      expect(result).toBe("https://cdn.discordapp.com/app-assets/123456789/asset123.webp?size=512");
    });
  });

  describe("achievementIcon", () => {
    it("should generate achievement icon URL", () => {
      const result = Cdn.achievementIcon("123456789", "987654321", "icon123");
      expect(result).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/achievements/987654321/icons/icon123.png",
      );
    });

    it("should generate achievement icon URL with options", () => {
      const result = Cdn.achievementIcon("123456789", "987654321", "icon123", {
        format: "jpeg",
        size: 128,
      });
      expect(result).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/achievements/987654321/icons/icon123.jpeg?size=128",
      );
    });
  });

  describe("storePageAsset", () => {
    it("should generate store page asset URL", () => {
      const result = Cdn.storePageAsset("123456789", "asset123");
      expect(result).toBe("https://cdn.discordapp.com/app-assets/123456789/store/asset123.png");
    });

    it("should generate store page asset URL with options", () => {
      const result = Cdn.storePageAsset("123456789", "asset123", { format: "webp", size: 256 });
      expect(result).toBe(
        "https://cdn.discordapp.com/app-assets/123456789/store/asset123.webp?size=256",
      );
    });
  });

  describe("stickerPackBanner", () => {
    it("should generate sticker pack banner URL", () => {
      const result = Cdn.stickerPackBanner("banner123");
      expect(result).toBe(
        "https://cdn.discordapp.com/app-assets/710982414301790216/store/banner123.png",
      );
    });

    it("should generate sticker pack banner URL with options", () => {
      const result = Cdn.stickerPackBanner("banner123", { format: "jpeg", size: 512 });
      expect(result).toBe(
        "https://cdn.discordapp.com/app-assets/710982414301790216/store/banner123.jpeg?size=512",
      );
    });
  });

  describe("teamIcon", () => {
    it("should generate team icon URL", () => {
      const result = Cdn.teamIcon("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/team-icons/123456789/hash123.png");
    });

    it("should generate team icon URL with options", () => {
      const result = Cdn.teamIcon("123456789", "hash123", { format: "webp", size: 64 });
      expect(result).toBe("https://cdn.discordapp.com/team-icons/123456789/hash123.webp?size=64");
    });
  });

  describe("sticker", () => {
    it("should generate sticker URL with default format and media proxy", () => {
      const result = Cdn.sticker("123456789");
      expect(result).toBe("https://cdn.discordapp.com/stickers/123456789.png");
    });

    it("should generate sticker URL with gif format and media proxy", () => {
      const result = Cdn.sticker("123456789", { format: "gif" });
      expect(result).toBe("https://media.discordapp.net/stickers/123456789.gif");
    });

    it("should generate sticker URL with gif format, size and media proxy", () => {
      const result = Cdn.sticker("123456789", { format: "gif", size: 128 });
      expect(result).toBe("https://media.discordapp.net/stickers/123456789.gif?size=128");
    });

    it("should generate sticker URL without media proxy when disabled", () => {
      const result = Cdn.sticker("123456789", { format: "gif", useMediaProxy: false });
      expect(result).toBe("https://cdn.discordapp.com/stickers/123456789.gif");
    });

    it("should generate sticker URL with custom format", () => {
      const result = Cdn.sticker("123456789", { format: "json" });
      expect(result).toBe("https://cdn.discordapp.com/stickers/123456789.json");
    });

    it("should generate sticker URL with size for non-gif format", () => {
      const result = Cdn.sticker("123456789", { format: "png", size: 256 });
      expect(result).toBe("https://cdn.discordapp.com/stickers/123456789.png?size=256");
    });
  });

  describe("roleIcon", () => {
    it("should generate role icon URL", () => {
      const result = Cdn.roleIcon("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/role-icons/123456789/hash123.png");
    });

    it("should generate role icon URL with options", () => {
      const result = Cdn.roleIcon("123456789", "hash123", { format: "webp", size: 32 });
      expect(result).toBe("https://cdn.discordapp.com/role-icons/123456789/hash123.webp?size=32");
    });
  });

  describe("guildScheduledEventCover", () => {
    it("should generate guild scheduled event cover URL", () => {
      const result = Cdn.guildScheduledEventCover("123456789", "hash123");
      expect(result).toBe("https://cdn.discordapp.com/guild-events/123456789/hash123.png");
    });

    it("should generate guild scheduled event cover URL with options", () => {
      const result = Cdn.guildScheduledEventCover("123456789", "hash123", {
        format: "jpeg",
        size: 1024,
      });
      expect(result).toBe(
        "https://cdn.discordapp.com/guild-events/123456789/hash123.jpeg?size=1024",
      );
    });
  });

  describe("guildMemberBanner", () => {
    it("should generate guild member banner URL", () => {
      const result = Cdn.guildMemberBanner("123456789", "987654321", "hash123");
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/hash123.png",
      );
    });

    it("should generate guild member banner URL with animated hash", () => {
      const result = Cdn.guildMemberBanner("123456789", "987654321", "a_hash123");
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/a_hash123.gif",
      );
    });

    it("should generate guild member banner URL with options", () => {
      const result = Cdn.guildMemberBanner("123456789", "987654321", "hash123", {
        format: "webp",
        size: 512,
      });
      expect(result).toBe(
        "https://cdn.discordapp.com/guilds/123456789/users/987654321/banners/hash123.webp?size=512",
      );
    });
  });

  describe("guildTagBadge", () => {
    it("should generate guild tag badge URL", () => {
      const result = Cdn.guildTagBadge("123456789", "badge123");
      expect(result).toBe("https://cdn.discordapp.com/guild-tag-badges/123456789/badge123.png");
    });

    it("should generate guild tag badge URL with options", () => {
      const result = Cdn.guildTagBadge("123456789", "badge123", { format: "webp", size: 64 });
      expect(result).toBe(
        "https://cdn.discordapp.com/guild-tag-badges/123456789/badge123.webp?size=64",
      );
    });
  });

  describe("attachment", () => {
    it("should generate attachment URL with simple filename", () => {
      const result = Cdn.attachment("123456789", "987654321", "file.txt");
      expect(result).toBe("https://cdn.discordapp.com/attachments/123456789/987654321/file.txt");
    });

    it("should generate attachment URL with encoded filename", () => {
      const result = Cdn.attachment("123456789", "987654321", "file with spaces.txt");
      expect(result).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/file%20with%20spaces.txt",
      );
    });

    it("should generate attachment URL with special characters in filename", () => {
      const result = Cdn.attachment("123456789", "987654321", "file@#$%.txt");
      expect(result).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/file%40%23%24%25.txt",
      );
    });

    it("should generate attachment URL with size option", () => {
      const result = Cdn.attachment("123456789", "987654321", "image.jpg", { size: 512 });
      expect(result).toBe(
        "https://cdn.discordapp.com/attachments/123456789/987654321/image.jpg?size=512",
      );
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle empty hash in getFormatFromHash", () => {
      const result = Cdn.getFormatFromHash("", {});
      expect(result).toBe("png");
    });

    it("should handle very large image sizes", () => {
      const result = Cdn.buildUrl("test/path", 4096);
      expect(result).toBe("https://cdn.discordapp.com/test/path?size=4096");
    });

    it("should handle very small image sizes", () => {
      const result = Cdn.buildUrl("test/path", 16);
      expect(result).toBe("https://cdn.discordapp.com/test/path?size=16");
    });

    it("should handle zero discriminator", () => {
      const result = Cdn.defaultUserAvatar(0);
      expect(result).toBe("https://cdn.discordapp.com/embed/avatars/0.png");
    });

    it("should handle large discriminator values", () => {
      const result = Cdn.defaultUserAvatar(999999);
      expect(result).toBe("https://cdn.discordapp.com/embed/avatars/4.png");
    });
  });

  describe("type assertions", () => {
    it("should return correct URL types", () => {
      const emojiUrl: EmojiUrl = Cdn.emoji("123");
      const guildIconUrl: GuildIconUrl = Cdn.guildIcon("123", "hash");
      const userAvatarUrl: UserAvatarUrl = Cdn.userAvatar("123", "hash");
      const attachmentUrl: AttachmentUrl = Cdn.attachment("123", "456", "file.txt");

      expect(emojiUrl).toMatch(/^https:\/\/cdn\.discordapp\.com\/emojis\//);
      expect(guildIconUrl).toMatch(/^https:\/\/cdn\.discordapp\.com\/icons\//);
      expect(userAvatarUrl).toMatch(/^https:\/\/cdn\.discordapp\.com\/avatars\//);
      expect(attachmentUrl).toMatch(/^https:\/\/cdn\.discordapp\.com\/attachments\//);
    });
  });
});
