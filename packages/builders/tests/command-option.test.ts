import { ApplicationCommandOptionType } from "@nyxojs/core";
import { describe, expect, it } from "vitest";
import {
  AttachmentOptionBuilder,
  BooleanOptionBuilder,
  COMMAND_LIMITS,
  ChannelOptionBuilder,
  IntegerOptionBuilder,
  MentionableOptionBuilder,
  NumberOptionBuilder,
  RoleOptionBuilder,
  StringOptionBuilder,
  SubCommandBuilder,
  SubCommandGroupBuilder,
  UserOptionBuilder,
} from "../src/index.js";

describe("BaseCommandOptionBuilder shared functionality", () => {
  // Using StringOptionBuilder as a concrete implementation to test base class functionality
  it("should set name", () => {
    const option = new StringOptionBuilder()
      .setName("option")
      .setDescription("A test option")
      .build();

    expect(option.name).toBe("option");
  });

  it("should convert option names to lowercase", () => {
    const option = new StringOptionBuilder()
      .setName("OptionName")
      .setDescription("A test option")
      .build();

    expect(option.name).toBe("optionname");
  });

  it("should set name localizations", () => {
    const option = new StringOptionBuilder()
      .setName("option")
      .setDescription("A test option")
      .setNameLocalizations({
        fr: "option-fr",
        "es-ES": "option-es",
      })
      .build();

    expect(option.name_localizations).toEqual({
      fr: "option-fr",
      "es-ES": "option-es",
    });
  });

  it("should set description", () => {
    const option = new StringOptionBuilder()
      .setName("option")
      .setDescription("A test description")
      .build();

    expect(option.description).toBe("A test description");
  });

  it("should set description localizations", () => {
    const option = new StringOptionBuilder()
      .setName("option")
      .setDescription("A test option")
      .setDescriptionLocalizations({
        fr: "Une option de test",
        "es-ES": "Una opción de prueba",
      })
      .build();

    expect(option.description_localizations).toEqual({
      fr: "Une option de test",
      "es-ES": "Una opción de prueba",
    });
  });

  // Error cases for base functionality
  it("should throw error on invalid name", () => {
    const builder = new StringOptionBuilder().setDescription("Test option");

    // Name too long
    expect(() => {
      builder.setName("a".repeat(COMMAND_LIMITS.OPTION_NAME + 1));
    }).toThrow();

    // Invalid characters
    expect(() => {
      builder.setName("invalid!name");
    }).toThrow();
  });

  it("should throw error on invalid description", () => {
    const builder = new StringOptionBuilder().setName("test");

    // Description too long
    expect(() => {
      builder.setDescription("a".repeat(COMMAND_LIMITS.OPTION_DESCRIPTION + 1));
    }).toThrow();
  });
});

