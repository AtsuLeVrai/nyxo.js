import { describe, expect, it } from "vitest";
import { PremiumType, UserFlags, UserSchema } from "../../src/index.js";

describe("UserSchema", () => {
  it("should validate a valid user", () => {
    const validUser = {
      id: "123456789012345678",
      username: "ValidUser",
      discriminator: "1234",
      global_name: "Global User",
      avatar: "abc123",
      bot: false,
      flags: UserFlags.verifiedBot,
      premium_type: PremiumType.nitro,
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it("should reject invalid username with @ symbol", () => {
    const invalidUser = {
      id: "123456789012345678",
      username: "@invalid",
      discriminator: "1234",
      global_name: null,
      avatar: null,
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it('should reject username "everyone"', () => {
    const invalidUser = {
      id: "123456789012345678",
      username: "everyone",
      discriminator: "1234",
      global_name: null,
      avatar: null,
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it("should validate nullable fields", () => {
    const user = {
      id: "123456789012345678",
      username: "ValidUser",
      discriminator: "1234",
      global_name: null,
      avatar: null,
    };

    const result = UserSchema.safeParse(user);
    expect(result.success).toBe(true);
  });

  it("should validate user with all optional fields", () => {
    const fullUser = {
      id: "123456789012345678",
      username: "ValidUser",
      discriminator: "1234",
      global_name: "Global User",
      avatar: "abc123",
      bot: true,
      system: false,
      mfa_enabled: true,
      banner: "banner123",
      accent_color: 12345,
      locale: "en-US",
      verified: true,
      email: "user@example.com",
      flags: UserFlags.verifiedBot,
      premium_type: PremiumType.nitro,
      public_flags: UserFlags.activeDeveloper,
      avatar_decoration_data: {
        asset: "decoration123",
        sku_id: "987654321098765432",
      },
    };

    const result = UserSchema.safeParse(fullUser);
    expect(result.success).toBe(true);
  });
});
