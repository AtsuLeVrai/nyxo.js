import config from "@nyxjs/eslint-config/eslint.config.js";

const overrides = [
    {
        rules: {
            "id-length": "warn",
        },
    },
];

export default [...config, ...overrides];
