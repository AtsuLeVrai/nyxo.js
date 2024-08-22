import { mergeConfig } from "vitest/config";
import { createVitestConfig } from "../../configs/vitest/vitest.config";

export default mergeConfig(createVitestConfig(), {});
