import config from "../../configs/eslint/eslint.config.mjs";

const overrides = [
    {
        rules: {
            "id-length": "warn",
        },
    },
];

export default [...config, ...overrides];
