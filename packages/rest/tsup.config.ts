import {esbuildPluginVersionInjector} from "esbuild-plugin-version-injector";
import {createTsupConfig} from "../../configs/tsup/tsup.config";

export default [
    createTsupConfig({
        name: "rest",
        plugins: [esbuildPluginVersionInjector()],
    }),
];