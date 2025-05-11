import {
  ApplicationCommandEntryPointType,
  ApplicationCommandType,
} from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  COMMAND_LIMITS,
  EntryPointCommandBuilder,
  MessageCommandBuilder,
  SlashCommandBuilder,
  UserCommandBuilder,
} from "../src/index.js";

describe("SlashCommandBuilder", () => {
  it("should create a valid slash command", () => {
    const command = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .build();

    expect(command.type).toBe(ApplicationCommandType.ChatInput);
    expect(command.name).toBe("ping");
    expect(command.description).toBe("Replies with Pong!");
  });

  it("should convert names to lowercase for slash commands", () => {
    const command = new SlashCommandBuilder()
      .setName("PiNg")
      .setDescription("Replies with Pong!")
      .build();

    expect(command.name).toBe("ping");
  });

  it("should set localizations", () => {
    const command = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .setNameLocalizations({
        fr: "ping-fr",
        "es-ES": "ping-es",
      })
      .setDescriptionLocalizations({
        fr: "Répond avec Pong!",
        "es-ES": "¡Responde con Pong!",
      })
      .build();

    expect(command.name_localizations).toEqual({
      fr: "ping-fr",
      "es-ES": "ping-es",
    });
    expect(command.description_localizations).toEqual({
      fr: "Répond avec Pong!",
      "es-ES": "¡Responde con Pong!",
    });
  });

  it("should set nsfw flag", () => {
    const command = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .setNsfw(true)
      .build();

    expect(command.nsfw).toBe(true);
  });

  it("should set default member permissions", () => {
    const command = new SlashCommandBuilder()
      .setName("admin")
      .setDescription("Admin only command")
      .setDefaultMemberPermissions("8") // Administrator permission
      .build();

    expect(command.default_member_permissions).toBe("8");
  });

  it("should set integration types and contexts", () => {
    const command = new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Replies with Pong!")
      .setIntegrationTypes(0, 1)
      .setContexts(0, 1)
      .build();

    expect(command.integration_types).toEqual([0, 1]);
    expect(command.contexts).toEqual([0, 1]);
  });

  it("should add string options", () => {
    const command = new SlashCommandBuilder()
      .setName("echo")
      .setDescription("Echoes your text")
      .addStringOption((option) =>
        option
          .setName("input")
          .setDescription("The input to echo back")
          .setRequired(true),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(3); // String option type
    expect(command.options?.[0]?.name).toBe("input");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.required).toBe(true);
  });

  it("should add integer options", () => {
    const command = new SlashCommandBuilder()
      .setName("roll")
      .setDescription("Roll a die")
      .addIntegerOption((option) =>
        option
          .setName("sides")
          .setDescription("Number of sides on the die")
          .setMinValue(2)
          .setMaxValue(100),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(4); // Integer option type
    expect(command.options?.[0]?.name).toBe("sides");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.min_value).toBe(2);
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.max_value).toBe(100);
  });

  it("should add number options", () => {
    const command = new SlashCommandBuilder()
      .setName("calculate")
      .setDescription("Performs a calculation")
      .addNumberOption((option) =>
        option
          .setName("value")
          .setDescription("A decimal value")
          .setMinValue(0)
          .setMaxValue(10),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(10); // Number option type
    expect(command.options?.[0]?.name).toBe("value");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.min_value).toBe(0);
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.max_value).toBe(10);
  });

  it("should add boolean options", () => {
    const command = new SlashCommandBuilder()
      .setName("settings")
      .setDescription("Change settings")
      .addBooleanOption((option) =>
        option
          .setName("enabled")
          .setDescription("Whether the feature is enabled"),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(5); // Boolean option type
    expect(command.options?.[0]?.name).toBe("enabled");
  });

  it("should add user options", () => {
    const command = new SlashCommandBuilder()
      .setName("info")
      .setDescription("Get user info")
      .addUserOption((option) =>
        option
          .setName("target")
          .setDescription("User to get info about")
          .setRequired(true),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(6); // User option type
    expect(command.options?.[0]?.name).toBe("target");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.required).toBe(true);
  });

  it("should add channel options", () => {
    const command = new SlashCommandBuilder()
      .setName("announce")
      .setDescription("Make an announcement")
      .addChannelOption(
        (option) =>
          option
            .setName("channel")
            .setDescription("Channel to announce in")
            .addChannelType(0), // Text channel
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(7); // Channel option type
    expect(command.options?.[0]?.name).toBe("channel");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.channel_types).toEqual([0]);
  });

  it("should add role options", () => {
    const command = new SlashCommandBuilder()
      .setName("role")
      .setDescription("Get role info")
      .addRoleOption((option) =>
        option.setName("target").setDescription("Role to get info about"),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(8); // Role option type
    expect(command.options?.[0]?.name).toBe("target");
  });

  it("should add mentionable options", () => {
    const command = new SlashCommandBuilder()
      .setName("mention")
      .setDescription("Mention something")
      .addMentionableOption((option) =>
        option.setName("target").setDescription("What to mention"),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(9); // Mentionable option type
    expect(command.options?.[0]?.name).toBe("target");
  });

  it("should add attachment options", () => {
    const command = new SlashCommandBuilder()
      .setName("upload")
      .setDescription("Upload a file")
      .addAttachmentOption((option) =>
        option
          .setName("file")
          .setDescription("The file to upload")
          .setRequired(true),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(11); // Attachment option type
    expect(command.options?.[0]?.name).toBe("file");
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(command.options?.[0]?.required).toBe(true);
  });

  it("should add subcommands", () => {
    const command = new SlashCommandBuilder()
      .setName("moderation")
      .setDescription("Moderation commands")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("ban")
          .setDescription("Ban a user")
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("The user to ban")
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("kick")
          .setDescription("Kick a user")
          .addUserOption((option) =>
            option
              .setName("user")
              .setDescription("The user to kick")
              .setRequired(true),
          ),
      )
      .build();

    expect(command.options).toHaveLength(2);
    expect(command.options?.[0]?.type).toBe(1); // Subcommand type
    expect(command.options?.[0]?.name).toBe("ban");
    expect(command.options?.[0]?.options).toHaveLength(1);
    expect(command.options?.[1]?.name).toBe("kick");
  });

  it("should add subcommand groups", () => {
    const command = new SlashCommandBuilder()
      .setName("settings")
      .setDescription("Manage settings")
      .addSubcommandGroup((group) =>
        group
          .setName("notifications")
          .setDescription("Manage notification settings")
          .addSubcommand((subcommand) =>
            subcommand.setName("enable").setDescription("Enable notifications"),
          )
          .addSubcommand((subcommand) =>
            subcommand
              .setName("disable")
              .setDescription("Disable notifications"),
          ),
      )
      .build();

    expect(command.options).toHaveLength(1);
    expect(command.options?.[0]?.type).toBe(2); // Subcommand group type
    expect(command.options?.[0]?.name).toBe("notifications");
    expect(command.options?.[0]?.options).toHaveLength(2);
    expect(command.options?.[0]?.options?.[0]?.name).toBe("enable");
    expect(command.options?.[0]?.options?.[1]?.name).toBe("disable");
  });

  // Error cases
  it("should throw error on invalid name", () => {
    const builder = new SlashCommandBuilder().setDescription("Test command");

    // Name too long
    expect(() => {
      builder.setName("a".repeat(COMMAND_LIMITS.NAME + 1));
    }).toThrow();

    // Invalid characters
    expect(() => {
      builder.setName("invalid!name");
    }).toThrow();
  });

  it("should throw error on invalid description", () => {
    const builder = new SlashCommandBuilder().setName("test");

    // Description too long
    expect(() => {
      builder.setDescription("a".repeat(COMMAND_LIMITS.DESCRIPTION + 1));
    }).toThrow();
  });

  it("should throw error on mixed option types", () => {
    const builder = new SlashCommandBuilder()
      .setName("test")
      .setDescription("Test command")
      .addStringOption((option) =>
        option.setName("string").setDescription("A string option"),
      );

    expect(() => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName("sub").setDescription("A subcommand"),
      );
    }).toThrow("Commands with subcommands cannot also have other option types");
  });

  it("should throw error on duplicate option names", () => {
    const builder = new SlashCommandBuilder()
      .setName("test")
      .setDescription("Test command")
      .addStringOption((option) =>
        option.setName("option").setDescription("First option"),
      );

    expect(() => {
      builder
        .addStringOption((option) =>
          option.setName("option").setDescription("Duplicate option"),
        )
        .build();
    }).toThrow("Duplicate option name");
  });

  it("should throw error on too many options", () => {
    const builder = new SlashCommandBuilder()
      .setName("test")
      .setDescription("Test command");

    // Add maximum number of options
    for (let i = 0; i < COMMAND_LIMITS.OPTIONS; i++) {
      builder.addStringOption((option) =>
        option.setName(`option${i}`).setDescription(`Option ${i}`),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addStringOption((option) =>
        option.setName("onemore").setDescription("One more option"),
      );
    }).toThrow(
      `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a command`,
    );
  });
});