describe("StringOptionBuilder", () => {
  it("should create a basic string option", () => {
    const option = new StringOptionBuilder()
      .setName("text")
      .setDescription("A text option")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.String);
    expect(option.name).toBe("text");
    expect(option.description).toBe("A text option");
    expect(option.required).toBeUndefined();
  });

  it("should create a required string option", () => {
    const option = new StringOptionBuilder()
      .setName("text")
      .setDescription("A text option")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  it("should add choices", () => {
    const option = new StringOptionBuilder()
      .setName("color")
      .setDescription("Pick a color")
      .addChoice({ name: "Red", value: "red" })
      .addChoice({ name: "Blue", value: "blue" })
      .build();

    expect(option.choices).toHaveLength(2);
    expect(option.choices?.[0]?.name).toBe("Red");
    expect(option.choices?.[0]?.value).toBe("red");
    expect(option.choices?.[1]?.name).toBe("Blue");
    expect(option.choices?.[1]?.value).toBe("blue");
  });

  it("should add multiple choices at once", () => {
    const option = new StringOptionBuilder()
      .setName("animal")
      .setDescription("Pick an animal")
      .addChoices(
        { name: "Dog", value: "dog" },
        { name: "Cat", value: "cat" },
        { name: "Bird", value: "bird" },
      )
      .build();

    expect(option.choices).toHaveLength(3);
    expect(option.choices?.map((c) => c.value)).toEqual(["dog", "cat", "bird"]);
  });

  it("should set autocomplete", () => {
    const option = new StringOptionBuilder()
      .setName("query")
      .setDescription("Search query")
      .setAutocomplete(true)
      .build();

    expect(option.autocomplete).toBe(true);
  });

  it("should set min and max length", () => {
    const option = new StringOptionBuilder()
      .setName("password")
      .setDescription("Create a password")
      .setMinLength(8)
      .setMaxLength(20)
      .build();

    expect(option.min_length).toBe(8);
    expect(option.max_length).toBe(20);
  });

  // Error cases
  it("should throw error on too many choices", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    // Add maximum number of choices
    for (let i = 0; i < COMMAND_LIMITS.OPTION_CHOICES; i++) {
      builder.addChoice({ name: `Choice ${i}`, value: `value${i}` });
    }

    // Try to add one more
    expect(() => {
      builder.addChoice({ name: "One more", value: "onemore" });
    }).toThrow(
      `Cannot add more than ${COMMAND_LIMITS.OPTION_CHOICES} choices to an option`,
    );
  });

  it("should throw error on choice name too long", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    expect(() => {
      builder.addChoice({
        name: "a".repeat(COMMAND_LIMITS.CHOICE_NAME + 1),
        value: "value",
      });
    }).toThrow();
  });

  it("should throw error on choice value too long", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    expect(() => {
      builder.addChoice({
        name: "Name",
        value: "a".repeat(COMMAND_LIMITS.CHOICE_STRING_VALUE + 1),
      });
    }).toThrow();
  });

  it("should throw error if autocomplete and choices are both specified", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option")
      .addChoice({ name: "Choice", value: "value" })
      .setAutocomplete(true);

    expect(() => {
      builder.build();
    }).toThrow("Autocomplete and choices cannot both be specified");
  });

  it("should throw error if min length greater than max length", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option")
      .setMinLength(20)
      .setMaxLength(10);

    expect(() => {
      builder.build();
    }).toThrow("Minimum length cannot be greater than maximum length");
  });

  it("should throw error on invalid length bounds", () => {
    const builder = new StringOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    expect(() => {
      builder.setMinLength(-1);
    }).toThrow("Minimum length must be between 0 and 6000");

    expect(() => {
      builder.setMaxLength(0);
    }).toThrow("Maximum length must be between 1 and 6000");

    expect(() => {
      builder.setMaxLength(6001);
    }).toThrow("Maximum length must be between 1 and 6000");
  });
});

describe("IntegerOptionBuilder", () => {
  it("should create a basic integer option", () => {
    const option = new IntegerOptionBuilder()
      .setName("count")
      .setDescription("A count value")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Integer);
    expect(option.name).toBe("count");
    expect(option.description).toBe("A count value");
  });

  it("should add choices", () => {
    const option = new IntegerOptionBuilder()
      .setName("dice")
      .setDescription("Pick a dice")
      .addChoice({ name: "D6", value: 6 })
      .addChoice({ name: "D20", value: 20 })
      .build();

    expect(option.choices).toHaveLength(2);
    expect(option.choices?.[0]?.name).toBe("D6");
    expect(option.choices?.[0]?.value).toBe(6);
  });

  it("should set min and max value", () => {
    const option = new IntegerOptionBuilder()
      .setName("age")
      .setDescription("Your age")
      .setMinValue(13)
      .setMaxValue(120)
      .build();

    expect(option.min_value).toBe(13);
    expect(option.max_value).toBe(120);
  });

  it("should set autocomplete", () => {
    const option = new IntegerOptionBuilder()
      .setName("year")
      .setDescription("Pick a year")
      .setAutocomplete(true)
      .build();

    expect(option.autocomplete).toBe(true);
  });

  // Error cases
  it("should throw error on non-integer choice value", () => {
    const builder = new IntegerOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    expect(() => {
      builder.addChoice({ name: "Decimal", value: 10.5 });
    }).toThrow("Choice value must be an integer");
  });

  it("should throw error on non-integer min/max values", () => {
    const builder = new IntegerOptionBuilder()
      .setName("option")
      .setDescription("Test option");

    expect(() => {
      builder.setMinValue(10.5);
    }).toThrow("Minimum value must be an integer");

    expect(() => {
      builder.setMaxValue(20.5);
    }).toThrow("Maximum value must be an integer");
  });

  it("should throw error if min value greater than max value", () => {
    const builder = new IntegerOptionBuilder()
      .setName("option")
      .setDescription("Test option")
      .setMinValue(20)
      .setMaxValue(10);

    expect(() => {
      builder.build();
    }).toThrow("Minimum value cannot be greater than maximum value");
  });
});

