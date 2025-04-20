import { describe, expect, it } from "vitest";
import { Cdn } from "../src/index.js";

describe("Cdn", () => {
  // Test constants
  const validSnowflake = "123456789012345678";
  const validHash = "abc123def456";
  const animatedHash = "a_abc123def456";

  describe("buildUrl", () => {
    it("should build URL with correct path", () => {
      const url = Cdn.buildUrl(["test", "path"]);
      expect(url).toBe("https://cdn.discordapp.com/test/path");
    });

    it("should include size parameter when provided", () => {
      const url = Cdn.buildUrl(["test"], 256);
      expect(url).toBe("https://cdn.discordapp.com/test?size=256");
    });

    it("should use the media proxy URL when specified", () => {
      const url = Cdn.buildUrl(
        ["test"],
        undefined,
        "https://media.discordapp.net",
      );
      expect(url).toBe("https://media.discordapp.net/test");
    });
  });

  describe("emoji", () => {
    it("should generate correct emoji URL", () => {
      const url = Cdn.emoji(validSnowflake);
      expect(url).toBe(
        `https://cdn.discordapp.com/emojis/${validSnowflake}.png`,
      );
    });

    it("should use format from options", () => {
      const url = Cdn.emoji(validSnowflake, { format: "gif" });
      expect(url).toBe(
        `https://cdn.discordapp.com/emojis/${validSnowflake}.gif`,
      );
    });

    it("should include size parameter", () => {
      const url = Cdn.emoji(validSnowflake, { size: 128 });
      expect(url).toBe(
        `https://cdn.discordapp.com/emojis/${validSnowflake}.png?size=128`,
      );
    });
  });

  describe("guildIcon", () => {
    it("should generate correct guild icon URL", () => {
      const url = Cdn.guildIcon(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/icons/${validSnowflake}/${validHash}.png`,
      );
    });

    it("should use gif for animated hash", () => {
      const url = Cdn.guildIcon(validSnowflake, animatedHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/icons/${validSnowflake}/${animatedHash}.gif`,
      );
    });

    it("should include size parameter", () => {
      const url = Cdn.guildIcon(validSnowflake, validHash, { size: 512 });
      expect(url).toBe(
        `https://cdn.discordapp.com/icons/${validSnowflake}/${validHash}.png?size=512`,
      );
    });
  });

  describe("guildSplash", () => {
    it("should generate correct guild splash URL", () => {
      const url = Cdn.guildSplash(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/splashes/${validSnowflake}/${validHash}.png`,
      );
    });

    it("should use format from options", () => {
      const url = Cdn.guildSplash(validSnowflake, validHash, {
        format: "jpeg",
      });
      expect(url).toBe(
        `https://cdn.discordapp.com/splashes/${validSnowflake}/${validHash}.jpeg`,
      );
    });
  });

  describe("guildDiscoverySplash", () => {
    it("should generate correct guild discovery splash URL", () => {
      const url = Cdn.guildDiscoverySplash(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/discovery-splashes/${validSnowflake}/${validHash}.png`,
      );
    });
  });

  describe("guildBanner", () => {
    it("should generate correct guild banner URL", () => {
      const url = Cdn.guildBanner(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/banners/${validSnowflake}/${validHash}.png`,
      );
    });

    it("should use gif for animated banner", () => {
      const url = Cdn.guildBanner(validSnowflake, animatedHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/banners/${validSnowflake}/${animatedHash}.gif`,
      );
    });
  });

  describe("userBanner", () => {
    it("should generate correct user banner URL", () => {
      const url = Cdn.userBanner(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/banners/${validSnowflake}/${validHash}.png`,
      );
    });
  });

  describe("defaultUserAvatar", () => {
    it("should generate correct default avatar URL for string discriminator", () => {
      const url = Cdn.defaultUserAvatar("1234");
      expect(url).toBe("https://cdn.discordapp.com/embed/avatars/4.png");
    });

    it("should generate correct default avatar URL for number discriminator", () => {
      const url = Cdn.defaultUserAvatar(1234);
      expect(url).toBe("https://cdn.discordapp.com/embed/avatars/4.png");
    });
  });

  describe("defaultUserAvatarSystem", () => {
    it("should generate correct default avatar URL for new username system", () => {
      // Mock the BigInt behavior for testing
      // In reality, the calculation is deterministic based on the user ID
      const url = Cdn.defaultUserAvatarSystem("760123456789012345");
      expect(url).toMatch(
        /https:\/\/cdn\.discordapp\.com\/embed\/avatars\/[0-5]\.png/,
      );
    });
  });

  describe("userAvatar", () => {
    it("should generate correct user avatar URL", () => {
      const url = Cdn.userAvatar(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/avatars/${validSnowflake}/${validHash}.png`,
      );
    });

    it("should use gif for animated avatar", () => {
      const url = Cdn.userAvatar(validSnowflake, animatedHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/avatars/${validSnowflake}/${animatedHash}.gif`,
      );
    });
  });

  describe("guildMemberAvatar", () => {
    it("should generate correct guild member avatar URL", () => {
      const guildId = "987654321098765432";
      const url = Cdn.guildMemberAvatar(guildId, validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/guilds/${guildId}/users/${validSnowflake}/avatars/${validHash}.png`,
      );
    });
  });

  describe("avatarDecoration", () => {
    it("should generate correct avatar decoration URL", () => {
      const assetId = "987654321";
      const url = Cdn.avatarDecoration(assetId);
      expect(url).toBe(
        `https://cdn.discordapp.com/avatar-decoration-presets/${assetId}.png`,
      );
    });
  });

  describe("applicationIcon", () => {
    it("should generate correct application icon URL", () => {
      const url = Cdn.applicationIcon(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-icons/${validSnowflake}/${validHash}.png`,
      );
    });
  });

  describe("applicationCover", () => {
    it("should generate correct application cover URL", () => {
      const url = Cdn.applicationCover(validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-icons/${validSnowflake}/${validHash}.png`,
      );
    });
  });

  describe("applicationAsset", () => {
    it("should generate correct application asset URL", () => {
      const assetId = "asset123";
      const url = Cdn.applicationAsset(validSnowflake, assetId);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-assets/${validSnowflake}/${assetId}.png`,
      );
    });
  });

  describe("achievementIcon", () => {
    it("should generate correct achievement icon URL", () => {
      const achievementId = "456789123";
      const url = Cdn.achievementIcon(validSnowflake, achievementId, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-assets/${validSnowflake}/achievements/${achievementId}/icons/${validHash}.png`,
      );
    });
  });

  describe("storePageAsset", () => {
    it("should generate correct store page asset URL", () => {
      const assetId = "storeasset123";
      const url = Cdn.storePageAsset(validSnowflake, assetId);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-assets/${validSnowflake}/store/${assetId}.png`,
      );
    });
  });

  describe("stickerPackBanner", () => {
    it("should generate correct sticker pack banner URL", () => {
      const bannerId = "banner123";
      const url = Cdn.stickerPackBanner(bannerId);
      expect(url).toBe(
        `https://cdn.discordapp.com/app-assets/710982414301790216/store/${bannerId}.png`,
      );
    });
  });

  describe("teamIcon", () => {
    it("should generate correct team icon URL", () => {
      const teamId = "567891234";
      const url = Cdn.teamIcon(teamId, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/team-icons/${teamId}/${validHash}.png`,
      );
    });
  });

  describe("sticker", () => {
    it("should generate correct sticker URL", () => {
      const stickerId = "123456789";
      const url = Cdn.sticker(stickerId);
      expect(url).toBe(`https://cdn.discordapp.com/stickers/${stickerId}.png`);
    });

    it("should use media proxy for gif stickers", () => {
      const stickerId = "123456789";
      const url = Cdn.sticker(stickerId, {
        format: "gif",
        useMediaProxy: true,
      });
      expect(url).toBe(
        `https://media.discordapp.net/stickers/${stickerId}.gif`,
      );
    });

    it("should use standard CDN if useMediaProxy is false", () => {
      const stickerId = "123456789";
      const url = Cdn.sticker(stickerId, {
        format: "gif",
        useMediaProxy: false,
      });
      expect(url).toBe(`https://cdn.discordapp.com/stickers/${stickerId}.gif`);
    });
  });

  describe("roleIcon", () => {
    it("should generate correct role icon URL", () => {
      const roleId = "234567891";
      const url = Cdn.roleIcon(roleId, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/role-icons/${roleId}/${validHash}.png`,
      );
    });
  });

  describe("guildScheduledEventCover", () => {
    it("should generate correct scheduled event cover URL", () => {
      const eventId = "345678912";
      const url = Cdn.guildScheduledEventCover(eventId, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/guild-events/${eventId}/${validHash}.png`,
      );
    });
  });

  describe("guildMemberBanner", () => {
    it("should generate correct guild member banner URL", () => {
      const guildId = "987654321098765432";
      const url = Cdn.guildMemberBanner(guildId, validSnowflake, validHash);
      expect(url).toBe(
        `https://cdn.discordapp.com/guilds/${guildId}/users/${validSnowflake}/banners/${validHash}.png`,
      );
    });
  });

  describe("attachment", () => {
    it("should generate correct attachment URL", () => {
      const channelId = "987654321";
      const attachmentId = "123987456";
      const filename = "image.png";
      const url = Cdn.attachment(channelId, attachmentId, filename);
      expect(url).toBe(
        `https://cdn.discordapp.com/attachments/${channelId}/${attachmentId}/${filename}`,
      );
    });

    it("should encode the filename", () => {
      const channelId = "987654321";
      const attachmentId = "123987456";
      const filename = "image with spaces.png";
      const url = Cdn.attachment(channelId, attachmentId, filename);
      expect(url).toBe(
        `https://cdn.discordapp.com/attachments/${channelId}/${attachmentId}/image%20with%20spaces.png`,
      );
    });

    it("should include size parameter", () => {
      const channelId = "987654321";
      const attachmentId = "123987456";
      const filename = "image.png";
      const url = Cdn.attachment(channelId, attachmentId, filename, {
        size: 1024,
      });
      expect(url).toBe(
        `https://cdn.discordapp.com/attachments/${channelId}/${attachmentId}/${filename}?size=1024`,
      );
    });
  });
});
