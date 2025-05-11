import { ApplicationCommandPermissionType } from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  CommandPermissionBuilder,
  GuildCommandPermissionsBuilder,
  MAX_PERMISSIONS,
} from "../src/index.js";

describe("CommandPermissionBuilder", () => {
  it("should create a basic permission", () => {
    const permission = new CommandPermissionBuilder()
      .setId("123456789012345678")
      .setType(ApplicationCommandPermissionType.User)
      .setPermission(true)
      .build();

    expect(permission.id).toBe("123456789012345678");
    expect(permission.type).toBe(ApplicationCommandPermissionType.User);
    expect(permission.permission).toBe(true);
  });

  it("should create from existing data", () => {
    const data = {
      id: "123456789012345678",
      type: ApplicationCommandPermissionType.Role,
      permission: false,
    };

    const permission = CommandPermissionBuilder.from(data).build();

    expect(permission).toEqual(data);
  });

  it("should create a role permission", () => {
    const permission = CommandPermissionBuilder.forRole(
      "123456789012345678",
      true,
    ).build();

    expect(permission.id).toBe("123456789012345678");
    expect(permission.type).toBe(ApplicationCommandPermissionType.Role);
    expect(permission.permission).toBe(true);
  });

  it("should create a user permission", () => {
    const permission = CommandPermissionBuilder.forUser(
      "123456789012345678",
      false,
    ).build();

    expect(permission.id).toBe("123456789012345678");
    expect(permission.type).toBe(ApplicationCommandPermissionType.User);
    expect(permission.permission).toBe(false);
  });

  it("should create a channel permission", () => {
    const permission = CommandPermissionBuilder.forChannel(
      "123456789012345678",
      true,
    ).build();

    expect(permission.id).toBe("123456789012345678");
    expect(permission.type).toBe(ApplicationCommandPermissionType.Channel);
    expect(permission.permission).toBe(true);
  });

  it("should create an @everyone permission", () => {
    const permission = CommandPermissionBuilder.forEveryone(
      "123456789012345678",
      false,
    ).build();

    expect(permission.id).toBe("123456789012345678");
    expect(permission.type).toBe(ApplicationCommandPermissionType.Role);
    expect(permission.permission).toBe(false);
  });

  it("should create an all channels permission", () => {
    const guildId = "123456789012345678";
    const permission = CommandPermissionBuilder.forAllChannels(
      guildId,
      true,
    ).build();

    const expectedId = (BigInt(guildId) - 1n).toString();
    expect(permission.id).toBe(expectedId);
    expect(permission.type).toBe(ApplicationCommandPermissionType.Channel);
    expect(permission.permission).toBe(true);
  });

  // Error cases
  it("should throw error if missing id", () => {
    const builder = new CommandPermissionBuilder()
      .setType(ApplicationCommandPermissionType.User)
      .setPermission(true);

    expect(() => builder.build()).toThrow("Permission ID is required");
  });

  it("should throw error if missing type", () => {
    const builder = new CommandPermissionBuilder()
      .setId("123456789012345678")
      .setPermission(true);

    expect(() => builder.build()).toThrow("Permission type is required");
  });

  it("should throw error if missing permission value", () => {
    const builder = new CommandPermissionBuilder()
      .setId("123456789012345678")
      .setType(ApplicationCommandPermissionType.User);

    expect(() => builder.build()).toThrow("Permission value is required");
  });
});