describe("NumberOptionBuilder", () => {
  it("should create a basic number option", () => {
    const option = new NumberOptionBuilder()
      .setName("percent")
      .setDescription("A percentage")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Number);
    expect(option.name).toBe("percent");
    expect(option.description).toBe("A percentage");
  });

  it("should add choices with decimal values", () => {
    const option = new NumberOptionBuilder()
      .setName("rating")
      .setDescription("Rate from 1-5")
      .addChoice({ name: "1 Star", value: 1.0 })
      .addChoice({ name: "4.5 Stars", value: 4.5 })
      .build();

    expect(option.choices).toHaveLength(2);
    expect(option.choices?.[0]?.name).toBe("1 Star");
    expect(option.choices?.[0]?.value).toBe(1.0);
    expect(option.choices?.[1]?.name).toBe("4.5 Stars");
    expect(option.choices?.[1]?.value).toBe(4.5);
  });

  it("should set min and max value", () => {
    const option = new NumberOptionBuilder()
      .setName("rating")
      .setDescription("Rating from 0-5")
      .setMinValue(0)
      .setMaxValue(5)
      .build();

    expect(option.min_value).toBe(0);
    expect(option.max_value).toBe(5);
  });

  it("should set required and autocomplete", () => {
    const option = new NumberOptionBuilder()
      .setName("rating")
      .setDescription("Rate from 1-5")
      .setRequired(true)
      .setAutocomplete(true)
      .build();

    expect(option.required).toBe(true);
    expect(option.autocomplete).toBe(true);
  });

  // Error cases
  it("should throw error if min value greater than max value", () => {
    const builder = new NumberOptionBuilder()
      .setName("option")
      .setDescription("Test option")
      .setMinValue(5.5)
      .setMaxValue(3.2);

    expect(() => {
      builder.build();
    }).toThrow("Minimum value cannot be greater than maximum value");
  });

  it("should throw error if both choices and autocomplete are set", () => {
    const builder = new NumberOptionBuilder()
      .setName("option")
      .setDescription("Test option")
      .addChoice({ name: "Choice", value: 1.5 })
      .setAutocomplete(true);

    expect(() => {
      builder.build();
    }).toThrow("Autocomplete and choices cannot both be specified");
  });
});

