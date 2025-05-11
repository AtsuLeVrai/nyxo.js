import {
  ApplicationCommandOptionType,
  ButtonStyle,
  ComponentType,
  type EmojiEntity,
} from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  Colors,
  ContainerBuilder,
  EmbedBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SectionBuilder,
  SelectMenuOptionBuilder,
  SeparatorBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from "../src/index.js";

describe("Real-world integration tests", () => {
  describe("Complex slash command with subcommands and options", () => {
    it("should build a moderation command with multiple subcommands and options", () => {
      const command = new SlashCommandBuilder()
        .setName("moderation")
        .setDescription("Server moderation commands")
        .setDefaultMemberPermissions("8") // Administrator permission
        .addSubcommandGroup((group) =>
          group
            .setName("members")
            .setDescription("Member management commands")
            .addSubcommand((sub) =>
              sub
                .setName("timeout")
                .setDescription("Timeout a member")
                .addUserOption((option) =>
                  option
                    .setName("user")
                    .setDescription("The user to timeout")
                    .setRequired(true),
                )
                .addIntegerOption(
                  (option) =>
                    option
                      .setName("duration")
                      .setDescription("Timeout duration in minutes")
                      .setRequired(true)
                      .setMinValue(1)
                      .setMaxValue(10080), // 1 week
                )
                .addStringOption((option) =>
                  option
                    .setName("reason")
                    .setDescription("Reason for the timeout"),
                ),
            )
            .addSubcommand((sub) =>
              sub
                .setName("ban")
                .setDescription("Ban a member")
                .addUserOption((option) =>
                  option
                    .setName("user")
                    .setDescription("The user to ban")
                    .setRequired(true),
                )
                .addIntegerOption((option) =>
                  option
                    .setName("delete_days")
                    .setDescription("Number of days of messages to delete")
                    .setMinValue(0)
                    .setMaxValue(7),
                )
                .addStringOption((option) =>
                  option.setName("reason").setDescription("Reason for the ban"),
                ),
            ),
        )
        .addSubcommandGroup((group) =>
          group
            .setName("messages")
            .setDescription("Message management commands")
            .addSubcommand((sub) =>
              sub
                .setName("purge")
                .setDescription("Delete multiple messages")
                .addIntegerOption((option) =>
                  option
                    .setName("count")
                    .setDescription("Number of messages to delete")
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(100),
                )
                .addUserOption((option) =>
                  option
                    .setName("from")
                    .setDescription("Only delete messages from this user"),
                ),
            ),
        )
        .build();

      // Verify command structure
      expect(command.name).toBe("moderation");
      expect(command.description).toBe("Server moderation commands");
      expect(command.default_member_permissions).toBe("8");

      // Verify subcommand groups
      expect(command.options).toHaveLength(2);
      expect(command.options?.[0]?.name).toBe("members");
      expect(command.options?.[1]?.name).toBe("messages");

      // Verify subcommands
      const membersGroup = command.options?.[0];
      expect(membersGroup?.options).toHaveLength(2);
      expect(membersGroup?.options?.[0]?.name).toBe("timeout");
      expect(membersGroup?.options?.[1]?.name).toBe("ban");

      const messagesGroup = command.options?.[1];
      expect(messagesGroup?.options).toHaveLength(1);
      expect(messagesGroup?.options?.[0]?.name).toBe("purge");

      // Verify subcommand options
      const timeoutCommand = membersGroup?.options?.[0];
      expect(timeoutCommand?.options).toHaveLength(3);

      const timeoutOptions = timeoutCommand?.options || [];
      const userOption = timeoutOptions.find((o) => o.name === "user");
      const durationOption = timeoutOptions.find((o) => o.name === "duration");
      const reasonOption = timeoutOptions.find((o) => o.name === "reason");

      expect(userOption?.type).toBe(ApplicationCommandOptionType.User);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(userOption?.required).toBe(true);

      expect(durationOption?.type).toBe(ApplicationCommandOptionType.Integer);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(durationOption?.required).toBe(true);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(durationOption?.min_value).toBe(1);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(durationOption?.max_value).toBe(10080);

      expect(reasonOption?.type).toBe(ApplicationCommandOptionType.String);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(reasonOption?.required).toBeUndefined();
    });
  });

  describe("Complex UI with multiple component types", () => {
    it("should build a complex message with multiple components", () => {
      // Create text displays
      const titleText = new TextDisplayBuilder()
        .setContent("# Welcome to Our Server!")
        .build();

      const descriptionText = new TextDisplayBuilder()
        .setContent(
          "We're glad to have you here! Please take a moment to explore our server and set up your account.",
        )
        .build();

      // Create a thumbnail
      const thumbnail = new ThumbnailBuilder()
        .setMedia({ url: "https://example.com/logo.png" })
        .setDescription("Server Logo")
        .build();

      // Create a section with the title and thumbnail
      const headerSection = new SectionBuilder()
        .addComponent(titleText)
        .setAccessory(thumbnail)
        .build();

      // Create buttons for getting started
      const rulesButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Server Rules")
        .setCustomId("view_rules")
        .build();

      const rolesButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Choose Roles")
        .setCustomId("choose_roles")
        .build();

      const discordButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Discord Website")
        .setUrl("https://discord.com")
        .build();

      // Create an action row with buttons
      const buttonsRow = new ActionRowBuilder()
        .addComponents(rulesButton, rolesButton, discordButton)
        .build();

      // Create a select menu for role selection
      const roleSelect = new StringSelectMenuBuilder()
        .setCustomId("role_select")
        .setPlaceholder("Select your interests")
        .setMinValues(0)
        .setMaxValues(3)
        .addOptions(
          new SelectMenuOptionBuilder()
            .setLabel("Gaming")
            .setValue("gaming")
            .setDescription("Access gaming channels")
            .setEmoji({ name: "🎮" } as Pick<
              EmojiEntity,
              "id" | "name" | "animated"
            >)
            .build(),
          new SelectMenuOptionBuilder()
            .setLabel("Art")
            .setValue("art")
            .setDescription("Access art channels")
            .setEmoji({ name: "🎨" } as Pick<
              EmojiEntity,
              "id" | "name" | "animated"
            >)
            .build(),
          new SelectMenuOptionBuilder()
            .setLabel("Music")
            .setValue("music")
            .setDescription("Access music channels")
            .setEmoji({ name: "🎵" } as Pick<
              EmojiEntity,
              "id" | "name" | "animated"
            >)
            .build(),
        )
        .build();

      // Create an action row with the select menu
      const selectRow = new ActionRowBuilder().addComponent(roleSelect).build();

      // Create a separator
      const separator = new SeparatorBuilder()
        .setDivider(true)
        .setSpacing(2)
        .build();

      // Create gallery items
      const galleryItems = [
        new MediaGalleryItemBuilder()
          .setMedia({ url: "https://example.com/image1.png" })
          .setDescription("Community Event")
          .build(),
        new MediaGalleryItemBuilder()
          .setMedia({ url: "https://example.com/image2.png" })
          .setDescription("Game Night")
          .build(),
      ];

      // Create a media gallery
      const mediaGallery = new MediaGalleryBuilder()
        .addItems(...galleryItems)
        .build();

      // Create a footer text
      const footerText = new TextDisplayBuilder()
        .setContent("Join our community channels to stay updated!")
        .build();

      // Put all components in a container
      const container = new ContainerBuilder()
        .addComponents(
          headerSection,
          descriptionText,
          buttonsRow,
          separator,
          selectRow,
          mediaGallery,
          footerText,
        )
        .setAccentColor(0x5865f2) // Discord Blurple
        .build();

      // Verify container structure
      expect(container.type).toBe(ComponentType.Container);
      expect(container.components).toHaveLength(7);
      expect(container.accent_color).toBe(0x5865f2);

      // Verify section (first component)
      const section = container.components[0];
      expect(section?.type).toBe(ComponentType.Section);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(section?.components?.[0].content).toBe("# Welcome to Our Server!");
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(section?.accessory?.type).toBe(ComponentType.Thumbnail);

      // Verify text display (second component)
      const description = container.components[1];
      expect(description?.type).toBe(ComponentType.TextDisplay);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(description?.content).toBe(
        "We're glad to have you here! Please take a moment to explore our server and set up your account.",
      );

      // Verify action row with buttons (third component)
      const buttons = container.components[2];
      expect(buttons?.type).toBe(ComponentType.ActionRow);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(buttons?.components).toHaveLength(3);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(buttons?.components?.[0].type).toBe(ComponentType.Button);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(buttons?.components?.[0].label).toBe("Server Rules");
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(buttons?.components?.[1].label).toBe("Choose Roles");
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(buttons?.components?.[2].label).toBe("Discord Website");

      // Verify separator (fourth component)
      const sep = container.components[3];
      expect(sep?.type).toBe(ComponentType.Separator);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(sep?.spacing).toBe(2);

      // Verify action row with select menu (fifth component)
      const select = container.components[4];
      expect(select?.type).toBe(ComponentType.ActionRow);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(select?.components).toHaveLength(1);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(select?.components?.[0].type).toBe(ComponentType.StringSelect);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(select?.components?.[0].placeholder).toBe("Select your interests");
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(select?.components?.[0].options).toHaveLength(3);

      // Verify media gallery (sixth component)
      const gallery = container.components[5];
      expect(gallery?.type).toBe(ComponentType.MediaGallery);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(gallery?.items).toHaveLength(2);

      // Verify footer text (seventh component)
      const footer = container.components[6];
      expect(footer?.type).toBe(ComponentType.TextDisplay);
      // @ts-expect-error - TypeScript doesn't know about the required property
      expect(footer?.content).toBe(
        "Join our community channels to stay updated!",
      );
    });
  });

  describe("Rich Embed Message", () => {
    it("should build a complex embed message", () => {
      const embed = new EmbedBuilder()
        .setTitle("Server Status Report")
        .setDescription("Current status of all server systems.")
        .setColor(Colors.Green)
        .setTimestamp(new Date("2023-05-15T10:30:00Z"))
        .setThumbnail({
          url: "https://example.com/server-icon.png",
        })
        .setAuthor({
          name: "Status Bot",
          icon_url: "https://example.com/bot-icon.png",
        })
        .setFooter({
          text: "Last updated",
          icon_url: "https://example.com/clock-icon.png",
        })
        .addFields(
          {
            name: "🟢 Database",
            value: "Online - 3ms response time",
            inline: true,
          },
          {
            name: "🟢 API Server",
            value: "Online - 42ms response time",
            inline: true,
          },
          {
            name: "🟢 Web Server",
            value: "Online - 127ms response time",
            inline: true,
          },
          {
            name: "🟡 Backup Service",
            value: "Degraded - Running with reduced capacity",
            inline: false,
          },
          {
            name: "📊 System Load",
            value: "CPU: 23% | Memory: 47% | Disk: 62%",
            inline: false,
          },
        )
        .build();

      // Verify embed structure
      expect(embed.title).toBe("Server Status Report");
      expect(embed.description).toBe("Current status of all server systems.");
      expect(embed.color).toBe(Colors.Green);
      expect(embed.timestamp).toBe("2023-05-15T10:30:00.000Z");

      // Verify author
      expect(embed.author?.name).toBe("Status Bot");
      expect(embed.author?.icon_url).toBe("https://example.com/bot-icon.png");

      // Verify footer
      expect(embed.footer?.text).toBe("Last updated");
      expect(embed.footer?.icon_url).toBe("https://example.com/clock-icon.png");

      // Verify thumbnail
      expect(embed.thumbnail?.url).toBe("https://example.com/server-icon.png");

      // Verify fields
      expect(embed.fields).toHaveLength(5);

      // First three fields should be inline
      expect(embed.fields?.[0]?.inline).toBe(true);
      expect(embed.fields?.[1]?.inline).toBe(true);
      expect(embed.fields?.[2]?.inline).toBe(true);

      // Last two fields should not be inline
      expect(embed.fields?.[3]?.inline).toBe(false);
      expect(embed.fields?.[4]?.inline).toBe(false);

      // Check field content
      expect(embed.fields?.[0]?.name).toBe("🟢 Database");
      expect(embed.fields?.[0]?.value).toBe("Online - 3ms response time");

      expect(embed.fields?.[3]?.name).toBe("🟡 Backup Service");
      expect(embed.fields?.[3]?.value).toBe(
        "Degraded - Running with reduced capacity",
      );
    });
  });
});
