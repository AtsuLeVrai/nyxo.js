import {
  type ActionRowEntity,
  type ButtonEntity,
  ButtonStyle,
  ComponentType,
  type ContainerEntity,
  type EmojiEntity,
  type FileEntity,
  type MediaGalleryEntity,
  type SectionEntity,
  type SelectMenuDefaultValueEntity,
  type SeparatorEntity,
  type StringSelectMenuEntity,
  type TextDisplayEntity,
  type TextInputEntity,
  TextInputStyle,
  type ThumbnailEntity,
  type UserSelectMenuEntity,
} from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  ActionRowBuilder,
  ButtonBuilder,
  COMPONENT_LIMITS,
  ChannelSelectMenuBuilder,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SelectMenuDefaultValueBuilder,
  SelectMenuOptionBuilder,
  SeparatorBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  ThumbnailBuilder,
  UserSelectMenuBuilder,
} from "../src/index.js";

describe("ActionRowBuilder", () => {
  it("should create an empty action row", () => {
    expect(() => new ActionRowBuilder().build()).toThrow(
      "Action row must have at least one component",
    );
  });

  it("should add button components", () => {
    const button1 = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Button 1")
      .setCustomId("button_1")
      .build();

    const button2 = new ButtonBuilder()
      .setStyle(ButtonStyle.Secondary)
      .setLabel("Button 2")
      .setCustomId("button_2")
      .build();

    const actionRow = new ActionRowBuilder()
      .addComponent(button1)
      .addComponent(button2)
      .build();

    expect(actionRow.components).toHaveLength(2);
    expect(actionRow.components[0]).toBe(button1);
    expect(actionRow.components[1]).toBe(button2);
  });

  it("should add multiple components at once", () => {
    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Button 1")
        .setCustomId("button_1")
        .build(),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Button 2")
        .setCustomId("button_2")
        .build(),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel("Button 3")
        .setCustomId("button_3")
        .build(),
    ];

    const actionRow = new ActionRowBuilder().addComponents(...buttons).build();

    expect(actionRow.components).toHaveLength(3);
    expect(actionRow.components).toEqual(buttons);
  });

  it("should set components", () => {
    const buttons = [
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Button 1")
        .setCustomId("button_1")
        .build(),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel("Button 2")
        .setCustomId("button_2")
        .build(),
    ];

    const actionRow = new ActionRowBuilder()
      // First add a different component
      .addComponent(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Danger)
          .setLabel("Delete")
          .setCustomId("delete")
          .build(),
      )
      // Then replace it with our buttons
      .setComponents(buttons)
      .build();

    expect(actionRow.components).toHaveLength(2);
    expect(actionRow.components).toEqual(buttons);
  });

  it("should create from existing data", () => {
    const data: Partial<ActionRowEntity> = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Primary,
          label: "Click Me",
          custom_id: "click_me",
        },
      ],
    };

    const actionRow = ActionRowBuilder.from(data).build();

    expect(actionRow.type).toBe(ComponentType.ActionRow);
    expect(actionRow.components).toHaveLength(1);
    expect(actionRow.components[0]?.type).toBe(ComponentType.Button);
    // @ts-expect-error - TypeScript doesn't know about the required property
    expect(actionRow.components[0]?.label).toBe("Click Me");
  });

  it("should add a select menu component", () => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Choose an option")
      .addOption({ label: "Option 1", value: "option_1" })
      .build();

    const actionRow = new ActionRowBuilder().addComponent(selectMenu).build();

    expect(actionRow.components).toHaveLength(1);
    expect(actionRow.components[0]).toBe(selectMenu);
  });

  // Error cases
  it("should throw error if adding more than 5 components", () => {
    const builder = new ActionRowBuilder();

    // Add 5 components
    for (let i = 0; i < 5; i++) {
      builder.addComponent(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Secondary)
          .setLabel(`Button ${i + 1}`)
          .setCustomId(`button_${i + 1}`)
          .build(),
      );
    }

    // Try to add a 6th component
    expect(() => {
      builder.addComponent(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("One More")
          .setCustomId("one_more")
          .build(),
      );
    }).toThrow(
      `Action rows cannot have more than ${COMPONENT_LIMITS.ACTION_ROW_COMPONENTS} components`,
    );
  });

  it("should throw error if mixing select menu with other components", () => {
    const builder = new ActionRowBuilder().addComponent(
      new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Choose an option")
        .addOption({ label: "Option 1", value: "option_1" })
        .build(),
    );

    // Try to add a button to a row with a select menu
    expect(() => {
      builder.addComponent(
        new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setLabel("Button")
          .setCustomId("button")
          .build(),
      );
    }).toThrow("Action rows with select menus cannot contain other components");
  });

  it("should throw error if adding a select menu to a row with buttons", () => {
    const builder = new ActionRowBuilder().addComponent(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("Button")
        .setCustomId("button")
        .build(),
    );

    // Try to add a select menu to a row with buttons
    expect(() => {
      builder.addComponent(
        new StringSelectMenuBuilder()
          .setCustomId("select")
          .setPlaceholder("Choose an option")
          .addOption({ label: "Option 1", value: "option_1" })
          .build(),
      );
    }).toThrow("Action rows with components cannot contain select menus");
  });

  it("should throw error if no components added", () => {
    const builder = new ActionRowBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Action row must have at least one component");
  });
});

