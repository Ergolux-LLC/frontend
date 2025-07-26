import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  root: __dirname,
  publicDir: "public",
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["app.ergolux.io.localhost"],
    historyApiFallback: {
      disableDotRule: true,
      htmlAcceptHeaders: ["text/html"],
    },
    proxy: {
      "/api": {
        target: "http://app.ergolux.io.localhost",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  resolve: {
    alias: {
      "@views": path.resolve(__dirname, "src/content/views"),
      "@content": path.resolve(__dirname, "src/content/home"),
      "@pageMaker": path.resolve(__dirname, "src/packages/pageMaker"),
      "@api": path.resolve(__dirname, "src/api"),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, "main.js"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", "dist"],
  },
});