describe("BooleanOptionBuilder", () => {
  it("should create a basic boolean option", () => {
    const option = new BooleanOptionBuilder()
      .setName("enabled")
      .setDescription("Whether the feature is enabled")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Boolean);
    expect(option.name).toBe("enabled");
    expect(option.description).toBe("Whether the feature is enabled");
  });

  it("should set required flag", () => {
    const option = new BooleanOptionBuilder()
      .setName("enabled")
      .setDescription("Whether the feature is enabled")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  // Boolean options don't have choices, autocomplete, or min/max values
});

describe("UserOptionBuilder", () => {
  it("should create a basic user option", () => {
    const option = new UserOptionBuilder()
      .setName("user")
      .setDescription("Select a user")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.User);
    expect(option.name).toBe("user");
    expect(option.description).toBe("Select a user");
  });

  it("should set required flag", () => {
    const option = new UserOptionBuilder()
      .setName("user")
      .setDescription("Select a user")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  // User options don't have choices, autocomplete, or min/max values
});

describe("ChannelOptionBuilder", () => {
  it("should create a basic channel option", () => {
    const option = new ChannelOptionBuilder()
      .setName("channel")
      .setDescription("Select a channel")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Channel);
    expect(option.name).toBe("channel");
    expect(option.description).toBe("Select a channel");
  });

  it("should add channel types", () => {
    const option = new ChannelOptionBuilder()
      .setName("channel")
      .setDescription("Select a text channel")
      .addChannelType(0) // Text channel
      .build();

    expect(option.channel_types).toEqual([0]);
  });

  it("should add multiple channel types", () => {
    const option = new ChannelOptionBuilder()
      .setName("channel")
      .setDescription("Select a chat channel")
      .addChannelType(0) // Text channel
      .addChannelType(1) // DM
      .addChannelType(2) // Voice channel
      .build();

    expect(option.channel_types).toEqual([0, 1, 2]);
  });

  it("should set channel types directly", () => {
    const option = new ChannelOptionBuilder()
      .setName("channel")
      .setDescription("Select a channel")
      .setChannelTypes([0, 2, 5]) // Text, Voice, Announcement
      .build();

    expect(option.channel_types).toEqual([0, 2, 5]);
  });

  // Channel options don't have choices, autocomplete, or min/max values
});

describe("RoleOptionBuilder", () => {
  it("should create a basic role option", () => {
    const option = new RoleOptionBuilder()
      .setName("role")
      .setDescription("Select a role")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Role);
    expect(option.name).toBe("role");
    expect(option.description).toBe("Select a role");
  });

  it("should set required flag", () => {
    const option = new RoleOptionBuilder()
      .setName("role")
      .setDescription("Select a role")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  // Role options don't have choices, autocomplete, or min/max values
});

describe("MentionableOptionBuilder", () => {
  it("should create a basic mentionable option", () => {
    const option = new MentionableOptionBuilder()
      .setName("mention")
      .setDescription("Mention a user or role")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Mentionable);
    expect(option.name).toBe("mention");
    expect(option.description).toBe("Mention a user or role");
  });

  it("should set required flag", () => {
    const option = new MentionableOptionBuilder()
      .setName("mention")
      .setDescription("Mention a user or role")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  // Mentionable options don't have choices, autocomplete, or min/max values
});

describe("AttachmentOptionBuilder", () => {
  it("should create a basic attachment option", () => {
    const option = new AttachmentOptionBuilder()
      .setName("file")
      .setDescription("Upload a file")
      .build();

    expect(option.type).toBe(ApplicationCommandOptionType.Attachment);
    expect(option.name).toBe("file");
    expect(option.description).toBe("Upload a file");
  });

  it("should set required flag", () => {
    const option = new AttachmentOptionBuilder()
      .setName("file")
      .setDescription("Upload a file")
      .setRequired(true)
      .build();

    expect(option.required).toBe(true);
  });

  // Attachment options don't have choices, autocomplete, or min/max values
});

describe("SubCommandBuilder", () => {
  it("should create a basic subcommand", () => {
    const subcommand = new SubCommandBuilder()
      .setName("create")
      .setDescription("Create a new item")
      .build();

    expect(subcommand.type).toBe(ApplicationCommandOptionType.SubCommand);
    expect(subcommand.name).toBe("create");
    expect(subcommand.description).toBe("Create a new item");
  });

  it("should add options to subcommand", () => {
    const subcommand = new SubCommandBuilder()
      .setName("create")
      .setDescription("Create a new item")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("Name of the item")
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option
          .setName("count")
          .setDescription("Number of items")
          .setMinValue(1),
      )
      .build();

    expect(subcommand.options).toHaveLength(2);
    expect(subcommand.options?.[0]?.type).toBe(
      ApplicationCommandOptionType.String,
    );
    expect(subcommand.options?.[0]?.name).toBe("name");
    expect(subcommand.options?.[1]?.type).toBe(
      ApplicationCommandOptionType.Integer,
    );
    expect(subcommand.options?.[1]?.name).toBe("count");
  });

  it("should support all option types", () => {
    const subcommand = new SubCommandBuilder()
      .setName("test")
      .setDescription("Test all option types")
      .addStringOption((option) =>
        option.setName("string").setDescription("String option"),
      )
      .addIntegerOption((option) =>
        option.setName("integer").setDescription("Integer option"),
      )
      .addNumberOption((option) =>
        option.setName("number").setDescription("Number option"),
      )
      .addBooleanOption((option) =>
        option.setName("boolean").setDescription("Boolean option"),
      )
      .addUserOption((option) =>
        option.setName("user").setDescription("User option"),
      )
      .addChannelOption((option) =>
        option.setName("channel").setDescription("Channel option"),
      )
      .addRoleOption((option) =>
        option.setName("role").setDescription("Role option"),
      )
      .addMentionableOption((option) =>
        option.setName("mentionable").setDescription("Mentionable option"),
      )
      .addAttachmentOption((option) =>
        option.setName("attachment").setDescription("Attachment option"),
      )
      .build();

    expect(subcommand.options).toHaveLength(9);

    const optionTypes = subcommand.options?.map((option) => option.type);
    expect(optionTypes).toContain(ApplicationCommandOptionType.String);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Integer);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Number);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Boolean);
    expect(optionTypes).toContain(ApplicationCommandOptionType.User);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Channel);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Role);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Mentionable);
    expect(optionTypes).toContain(ApplicationCommandOptionType.Attachment);
  });

  // Error cases
  it("should throw error on too many options", () => {
    const builder = new SubCommandBuilder()
      .setName("subcommand")
      .setDescription("Test subcommand");

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
      `Cannot add more than ${COMMAND_LIMITS.OPTIONS} options to a subcommand`,
    );
  });

  it("should throw error on duplicate option names", () => {
    const builder = new SubCommandBuilder()
      .setName("subcommand")
      .setDescription("Test subcommand")
      .addStringOption((option) =>
        option.setName("name").setDescription("First option"),
      );

    expect(() => {
      builder.addIntegerOption((option) =>
        option.setName("name").setDescription("Duplicate option"),
      );
      builder.build();
    }).toThrow("Duplicate option name");
  });
});