describe("ButtonBuilder", () => {
  it("should create a basic button", () => {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me")
      .setCustomId("click_me")
      .build();

    expect(button.type).toBe(ComponentType.Button);
    expect(button.style).toBe(ButtonStyle.Primary);
    expect(button.label).toBe("Click Me");
    expect(button.custom_id).toBe("click_me");
  });

  it("should create a link button", () => {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Visit Website")
      .setUrl("https://example.com")
      .build();

    expect(button.style).toBe(ButtonStyle.Link);
    expect(button.label).toBe("Visit Website");
    expect(button.url).toBe("https://example.com");
    expect(button.custom_id).toBeUndefined();
  });

  it("should set emoji", () => {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Success)
      .setCustomId("approve")
      .setEmoji({ name: "✅" } as Pick<EmojiEntity, "id" | "name" | "animated">)
      .build();

    expect(button.emoji).toEqual({ name: "✅" });
  });

  it("should set disabled state", () => {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Disabled")
      .setCustomId("disabled")
      .setDisabled(true)
      .build();

    expect(button.disabled).toBe(true);
  });

  it("should create a premium button", () => {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId("123456789012345678")
      .build();

    expect(button.style).toBe(ButtonStyle.Premium);
    expect(button.sku_id).toBe("123456789012345678");
    expect(button.custom_id).toBeUndefined();
    expect(button.url).toBeUndefined();
    expect(button.label).toBeUndefined();
    expect(button.emoji).toBeUndefined();
  });

  it("should create from existing data", () => {
    const data: ButtonEntity = {
      type: ComponentType.Button,
      style: ButtonStyle.Primary,
      label: "Click Me",
      custom_id: "click_me",
    };

    const button = ButtonBuilder.from(data).build();

    expect(button).toEqual(data);
  });

  // Error cases
  it("should throw error if style missing", () => {
    const builder = new ButtonBuilder()
      .setLabel("Click Me")
      .setCustomId("click_me");

    expect(() => {
      builder.build();
    }).toThrow("Button style is required");
  });

  it("should throw error if link button missing URL", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Visit Website");

    expect(() => {
      builder.build();
    }).toThrow("Link buttons must have a URL");
  });

  it("should throw error if link button has custom ID", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Visit Website")
      .setUrl("https://example.com")
      .setCustomId("visit");

    expect(() => {
      builder.build();
    }).toThrow("Link buttons cannot have a custom ID");
  });

  it("should throw error if interaction button missing custom ID", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me");

    expect(() => {
      builder.build();
    }).toThrow("Interaction buttons must have a custom ID");
  });

  it("should throw error if interaction button has URL", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me")
      .setCustomId("click_me")
      .setUrl("https://example.com");

    expect(() => {
      builder.build();
    }).toThrow("Interaction buttons cannot have a URL");
  });

  it("should throw error if button has no label or emoji", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId("click_me");

    expect(() => {
      builder.build();
    }).toThrow("Buttons must have either a label or an emoji or both");
  });

  it("should throw error if premium button has label", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId("123456789012345678")
      .setLabel("Premium");

    expect(() => {
      builder.build();
    }).toThrow("Premium buttons cannot have a label");
  });

  it("should throw error if premium button has emoji", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId("123456789012345678")
      .setEmoji({ name: "💎" } as Pick<
        EmojiEntity,
        "id" | "name" | "animated"
      >);

    expect(() => {
      builder.build();
    }).toThrow("Premium buttons cannot have an emoji");
  });

  it("should throw error if premium button has custom ID", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId("123456789012345678")
      .setCustomId("premium");

    expect(() => {
      builder.build();
    }).toThrow("Premium buttons cannot have a custom ID");
  });

  it("should throw error if premium button has URL", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Premium)
      .setSkuId("123456789012345678")
      .setUrl("https://example.com");

    expect(() => {
      builder.build();
    }).toThrow("Premium buttons cannot have a URL");
  });

  it("should throw error if premium button missing SKU ID", () => {
    const builder = new ButtonBuilder().setStyle(ButtonStyle.Premium);

    expect(() => {
      builder.build();
    }).toThrow("Premium buttons must have a SKU ID");
  });

  it("should throw error if non-premium button has SKU ID", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me")
      .setCustomId("click_me")
      .setSkuId("123456789012345678");

    expect(() => {
      builder.build();
    }).toThrow("Only Premium buttons can have a SKU ID");
  });

  it("should throw error on invalid URL", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel("Invalid URL");

    expect(() => {
      builder.setUrl("not-a-url");
    }).toThrow("Invalid URL format");
  });

  it("should throw error on label too long", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setCustomId("click_me");

    expect(() => {
      builder.setLabel("a".repeat(COMPONENT_LIMITS.BUTTON_LABEL + 1));
    }).toThrow();
  });

  it("should throw error on custom ID too long", () => {
    const builder = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me");

    expect(() => {
      builder.setCustomId("a".repeat(COMPONENT_LIMITS.CUSTOM_ID + 1));
    }).toThrow();
  });
});

describe("ContainerBuilder", () => {
  it("should create a basic container", () => {
    const textDisplay = new TextDisplayBuilder()
      .setContent("Hello, world!")
      .build();

    const container = new ContainerBuilder().addComponent(textDisplay).build();

    expect(container.type).toBe(ComponentType.Container);
    expect(container.components).toHaveLength(1);
    expect(container.components[0]).toBe(textDisplay);
  });

  it("should add multiple components", () => {
    const components = [
      new TextDisplayBuilder().setContent("Title").build(),
      new TextDisplayBuilder().setContent("Description").build(),
      new ActionRowBuilder()
        .addComponent(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel("Button")
            .setCustomId("button")
            .build(),
        )
        .build(),
    ];

    const container = new ContainerBuilder()
      .addComponents(...components)
      .build();

    expect(container.components).toHaveLength(3);
    expect(container.components).toEqual(components);
  });

  it("should set accent color", () => {
    const container = new ContainerBuilder()
      .addComponent(
        new TextDisplayBuilder().setContent("Colored container").build(),
      )
      .setAccentColor(0xff0000) // Red
      .build();

    expect(container.accent_color).toBe(0xff0000);
  });

  it("should set spoiler", () => {
    const container = new ContainerBuilder()
      .addComponent(
        new TextDisplayBuilder().setContent("Spoiler content").build(),
      )
      .setSpoiler(true)
      .build();

    expect(container.spoiler).toBe(true);
  });

  it("should set ID", () => {
    const container = new ContainerBuilder()
      .addComponent(new TextDisplayBuilder().setContent("Content").build())
      .setId(123)
      .build();

    expect(container.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: ContainerEntity = {
      type: ComponentType.Container,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: "Hello, world!",
        },
      ],
      accent_color: 0x00ff00,
    };

    const container = ContainerBuilder.from(data).build();

    expect(container.type).toBe(ComponentType.Container);
    expect(container.components).toHaveLength(1);
    expect(container.accent_color).toBe(0x00ff00);
  });

  // Error cases
  it("should throw error if no components added", () => {
    const builder = new ContainerBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Container must have at least one component");
  });

  it("should throw error if too many components added", () => {
    const builder = new ContainerBuilder();

    // Add 10 components
    for (let i = 0; i < 10; i++) {
      builder.addComponent(
        new TextDisplayBuilder().setContent(`Text ${i + 1}`).build(),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addComponent(
        new TextDisplayBuilder().setContent("One more").build(),
      );
    }).toThrow("Containers cannot have more than 10 components");
  });

  it("should throw error on invalid component type", () => {
    const builder = new ContainerBuilder();

    // Try to add an unsupported component type
    expect(() => {
      builder.addComponent({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        label: "Button",
        custom_id: "button",
      } as any);
    }).toThrow(
      "Container only supports ActionRow, TextDisplay, Section, MediaGallery, Separator, and File components",
    );
  });

  it("should throw error on invalid accent color", () => {
    const builder = new ContainerBuilder().addComponent(
      new TextDisplayBuilder().setContent("Content").build(),
    );

    // Color too high
    expect(() => {
      builder.setAccentColor(0x1000000);
    }).toThrow("Accent color must be between 0x000000 and 0xFFFFFF");

    // Color too low
    expect(() => {
      builder.setAccentColor(-1);
    }).toThrow("Accent color must be between 0x000000 and 0xFFFFFF");
  });
});

