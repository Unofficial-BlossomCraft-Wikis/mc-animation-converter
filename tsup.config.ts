import { defineConfig } from "tsup";

export default defineConfig((options) => {
	return {
		entry: ["src/index.ts"],
		format: ["cjs", "esm"], // Build both CommonJS and ES modules
		dts: true, // Emit .d.ts type declarations
		splitting: false, // Usually false for libraries, especially CJS
		clean: true,
		minify: !options.watch,
		sourcemap: true, // Optional but recommended
	};
});
