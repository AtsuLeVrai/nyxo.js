import config from "@nyxjs/eslint-config/eslint.config.mjs";

const overrides = [
    {
        rules: {
            "id-length": "warn",
        },
    },
];

export default [...config, ...overrides];