describe("FileBuilder", () => {
  it("should create a basic file component", () => {
    const file = new FileBuilder()
      .setFile({ url: "attachment://document.pdf" })
      .build();

    expect(file.type).toBe(ComponentType.File);
    expect(file.file).toEqual({ url: "attachment://document.pdf" });
  });

  it("should set spoiler flag", () => {
    const file = new FileBuilder()
      .setFile({ url: "attachment://image.png" })
      .setSpoiler(true)
      .build();

    expect(file.spoiler).toBe(true);
  });

  it("should set ID", () => {
    const file = new FileBuilder()
      .setFile({ url: "attachment://document.pdf" })
      .setId(123)
      .build();

    expect(file.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: FileEntity = {
      type: ComponentType.File,
      file: { url: "attachment://document.pdf" },
      spoiler: true,
    };

    const file = FileBuilder.from(data).build();

    expect(file.type).toBe(ComponentType.File);
    expect(file.file).toEqual({ url: "attachment://document.pdf" });
    expect(file.spoiler).toBe(true);
  });

  // Error cases
  it("should throw error if no file set", () => {
    const builder = new FileBuilder();

    expect(() => {
      builder.build();
    }).toThrow("File component must have a file with a URL");
  });

  it("should throw error if URL does not use attachment:// syntax", () => {
    const builder = new FileBuilder();

    expect(() => {
      builder.setFile({ url: "https://example.com/file.pdf" });
    }).toThrow("File URL must use the attachment:// syntax");

    // Also check at build time
    expect(() =>
      new FileBuilder().setFile({
        url: "https://example.com/file.pdf",
      }),
    ).toThrow("File URL must use the attachment:// syntax");
  });
});

describe("MediaGalleryItemBuilder", () => {
  it("should create a basic media gallery item", () => {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .build();

    expect(item.media).toEqual({ url: "https://example.com/image.png" });
  });

  it("should set description", () => {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .setDescription("A beautiful landscape")
      .build();

    expect(item.description).toBe("A beautiful landscape");
  });

  it("should set spoiler flag", () => {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .setSpoiler(true)
      .build();

    expect(item.spoiler).toBe(true);
  });

  it("should create from existing data", () => {
    const data = {
      media: { url: "https://example.com/image.png" },
      description: "A beautiful landscape",
      spoiler: true,
    };

    const item = MediaGalleryItemBuilder.from(data).build();

    expect(item).toEqual(data);
  });

  // Error cases
  it("should throw error if no media set", () => {
    const builder = new MediaGalleryItemBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Media gallery item must have media with a URL");
  });
});

describe("MediaGalleryBuilder", () => {
  it("should create a basic media gallery", () => {
    const item = new MediaGalleryItemBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .build();

    const gallery = new MediaGalleryBuilder().addItem(item).build();

    expect(gallery.type).toBe(ComponentType.MediaGallery);
    expect(gallery.items).toHaveLength(1);
    expect(gallery.items[0]).toBe(item);
  });

  it("should add multiple items", () => {
    const items = [
      new MediaGalleryItemBuilder()
        .setMedia({ url: "https://example.com/image1.png" })
        .build(),
      new MediaGalleryItemBuilder()
        .setMedia({ url: "https://example.com/image2.png" })
        .build(),
      new MediaGalleryItemBuilder()
        .setMedia({ url: "https://example.com/image3.png" })
        .build(),
    ];

    const gallery = new MediaGalleryBuilder().addItems(...items).build();

    expect(gallery.items).toHaveLength(3);
    expect(gallery.items).toEqual(items);
  });

  it("should set items", () => {
    const items = [
      new MediaGalleryItemBuilder()
        .setMedia({ url: "https://example.com/image1.png" })
        .build(),
      new MediaGalleryItemBuilder()
        .setMedia({ url: "https://example.com/image2.png" })
        .build(),
    ];

    const gallery = new MediaGalleryBuilder()
      // First add a different item
      .addItem(
        new MediaGalleryItemBuilder()
          .setMedia({ url: "https://example.com/old.png" })
          .build(),
      )
      // Then replace with our items
      .setItems(items)
      .build();

    expect(gallery.items).toHaveLength(2);
    expect(gallery.items).toEqual(items);
  });

  it("should set ID", () => {
    const gallery = new MediaGalleryBuilder()
      .addItem(
        new MediaGalleryItemBuilder()
          .setMedia({ url: "https://example.com/image.png" })
          .build(),
      )
      .setId(123)
      .build();

    expect(gallery.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: MediaGalleryEntity = {
      type: ComponentType.MediaGallery,
      items: [
        {
          media: { url: "https://example.com/image.png" },
          description: "An image",
        },
      ],
    };

    const gallery = MediaGalleryBuilder.from(data).build();

    expect(gallery.type).toBe(ComponentType.MediaGallery);
    expect(gallery.items).toHaveLength(1);
    expect(gallery.items[0]?.media.url).toBe("https://example.com/image.png");
  });

  // Error cases
  it("should throw error if no items added", () => {
    const builder = new MediaGalleryBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Media gallery must have at least one item");
  });

  it("should throw error if too many items added", () => {
    const builder = new MediaGalleryBuilder();

    // Add 10 items
    for (let i = 0; i < 10; i++) {
      builder.addItem(
        new MediaGalleryItemBuilder()
          .setMedia({ url: `https://example.com/image${i + 1}.png` })
          .build(),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addItem(
        new MediaGalleryItemBuilder()
          .setMedia({ url: "https://example.com/onemore.png" })
          .build(),
      );
    }).toThrow("Media galleries cannot have more than 10 items");
  });
});

describe("SectionBuilder", () => {
  it("should create a basic section", () => {
    const text = new TextDisplayBuilder().setContent("Section text").build();

    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .build();

    const section = new SectionBuilder()
      .addComponent(text)
      .setAccessory(thumbnail)
      .build();

    expect(section.type).toBe(ComponentType.Section);
    expect(section.components).toHaveLength(1);
    expect(section.components[0]).toBe(text);
    expect(section.accessory).toBe(thumbnail);
  });

  it("should add multiple text components", () => {
    const text1 = new TextDisplayBuilder().setContent("Title").build();

    const text2 = new TextDisplayBuilder().setContent("Subtitle").build();

    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .build();

    const section = new SectionBuilder()
      .addComponent(text1)
      .addComponent(text2)
      .setAccessory(thumbnail)
      .build();

    expect(section.components).toHaveLength(2);
    expect(section.components[0]).toBe(text1);
    expect(section.components[1]).toBe(text2);
  });

  it("should set a button as accessory", () => {
    const text = new TextDisplayBuilder()
      .setContent("Section with button")
      .build();

    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel("Click Me")
      .setCustomId("click_me")
      .build();

    const section = new SectionBuilder()
      .addComponent(text)
      .setAccessory(button)
      .build();

    expect(section.accessory).toBe(button);
  });

  it("should create from existing data", () => {
    const data: SectionEntity = {
      type: ComponentType.Section,
      components: [
        {
          type: ComponentType.TextDisplay,
          content: "Section text",
        },
      ],
      accessory: {
        type: ComponentType.Thumbnail,
        media: { url: "https://example.com/image.png" },
      },
    };

    const section = SectionBuilder.from(data).build();

    expect(section.type).toBe(ComponentType.Section);
    expect(section.components).toHaveLength(1);
    expect(section.components[0]?.type).toBe(ComponentType.TextDisplay);
    expect(section.accessory.type).toBe(ComponentType.Thumbnail);
  });

  // Error cases
  it("should throw error if no text components added", () => {
    const builder = new SectionBuilder().setAccessory(
      new ThumbnailBuilder()
        .setMedia({ url: "https://example.com/image.png" })
        .build(),
    );

    expect(() => {
      builder.build();
    }).toThrow("Section must have at least one text component");
  });

  it("should throw error if no accessory set", () => {
    const builder = new SectionBuilder().addComponent(
      new TextDisplayBuilder().setContent("Section text").build(),
    );

    expect(() => {
      builder.build();
    }).toThrow("Section must have an accessory component");
  });

  it("should throw error if too many text components added", () => {
    const builder = new SectionBuilder().setAccessory(
      new ThumbnailBuilder()
        .setMedia({ url: "https://example.com/image.png" })
        .build(),
    );

    // Add 3 text components
    for (let i = 0; i < 3; i++) {
      builder.addComponent(
        new TextDisplayBuilder().setContent(`Text ${i + 1}`).build(),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addComponent(
        new TextDisplayBuilder().setContent("One more").build(),
      );
    }).toThrow("Sections cannot have more than three text components");
  });

  it("should throw error on non-text component", () => {
    const builder = new SectionBuilder().setAccessory(
      new ThumbnailBuilder()
        .setMedia({ url: "https://example.com/image.png" })
        .build(),
    );

    // Try to add a non-text component
    expect(() => {
      builder.addComponent({
        type: ComponentType.Button,
        style: ButtonStyle.Primary,
        label: "Button",
        custom_id: "button",
      } as any);
    }).toThrow("Section components must be TextDisplay components");
  });

  it("should throw error on invalid accessory type", () => {
    const builder = new SectionBuilder().addComponent(
      new TextDisplayBuilder().setContent("Section text").build(),
    );

    // Try to set an invalid accessory type
    expect(() => {
      builder.setAccessory({
        type: ComponentType.TextDisplay,
        content: "Not a valid accessory",
      } as any);
    }).toThrow("Section accessory must be a Thumbnail or Button component");
  });
});

describe("SelectMenuOptionBuilder", () => {
  it("should create a basic select menu option", () => {
    const option = new SelectMenuOptionBuilder()
      .setLabel("Option 1")
      .setValue("option_1")
      .build();

    expect(option.label).toBe("Option 1");
    expect(option.value).toBe("option_1");
  });

  it("should set description", () => {
    const option = new SelectMenuOptionBuilder()
      .setLabel("Option 1")
      .setValue("option_1")
      .setDescription("This is option 1")
      .build();

    expect(option.description).toBe("This is option 1");
  });

  it("should set emoji", () => {
    const option = new SelectMenuOptionBuilder()
      .setLabel("Option 1")
      .setValue("option_1")
      .setEmoji({ name: "🔥" } as Pick<EmojiEntity, "id" | "name" | "animated">)
      .build();

    expect(option.emoji).toEqual({ name: "🔥" });
  });

  it("should set default flag", () => {
    const option = new SelectMenuOptionBuilder()
      .setLabel("Option 1")
      .setValue("option_1")
      .setDefault(true)
      .build();

    expect(option.default).toBe(true);
  });

  it("should create from existing data", () => {
    const data = {
      label: "Option 1",
      value: "option_1",
      description: "This is option 1",
      default: true,
    };

    const option = SelectMenuOptionBuilder.from(data).build();

    expect(option).toEqual(data);
  });

  // Error cases
  it("should throw error if no label set", () => {
    const builder = new SelectMenuOptionBuilder().setValue("option_1");

    expect(() => {
      builder.build();
    }).toThrow("Select menu option must have a label");
  });

  it("should throw error if no value set", () => {
    const builder = new SelectMenuOptionBuilder().setLabel("Option 1");

    expect(() => {
      builder.build();
    }).toThrow("Select menu option must have a value");
  });

  it("should throw error if label too long", () => {
    const builder = new SelectMenuOptionBuilder().setValue("option_1");

    expect(() => {
      builder.setLabel("a".repeat(COMPONENT_LIMITS.SELECT_OPTION_LABEL + 1));
    }).toThrow();
  });

  it("should throw error if value too long", () => {
    const builder = new SelectMenuOptionBuilder().setLabel("Option 1");

    expect(() => {
      builder.setValue("a".repeat(COMPONENT_LIMITS.SELECT_OPTION_VALUE + 1));
    }).toThrow();
  });

  it("should throw error if description too long", () => {
    const builder = new SelectMenuOptionBuilder()
      .setLabel("Option 1")
      .setValue("option_1");

    expect(() => {
      builder.setDescription(
        "a".repeat(COMPONENT_LIMITS.SELECT_OPTION_DESCRIPTION + 1),
      );
    }).toThrow();
  });
});

describe("SelectMenuDefaultValueBuilder", () => {
  it("should create a basic default value", () => {
    const defaultValue = new SelectMenuDefaultValueBuilder()
      .setId("123456789012345678")
      .setType("user")
      .build();

    expect(defaultValue.id).toBe("123456789012345678");
    expect(defaultValue.type).toBe("user");
  });

  it("should create from existing data", () => {
    const data: Partial<SelectMenuDefaultValueEntity> = {
      id: "123456789012345678",
      type: "role",
    };

    const defaultValue = SelectMenuDefaultValueBuilder.from(data).build();

    expect(defaultValue).toEqual(data);
  });

  // Error cases
  it("should throw error if no ID set", () => {
    const builder = new SelectMenuDefaultValueBuilder().setType("user");

    expect(() => {
      builder.build();
    }).toThrow("Default value must have an ID");
  });

  it("should throw error if no type set", () => {
    const builder = new SelectMenuDefaultValueBuilder().setId(
      "123456789012345678",
    );

    expect(() => {
      builder.build();
    }).toThrow("Default value must have a type");
  });

  it("should throw error on invalid type", () => {
    const builder = new SelectMenuDefaultValueBuilder()
      .setId("123456789012345678")
      .setType("invalid" as any);

    expect(() => {
      builder.build();
    }).toThrow("Default value type must be 'user', 'role', or 'channel'");
  });
});

describe("StringSelectMenuBuilder", () => {
  it("should create a basic string select menu", () => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Choose an option")
      .addOption({ label: "Option 1", value: "option_1" })
      .addOption({ label: "Option 2", value: "option_2" })
      .build();

    expect(selectMenu.type).toBe(ComponentType.StringSelect);
    expect(selectMenu.custom_id).toBe("select");
    expect(selectMenu.placeholder).toBe("Choose an option");
    expect(selectMenu.options).toHaveLength(2);
    expect(selectMenu.options?.[0]?.label).toBe("Option 1");
    expect(selectMenu.options?.[1]?.value).toBe("option_2");
  });

  it("should add multiple options at once", () => {
    const options = [
      { label: "Option 1", value: "option_1" },
      { label: "Option 2", value: "option_2" },
      { label: "Option 3", value: "option_3" },
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOptions(...options)
      .build();

    expect(selectMenu.options).toHaveLength(3);
    expect(selectMenu.options?.map((o) => o.value)).toEqual([
      "option_1",
      "option_2",
      "option_3",
    ]);
  });

  it("should set options", () => {
    const options = [
      { label: "Option A", value: "option_a" },
      { label: "Option B", value: "option_b" },
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      // First add different options
      .addOption({ label: "Old Option", value: "old" })
      // Then replace them
      .setOptions(options)
      .build();

    expect(selectMenu.options).toHaveLength(2);
    expect(selectMenu.options?.[0]?.label).toBe("Option A");
    expect(selectMenu.options?.[1]?.label).toBe("Option B");
  });

  it("should set min and max values", () => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOption({ label: "Option 1", value: "option_1" })
      .addOption({ label: "Option 2", value: "option_2" })
      .addOption({ label: "Option 3", value: "option_3" })
      .setMinValues(1)
      .setMaxValues(2)
      .build();

    expect(selectMenu.min_values).toBe(1);
    expect(selectMenu.max_values).toBe(2);
  });

  it("should set disabled state", () => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOption({ label: "Option 1", value: "option_1" })
      .setDisabled(true)
      .build();

    expect(selectMenu.disabled).toBe(true);
  });

  it("should create from existing data", () => {
    const data: StringSelectMenuEntity = {
      type: ComponentType.StringSelect,
      custom_id: "select",
      placeholder: "Choose an option",
      options: [
        { label: "Option 1", value: "option_1" },
        { label: "Option 2", value: "option_2" },
      ],
    };

    const selectMenu = StringSelectMenuBuilder.from(data).build();

    expect(selectMenu.type).toBe(ComponentType.StringSelect);
    expect(selectMenu.custom_id).toBe("select");
    expect(selectMenu.options).toHaveLength(2);
  });

  // Error cases
  it("should throw error if no custom ID set", () => {
    const builder = new StringSelectMenuBuilder().addOption({
      label: "Option 1",
      value: "option_1",
    });

    expect(() => {
      builder.build();
    }).toThrow("Select menu must have a custom ID");
  });

  it("should throw error if no options added", () => {
    const builder = new StringSelectMenuBuilder().setCustomId("select");

    expect(() => {
      builder.build();
    }).toThrow("String select menu must have at least one option");
  });

  it("should throw error if too many options added", () => {
    const builder = new StringSelectMenuBuilder().setCustomId("select");

    // Add 25 options
    for (let i = 0; i < 25; i++) {
      builder.addOption({ label: `Option ${i + 1}`, value: `option_${i + 1}` });
    }

    // Try to add one more
    expect(() => {
      builder.addOption({ label: "One more", value: "one_more" });
    }).toThrow(
      `Select menus cannot have more than ${COMPONENT_LIMITS.SELECT_OPTIONS} options`,
    );
  });

  it("should throw error if min values greater than max values", () => {
    const builder = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOption({ label: "Option 1", value: "option_1" })
      .setMinValues(3)
      .setMaxValues(2);

    expect(() => {
      builder.build();
    }).toThrow("Minimum values cannot be greater than maximum values");
  });

  it("should throw error on invalid min/max values", () => {
    const builder = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOption({ label: "Option 1", value: "option_1" });

    // Min too low
    expect(() => {
      builder.setMinValues(-1);
    }).toThrow(
      `Minimum values must be between 0 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
    );

    // Min too high
    expect(() => {
      builder.setMinValues(COMPONENT_LIMITS.SELECT_OPTIONS + 1);
    }).toThrow(
      `Minimum values must be between 0 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
    );

    // Max too low
    expect(() => {
      builder.setMaxValues(0);
    }).toThrow(
      `Maximum values must be between 1 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
    );

    // Max too high
    expect(() => {
      builder.setMaxValues(COMPONENT_LIMITS.SELECT_OPTIONS + 1);
    }).toThrow(
      `Maximum values must be between 1 and ${COMPONENT_LIMITS.SELECT_OPTIONS}`,
    );
  });

  it("should throw error on custom ID too long", () => {
    const builder = new StringSelectMenuBuilder().addOption({
      label: "Option 1",
      value: "option_1",
    });

    expect(() => {
      builder.setCustomId("a".repeat(COMPONENT_LIMITS.CUSTOM_ID + 1));
    }).toThrow();
  });

  it("should throw error on placeholder too long", () => {
    const builder = new StringSelectMenuBuilder()
      .setCustomId("select")
      .addOption({ label: "Option 1", value: "option_1" });

    expect(() => {
      builder.setPlaceholder(
        "a".repeat(COMPONENT_LIMITS.SELECT_PLACEHOLDER + 1),
      );
    }).toThrow();
  });
});

describe("UserSelectMenuBuilder", () => {
  it("should create a basic user select menu", () => {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setPlaceholder("Select a user")
      .build();

    expect(selectMenu.type).toBe(ComponentType.UserSelect);
    expect(selectMenu.custom_id).toBe("user_select");
    expect(selectMenu.placeholder).toBe("Select a user");
  });

  it("should add default users", () => {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .addDefaultUser("123456789012345678")
      .build();

    expect(selectMenu.default_values).toHaveLength(1);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[0]?.type).toBe("user");
  });

  it("should set default users", () => {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setDefaultUsers(["123456789012345678", "876543210987654321"])
      .build();

    expect(selectMenu.default_values).toHaveLength(2);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[1]?.id).toBe("876543210987654321");
    expect(selectMenu.default_values?.every((v) => v.type === "user")).toBe(
      true,
    );
  });

  it("should set min and max values", () => {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setMinValues(1)
      .setMaxValues(5)
      .build();

    expect(selectMenu.min_values).toBe(1);
    expect(selectMenu.max_values).toBe(5);
  });

  it("should create from existing data", () => {
    const data: UserSelectMenuEntity = {
      type: ComponentType.UserSelect,
      custom_id: "user_select",
      placeholder: "Select a user",
      default_values: [{ id: "123456789012345678", type: "user" }],
    };

    const selectMenu = UserSelectMenuBuilder.from(data).build();

    expect(selectMenu.type).toBe(ComponentType.UserSelect);
    expect(selectMenu.custom_id).toBe("user_select");
    expect(selectMenu.default_values).toHaveLength(1);
  });

  // Error cases
  it("should throw error if default values type mismatch", () => {
    const builder = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setMinValues(1)
      .setMaxValues(1);

    // Set default_values manually to bypass type checking
    (builder as any).data.default_values = [
      { id: "123456789012345678", type: "role" }, // Wrong type for user select
    ];

    expect(() => {
      builder.build();
    }).toThrow("User select menu can only have user default values");
  });

  it("should throw error if default values count outside min/max range", () => {
    const builder = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setMinValues(2)
      .setMaxValues(3);

    // Add only one default value when min is 2
    builder.addDefaultUser("123456789012345678");

    expect(() => {
      builder.build();
    }).toThrow("User select menu must have at least 2 default values");

    // Now add too many
    const builder2 = new UserSelectMenuBuilder()
      .setCustomId("user_select")
      .setMinValues(1)
      .setMaxValues(2);

    builder2.addDefaultUser("111111111111111111");
    builder2.addDefaultUser("222222222222222222");
    builder2.addDefaultUser("333333333333333333"); // One too many

    expect(() => {
      builder2.build();
    }).toThrow("User select menu cannot have more than 2 default values");
  });
});

describe("RoleSelectMenuBuilder", () => {
  it("should create a basic role select menu", () => {
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId("role_select")
      .setPlaceholder("Select a role")
      .build();

    expect(selectMenu.type).toBe(ComponentType.RoleSelect);
    expect(selectMenu.custom_id).toBe("role_select");
    expect(selectMenu.placeholder).toBe("Select a role");
  });

  it("should add default roles", () => {
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId("role_select")
      .addDefaultRole("123456789012345678")
      .build();

    expect(selectMenu.default_values).toHaveLength(1);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[0]?.type).toBe("role");
  });

  it("should set default roles", () => {
    const selectMenu = new RoleSelectMenuBuilder()
      .setCustomId("role_select")
      .setDefaultRoles(["123456789012345678", "876543210987654321"])
      .build();

    expect(selectMenu.default_values).toHaveLength(2);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[1]?.id).toBe("876543210987654321");
    expect(selectMenu.default_values?.every((v) => v.type === "role")).toBe(
      true,
    );
  });

  // Error cases follow the same pattern as UserSelectMenuBuilder
});

describe("MentionableSelectMenuBuilder", () => {
  it("should create a basic mentionable select menu", () => {
    const selectMenu = new MentionableSelectMenuBuilder()
      .setCustomId("mentionable_select")
      .setPlaceholder("Select a user or role")
      .build();

    expect(selectMenu.type).toBe(ComponentType.MentionableSelect);
    expect(selectMenu.custom_id).toBe("mentionable_select");
    expect(selectMenu.placeholder).toBe("Select a user or role");
  });

  it("should add default users and roles", () => {
    const selectMenu = new MentionableSelectMenuBuilder()
      .setCustomId("mentionable_select")
      .addDefaultUser("111111111111111111")
      .addDefaultRole("222222222222222222")
      .build();

    expect(selectMenu.default_values).toHaveLength(2);
    expect(selectMenu.default_values?.[0]?.id).toBe("111111111111111111");
    expect(selectMenu.default_values?.[0]?.type).toBe("user");
    expect(selectMenu.default_values?.[1]?.id).toBe("222222222222222222");
    expect(selectMenu.default_values?.[1]?.type).toBe("role");
  });

  it("should set default values", () => {
    const values: SelectMenuDefaultValueEntity[] = [
      { id: "111111111111111111", type: "user" },
      { id: "222222222222222222", type: "role" },
    ];

    const selectMenu = new MentionableSelectMenuBuilder()
      .setCustomId("mentionable_select")
      .setDefaultValues(values)
      .build();

    expect(selectMenu.default_values).toHaveLength(2);
    expect(selectMenu.default_values?.[0]?.id).toBe("111111111111111111");
    expect(selectMenu.default_values?.[0]?.type).toBe("user");
    expect(selectMenu.default_values?.[1]?.id).toBe("222222222222222222");
    expect(selectMenu.default_values?.[1]?.type).toBe("role");
  });

  // Error case - invalid type
  it("should throw error if default values have invalid type", () => {
    const builder = new MentionableSelectMenuBuilder().setCustomId(
      "mentionable_select",
    );

    // Set default_values manually to bypass type checking
    (builder as any).data.default_values = [
      { id: "123456789012345678", type: "channel" }, // Wrong type for mentionable select
    ];

    expect(() => {
      builder.build();
    }).toThrow(
      "Mentionable select menu can only have user or role default values",
    );
  });
});

describe("ChannelSelectMenuBuilder", () => {
  it("should create a basic channel select menu", () => {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .setPlaceholder("Select a channel")
      .build();

    expect(selectMenu.type).toBe(ComponentType.ChannelSelect);
    expect(selectMenu.custom_id).toBe("channel_select");
    expect(selectMenu.placeholder).toBe("Select a channel");
  });

  it("should add channel types", () => {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .addChannelType(0) // Text channel
      .addChannelType(2) // Voice channel
      .build();

    expect(selectMenu.channel_types).toEqual([0, 2]);
  });

  it("should set channel types", () => {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .setChannelTypes(0, 2, 5) // Text, Voice, and Announcement channels
      .build();

    expect(selectMenu.channel_types).toEqual([0, 2, 5]);
  });

  it("should add default channels", () => {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .addDefaultChannel("123456789012345678")
      .build();

    expect(selectMenu.default_values).toHaveLength(1);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[0]?.type).toBe("channel");
  });

  it("should set default channels", () => {
    const selectMenu = new ChannelSelectMenuBuilder()
      .setCustomId("channel_select")
      .setDefaultChannels(["123456789012345678", "876543210987654321"])
      .build();

    expect(selectMenu.default_values).toHaveLength(2);
    expect(selectMenu.default_values?.[0]?.id).toBe("123456789012345678");
    expect(selectMenu.default_values?.[1]?.id).toBe("876543210987654321");
    expect(selectMenu.default_values?.every((v) => v.type === "channel")).toBe(
      true,
    );
  });

  // Error case - invalid type
  it("should throw error if default values have invalid type", () => {
    const builder = new ChannelSelectMenuBuilder().setCustomId(
      "channel_select",
    );

    // Set default_values manually to bypass type checking
    (builder as any).data.default_values = [
      { id: "123456789012345678", type: "user" }, // Wrong type for channel select
    ];

    expect(() => {
      builder.build();
    }).toThrow("Channel select menu can only have channel default values");
  });
});

describe("SeparatorBuilder", () => {
  it("should create a basic separator", () => {
    const separator = new SeparatorBuilder().build();

    expect(separator.type).toBe(ComponentType.Separator);
    expect(separator.divider).toBeUndefined(); // Uses default value
  });

  it("should set divider flag", () => {
    const separator = new SeparatorBuilder().setDivider(false).build();

    expect(separator.divider).toBe(false);
  });

  it("should set spacing", () => {
    const separator = new SeparatorBuilder()
      .setSpacing(2) // Large spacing
      .build();

    expect(separator.spacing).toBe(2);
  });

  it("should set ID", () => {
    const separator = new SeparatorBuilder().setId(123).build();

    expect(separator.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: SeparatorEntity = {
      type: ComponentType.Separator,
      divider: false,
      spacing: 2,
    };

    const separator = SeparatorBuilder.from(data).build();

    expect(separator.type).toBe(ComponentType.Separator);
    expect(separator.divider).toBe(false);
    expect(separator.spacing).toBe(2);
  });

  // Error case
  it("should throw error on invalid spacing", () => {
    const builder = new SeparatorBuilder();

    // Spacing must be 1 or 2
    expect(() => {
      builder.setSpacing(3 as any);
    }).toThrow("Separator spacing must be 1 or 2");

    expect(() => {
      builder.setSpacing(0 as any);
    }).toThrow("Separator spacing must be 1 or 2");
  });
});

describe("TextDisplayBuilder", () => {
  it("should create a basic text display", () => {
    const textDisplay = new TextDisplayBuilder()
      .setContent("Hello, world!")
      .build();

    expect(textDisplay.type).toBe(ComponentType.TextDisplay);
    expect(textDisplay.content).toBe("Hello, world!");
  });

  it("should set ID", () => {
    const textDisplay = new TextDisplayBuilder()
      .setContent("Hello, world!")
      .setId(123)
      .build();

    expect(textDisplay.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: TextDisplayEntity = {
      type: ComponentType.TextDisplay,
      content: "Hello, world!",
    };

    const textDisplay = TextDisplayBuilder.from(data).build();

    expect(textDisplay.type).toBe(ComponentType.TextDisplay);
    expect(textDisplay.content).toBe("Hello, world!");
  });

  // Error case
  it("should throw error if no content set", () => {
    const builder = new TextDisplayBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Text display must have content");
  });
});

describe("TextInputBuilder", () => {
  it("should create a basic text input", () => {
    const textInput = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name")
      .build();

    expect(textInput.type).toBe(ComponentType.TextInput);
    expect(textInput.custom_id).toBe("name");
    expect(textInput.style).toBe(TextInputStyle.Short);
    expect(textInput.label).toBe("Name");
  });

  it("should set min and max length", () => {
    const textInput = new TextInputBuilder()
      .setCustomId("password")
      .setStyle(TextInputStyle.Short)
      .setLabel("Password")
      .setMinLength(8)
      .setMaxLength(30)
      .build();

    expect(textInput.min_length).toBe(8);
    expect(textInput.max_length).toBe(30);
  });

  it("should set required flag", () => {
    const textInput = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name")
      .setRequired(false)
      .build();

    expect(textInput.required).toBe(false);
  });

  it("should set value", () => {
    const textInput = new TextInputBuilder()
      .setCustomId("email")
      .setStyle(TextInputStyle.Short)
      .setLabel("Email")
      .setValue("user@example.com")
      .build();

    expect(textInput.value).toBe("user@example.com");
  });

  it("should set placeholder", () => {
    const textInput = new TextInputBuilder()
      .setCustomId("email")
      .setStyle(TextInputStyle.Short)
      .setLabel("Email")
      .setPlaceholder("Enter your email address")
      .build();

    expect(textInput.placeholder).toBe("Enter your email address");
  });

  it("should create from existing data", () => {
    const data: TextInputEntity = {
      type: ComponentType.TextInput,
      custom_id: "name",
      style: TextInputStyle.Short,
      label: "Name",
      required: true,
      placeholder: "Enter your name",
    };

    const textInput = TextInputBuilder.from(data).build();

    expect(textInput.type).toBe(ComponentType.TextInput);
    expect(textInput.custom_id).toBe("name");
    expect(textInput.style).toBe(TextInputStyle.Short);
    expect(textInput.label).toBe("Name");
    expect(textInput.required).toBe(true);
    expect(textInput.placeholder).toBe("Enter your name");
  });

  // Error cases
  it("should throw error if no custom ID set", () => {
    const builder = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setLabel("Name");

    expect(() => {
      builder.build();
    }).toThrow("Text input must have a custom ID");
  });

  it("should throw error if no style set", () => {
    const builder = new TextInputBuilder().setCustomId("name").setLabel("Name");

    expect(() => {
      builder.build();
    }).toThrow("Text input must have a style");
  });

  it("should throw error if no label set", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short);

    expect(() => {
      builder.build();
    }).toThrow("Text input must have a label");
  });

  it("should throw error if min length greater than max length", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name")
      .setMinLength(30)
      .setMaxLength(20);

    expect(() => {
      builder.build();
    }).toThrow("Minimum length cannot be greater than maximum length");
  });

  it("should throw error on invalid min/max length", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name");

    // Min too low
    expect(() => {
      builder.setMinLength(-1);
    }).toThrow(
      `Minimum length must be between 0 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
    );

    // Min too high
    expect(() => {
      builder.setMinLength(COMPONENT_LIMITS.TEXT_INPUT_VALUE + 1);
    }).toThrow(
      `Minimum length must be between 0 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
    );

    // Max too low
    expect(() => {
      builder.setMaxLength(0);
    }).toThrow(
      `Maximum length must be between 1 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
    );

    // Max too high
    expect(() => {
      builder.setMaxLength(COMPONENT_LIMITS.TEXT_INPUT_VALUE + 1);
    }).toThrow(
      `Maximum length must be between 1 and ${COMPONENT_LIMITS.TEXT_INPUT_VALUE}`,
    );
  });

  it("should throw error on custom ID too long", () => {
    const builder = new TextInputBuilder()
      .setStyle(TextInputStyle.Short)
      .setLabel("Name");

    expect(() => {
      builder.setCustomId("a".repeat(COMPONENT_LIMITS.CUSTOM_ID + 1));
    }).toThrow();
  });

  it("should throw error on label too long", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short);

    expect(() => {
      builder.setLabel("a".repeat(COMPONENT_LIMITS.TEXT_INPUT_LABEL + 1));
    }).toThrow();
  });

  it("should throw error on value too long", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name");

    expect(() => {
      builder.setValue("a".repeat(COMPONENT_LIMITS.TEXT_INPUT_VALUE + 1));
    }).toThrow();
  });

  it("should throw error on placeholder too long", () => {
    const builder = new TextInputBuilder()
      .setCustomId("name")
      .setStyle(TextInputStyle.Short)
      .setLabel("Name");

    expect(() => {
      builder.setPlaceholder(
        "a".repeat(COMPONENT_LIMITS.TEXT_INPUT_PLACEHOLDER + 1),
      );
    }).toThrow();
  });
});

