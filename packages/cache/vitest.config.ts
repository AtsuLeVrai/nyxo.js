import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		coverage: {
			provider: "v8",
			clean: true,
			reporter: ["text", "json", "html"],
			exclude: ["**/node_modules/**", "**/dist/**"],
			include: ["**/src/**"],
		},
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
	},
});
