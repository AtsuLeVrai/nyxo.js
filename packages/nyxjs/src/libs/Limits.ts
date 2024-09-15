export const EmbedLimits = {
    /**
     * The maximum length of the title field
     */
    Title: 256,
    /**
     * The maximum length of the description field
     */
    Description: 4_096,
    /**
     * The maximum length of the field name
     */
    FieldName: 256,
    /**
     * The maximum length of the field value
     */
    FieldValue: 1_024,
    /**
     * The maximum number of fields
     */
    Fields: 25,
    /**
     * The maximum length of the footer text
     */
    FooterText: 2_048,
    /**
     * The maximum length of the author name
     */
    AuthorName: 256,
};

export const TextInputLimits = {
    /**
     * The maximum length of the custom ID.
     */
    CustomId: 100,
    /**
     * The maximum length of the label.
     */
    Label: 45,
    MinLength: {
        /**
         * The minimum length of the input.
         */
        Min: 0,
        /**
         * The maximum length of the input.
         */
        Max: 4_000,
    },
    MaxLength: {
        /**
         * The minimum length of the input.
         */
        Min: 1,
        /**
         * The maximum length of the input.
         */
        Max: 4_000,
    },
    /**
     * The maximum length of the value.
     */
    Value: 4_000,
    /**
     * The maximum length of the placeholder.
     */
    Placeholder: 100,
};

export const ButtonLimits = {
    /**
     * The maximum length of the label.
     */
    Label: 80,
    /**
     * The maximum length of the custom ID.
     */
    CustomId: 100,
};

export const SelectMenuLimits = {
    /**
     * The maximum length of the custom ID.
     */
    CustomId: 100,
    /**
     * The maximum number of options.
     */
    Options: 25,
    /**
     * The maximum length of the placeholder.
     */
    Placeholder: 150,
    MinValues: {
        /**
         * The minimum number of selected values.
         */
        Min: 0,
        /**
         * The maximum number of selected values.
         */
        Max: 25,
    },
    MaxValues: {
        /**
         * The minimum number of selected values.
         */
        Min: 1,
        /**
         * The maximum number of selected values.
         */
        Max: 25,
    },
};

export const SelectOptionLimits = {
    /**
     * The maximum length of the label.
     */
    Label: 100,
    /**
     * The maximum length of the value.
     */
    Value: 100,
    /**
     * The maximum length of the description.
     */
    Description: 100,
};

export const ModalLimits = {
    /**
     * The maximum length of the custom ID.
     */
    CustomId: 100,
    /**
     * The maximum length of the title.
     */
    Title: 45,
    Components: {
        /**
         * The minimum number of components.
         */
        Min: 1,
        /**
         * The maximum number of components.
         */
        Max: 5,
    },
};