describe("ThumbnailBuilder", () => {
  it("should create a basic thumbnail", () => {
    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .build();

    expect(thumbnail.type).toBe(ComponentType.Thumbnail);
    expect(thumbnail.media).toEqual({ url: "https://example.com/image.png" });
  });

  it("should set description", () => {
    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .setDescription("A beautiful image")
      .build();

    expect(thumbnail.description).toBe("A beautiful image");
  });

  it("should set spoiler flag", () => {
    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .setSpoiler(true)
      .build();

    expect(thumbnail.spoiler).toBe(true);
  });

  it("should set ID", () => {
    const thumbnail = new ThumbnailBuilder()
      .setMedia({ url: "https://example.com/image.png" })
      .setId(123)
      .build();

    expect(thumbnail.id).toBe(123);
  });

  it("should create from existing data", () => {
    const data: ThumbnailEntity = {
      type: ComponentType.Thumbnail,
      media: { url: "https://example.com/image.png" },
      description: "A beautiful image",
      spoiler: true,
    };

    const thumbnail = ThumbnailBuilder.from(data).build();

    expect(thumbnail.type).toBe(ComponentType.Thumbnail);
    expect(thumbnail.media).toEqual({ url: "https://example.com/image.png" });
    expect(thumbnail.description).toBe("A beautiful image");
    expect(thumbnail.spoiler).toBe(true);
  });

  // Error case
  it("should throw error if no media set", () => {
    const builder = new ThumbnailBuilder();

    expect(() => {
      builder.build();
    }).toThrow("Thumbnail must have media with a URL");
  });
});
