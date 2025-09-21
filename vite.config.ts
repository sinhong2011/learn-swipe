import { resolve } from "node:path";
import { lingui } from "@lingui/vite-plugin";
import { serwist } from "@serwist/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		port: 5173,
	},
	plugins: [
		tsconfigPaths(),
		tanstackRouter({ autoCodeSplitting: true }),
		viteReact({
			plugins: [["@lingui/swc-plugin", {}]],
		}),
		tailwindcss(),
		serwist({
			swSrc: "src/sw.ts",
			swDest: "sw.js",
			globDirectory: "dist",
			injectionPoint: "self.__SW_MANIFEST",
			rollupFormat: "iife",
		}),
		lingui(),
	],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
