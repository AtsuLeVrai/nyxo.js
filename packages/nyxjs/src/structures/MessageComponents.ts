import type {
    ButtonStructure,
    ButtonStyles,
    ChannelTypes,
    ComponentTypes,
    Integer,
    SelectDefaultValueStructure,
    SelectDefaultValueTypes,
    SelectMenuStructure,
    SelectOptionStructure,
    Snowflake,
    TextInputStructure,
    TextInputStyles,
} from "@nyxjs/core";
import type { PickWithPublicMethods } from "../utils";
import { Base } from "./Base";
import { Emoji } from "./Emojis";

export class TextInput extends Base<TextInputStructure> {
    public customId!: string;

    public label!: string;

    public max_length?: Integer;

    public min_length?: Integer;

    public placeholder?: string;

    public required?: boolean;

    public style!: TextInputStyles;

    public type!: ComponentTypes.TextInput;

    public value?: string;

    public constructor(data: Readonly<Partial<TextInputStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<TextInputStructure>>): void {
        if (data.custom_id !== undefined) {
            this.customId = data.custom_id;
        }

        if (data.label !== undefined) {
            this.label = data.label;
        }

        if ("max_length" in data) {
            if (data.max_length === null) {
                this.max_length = undefined;
            } else if (data.max_length !== undefined) {
                this.max_length = data.max_length;
            }
        }

        if ("min_length" in data) {
            if (data.min_length === null) {
                this.min_length = undefined;
            } else if (data.min_length !== undefined) {
                this.min_length = data.min_length;
            }
        }

        if ("placeholder" in data) {
            if (data.placeholder === null) {
                this.placeholder = undefined;
            } else if (data.placeholder !== undefined) {
                this.placeholder = data.placeholder;
            }
        }

        if ("required" in data) {
            if (data.required === null) {
                this.required = undefined;
            } else if (data.required !== undefined) {
                this.required = data.required;
            }
        }

        if (data.style !== undefined) {
            this.style = data.style;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("value" in data) {
            if (data.value === null) {
                this.value = undefined;
            } else if (data.value !== undefined) {
                this.value = data.value;
            }
        }
    }
}

export class SelectDefaultValue extends Base<SelectDefaultValueStructure> {
    public id!: Snowflake;

    public type!: SelectDefaultValueTypes;

    public constructor(data: Readonly<Partial<SelectDefaultValueStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<SelectDefaultValueStructure>>): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class SelectOption extends Base<SelectOptionStructure> {
    public default?: boolean;

    public description?: string;

    public emoji?: PickWithPublicMethods<Emoji, "animated" | "id" | "name">;

    public label!: string;

    public value!: string;

    public constructor(data: Readonly<Partial<SelectOptionStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<SelectOptionStructure>>): void {
        if ("default" in data) {
            if (data.default === null) {
                this.default = undefined;
            } else if (data.default !== undefined) {
                this.default = data.default;
            }
        }

        if ("description" in data) {
            if (data.description === null) {
                this.description = undefined;
            } else if (data.description !== undefined) {
                this.description = data.description;
            }
        }

        if ("emoji" in data) {
            if (data.emoji === null) {
                this.emoji = undefined;
            } else if (data.emoji !== undefined) {
                this.emoji = Emoji.from(data.emoji);
            }
        }

        if (data.label !== undefined) {
            this.label = data.label;
        }

        if (data.value !== undefined) {
            this.value = data.value;
        }
    }
}

export class SelectMenu extends Base<SelectMenuStructure> {
    public channelTypes?: ChannelTypes[];

    public customId!: string;

    public defaultValues?: SelectDefaultValue[];

    public disabled?: boolean;

    public maxValues?: Integer;

    public minValues?: Integer;

    public options?: SelectOption[];

    public placeholder?: string;

    public type!:
        | ComponentTypes.ChannelSelect
        | ComponentTypes.MentionableSelect
        | ComponentTypes.RoleSelect
        | ComponentTypes.StringSelect
        | ComponentTypes.UserSelect;

    public constructor(data: Readonly<Partial<SelectMenuStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<SelectMenuStructure>>): void {
        if ("channel_types" in data) {
            if (data.channel_types === null) {
                this.channelTypes = undefined;
            } else if (data.channel_types !== undefined) {
                this.channelTypes = data.channel_types;
            }
        }

        if (data.custom_id !== undefined) {
            this.customId = data.custom_id;
        }

        if ("default_values" in data) {
            if (data.default_values === null) {
                this.defaultValues = undefined;
            } else if (data.default_values !== undefined) {
                this.defaultValues = data.default_values.map((value) => SelectDefaultValue.from(value));
            }
        }

        if ("disabled" in data) {
            if (data.disabled === null) {
                this.disabled = undefined;
            } else if (data.disabled !== undefined) {
                this.disabled = data.disabled;
            }
        }

        if ("max_values" in data) {
            if (data.max_values === null) {
                this.maxValues = undefined;
            } else if (data.max_values !== undefined) {
                this.maxValues = data.max_values;
            }
        }

        if ("min_values" in data) {
            if (data.min_values === null) {
                this.minValues = undefined;
            } else if (data.min_values !== undefined) {
                this.minValues = data.min_values;
            }
        }

        if ("options" in data) {
            if (data.options === null) {
                this.options = undefined;
            } else if (data.options !== undefined) {
                this.options = data.options.map((value) => SelectOption.from(value));
            }
        }

        if ("placeholder" in data) {
            if (data.placeholder === null) {
                this.placeholder = undefined;
            } else if (data.placeholder !== undefined) {
                this.placeholder = data.placeholder;
            }
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }
}

export class Button extends Base<ButtonStructure> {
    public customId?: string;

    public disabled?: boolean;

    public emoji?: PickWithPublicMethods<Emoji, "animated" | "id" | "name">;

    public label?: string;

    public skuId?: Snowflake;

    public style!: ButtonStyles;

    public type!: ComponentTypes.Button;

    public url?: string;

    public constructor(data: Readonly<Partial<ButtonStructure>> = {}) {
        super(data);
    }

    protected patch(data: Readonly<Partial<ButtonStructure>>): void {
        if ("custom_id" in data) {
            if (data.custom_id === null) {
                this.customId = undefined;
            } else if (data.custom_id !== undefined) {
                this.customId = data.custom_id;
            }
        }

        if ("disabled" in data) {
            if (data.disabled === null) {
                this.disabled = undefined;
            } else if (data.disabled !== undefined) {
                this.disabled = data.disabled;
            }
        }

        if ("emoji" in data) {
            if (data.emoji === null) {
                this.emoji = undefined;
            } else if (data.emoji !== undefined) {
                this.emoji = Emoji.from(data.emoji);
            }
        }

        if ("label" in data) {
            if (data.label === null) {
                this.label = undefined;
            } else if (data.label !== undefined) {
                this.label = data.label;
            }
        }

        if ("sku_id" in data) {
            if (data.sku_id === null) {
                this.skuId = undefined;
            } else if (data.sku_id !== undefined) {
                this.skuId = data.sku_id;
            }
        }

        if (data.style !== undefined) {
            this.style = data.style;
        }

        if (data.type !== undefined) {
            this.type = data.type;
        }

        if ("url" in data) {
            if (data.url === null) {
                this.url = undefined;
            } else if (data.url !== undefined) {
                this.url = data.url;
            }
        }
    }
}

export { ButtonStyles, ChannelTypes, ComponentTypes, SelectDefaultValueTypes, TextInputStyles } from "@nyxjs/core";