describe("UserCommandBuilder", () => {
  it("should create a valid user command", () => {
    const command = new UserCommandBuilder().setName("User Info").build();

    expect(command.type).toBe(ApplicationCommandType.User);
    expect(command.name).toBe("User Info");
    expect(command.description).toBe(""); // User commands have empty descriptions
  });

  it("should not force lowercase for user commands", () => {
    const command = new UserCommandBuilder().setName("View Profile").build();

    expect(command.name).toBe("View Profile");
  });

  it("should set permissions and integration types", () => {
    const command = new UserCommandBuilder()
      .setName("Ban User")
      .setDefaultMemberPermissions("8") // Administrator permission
      .setIntegrationTypes(1)
      .setContexts(0)
      .build();

    expect(command.default_member_permissions).toBe("8");
    expect(command.integration_types).toEqual([1]);
    expect(command.contexts).toEqual([0]);
  });

  // Error cases
  it("should throw error if trying to add options", () => {
    const builder = new UserCommandBuilder().setName("User Profile");

    expect(() => {
      // @ts-expect-error - UserCommandBuilder doesn't have addStringOption
      builder.addStringOption((option) =>
        option.setName("option").setDescription("This should fail"),
      );
    }).toThrow();
  });

  it("should throw error on invalid name", () => {
    const builder = new UserCommandBuilder();

    // Name too long
    expect(() => {
      builder.setName("a".repeat(COMMAND_LIMITS.NAME + 1));
    }).toThrow();

    // Empty name
    expect(() => {
      builder.setName("").build();
    }).toThrow("Command name cannot be empty");
  });
});

