const { createTsupConfig } = require("../../configs/tsup/tsup.config");

module.exports = createTsupConfig(["src/index.ts"]);
