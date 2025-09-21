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
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// React core
					react: ["react", "react-dom"],

					// TanStack Router
					router: ["@tanstack/react-router", "@tanstack/router-plugin"],

					// TanStack DevTools (separate chunk for dev tools)
					devtools: [
						"@tanstack/react-devtools",
						"@tanstack/react-router-devtools",
					],

					// Radix UI components
					radix: [
						"@radix-ui/react-dialog",
						"@radix-ui/react-dropdown-menu",
						"@radix-ui/react-progress",
						"@radix-ui/react-select",
						"@radix-ui/react-separator",
						"@radix-ui/react-slot",
						"@radix-ui/react-tooltip",
					],

					// Icons
					icons: ["lucide-react"],

					// Animation
					motion: ["motion"],

					// Database
					database: ["dexie"],

					// State management
					state: ["zustand"],

					// Utilities
					utils: [
						"clsx",
						"tailwind-merge",
						"class-variance-authority",
						"es-toolkit",
						"uuid",
					],

					// i18n (Lingui core, translations will be loaded dynamically)
					i18n: ["@lingui/core", "@lingui/react"],
				},
			},
		},
	},
});