describe("MessageCommandBuilder", () => {
  it("should create a valid message command", () => {
    const command = new MessageCommandBuilder()
      .setName("Report Message")
      .build();

    expect(command.type).toBe(ApplicationCommandType.Message);
    expect(command.name).toBe("Report Message");
    expect(command.description).toBe(""); // Message commands have empty descriptions
  });

  it("should not force lowercase for message commands", () => {
    const command = new MessageCommandBuilder().setName("Pin Message").build();

    expect(command.name).toBe("Pin Message");
  });

  it("should set permissions and nsfw flag", () => {
    const command = new MessageCommandBuilder()
      .setName("Delete Message")
      .setDefaultMemberPermissions("8") // Administrator permission
      .setNsfw(true)
      .build();

    expect(command.default_member_permissions).toBe("8");
    expect(command.nsfw).toBe(true);
  });

  // Error cases
  it("should throw error if trying to add options", () => {
    const builder = new MessageCommandBuilder().setName("Translate Message");

    expect(() => {
      // @ts-expect-error - MessageCommandBuilder doesn't have addStringOption
      builder.addStringOption((option) =>
        option.setName("language").setDescription("Target language"),
      );
    }).toThrow();
  });
});

describe("EntryPointCommandBuilder", () => {
  it("should create a valid entry point command", () => {
    const command = new EntryPointCommandBuilder()
      .setName("Launch Game")
      .setDescription("Launch the game activity")
      .setHandler(ApplicationCommandEntryPointType.DiscordLaunchActivity)
      .build();

    expect(command.type).toBe(ApplicationCommandType.PrimaryEntryPoint);
    expect(command.name).toBe("Launch Game");
    expect(command.description).toBe("Launch the game activity");
    expect(command.handler).toBe(
      ApplicationCommandEntryPointType.DiscordLaunchActivity,
    );
  });

  it("should set default handler if not specified", () => {
    const command = new EntryPointCommandBuilder()
      .setName("Start Activity")
      .setDescription("Start a new activity")
      .build();

    expect(command.handler).toBe(
      ApplicationCommandEntryPointType.DiscordLaunchActivity,
    );
  });

  it("should set localizations", () => {
    const command = new EntryPointCommandBuilder()
      .setName("start")
      .setDescription("Start the activity")
      .setNameLocalizations({
        fr: "démarrer",
        "es-ES": "iniciar",
      })
      .setDescriptionLocalizations({
        fr: "Démarrer l'activité",
        "es-ES": "Iniciar la actividad",
      })
      .build();

    expect(command.name_localizations).toEqual({
      fr: "démarrer",
      "es-ES": "iniciar",
    });
    expect(command.description_localizations).toEqual({
      fr: "Démarrer l'activité",
      "es-ES": "Iniciar la actividad",
    });
  });

  // Error cases
  it("should throw error if trying to add options", () => {
    const builder = new EntryPointCommandBuilder()
      .setName("start")
      .setDescription("Start the activity");

    expect(() => {
      // @ts-expect-error - EntryPointCommandBuilder doesn't have addStringOption
      builder.addStringOption((option) =>
        option.setName("option").setDescription("This should fail"),
      );
    }).toThrow();
  });

  it("should throw error on invalid description", () => {
    const builder = new EntryPointCommandBuilder().setName("start");

    // Description too long
    expect(() => {
      builder.setDescription("a".repeat(COMMAND_LIMITS.DESCRIPTION + 1));
    }).toThrow();
  });
});
