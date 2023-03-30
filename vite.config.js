import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	base: "",
	build: {
		target: "es2019",
		outDir: "docs",
		assetsDir: ""
	},
	plugins: [
		vue(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Draw Poker",
				icons: [
					{
						src: "icon.png",
						type: "image/png",
						sizes: "192x192"
					}
				],
				start_url: "index.html",
				display: "standalone",
				background_color: "#ddc",
				theme_color: "#263"
			},
			devOptions: {
				enable: true
			}
		})
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url))
		}
	}
});