describe("SubCommandGroupBuilder", () => {
  it("should create a basic subcommand group", () => {
    const group = new SubCommandGroupBuilder()
      .setName("items")
      .setDescription("Item management")
      .addSubcommand((subcommand) =>
        subcommand.setName("create").setDescription("Create a new item"),
      )
      .build();

    expect(group.type).toBe(ApplicationCommandOptionType.SubCommandGroup);
    expect(group.name).toBe("items");
    expect(group.description).toBe("Item management");
    expect(group.options).toHaveLength(1);
    expect(group.options?.[0]?.type).toBe(
      ApplicationCommandOptionType.SubCommand,
    );
    expect(group.options?.[0]?.name).toBe("create");
  });

  it("should add multiple subcommands", () => {
    const group = new SubCommandGroupBuilder()
      .setName("items")
      .setDescription("Item management")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("create")
          .setDescription("Create a new item")
          .addStringOption((option) =>
            option
              .setName("name")
              .setDescription("Item name")
              .setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("delete")
          .setDescription("Delete an item")
          .addStringOption((option) =>
            option.setName("id").setDescription("Item ID").setRequired(true),
          ),
      )
      .build();

    expect(group.options).toHaveLength(2);
    expect(group.options?.[0]?.name).toBe("create");
    expect(group.options?.[1]?.name).toBe("delete");
    expect(group.options?.[0]?.options).toHaveLength(1);
    expect(group.options?.[1]?.options).toHaveLength(1);
  });

  // Error cases
  it("should throw error if no subcommands added", () => {
    const builder = new SubCommandGroupBuilder()
      .setName("group")
      .setDescription("Test group");

    expect(() => {
      builder.build();
    }).toThrow("Subcommand group must have at least one subcommand");
  });

  it("should throw error on too many subcommands", () => {
    const builder = new SubCommandGroupBuilder()
      .setName("group")
      .setDescription("Test group");

    // Add maximum number of subcommands
    for (let i = 0; i < COMMAND_LIMITS.OPTIONS; i++) {
      builder.addSubcommand((subcommand) =>
        subcommand.setName(`sub${i}`).setDescription(`Subcommand ${i}`),
      );
    }

    // Try to add one more
    expect(() => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName("onemore").setDescription("One more subcommand"),
      );
    }).toThrow(
      `Cannot add more than ${COMMAND_LIMITS.OPTIONS} subcommands to a group`,
    );
  });

  it("should throw error on duplicate subcommand names", () => {
    const builder = new SubCommandGroupBuilder()
      .setName("group")
      .setDescription("Test group")
      .addSubcommand((subcommand) =>
        subcommand.setName("action").setDescription("First subcommand"),
      );

    expect(() => {
      builder.addSubcommand((subcommand) =>
        subcommand.setName("action").setDescription("Duplicate subcommand"),
      );
      builder.build();
    }).toThrow("Duplicate subcommand name in group");
  });
});