describe("GuildCommandPermissionsBuilder", () => {
  it("should create a basic guild command permissions", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .addPermission(
        CommandPermissionBuilder.forRole("111111111111111111", true).build(),
      )
      .build();

    expect(permissions.id).toBe("123456789012345678");
    expect(permissions.application_id).toBe("876543210987654321");
    expect(permissions.guild_id).toBe("555555555555555555");
    expect(permissions.permissions).toHaveLength(1);
    expect(permissions.permissions[0]?.id).toBe("111111111111111111");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[0]?.permission).toBe(true);
  });

  it("should create from existing data", () => {
    const data = {
      id: "123456789012345678",
      application_id: "876543210987654321",
      guild_id: "555555555555555555",
      permissions: [
        {
          id: "111111111111111111",
          type: ApplicationCommandPermissionType.Role,
          permission: true,
        },
      ],
    };

    const permissions = GuildCommandPermissionsBuilder.from(data).build();

    expect(permissions).toEqual(data);
  });

  it("should add multiple permissions", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .addPermission(
        CommandPermissionBuilder.forRole("111111111111111111", true).build(),
      )
      .addPermission(
        CommandPermissionBuilder.forUser("222222222222222222", true).build(),
      )
      .addPermission((builder) =>
        builder
          .setId("333333333333333333")
          .setType(ApplicationCommandPermissionType.Channel)
          .setPermission(false),
      )
      .build();

    expect(permissions.permissions).toHaveLength(3);
    expect(permissions.permissions[0]?.id).toBe("111111111111111111");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[1]?.id).toBe("222222222222222222");
    expect(permissions.permissions[1]?.type).toBe(
      ApplicationCommandPermissionType.User,
    );
    expect(permissions.permissions[2]?.id).toBe("333333333333333333");
    expect(permissions.permissions[2]?.type).toBe(
      ApplicationCommandPermissionType.Channel,
    );
  });

  it("should add permissions array", () => {
    const permsArray = [
      {
        id: "111111111111111111",
        type: ApplicationCommandPermissionType.Role,
        permission: true,
      },
      {
        id: "222222222222222222",
        type: ApplicationCommandPermissionType.User,
        permission: false,
      },
    ];

    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .addPermissions(permsArray)
      .build();

    expect(permissions.permissions).toHaveLength(2);
    expect(permissions.permissions).toEqual(permsArray);
  });

  it("should set permissions", () => {
    const permsArray = [
      {
        id: "111111111111111111",
        type: ApplicationCommandPermissionType.Role,
        permission: true,
      },
      {
        id: "222222222222222222",
        type: ApplicationCommandPermissionType.User,
        permission: false,
      },
    ];

    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      // Add some permissions first
      .addPermission(
        CommandPermissionBuilder.forUser("999999999999999999", true).build(),
      )
      // Then replace them all
      .setPermissions(permsArray)
      .build();

    expect(permissions.permissions).toHaveLength(2);
    expect(permissions.permissions).toEqual(permsArray);
  });

  it("should restrict to channels", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .restrictToChannels(["111111111111111111", "222222222222222222"])
      .build();

    expect(permissions.permissions).toHaveLength(3);

    // First two permissions should be the allowed channels
    expect(permissions.permissions[0]?.id).toBe("111111111111111111");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Channel,
    );
    expect(permissions.permissions[0]?.permission).toBe(true);

    expect(permissions.permissions[1]?.id).toBe("222222222222222222");
    expect(permissions.permissions[1]?.type).toBe(
      ApplicationCommandPermissionType.Channel,
    );
    expect(permissions.permissions[1]?.permission).toBe(true);

    // Last permission should be "all other channels" denied
    expect(permissions.permissions[2]?.id).toBe(
      (BigInt("555555555555555555") - 1n).toString(),
    );
    expect(permissions.permissions[2]?.type).toBe(
      ApplicationCommandPermissionType.Channel,
    );
    expect(permissions.permissions[2]?.permission).toBe(false);
  });

  it("should restrict to roles", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .restrictToRoles(["111111111111111111", "222222222222222222"])
      .build();

    expect(permissions.permissions).toHaveLength(3);

    // First two permissions should be the allowed roles
    expect(permissions.permissions[0]?.id).toBe("111111111111111111");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[0]?.permission).toBe(true);

    expect(permissions.permissions[1]?.id).toBe("222222222222222222");
    expect(permissions.permissions[1]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[1]?.permission).toBe(true);

    // Last permission should be @everyone denied
    expect(permissions.permissions[2]?.id).toBe("555555555555555555");
    expect(permissions.permissions[2]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[2]?.permission).toBe(false);
  });

  it("should restrict to users", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .restrictToUsers(["111111111111111111", "222222222222222222"])
      .build();

    expect(permissions.permissions).toHaveLength(3);

    // First two permissions should be the allowed users
    expect(permissions.permissions[0]?.id).toBe("111111111111111111");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.User,
    );
    expect(permissions.permissions[0]?.permission).toBe(true);

    expect(permissions.permissions[1]?.id).toBe("222222222222222222");
    expect(permissions.permissions[1]?.type).toBe(
      ApplicationCommandPermissionType.User,
    );
    expect(permissions.permissions[1]?.permission).toBe(true);

    // Last permission should be @everyone denied
    expect(permissions.permissions[2]?.id).toBe("555555555555555555");
    expect(permissions.permissions[2]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[2]?.permission).toBe(false);
  });

  it("should allow for everyone", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .allowForEveryone()
      .build();

    expect(permissions.permissions).toHaveLength(1);
    expect(permissions.permissions[0]?.id).toBe("555555555555555555");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[0]?.permission).toBe(true);
  });

  it("should restrict to administrators", () => {
    const permissions = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .restrictToAdministrators()
      .build();

    expect(permissions.permissions).toHaveLength(1);
    expect(permissions.permissions[0]?.id).toBe("555555555555555555");
    expect(permissions.permissions[0]?.type).toBe(
      ApplicationCommandPermissionType.Role,
    );
    expect(permissions.permissions[0]?.permission).toBe(false);
  });

  // Error cases
  it("should throw error if missing command ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555")
      .addPermission(
        CommandPermissionBuilder.forRole("111111111111111111", true).build(),
      );

    expect(() => builder.build()).toThrow("Command ID is required");
  });

  it("should throw error if missing application ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setGuildId("555555555555555555")
      .addPermission(
        CommandPermissionBuilder.forRole("111111111111111111", true).build(),
      );

    expect(() => builder.build()).toThrow("Application ID is required");
  });

  it("should throw error if missing guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .addPermission(
        CommandPermissionBuilder.forRole("111111111111111111", true).build(),
      );

    expect(() => builder.build()).toThrow("Guild ID is required");
  });

  it("should throw error if no permissions added", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555");

    expect(() => builder.build()).toThrow(
      "At least one permission is required",
    );
  });

  it("should throw error on too many permissions", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321")
      .setGuildId("555555555555555555");

    // Add maximum number of permissions
    for (let i = 0; i < MAX_PERMISSIONS; i++) {
      builder.addPermission(
        CommandPermissionBuilder.forUser(
          `${1000000000000000000 + i}`,
          true,
        ).build(),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addPermission(
        CommandPermissionBuilder.forUser("999999999999999999", true).build(),
      );
    }).toThrow(
      `Cannot add more than ${MAX_PERMISSIONS} permissions to a command`,
    );
  });

  it("should throw error if restrictToChannels called without guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321");

    expect(() => {
      builder.restrictToChannels(["111111111111111111"]);
    }).toThrow("Guild ID must be set before using restrictToChannels");
  });

  it("should throw error if restrictToRoles called without guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321");

    expect(() => {
      builder.restrictToRoles(["111111111111111111"]);
    }).toThrow("Guild ID must be set before using restrictToRoles");
  });

  it("should throw error if restrictToUsers called without guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321");

    expect(() => {
      builder.restrictToUsers(["111111111111111111"]);
    }).toThrow("Guild ID must be set before using restrictToUsers");
  });

  it("should throw error if allowForEveryone called without guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321");

    expect(() => {
      builder.allowForEveryone();
    }).toThrow("Guild ID must be set before using allowForEveryone");
  });

  it("should throw error if restrictToAdministrators called without guild ID", () => {
    const builder = new GuildCommandPermissionsBuilder()
      .setCommandId("123456789012345678")
      .setApplicationId("876543210987654321");

    expect(() => {
      builder.restrictToAdministrators();
    }).toThrow("Guild ID must be set before using restrictToAdministrators");
  });
});
