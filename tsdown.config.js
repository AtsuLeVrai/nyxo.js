export default {
  entry: "src/index.ts",
  outDir: "dist",
  format: "esm",
  platform: "node",
  clean: true,
  treeshake: true,
  minify: false,
  sourcemap: false,
  tsconfig: "./tsconfig.json",
  dts: {
    sourcemap: false,
  },
};
